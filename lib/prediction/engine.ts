/**
 * KCET Prediction Engine
 * Statistical ensemble model for KCET cutoff prediction
 * Uses weighted historical average + trend analysis + confidence scoring
 */

import { getYearlyStats, getHistoricalCutoffs, YearlyStat } from '../data/syntheticData';
import { COLLEGES, College } from '../data/colleges';
import { BRANCHES, Branch } from '../data/branches';
import { CATEGORY_RANK_MULTIPLIERS } from '../data/categories';
import { Round, getRoundFactor } from '../data/roundFactors';

export type Tier = 'Dream' | 'Realistic' | 'Safe' | 'Reach';

export interface StudentInput {
  rank: number;
  category: string;
  round?: Round;
  gender?: string;
  rural?: boolean;
  kannadaMedium?: boolean;
  ph?: boolean;
  exDefence?: boolean;
  preferredCities?: string[];
  preferredColleges?: string[];
  preferredBranches?: string[];
  excludeColleges?: string[];
  minNaac?: string;
  includePrivate?: boolean;
  includeGovernment?: boolean;
  includeAided?: boolean;
  customHistory?: {
    collegeCode: string;
    branchCode: string;
    category: string;
    year: number;
    cutoff: number;
    round: Round;
  }[];
}

export interface Recommendation {
  id: string;
  priority: number;
  collegeCode: string;
  collegeName: string;
  city: string;
  district: string;
  collegeType: string;
  naac: string;
  annualFee: number;
  branchCode: string;
  branchName: string;
  branchShortName: string;
  demandIndex: number;
  avgPackage: number;
  avgPlacementRate: number;
  tier: Tier;
  predictedCutoff: number;
  confidenceScore: number;
  trendDirection: 'Rising' | 'Falling' | 'Stable';
  trendPercent: number;
  historicalCutoffs: { year: number; cutoff: number }[];
  probabilityOfAdmission: number;
  safetyMargin: number; // rank - cutoff (positive = safe)
}

export interface PredictionResult {
  studentId: string;
  rank: number;
  category: string;
  totalRecommendations: number;
  recommendations: Recommendation[];
  dreamColleges: Recommendation[];
  realisticColleges: Recommendation[];
  safeColleges: Recommendation[];
  reachColleges: Recommendation[];
  overallConfidence: number;
  predictionTimestamp: string;
  topPick: Recommendation | null;
}

// Year weights for weighted average (recent years weigh more)
const YEAR_WEIGHTS: Record<number, number> = {
  2020: 0.05,
  2021: 0.08,
  2022: 0.12,
  2023: 0.20,
  2024: 0.25,
  2025: 0.30,
};

/**
 * Calculate weighted average cutoff from historical data
 */
