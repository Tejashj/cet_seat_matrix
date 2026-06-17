import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ALLOTMENTS_DIR = path.join(DATA_DIR, 'allotments');
const MODEL_FILE = path.join(DATA_DIR, 'trained-model.json');
const REGISTRY_FILE = path.join(DATA_DIR, 'datasets.json');

// Year weights matching lib/prediction/engine.ts
const YEAR_WEIGHTS: Record<number, number> = {
  2020: 0.05,
  2021: 0.08,
  2022: 0.12,
  2023: 0.20,
  2024: 0.25,
  2025: 0.30,
};

interface AllotmentRecord {
  academicYear: number;
  round: string;
  category: string;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  cutoffRank: number;
}

export async function POST() {
  try {
    // 1. Load registry to see how many files are registered
    let datasets: any[] = [];
    try {
      const content = await fs.readFile(REGISTRY_FILE, 'utf-8');
      datasets = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'No datasets registered. Upload data files first.' }, { status: 400 });
    }

    const readyDatasets = datasets.filter((d: any) => d.status === 'ready');
    if (readyDatasets.length === 0) {
      return NextResponse.json({ error: 'No uploaded datasets are ready.' }, { status: 400 });
    }

    // 2. Read and merge all allotments JSON files
    const allRecords: AllotmentRecord[] = [];
    for (const dataset of readyDatasets) {
      const filePath = path.join(ALLOTMENTS_DIR, `allotments-${dataset.id}.json`);
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const records = JSON.parse(fileContent) as AllotmentRecord[];
        allRecords.push(...records);
      } catch (err) {
        console.warn(`Could not read dataset file: allotments-${dataset.id}.json`, err);
      }
    }

    if (allRecords.length === 0) {
      return NextResponse.json({ error: 'No records found in allotments files.' }, { status: 400 });
    }

    // 3. Compute dynamic round factors from real data
    // Calculate average ratio of R2/R1, R2E/R1, MOCK/R1
    const roundRatios: Record<string, number[]> = { MOCK: [], R2: [], R2E: [] };
    
    // Group records by (college, branch, category, year) to find matching rounds
    const roundMapping = new Map<string, Record<string, number>>(); // key: college_branch_category_year -> { round: cutoff }
    for (const r of allRecords) {
      const key = `${r.collegeCode}_${r.branchCode}_${r.category}_${r.academicYear}`;
      if (!roundMapping.has(key)) {
        roundMapping.set(key, {});
      }
      roundMapping.get(key)![r.round] = r.cutoffRank;
    }

    for (const [_, roundsObj] of roundMapping.entries()) {
      const r1 = roundsObj['R1'];
      if (!r1 || r1 <= 0) continue;

      if (roundsObj['MOCK']) roundRatios['MOCK'].push(roundsObj['MOCK'] / r1);
      if (roundsObj['R2']) roundRatios['R2'].push(roundsObj['R2'] / r1);
      if (roundsObj['R2E']) roundRatios['R2E'].push(roundsObj['R2E'] / r1);
    }

    // Dynamic round factors (fallback to baseline constants if no matches)
    const dynamicRoundFactors = {
      MOCK: roundRatios['MOCK'].length > 0 ? (roundRatios['MOCK'].reduce((a, b) => a + b, 0) / roundRatios['MOCK'].length) : 0.91,
      R1: 1.00,
      R2: roundRatios['R2'].length > 0 ? (roundRatios['R2'].reduce((a, b) => a + b, 0) / roundRatios['R2'].length) : 1.13,
      R2E: roundRatios['R2E'].length > 0 ? (roundRatios['R2E'].reduce((a, b) => a + b, 0) / roundRatios['R2E'].length) : 1.22,
    };

    // 4. Group by (collegeCode, branchCode, category) to fit models
    const grouped = new Map<string, {
      collegeCode: string;
      collegeName: string;
      branchCode: string;
      branchName: string;
      category: string;
      history: { year: number; round: string; cutoff: number }[];
    }>();

    for (const r of allRecords) {
      const key = `${r.collegeCode}_${r.branchCode}_${r.category}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          collegeCode: r.collegeCode,
          collegeName: r.collegeName,
          branchCode: r.branchCode,
          branchName: r.branchName,
          category: r.category,
          history: [],
        });
      }
      grouped.get(key)!.history.push({
        year: r.academicYear,
        round: r.round,
        cutoff: r.cutoffRank,
      });
    }

    const options: Record<string, any> = {};

    for (const [key, group] of grouped.entries()) {
      // Group history by year, taking R1 as baseline or estimating it
      const yearMap = new Map<number, { year: number; cutoff: number }>();
      
      for (const h of group.history) {
        if (h.round === 'R1') {
          yearMap.set(h.year, { year: h.year, cutoff: h.cutoff });
        } else if (!yearMap.has(h.year)) {
          // Estimate R1 cutoff by dividing by dynamic round factor
          const factor = (dynamicRoundFactors as any)[h.round] || 1.0;
          yearMap.set(h.year, { year: h.year, cutoff: Math.round(h.cutoff / factor) });
        }
      }

      const historicalCutoffs = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
      if (historicalCutoffs.length === 0) continue;

      // Calculate weighted cutoff
      let weightedSum = 0;
      let totalWeight = 0;
      for (const h of historicalCutoffs) {
        const weight = YEAR_WEIGHTS[h.year] ?? 0.1;
        weightedSum += h.cutoff * weight;
        totalWeight += weight;
      }
      const predictedCutoff = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : historicalCutoffs[historicalCutoffs.length - 1].cutoff;

      // Calculate trend
      let trendDirection: 'Rising' | 'Falling' | 'Stable' = 'Stable';
      let trendPercent = 0;
      if (historicalCutoffs.length >= 2) {
        const recent = historicalCutoffs.slice(-3);
        const first = recent[0].cutoff;
        const last = recent[recent.length - 1].cutoff;
        const changePercent = ((last - first) / first) * 100;
        
        if (Math.abs(changePercent) >= 3) {
          trendDirection = changePercent > 0 ? 'Falling' : 'Rising'; // Rising cutoff rank = harder (requires lower rank)
          trendPercent = Math.abs(changePercent);
        }
      }

      // Calculate confidence score (CV method)
      const cutoffs = historicalCutoffs.map(h => h.cutoff);
      const mean = cutoffs.reduce((a, b) => a + b, 0) / cutoffs.length;
      const variance = cutoffs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / cutoffs.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;
      
      let confidenceScore = Math.max(0.3, Math.min(0.98, 1 - cv * 2));
      confidenceScore += Math.min(0.1, historicalCutoffs.length * 0.015);
      confidenceScore = Math.min(0.99, confidenceScore);

      options[key] = {
        collegeCode: group.collegeCode,
        collegeName: group.collegeName,
        branchCode: group.branchCode,
        branchName: group.branchName,
        category: group.category,
        predictedCutoff,
        confidenceScore,
        trendDirection,
        trendPercent,
        historicalCutoffs,
      };
    }

    const modelData = {
      trainedAt: new Date().toISOString(),
      totalDatasets: readyDatasets.length,
      datasets: readyDatasets.map(d => `${d.academicYear}-${d.round}`),
      roundFactors: dynamicRoundFactors,
      options,
    };

    // Save trained model database
    await fs.writeFile(MODEL_FILE, JSON.stringify(modelData, null, 2));

    return NextResponse.json({
      success: true,
      trainedAt: modelData.trainedAt,
      totalDatasets: modelData.totalDatasets,
      totalOptions: Object.keys(options).length,
      roundFactors: dynamicRoundFactors,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Training error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
