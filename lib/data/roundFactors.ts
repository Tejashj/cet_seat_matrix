/**
 * Round-specific cutoff adjustment factors for KCET
 *
 * Cutoff patterns across rounds (historical observation):
 * - MOCK: Highest cutoff rank required (hardest to get — very competitive)
 * - R1:   Slightly relaxed vs MOCK. First official allotment.
 * - R2:   Further relaxed for most colleges/branches. Upgrades happen here.
 * - R2E:  Relaxed significantly — last round, seats fill up but range widens.
 *
 * A factor > 1.0 means the cutoff rank is HIGHER (seat is easier to get).
 * A factor < 1.0 means the cutoff rank is LOWER (seat is harder to get).
 *
 * Example: if R1 GM cutoff for RV CSE is 300,
 *   Mock cutoff ≈ 300 × 0.88 = 264  (harder)
 *   R2   cutoff ≈ 300 × 1.12 = 336  (easier)
 *   R2E  cutoff ≈ 300 × 1.22 = 366  (easiest)
 */

export type Round = 'MOCK' | 'R1' | 'R2' | 'R2E';

export const ROUND_LABELS: Record<Round, string> = {
  MOCK: 'Mock Round',
  R1:   'Round 1',
  R2:   'Round 2',
  R2E:  'Round 2 Extended / Round 3',
};

export const ROUND_DESCRIPTIONS: Record<Round, string> = {
  MOCK: 'Practice allotment — results are not binding. Most aspirants apply optimistically, so cutoffs are very competitive.',
  R1:   'First official allotment. Plan your Option Entry carefully here — this sets the baseline.',
  R2:   'Second allotment. Upgrades are common. Most top colleges see cutoffs relax by 5–20%.',
  R2E:  'Final round. Last chance for upgrades. If you already have a seat, blocking is usually advised.',
};

/**
 * Round adjustment factors relative to R1 (baseline = 1.0).
 * Branch-specific: high-demand branches (CSE/AIML) move less across rounds.
 * Low-demand branches (Civil/Mech) can move significantly.
 */
export const ROUND_FACTORS: Record<Round, Record<string, number>> = {
  MOCK: {
    // Mock is stricter — cutoff ranks are lower (harder)
    C001: 0.87, // CSE
    C002: 0.88, // ISE
    C003: 0.90, // ECE
    C004: 0.91, // EEE
    C005: 0.93, // ME
    C006: 0.94, // Civil
    C007: 0.95, // Chem
    C008: 0.86, // AIML
    C009: 0.87, // DS
    C010: 0.88, // CS-CY
    C011: 0.89, // CS-IoT
    C012: 0.91, // ETE
    C013: 0.92, // Robotics
    C014: 0.93, // Aero
    C015: 0.94, // Biotech
    _default: 0.91,
  },
  R1: {
    // R1 is the baseline (factor = 1.0)
    C001: 1.00, C002: 1.00, C003: 1.00, C004: 1.00, C005: 1.00,
    C006: 1.00, C007: 1.00, C008: 1.00, C009: 1.00, C010: 1.00,
    C011: 1.00, C012: 1.00, C013: 1.00, C014: 1.00, C015: 1.00,
    _default: 1.00,
  },
  R2: {
    // R2 sees relaxation — higher cutoff rank = easier to get in
    C001: 1.10, // CSE barely relaxes (huge demand)
    C002: 1.12, // ISE
    C003: 1.14, // ECE
    C004: 1.15, // EEE
    C005: 1.18, // ME — more seats available
    C006: 1.20, // Civil
    C007: 1.20, // Chem
    C008: 1.09, // AIML — barely relaxes
    C009: 1.10, // DS
    C010: 1.11, // CS-CY
    C011: 1.12, // CS-IoT
    C012: 1.15, // ETE
    C013: 1.16, // Robotics
    C014: 1.17, // Aero
    C015: 1.20, // Biotech
    _default: 1.13,
  },
  R2E: {
    // R2E (Extended) — final round, widest range
    C001: 1.18,
    C002: 1.20,
    C003: 1.24,
    C004: 1.26,
    C005: 1.30,
    C006: 1.33,
    C007: 1.32,
    C008: 1.16,
    C009: 1.18,
    C010: 1.20,
    C011: 1.22,
    C012: 1.25,
    C013: 1.27,
    C014: 1.29,
    C015: 1.32,
    _default: 1.22,
  },
};

/**
 * Historical R1→R2 upgrade probability by tier gap
 * e.g., if your rank is 8000 and the R2 cutoff of your target is predicted at 9500,
 * the gap ratio = 9500/8000 = 1.1875 → 60% chance
 */
export function getUpgradeProbability(
  studentRank: number,
  targetR2Cutoff: number
): number {
  const ratio = targetR2Cutoff / studentRank;

  if (ratio >= 2.0)  return 0.97; // extremely safe
  if (ratio >= 1.6)  return 0.92;
  if (ratio >= 1.3)  return 0.82;
  if (ratio >= 1.15) return 0.68;
  if (ratio >= 1.05) return 0.52;
  if (ratio >= 0.98) return 0.38;
  if (ratio >= 0.90) return 0.22;
  if (ratio >= 0.80) return 0.10;
  return 0.04; // basically impossible
}

/**
 * R1→R2E cutoff improvement rate (historical, by branch)
 * Represents average % by which cutoff rank INCREASES (relaxes) from R1 to R2E
 */
export const R1_TO_R2E_IMPROVEMENT: Record<string, number> = {
  C001: 0.18, C002: 0.20, C003: 0.24, C004: 0.26, C005: 0.30,
  C006: 0.33, C007: 0.32, C008: 0.16, C009: 0.18, C010: 0.20,
  C011: 0.22, C012: 0.25, C013: 0.27, C014: 0.29, C015: 0.32,
  _default: 0.22,
};

export function getRoundFactor(round: Round, branchCode: string): number {
  const factors = ROUND_FACTORS[round];
  return factors[branchCode] ?? factors['_default'] ?? 1.0;
}
