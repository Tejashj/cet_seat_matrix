/**
 * KCET Seat Blocking AI Advisor
 *
 * "Should I BLOCK (freeze my current seat) or SLIDE (try for upgrade)?"
 *
 * KCET KEA Rules:
 * - FREEZE: Accept current allotment, exit the process. Seat is guaranteed.
 * - SLIDE:  Stay in the process for the next round hoping for a better allotment.
 *           Risk: If the next round allots you nothing better, you may lose the current seat.
 * - R2E is the FINAL round — blocking is almost always recommended at this stage.
 *
 * Algorithm:
 * 1. Score the current allotted seat (college rank × branch demand)
 * 2. Find all realistically achievable upgrades based on student rank + R2/R2E factors
 * 3. Compute P(upgrade) for each target
 * 4. Compute expected seat value = P(upgrade) × upgrade_value + (1-P) × 0 (risk: losing seat)
 * 5. Compare expected upgrade value vs guaranteed current seat value
 * 6. Output BLOCK / SLIDE / CAUTION with reasoning
 */

import { COLLEGES } from '../data/colleges';
import { BRANCHES } from '../data/branches';
import { getRoundFactor, getUpgradeProbability, R1_TO_R2E_IMPROVEMENT, Round } from '../data/roundFactors';
import { getYearlyStats } from '../data/syntheticData';

export type BlockingDecision = 'BLOCK' | 'SLIDE' | 'CAUTION';

export interface CurrentAllotment {
  collegeCode: string;
  branchCode: string;
  allottedInRound: Round;
}

export interface UpgradeTarget {
  collegeCode: string;
  branchCode: string;
  priority: number; // 1 = most preferred
}

export interface UpgradeAnalysis {
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  priority: number;
  predictedR2Cutoff: number;
  predictedR2ECutoff: number;
  upgradeProb: number;      // probability in next round
  upgradeProbFinal: number; // probability in final round
  isRealistic: boolean;     // > 30% chance
  valueGain: number;        // how much better this seat is (0–100)
}

export interface BlockingAnalysis {
  decision: BlockingDecision;
  confidence: number;        // 0–1
  currentSeatScore: number;  // 0–100 — how good is the current seat
  expectedUpgradeValue: number; // probability-weighted upgrade value
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  roundContext: Round;       // which round the student is in now
  reasoning: string[];       // bullet point explanations
  upgradeAnalyses: UpgradeAnalysis[];
  topRecommendation: string; // one-line summary
  nextSteps: string[];       // actionable advice
}

/**
 * Score a college+branch combination on a 0–100 scale
 * Higher = better (more prestigious + more demanded)
 */
function scoreSeat(collegeCode: string, branchCode: string): number {
  const college = COLLEGES.find(c => c.code === collegeCode);
  const branch = BRANCHES.find(b => b.code === branchCode);

  if (!college || !branch) return 50;

  // College score: 100 - (ranking × 1.8), clamped 0–100
  const collegeScore = Math.max(0, 100 - college.ranking * 1.8);

  // Branch score: demand index × 10 (0–100)
  const branchScore = branch.demandIndex * 10;

  // Weighted composite
  return Math.round(collegeScore * 0.55 + branchScore * 0.45);
}

/**
 * Get predicted cutoff for a college+branch+category in a given round
 */
function getPredictedCutoff(
  collegeCode: string,
  branchCode: string,
  category: string,
  round: Round
): number {
  const stats = getYearlyStats();

  // Get 2025 R1 baseline
  const stat2025 = stats.find(
    s => s.academicYear === 2025 && s.category === category &&
      s.collegeCode === collegeCode && s.branchCode === branchCode
  );

  if (!stat2025) return 0;

  const factor = getRoundFactor(round, branchCode);
  return Math.round(stat2025.cutoffRank * factor);
}

/**
 * Determine risk level based on round context and upgrade probability
 */
function determineRisk(
  round: Round,
  maxUpgradeProb: number,
  currentSeatScore: number
): 'Low' | 'Medium' | 'High' | 'Very High' {
  // R2E is the final round — losing your seat is catastrophic
  if (round === 'R2E') return 'Very High';

  if (currentSeatScore >= 75) {
    // Current seat is very good — don't risk it unless upgrade is near-certain
    if (maxUpgradeProb < 0.6) return 'High';
    if (maxUpgradeProb < 0.8) return 'Medium';
    return 'Low';
  }

  if (currentSeatScore >= 50) {
    if (maxUpgradeProb < 0.45) return 'High';
    if (maxUpgradeProb < 0.65) return 'Medium';
    return 'Low';
  }

  // Current seat is mediocre — worth taking risk
  if (maxUpgradeProb < 0.30) return 'High';
  if (maxUpgradeProb < 0.50) return 'Medium';
  return 'Low';
}