function calculateWeightedCutoff(historicalCutoffs: { year: number; cutoff: number }[]): number {
  if (historicalCutoffs.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const { year, cutoff } of historicalCutoffs) {
    const weight = YEAR_WEIGHTS[year] ?? 0.1;
    weightedSum += cutoff * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : historicalCutoffs[historicalCutoffs.length - 1].cutoff;
}

/**
 * Calculate trend direction and percentage
 */
function calculateTrend(historicalCutoffs: { year: number; cutoff: number }[]): {
  direction: 'Rising' | 'Falling' | 'Stable';
  percent: number;
} {
  if (historicalCutoffs.length < 2) return { direction: 'Stable', percent: 0 };

  const sorted = [...historicalCutoffs].sort((a, b) => a.year - b.year);
  const recent = sorted.slice(-3); // Last 3 years

  if (recent.length < 2) return { direction: 'Stable', percent: 0 };

  const first = recent[0].cutoff;
  const last = recent[recent.length - 1].cutoff;
  const changePercent = ((last - first) / first) * 100;

  // Rising rank = getting harder (lower rank needed = more competitive)
  // Falling rank = getting easier
  if (Math.abs(changePercent) < 3) return { direction: 'Stable', percent: Math.abs(changePercent) };
  if (changePercent > 0) return { direction: 'Falling', percent: changePercent }; // higher rank needed = easier
  return { direction: 'Rising', percent: Math.abs(changePercent) }; // lower rank needed = harder
}

/**
 * Calculate confidence score based on data consistency
 */
function calculateConfidence(historicalCutoffs: { year: number; cutoff: number }[]): number {
  if (historicalCutoffs.length === 0) return 0;
  if (historicalCutoffs.length === 1) return 0.5;

  const cutoffs = historicalCutoffs.map(h => h.cutoff);
  const mean = cutoffs.reduce((a, b) => a + b, 0) / cutoffs.length;
  const variance = cutoffs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / cutoffs.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of variation

  // Low CV = high confidence
  const baseConfidence = Math.max(0.3, Math.min(0.98, 1 - cv * 2));
  
  // More data points = higher confidence
  const dataBonus = Math.min(0.1, historicalCutoffs.length * 0.015);
  
  return Math.min(0.99, baseConfidence + dataBonus);
}

/**
 * Calculate probability of admission
 */
function calculateProbability(studentRank: number, predictedCutoff: number, confidence: number): number {
  const margin = (predictedCutoff - studentRank) / predictedCutoff;

  if (margin >= 0.4) return Math.min(0.99, 0.95 * confidence);
  if (margin >= 0.2) return Math.min(0.92, 0.85 * confidence);
  if (margin >= 0.05) return Math.min(0.80, 0.72 * confidence);
  if (margin >= -0.05) return Math.min(0.60, 0.55 * confidence);
  if (margin >= -0.20) return Math.min(0.35, 0.30 * confidence);
  if (margin >= -0.40) return Math.min(0.15, 0.12 * confidence);
  return Math.min(0.05, 0.03 * confidence);
}

/**
 * Determine tier based on rank vs predicted cutoff
 */
function determineTier(studentRank: number, predictedCutoff: number): Tier {
  const ratio = predictedCutoff / studentRank;

  if (ratio >= 1.5) return 'Safe';
  if (ratio >= 1.05) return 'Realistic';
  if (ratio >= 0.75) return 'Dream';
  return 'Reach';
}

/**
 * Main prediction function
 */
export function predict(input: StudentInput): PredictionResult {
  const stats = getYearlyStats();
  const recommendations: Recommendation[] = [];

  // Filter to 2025 data for the student's category
  const relevantStats2025 = stats.filter(
    s => s.academicYear === 2025 && s.category === input.category
  );

  // Build a set of unique college+branch combos
  const seenCombos = new Set<string>();

  for (const stat of relevantStats2025) {
    const comboKey = `${stat.collegeCode}__${stat.branchCode}`;
    if (seenCombos.has(comboKey)) continue;
    seenCombos.add(comboKey);

    const college = COLLEGES.find(c => c.code === stat.collegeCode);
    const branch = BRANCHES.find(b => b.code === stat.branchCode);
    if (!college || !branch) continue;

    // Apply user filters
    if (input.preferredCities && input.preferredCities.length > 0) {
      if (!input.preferredCities.includes(college.city)) continue;
    }
    if (input.preferredColleges && input.preferredColleges.length > 0) {
      if (!input.preferredColleges.includes(college.code)) continue;
    }
    if (input.preferredBranches && input.preferredBranches.length > 0) {
      if (!input.preferredBranches.includes(branch.code)) continue;
    }
    if (input.excludeColleges && input.excludeColleges.includes(college.code)) continue;
    if (!input.includePrivate && college.type === 'Unaided') continue;
    if (!input.includeGovernment && college.type === 'Government') continue;
    if (!input.includeAided && college.type === 'Aided') continue;

    // Get historical data
    let historicalCutoffs = getHistoricalCutoffs(stat.collegeCode, stat.branchCode, input.category);
    if (input.customHistory) {
      const customMatches = input.customHistory.filter(
        h => h.collegeCode === stat.collegeCode && h.branchCode === stat.branchCode && h.category === input.category
      );
      if (customMatches.length > 0) {
        const customByYear = new Map(customMatches.map(m => [m.year, m.cutoff]));
        historicalCutoffs = historicalCutoffs.map(h => ({
          year: h.year,
          cutoff: customByYear.get(h.year) ?? h.cutoff
        }));
        for (const m of customMatches) {
          if (!historicalCutoffs.some(h => h.year === m.year)) {
            historicalCutoffs.push({ year: m.year, cutoff: m.cutoff });
          }
        }
        historicalCutoffs.sort((a, b) => a.year - b.year);
      }
    }

    if (historicalCutoffs.length === 0) continue;

    // Calculate weighted predicted cutoff
    const basePredictedCutoff = calculateWeightedCutoff(historicalCutoffs);
    if (basePredictedCutoff === 0) continue;

    // Adjust for round factor
    const selectedRound = input.round || 'R1';
    const factor = getRoundFactor(selectedRound, branch.code);
    const predictedCutoff = Math.round(basePredictedCutoff * factor);

    // Calculate metrics
    const confidence = calculateConfidence(historicalCutoffs);
    const trend = calculateTrend(historicalCutoffs);
    const tier = determineTier(input.rank, predictedCutoff);
    const probability = calculateProbability(input.rank, predictedCutoff, confidence);
    const safetyMargin = predictedCutoff - input.rank;

    recommendations.push({
      id: `${stat.collegeCode}_${stat.branchCode}`,
      priority: 0, // Will be set after sorting
      collegeCode: stat.collegeCode,
      collegeName: college.name,
      city: college.city,
      district: college.district,
      collegeType: college.type,
      naac: college.naac,
      annualFee: college.annualFee,
      branchCode: stat.branchCode,
      branchName: branch.name,
      branchShortName: branch.shortName,
      demandIndex: branch.demandIndex,
      avgPackage: branch.avgPackage,
      avgPlacementRate: branch.avgPlacementRate,
      tier,
      predictedCutoff,
      confidenceScore: confidence,
      trendDirection: trend.direction,
      trendPercent: trend.percent,
      historicalCutoffs,
      probabilityOfAdmission: probability,
      safetyMargin,
    });
  }

  // Sort: Realistic first (best match), then Safe, then Dream, then Reach
  // Within each tier, sort by predicted cutoff descending (closest to student rank)
  const tierOrder: Record<Tier, number> = { Realistic: 0, Dream: 1, Safe: 2, Reach: 3 };

  recommendations.sort((a, b) => {
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[a.tier] - tierOrder[b.tier];
    }
    // Within same tier, sort by college ranking (lower = better)
    const colA = COLLEGES.find(c => c.code === a.collegeCode)?.ranking ?? 99;
    const colB = COLLEGES.find(c => c.code === b.collegeCode)?.ranking ?? 99;
    if (colA !== colB) return colA - colB;
    // Then by branch demand
    return b.demandIndex - a.demandIndex;
  });

  // Assign priorities
  recommendations.forEach((r, i) => { r.priority = i + 1; });

  const dreamColleges = recommendations.filter(r => r.tier === 'Dream');
  const realisticColleges = recommendations.filter(r => r.tier === 'Realistic');
  const safeColleges = recommendations.filter(r => r.tier === 'Safe');
  const reachColleges = recommendations.filter(r => r.tier === 'Reach');

  const overallConfidence =
    recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.confidenceScore, 0) / recommendations.length
      : 0;

  return {
    studentId: `KCET_${input.category}_${input.rank}_${Date.now()}`,
    rank: input.rank,
    category: input.category,
    totalRecommendations: recommendations.length,
    recommendations,
    dreamColleges,
    realisticColleges,
    safeColleges,
    reachColleges,
    overallConfidence,
    predictionTimestamp: new Date().toISOString(),
    topPick: recommendations[0] ?? null,
  };
}
