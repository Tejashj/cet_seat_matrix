/**
 * KCET Excel Import Pipeline
 * Parses KEA allotment Excel files with flexible column detection.
 * Supports multiple KEA formats across different years.
 */

import * as XLSX from 'xlsx';
import type { Round } from './roundFactors';

export interface RawAllotmentRecord {
  academicYear: number;
  round: Round;
  rank: number;
  cetNo?: string;
  category: string;
  gender?: string;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  cutoffRank: number;          // The closing rank for this allotment
  seatsAvailable?: number;
  source: 'uploaded';
}

export interface ImportResult {
  records: RawAllotmentRecord[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
  errors: string[];
  columnMapping: Record<string, string>;
}

// ── Flexible column name matching ──────────────────────────────────
// KEA changes header names year to year. These lists try all known variants.
const COLUMN_ALIASES: Record<string, string[]> = {
  rank: [
    'rank', 'kcet rank', 'cet rank', 'student rank', 'merit rank',
    'allotment rank', 'rank no', 'sl no', 'sno', 'sr.no',
  ],
  cetNo: [
    'cet no', 'cet number', 'application no', 'application number',
    'reg no', 'registration no', 'student id',
  ],
  category: [
    'category', 'seat category', 'allotment category', 'caste category',
    'reservation', 'quota', 'cat',
  ],
  gender: ['gender', 'sex'],
  collegeCode: [
    'college code', 'institute code', 'e-code', 'ecode', 'college_code',
    'college id', 'inst code',
  ],
  collegeName: [
    'college name', 'institute name', 'college', 'institution name',
    'name of college', 'name of institution',
  ],
  branchCode: [
    'branch code', 'course code', 'c-code', 'ccode', 'branch_code',
    'branch id', 'subject code',
  ],
  branchName: [
    'branch name', 'course name', 'branch', 'course', 'subject',
    'programme', 'stream',
  ],
  cutoffRank: [
    'allotted rank', 'allotment rank', 'closing rank', 'last rank',
    'cutoff rank', 'cutoff', 'closing', 'last allotted rank',
  ],
  seatsAvailable: [
    'seats', 'total seats', 'seats available', 'sanctioned intake',
    'intake', 'no of seats', 'available seats',
  ],
};

const VALID_CATEGORIES = new Set([
  '1G', '1K', '1R', '2AG', '2AK', '2AR',
  '2BG', '2BK', '2BR', '3AG', '3AK', '3AR',
  '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMR',
  'SCG', 'SCK', 'SCR', 'STG', 'STK',
]);

/**
 * Normalize a header string for comparison
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

/**
 * Auto-detect column mapping from sheet headers
 */
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

/**
 * Parse a single value from a cell, handling various Excel formats
 */
function cellValue(row: any[], idx: number | undefined): string {
  if (idx === undefined || idx < 0) return '';
  const val = row[idx];
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function cellNumber(row: any[], idx: number | undefined): number {
  const val = cellValue(row, idx);
  const num = parseInt(val.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize category strings (handles spaces, dashes, case)
 */
function normalizeCategory(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
}

/**
 * Main import function — parses an XLSX File object
 */
export async function parseKCETExcel(
  file: File,
  year: number,
  round: Round
): Promise<ImportResult> {
  const errors: string[] = [];
  const records: RawAllotmentRecord[] = [];

  // Read file as ArrayBuffer
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Find the allotment sheet (first sheet, or one named 'allotment'/'data')
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    const lower = name.toLowerCase();
    if (lower.includes('allot') || lower.includes('data') || lower.includes('round')) {
      sheetName = name;
      break;
    }
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { records: [], totalRows: 0, validRows: 0, skippedRows: 0, errors: ['No valid sheet found in Excel file.'], columnMapping: {} };
  }

  // Convert to array of arrays
  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawData.length < 2) {
    return { records: [], totalRows: 0, validRows: 0, skippedRows: 0, errors: ['Sheet has no data rows.'], columnMapping: {} };
  }

  // Find header row (usually row 0, but sometimes row 1 if there's a title row)
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    const normalized = row.map((c: any) => normalizeHeader(String(c ?? '')));
    // Check if this looks like a header row (has multiple known field names)
    let matches = 0;
    for (const aliases of Object.values(COLUMN_ALIASES)) {
      if (aliases.some(a => normalized.some(h => h.includes(a)))) matches++;
    }
    if (matches >= 3) { headerRowIdx = i; break; }
  }

  const headers = rawData[headerRowIdx] as string[];
  const colMap = detectColumns(headers);

  // Build friendly column mapping for display
  const columnMapping: Record<string, string> = {};
  for (const [field, idx] of Object.entries(colMap)) {
    columnMapping[field] = headers[idx] ?? '(unknown)';
  }

  // Require at minimum: category, collegeCode, branchCode, and either rank or cutoffRank
  const hasMinimum = (colMap.category !== undefined) &&
    (colMap.collegeCode !== undefined) &&
    (colMap.branchCode !== undefined) &&
    (colMap.rank !== undefined || colMap.cutoffRank !== undefined);

  if (!hasMinimum) {
    errors.push(
      `Could not detect required columns. Found: ${Object.keys(colMap).join(', ')}. ` +
      'Please ensure your Excel has columns for Category, College Code, Branch Code, and Rank/Cutoff Rank.'
    );
    return { records, totalRows: rawData.length - headerRowIdx - 1, validRows: 0, skippedRows: rawData.length - headerRowIdx - 1, errors, columnMapping };
  }

  let skipped = 0;

  for (let i = headerRowIdx + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.every((c: any) => !c)) continue; // skip blank rows

    const rawCategory = normalizeCategory(cellValue(row, colMap.category));
    const collegeCode = cellValue(row, colMap.collegeCode).toUpperCase();
    const branchCode = cellValue(row, colMap.branchCode).toUpperCase();

    // Rank: use student rank if available, else use cutoff rank for both
    const rank = colMap.rank !== undefined ? cellNumber(row, colMap.rank) : cellNumber(row, colMap.cutoffRank);
    const cutoffRank = colMap.cutoffRank !== undefined ? cellNumber(row, colMap.cutoffRank) : rank;

    // Validate
    if (!VALID_CATEGORIES.has(rawCategory)) { skipped++; continue; }
    if (!collegeCode || collegeCode.length < 2) { skipped++; continue; }
    if (!branchCode || branchCode.length < 2) { skipped++; continue; }
    if (rank <= 0 && cutoffRank <= 0) { skipped++; continue; }

    records.push({
      academicYear: year,
      round,
      rank: rank > 0 ? rank : cutoffRank,
      cetNo: cellValue(row, colMap.cetNo) || undefined,
      category: rawCategory,
      gender: cellValue(row, colMap.gender) || undefined,
      collegeCode,
      collegeName: cellValue(row, colMap.collegeName) || collegeCode,
      branchCode,
      branchName: cellValue(row, colMap.branchName) || branchCode,
      cutoffRank: cutoffRank > 0 ? cutoffRank : rank,
      seatsAvailable: colMap.seatsAvailable !== undefined ? cellNumber(row, colMap.seatsAvailable) : undefined,
      source: 'uploaded',
    });
  }

  return {
    records,
    totalRows: rawData.length - headerRowIdx - 1,
    validRows: records.length,
    skippedRows: skipped,
    errors,
    columnMapping,
  };
}

/**
 * Generate column mapping report for user display
 */
export function describeMapping(mapping: Record<string, string>): string {
  const lines = Object.entries(mapping).map(
    ([field, col]) => `  ${field} → "${col}"`
  );
  return lines.join('\n');
}