/**
 * Main blocking advisor function
 */
export function analyzeBlocking(
  studentRank: number,
  category: string,
  currentAllotment: CurrentAllotment,
  upgradeTargets: UpgradeTarget[],
  currentRound: Round
): BlockingAnalysis {
  const currentScore = scoreSeat(currentAllotment.collegeCode, currentAllotment.branchCode);
  const currentCollege = COLLEGES.find(c => c.code === currentAllotment.collegeCode);
  const currentBranch = BRANCHES.find(b => b.code === currentAllotment.branchCode);
  const currentCollegeName = currentCollege?.name ?? currentAllotment.collegeCode;
  const currentBranchName = currentBranch?.name ?? currentAllotment.branchCode;

  // Determine next round
  const nextRound: Round = currentRound === 'R1' ? 'R2' : 'R2E';
  const isFinalRound = currentRound === 'R2E' || currentRound === 'R2';

  // Analyze each upgrade target
  const upgradeAnalyses: UpgradeAnalysis[] = upgradeTargets
    .filter(t => !(t.collegeCode === currentAllotment.collegeCode && t.branchCode === currentAllotment.branchCode))
    .map(target => {
      const targetScore = scoreSeat(target.collegeCode, target.branchCode);
      const valueGain = Math.max(0, targetScore - currentScore);

      const predR2 = getPredictedCutoff(target.collegeCode, target.branchCode, category, nextRound);
      const predR2E = getPredictedCutoff(target.collegeCode, target.branchCode, category, 'R2E');

      const upgradeProb = predR2 > 0 ? getUpgradeProbability(studentRank, predR2) : 0;
      const upgradeProbFinal = predR2E > 0 ? getUpgradeProbability(studentRank, predR2E) : 0;

      const college = COLLEGES.find(c => c.code === target.collegeCode);
      const branch = BRANCHES.find(b => b.code === target.branchCode);

      return {
        collegeCode: target.collegeCode,
        collegeName: college?.name ?? target.collegeCode,
        branchCode: target.branchCode,
        branchName: branch?.name ?? target.branchCode,
        priority: target.priority,
        predictedR2Cutoff: predR2,
        predictedR2ECutoff: predR2E,
        upgradeProb,
        upgradeProbFinal,
        isRealistic: upgradeProb > 0.30,
        valueGain,
      };
    })
    .sort((a, b) => a.priority - b.priority);

  const realisticUpgrades = upgradeAnalyses.filter(u => u.isRealistic);
  const maxUpgradeProb = Math.max(0, ...upgradeAnalyses.map(u => u.upgradeProb));
  const bestUpgrade = upgradeAnalyses[0];

  // Expected value of sliding
  // EV(slide) = P(best upgrade) × upgrade_score + (1 - P) × risk_penalty
  // Risk penalty: if you slide and fail, you might lose the seat
  const riskPenalty = currentRound === 'R2E' ? 0 : currentScore * 0.3;
  const expectedUpgradeValue = bestUpgrade
    ? (bestUpgrade.upgradeProb * (currentScore + bestUpgrade.valueGain)) +
      ((1 - bestUpgrade.upgradeProb) * (currentScore - riskPenalty))
    : currentScore;

  const riskLevel = determineRisk(currentRound, maxUpgradeProb, currentScore);

  // ── Decision Logic ──────────────────────────────────────────────
  let decision: BlockingDecision;
  let confidence: number;
  const reasoning: string[] = [];
  const nextSteps: string[] = [];

  if (currentRound === 'R2E') {
    // This is the FINAL round. If you have a seat, BLOCK.
    decision = 'BLOCK';
    confidence = 0.97;
    reasoning.push(`🚨 This is the FINAL round (R2E). Blocking is strongly recommended.`);
    reasoning.push(`Any seat not blocked in R2E is forfeited. There is no further round.`);
    reasoning.push(`Your current seat at ${currentCollegeName} - ${currentBranchName} is secured.`);
    nextSteps.push('Go to the KEA portal and select "Freeze" for your current allotment.');
    nextSteps.push('Download and save your allotment order as proof.');
    nextSteps.push('Complete fee payment within the deadline.');
  } else if (realisticUpgrades.length === 0) {
    // No realistic upgrade target exists
    decision = 'BLOCK';
    confidence = 0.88;
    reasoning.push(`No upgrade target has more than 30% probability of allotment given your rank of ${studentRank.toLocaleString('en-IN')}.`);
    reasoning.push(`Your current seat (score: ${currentScore}/100) is good relative to your rank.`);
    reasoning.push(`Sliding without realistic upgrade targets is not advisable.`);
    nextSteps.push('Accept (freeze) your current allotment at the KEA portal.');
    nextSteps.push('The seat is worth securing rather than risking it for uncertain upgrades.');
  } else if (currentScore >= 80 && maxUpgradeProb < 0.65) {
    // Current seat is excellent — don't risk it
    decision = 'BLOCK';
    confidence = 0.82;
    reasoning.push(`Your current seat (${currentCollegeName} - ${currentBranchName}) has a high value score of ${currentScore}/100.`);
    reasoning.push(`The best upgrade probability is ${Math.round(maxUpgradeProb * 100)}% — not high enough to justify the risk.`);
    reasoning.push(`Expected value of sliding (${expectedUpgradeValue.toFixed(0)}) is lower than guaranteed current value (${currentScore}).`);
    nextSteps.push('Freeze your current allotment. You have an excellent seat.');
    nextSteps.push('Upgrading is possible but the risk of losing this seat is not worth it.');
  } else if (expectedUpgradeValue > currentScore + 8 && maxUpgradeProb > 0.55) {
    // Clear upgrade path with good probability
    decision = 'SLIDE';
    confidence = Math.min(0.92, 0.5 + maxUpgradeProb * 0.45);
    reasoning.push(`${realisticUpgrades.length} realistic upgrade option(s) found with >30% probability.`);
    reasoning.push(`Best upgrade: ${bestUpgrade?.collegeName} - ${bestUpgrade?.branchName} at ${Math.round((bestUpgrade?.upgradeProb ?? 0) * 100)}% probability.`);
    reasoning.push(`Expected slide value (${expectedUpgradeValue.toFixed(0)}) exceeds guaranteed current value (${currentScore}).`);
    if (currentScore < 45) reasoning.push('Your current seat is relatively modest — it is worth attempting an upgrade.');
    nextSteps.push(`Choose "Slide" at the KEA portal to stay in Round ${nextRound === 'R2' ? '2' : '2 Extended'}.`);
    nextSteps.push(`Ensure your preferred upgrades (${bestUpgrade?.collegeName}) are listed higher in your option entry.`);
    nextSteps.push('Have a backup plan in case the upgrade does not materialize.');
  } else {
    // Borderline — CAUTION
    decision = 'CAUTION';
    confidence = 0.60;
    reasoning.push(`This is a borderline case. Upgrade probability is ${Math.round(maxUpgradeProb * 100)}% — neither very high nor very low.`);
    reasoning.push(`Current seat value (${currentScore}/100) vs expected upgrade value (${expectedUpgradeValue.toFixed(0)}/100).`);
    reasoning.push(`Risk level: ${riskLevel}.`);
    if (currentScore >= 60) reasoning.push('Your current seat is good. Only slide if the upgrade is your strong preference.');
    nextSteps.push('Carefully weigh: how much do you want the upgrade vs how comfortable you are with the current seat?');
    nextSteps.push('If the upgrade college is significantly better for your career goals, sliding may be worth it.');
    nextSteps.push('If your current seat is satisfactory, blocking is the safer choice.');
  }

  // Build top recommendation text
  const topRecommendation = `${decision === 'BLOCK' ? '🛡️ BLOCK' : decision === 'SLIDE' ? '🚀 SLIDE' : '⚠️ CAUTION'}: ${
    decision === 'BLOCK'
      ? `Keep your seat at ${currentCollegeName} - ${currentBranchName}.`
      : decision === 'SLIDE'
      ? `Slide for a chance to upgrade to ${bestUpgrade?.collegeName ?? 'a better option'}.`
      : `Carefully consider before deciding.`
  } (${Math.round(confidence * 100)}% confidence)`;

  return {
    decision,
    confidence,
    currentSeatScore: currentScore,
    expectedUpgradeValue,
    riskLevel,
    roundContext: currentRound,
    reasoning,
    upgradeAnalyses,
    topRecommendation,
    nextSteps,
  };
}
