/**
 * Synthetic KCET Allotment Data Generator
 * Generates statistically realistic 6-year data (2020–2025)
 * Patterns modeled on real Karnataka engineering college cutoffs
 */

import { COLLEGES } from './colleges';
import { BRANCHES } from './branches';
import { CATEGORY_RANK_MULTIPLIERS } from './categories';

export interface AllotmentRecord {
  id: number;
  academicYear: number;
  round: number;
  category: string;
  rank: number;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  cutoffRank: number;
  seatsAvailable: number;
  seatsFilled: number;
  demandIndex: number;
}

export interface YearlyStat {
  academicYear: number;
  category: string;
  collegeCode: string;
  branchCode: string;
  cutoffRank: number;
  seatsAvailable: number;
  demandIndex: number;
}

// Base GM cutoffs for top colleges/branches (realistic values from public data)
// These represent Round 1 GM cutoff for 2025
const BASE_CUTOFFS: Record<string, Record<string, number>> = {
  'E001': { 'C001': 180,  'C002': 320,  'C003': 580,  'C004': 800,  'C005': 950,  'C006': 1100, 'C008': 150,  'C009': 200,  'C010': 400,  'C011': 500,  'C012': 700,  'C013': 1200, 'C014': 1500, 'C015': 2000, 'C007': 1800 },
  'E002': { 'C001': 250,  'C002': 480,  'C003': 820,  'C004': 1100, 'C005': 1300, 'C006': 1800, 'C008': 200,  'C009': 280,  'C010': 600,  'C011': 750,  'C012': 950,  'C013': 1600, 'C014': 2000, 'C015': 2800, 'C007': 2200 },
  'E003': { 'C001': 300,  'C002': 550,  'C003': 900,  'C004': 1200, 'C005': 1500, 'C006': 2000, 'C008': 240,  'C009': 320,  'C010': 700,  'C011': 880,  'C012': 1100, 'C013': 1800, 'C014': 2200, 'C015': 3200, 'C007': 2600 },
  'E004': { 'C001': 400,  'C002': 680,  'C003': 1100, 'C004': 1500, 'C005': 1800, 'C006': 2400, 'C008': 320,  'C009': 420,  'C010': 850,  'C011': 1050, 'C012': 1350, 'C013': 2200, 'C014': 2700, 'C015': 3800, 'C007': 3100 },
  'E005': { 'C001': 500,  'C002': 850,  'C003': 1350, 'C004': 1800, 'C005': 2200, 'C006': 3000, 'C008': 400,  'C009': 520,  'C010': 1050, 'C011': 1300, 'C012': 1650, 'C013': 2800, 'C014': 3500, 'C015': 4500, 'C007': 3800 },
  'E006': { 'C001': 600,  'C002': 1000, 'C003': 1600, 'C004': 2100, 'C005': 2600, 'C006': 3500, 'C008': 480,  'C009': 620,  'C010': 1250, 'C011': 1550, 'C012': 1950, 'C013': 3300, 'C014': 4100, 'C015': 5200, 'C007': 4500 },
  'E007': { 'C001': 750,  'C002': 1200, 'C003': 1900, 'C004': 2500, 'C005': 3100, 'C006': 4200, 'C008': 600,  'C009': 780,  'C010': 1500, 'C011': 1850, 'C012': 2350, 'C013': 4000, 'C014': 5000, 'C015': 6200, 'C007': 5500 },
  'E008': { 'C001': 950,  'C002': 1500, 'C003': 2350, 'C004': 3100, 'C005': 3800, 'C006': 5200, 'C008': 750,  'C009': 980,  'C010': 1850, 'C011': 2300, 'C012': 2900, 'C013': 4900, 'C014': 6100, 'C015': 7500, 'C007': 6800 },
  'E009': { 'C001': 1100, 'C002': 1750, 'C003': 2700, 'C004': 3600, 'C005': 4400, 'C006': 6000, 'C008': 880,  'C009': 1140, 'C010': 2150, 'C011': 2650, 'C012': 3350, 'C013': 5700, 'C014': 7100, 'C015': 8700, 'C007': 7900 },
  'E010': { 'C001': 1300, 'C002': 2000, 'C003': 3100, 'C004': 4100, 'C005': 5000, 'C006': 6800, 'C008': 1050, 'C009': 1350, 'C010': 2500, 'C011': 3100, 'C012': 3900, 'C013': 6500, 'C014': 8100, 'C015': 9900, 'C007': 9000 },
  'E011': { 'C001': 1600, 'C002': 2450, 'C003': 3700, 'C004': 4900, 'C005': 6000, 'C006': 8200, 'C008': 1280, 'C009': 1650, 'C010': 3000, 'C011': 3700, 'C012': 4700, 'C013': 7800, 'C014': 9700, 'C015': 11800, 'C007': 10800 },
  'E012': { 'C001': 1900, 'C002': 2900, 'C003': 4400, 'C004': 5800, 'C005': 7100, 'C006': 9600, 'C008': 1520, 'C009': 1960, 'C010': 3550, 'C011': 4400, 'C012': 5550, 'C013': 9200, 'C014': 11500, 'C015': 14000, 'C007': 12700 },
  'E013': { 'C001': 2200, 'C002': 3350, 'C003': 5100, 'C004': 6700, 'C005': 8200, 'C006': 11100, 'C008': 1760, 'C009': 2260, 'C010': 4100, 'C011': 5100, 'C012': 6400, 'C013': 10600, 'C014': 13200, 'C015': 16100, 'C007': 14700 },
  'E014': { 'C001': 2600, 'C002': 3900, 'C003': 5900, 'C004': 7800, 'C005': 9500, 'C006': 12800, 'C008': 2080, 'C009': 2680, 'C010': 4750, 'C011': 5900, 'C012': 7400, 'C013': 12200, 'C014': 15200, 'C015': 18500, 'C007': 16900 },
  'E015': { 'C001': 2100, 'C002': 3200, 'C003': 4900, 'C004': 6500, 'C005': 7900, 'C006': 10700, 'C008': 1680, 'C009': 2160, 'C010': 3900, 'C011': 4850, 'C012': 6100, 'C013': 10100, 'C014': 12600, 'C015': 15400, 'C007': 14000 },
  'E016': { 'C001': 3000, 'C002': 4500, 'C003': 6800, 'C004': 9000, 'C005': 10900, 'C006': 14700, 'C008': 2400, 'C009': 3100, 'C010': 5500, 'C011': 6800, 'C012': 8500, 'C013': 14000, 'C014': 17500, 'C015': 21200, 'C007': 19400 },
  'E017': { 'C001': 3500, 'C002': 5200, 'C003': 7800, 'C004': 10300, 'C005': 12600, 'C006': 17000, 'C008': 2800, 'C009': 3600, 'C010': 6300, 'C011': 7800, 'C012': 9800, 'C013': 16200, 'C014': 20200, 'C015': 24500, 'C007': 22300 },
  'E018': { 'C001': 4000, 'C002': 6000, 'C003': 9000, 'C004': 11900, 'C005': 14500, 'C006': 19600, 'C008': 3200, 'C009': 4100, 'C010': 7200, 'C011': 9000, 'C012': 11300, 'C013': 18700, 'C014': 23300, 'C015': 28300, 'C007': 25800 },
  'E019': { 'C001': 4600, 'C002': 6900, 'C003': 10400, 'C004': 13700, 'C005': 16700, 'C006': 22600, 'C008': 3680, 'C009': 4740, 'C010': 8300, 'C011': 10300, 'C012': 13000, 'C013': 21500, 'C014': 26800, 'C015': 32600, 'C007': 29700 },
  'E020': { 'C001': 5300, 'C002': 7900, 'C003': 11900, 'C004': 15700, 'C005': 19200, 'C006': 25900, 'C008': 4240, 'C009': 5460, 'C010': 9550, 'C011': 11850, 'C012': 14950, 'C013': 24700, 'C014': 30800, 'C015': 37400, 'C007': 34100 },
};

