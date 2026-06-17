import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import type { Round } from '@/lib/data/roundFactors';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ALLOTMENTS_DIR = path.join(DATA_DIR, 'allotments');
const REGISTRY_FILE = path.join(DATA_DIR, 'datasets.json');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(ALLOTMENTS_DIR, { recursive: true });
  try {
    await fs.access(REGISTRY_FILE);
  } catch {
    await fs.writeFile(REGISTRY_FILE, JSON.stringify([]));
  }
}

// Normalized header aliases matching lib/data/excelImport.ts
const COLUMN_ALIASES: Record<string, string[]> = {
  rank: ['rank', 'kcet rank', 'cet rank', 'student rank', 'merit rank', 'allotment rank'],
  category: ['category', 'seat category', 'allotment category', 'reservation', 'quota'],
  collegeCode: ['college code', 'institute code', 'e-code', 'ecode', 'college_code'],
  collegeName: ['college name', 'institute name', 'college', 'institution name'],
  branchCode: ['branch code', 'course code', 'c-code', 'ccode', 'branch_code'],
  branchName: ['branch name', 'course name', 'branch', 'course'],
  cutoffRank: ['allotted rank', 'allotment rank', 'closing rank', 'last rank', 'cutoff rank', 'cutoff'],
};

const VALID_CATEGORIES = new Set([
  '1G', '1K', '1R', '2AG', '2AK', '2AR',
  '2BG', '2BK', '2BR', '3AG', '3AK', '3AR',
  '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMR',
  'SCG', 'SCK', 'SCR', 'STG', 'STK',
]);

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function detectColumns(headers: string[]): Record<string, number> {
  const normalizedHeaders = headers.map(h => normalizeHeader(String(h ?? '')));
  const mapping: Record<string, number> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = normalizedHeaders.findIndex(h => h === alias || h.includes(alias));
      if (idx !== -1) {
        mapping[field] = idx;
        break;
      }
    }
  }
  return mapping;
}

export async function GET() {
  try {
    await ensureDirs();
    const content = await fs.readFile(REGISTRY_FILE, 'utf-8');
    const datasets = JSON.parse(content);
    return NextResponse.json(datasets, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirs();
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const yearStr = formData.get('year') as string;
    const roundStr = formData.get('round') as string;
    const fileName = formData.get('fileName') as string || 'uploaded_data.csv';

    if (!file || !yearStr || !roundStr) {
      return NextResponse.json({ error: 'Missing file, year, or round.' }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const round = roundStr as Round;

    // Save uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadPath = path.join(UPLOADS_DIR, `${year}-${round}-${fileName}`);
    await fs.writeFile(uploadPath, buffer);

    // Parse workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      const lower = name.toLowerCase();
      if (lower.includes('allot') || lower.includes('data') || lower.includes('round')) {
        sheetName = name;
        break;
      }
    }
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });

    if (rawData.length < 2) {
      return NextResponse.json({ error: 'Excel sheet has no data.' }, { status: 400 });
    }

    // Detect headers
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i] as any[];
      const normalized = row.map((c: any) => normalizeHeader(String(c ?? '')));
      let matches = 0;
      for (const aliases of Object.values(COLUMN_ALIASES)) {
        if (aliases.some(a => normalized.some(h => h.includes(a)))) matches++;
      }
      if (matches >= 3) { headerRowIdx = i; break; }
    }

    const headers = rawData[headerRowIdx] as string[];
    const colMap = detectColumns(headers);

    const hasMinimum = colMap.category !== undefined &&
      colMap.collegeCode !== undefined &&
      colMap.branchCode !== undefined &&
      (colMap.rank !== undefined || colMap.cutoffRank !== undefined);

    if (!hasMinimum) {
      return NextResponse.json({
        error: `Invalid columns. Found headers: ${headers.join(', ')}. Ensure category, college code, branch code, and rank/cutoff exist.`
      }, { status: 400 });
    }

    const records: any[] = [];
    for (let i = headerRowIdx + 1; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (!row || row.every((c: any) => !c)) continue;

      const rawCategory = String(row[colMap.category] ?? '').toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
      const collegeCode = String(row[colMap.collegeCode] ?? '').toUpperCase().trim();
      const branchCode = String(row[colMap.branchCode] ?? '').toUpperCase().trim();
      
      const rankVal = colMap.rank !== undefined ? parseInt(String(row[colMap.rank]).replace(/,/g, ''), 10) : 0;
      const cutoffVal = colMap.cutoffRank !== undefined ? parseInt(String(row[colMap.cutoffRank]).replace(/,/g, ''), 10) : 0;
      const cutoffRank = cutoffVal > 0 ? cutoffVal : rankVal;

      if (!VALID_CATEGORIES.has(rawCategory)) continue;
      if (!collegeCode || collegeCode.length < 2) continue;
      if (!branchCode || branchCode.length < 2) continue;
      if (cutoffRank <= 0) continue;

      records.push({
        academicYear: year,
        round,
        category: rawCategory,
        collegeCode,
        collegeName: String(row[colMap.collegeName] ?? collegeCode).trim(),
        branchCode,
        branchName: String(row[colMap.branchName] ?? branchCode).trim(),
        cutoffRank,
      });
    }

    // Save parsed allotments
    const allotmentsPath = path.join(ALLOTMENTS_DIR, `allotments-${year}-${round}.json`);
    await fs.writeFile(allotmentsPath, JSON.stringify(records));

    // Update datasets registry
    const registryContent = await fs.readFile(REGISTRY_FILE, 'utf-8');
    const datasets = JSON.parse(registryContent);
    const existingIdx = datasets.findIndex((d: any) => d.id === `${year}-${round}`);

    const info = {
      id: `${year}-${round}`,
      academicYear: year,
      round,
      fileName,
      rowCount: records.length,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
    };

    if (existingIdx !== -1) {
      datasets[existingIdx] = info;
    } else {
      datasets.push(info);
    }
    await fs.writeFile(REGISTRY_FILE, JSON.stringify(datasets, null, 2));

    return NextResponse.json(info, { status: 200 });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureDirs();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing dataset ID parameter.' }, { status: 400 });
    }

    const registryContent = await fs.readFile(REGISTRY_FILE, 'utf-8');
    const datasets = JSON.parse(registryContent);
    const dataset = datasets.find((d: any) => d.id === id);

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found.' }, { status: 404 });
    }

    // Remove file and records
    try {
      const uploadPath = path.join(UPLOADS_DIR, `${dataset.academicYear}-${dataset.round}-${dataset.fileName}`);
      await fs.unlink(uploadPath);
    } catch {}

    try {
      const allotmentsPath = path.join(ALLOTMENTS_DIR, `allotments-${dataset.academicYear}-${dataset.round}.json`);
      await fs.unlink(allotmentsPath);
    } catch {}

    // Update datasets registry
    const updated = datasets.filter((d: any) => d.id !== id);
    await fs.writeFile(REGISTRY_FILE, JSON.stringify(updated, null, 2));

    return NextResponse.json({ success: true, message: 'Dataset deleted.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