// Generate cutoffs for remaining colleges E021-E050
function generateRemainingCutoffs(): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (let i = 21; i <= 50; i++) {
    const code = `E0${i.toString().padStart(2, '0')}`;
    const scaleFactor = 1.0 + (i - 20) * 0.12;
    result[code] = {};
    const baseCutoffs = BASE_CUTOFFS['E020'];
    for (const [branchCode, baseCutoff] of Object.entries(baseCutoffs)) {
      // Add noise and scale
      const noise = 0.85 + Math.random() * 0.3;
      result[code][branchCode] = Math.round(baseCutoff * scaleFactor * noise);
    }
  }
  return result;
}

const ALL_CUTOFFS: Record<string, Record<string, number>> = {
  ...BASE_CUTOFFS,
  ...generateRemainingCutoffs(),
};

// Year-over-year trend factors (simulating demand changes)
// CS/AI/DS got more competitive each year; Mechanical/Civil got easier
const YEAR_TREND_FACTORS: Record<number, Record<string, number>> = {
  2020: { 'C001': 1.35, 'C002': 1.30, 'C003': 1.15, 'C004': 1.10, 'C005': 0.95, 'C006': 0.90, 'C007': 0.88, 'C008': 1.50, 'C009': 1.45, 'C010': 1.25, 'C011': 1.20, 'C012': 1.05, 'C013': 1.10, 'C014': 1.00, 'C015': 0.92 },
  2021: { 'C001': 1.25, 'C002': 1.20, 'C003': 1.10, 'C004': 1.05, 'C005': 0.97, 'C006': 0.93, 'C007': 0.91, 'C008': 1.35, 'C009': 1.30, 'C010': 1.18, 'C011': 1.14, 'C012': 1.02, 'C013': 1.05, 'C014': 0.98, 'C015': 0.94 },
  2022: { 'C001': 1.15, 'C002': 1.12, 'C003': 1.06, 'C004': 1.02, 'C005': 0.98, 'C006': 0.95, 'C007': 0.93, 'C008': 1.22, 'C009': 1.18, 'C010': 1.10, 'C011': 1.08, 'C012': 1.01, 'C013': 1.02, 'C014': 0.99, 'C015': 0.96 },
  2023: { 'C001': 1.08, 'C002': 1.06, 'C003': 1.03, 'C004': 1.00, 'C005': 0.99, 'C006': 0.97, 'C007': 0.96, 'C008': 1.12, 'C009': 1.09, 'C010': 1.05, 'C011': 1.04, 'C012': 1.00, 'C013': 1.00, 'C014': 0.99, 'C015': 0.97 },
  2024: { 'C001': 1.03, 'C002': 1.02, 'C003': 1.01, 'C004': 1.00, 'C005': 1.00, 'C006': 0.99, 'C007': 0.98, 'C008': 1.05, 'C009': 1.04, 'C010': 1.02, 'C011': 1.01, 'C012': 1.00, 'C013': 1.00, 'C014': 1.00, 'C015': 0.99 },
  2025: { 'C001': 1.00, 'C002': 1.00, 'C003': 1.00, 'C004': 1.00, 'C005': 1.00, 'C006': 1.00, 'C007': 1.00, 'C008': 1.00, 'C009': 1.00, 'C010': 1.00, 'C011': 1.00, 'C012': 1.00, 'C013': 1.00, 'C014': 1.00, 'C015': 1.00 },
};

// Seats per branch per college (approximate)
const SEATS_PER_BRANCH: Record<string, number> = {
  'C001': 120, 'C002': 60, 'C003': 60, 'C004': 60, 'C005': 60,
  'C006': 60, 'C007': 30, 'C008': 60, 'C009': 60, 'C010': 60,
  'C011': 60, 'C012': 30, 'C013': 30, 'C014': 30, 'C015': 30,
};

let idCounter = 1;

/**
 * Generate all yearly statistics (fast in-memory computation)
 */
export function generateYearlyStats(): YearlyStat[] {
  const stats: YearlyStat[] = [];
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const categories = Object.keys(CATEGORY_RANK_MULTIPLIERS);

  for (const year of years) {
    for (const college of COLLEGES) {
      const collegeCutoffs = ALL_CUTOFFS[college.code];
      if (!collegeCutoffs) continue;

      for (const branch of BRANCHES) {
        const baseCutoff = collegeCutoffs[branch.code];
        if (!baseCutoff) continue;

        const trendFactor = YEAR_TREND_FACTORS[year]?.[branch.code] ?? 1.0;
        const gmCutoff = Math.round(baseCutoff * trendFactor);

        for (const category of categories) {
          const multiplier = CATEGORY_RANK_MULTIPLIERS[category] ?? 1.0;
          // Add small random noise for realism
          const noise = 0.95 + Math.random() * 0.10;
          const cutoffRank = Math.min(200000, Math.round(gmCutoff * multiplier * noise));

          const seats = Math.floor((SEATS_PER_BRANCH[branch.code] ?? 60) * (category === 'GM' ? 0.5 : 0.1));

          stats.push({
            academicYear: year,
            category,
            collegeCode: college.code,
            branchCode: branch.code,
            cutoffRank,
            seatsAvailable: Math.max(1, seats),
            demandIndex: branch.demandIndex,
          });
        }
      }
    }
  }

  return stats;
}

// Memoized stats
let _cachedStats: YearlyStat[] | null = null;

export function getYearlyStats(): YearlyStat[] {
  if (!_cachedStats) {
    _cachedStats = generateYearlyStats();
  }
  return _cachedStats;
}

/**
 * Get historical cutoffs for a specific college+branch+category combination
 */
export function getHistoricalCutoffs(
  collegeCode: string,
  branchCode: string,
  category: string
): { year: number; cutoff: number }[] {
  const stats = getYearlyStats();
  return stats
    .filter(s => s.collegeCode === collegeCode && s.branchCode === branchCode && s.category === category)
    .map(s => ({ year: s.academicYear, cutoff: s.cutoffRank }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Get all unique college+branch combinations available
 */
export function getAllOptions(): { collegeCode: string; branchCode: string }[] {
  const stats = getYearlyStats().filter(s => s.academicYear === 2025 && s.category === 'GM');
  return stats.map(s => ({ collegeCode: s.collegeCode, branchCode: s.branchCode }));
}
