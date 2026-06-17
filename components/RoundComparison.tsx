'use client';

import { useMemo } from 'react';
import { PredictionResult, StudentInput } from '@/lib/prediction/engine';
import { getRoundFactor, ROUND_LABELS, Round, ROUND_DESCRIPTIONS } from '@/lib/data/roundFactors';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface Props {
  baseResult: PredictionResult;
  studentInput: StudentInput;
}

interface RoundRow {
  round: Round;
  predictedCutoff: number;
  tier: string;
  prob: number;
}

export default function RoundComparison({ baseResult, studentInput }: Props) {
  const rounds: Round[] = ['MOCK', 'R1', 'R2', 'R2E'];

  const topOptions = useMemo(() => {
    return baseResult.recommendations.slice(0, 12);
  }, [baseResult]);

  const getAdjustedCutoff = (baseCutoff: number, round: Round, branchCode: string): number => {
    const factor = getRoundFactor(round, branchCode);
    return Math.round(baseCutoff * factor);
  };

  const getTier = (cutoff: number, rank: number): { tier: string; color: string } => {
    const ratio = cutoff / rank;
    if (ratio < 0.82)  return { tier: 'Dream',     color: '#f43f5e' };
    if (ratio <= 1.08) return { tier: 'Realistic',  color: '#f59e0b' };
    if (ratio > 1.25)  return { tier: 'Safe',       color: '#10b981' };
    return              { tier: 'Reach',      color: '#8b5cf6' };
  };

  return (
    <div className="animate-fade-in">
      {/* Header explanation */}
      <div style={{
        padding: '1rem', marginBottom: '1.5rem',
        background: 'rgba(99,102,241,0.07)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      }}>
        <Info size={18} style={{ color: 'var(--color-brand-500)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          KCET cutoffs <strong style={{ color: 'var(--text-primary)' }}>relax across rounds</strong> — 
          Mock round is the most competitive, Round 2 Extended is easiest. 
          High-demand branches (CSE, AIML) barely budge; low-demand branches (Civil, Mech) can improve significantly.
          Use this table to plan which options to add for each round.
        </div>
      </div>

      {/* Round legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {rounds.map(r => (
          <div key={r} style={{
            padding: '0.875rem',
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {ROUND_LABELS[r]}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {ROUND_DESCRIPTIONS[r].slice(0, 80)}...
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', background: 'var(--surface-1)' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: '0.82rem', whiteSpace: 'nowrap',
        }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                College — Branch
              </th>
              {rounds.map(r => (
                <th key={r} style={{ padding: '0.75rem 0.875rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {r}
                </th>
              ))}
              <th style={{ padding: '0.75rem 0.875rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Trend R1→R2E
              </th>
            </tr>
          </thead>
          <tbody>
            {topOptions.map((rec, idx) => {
              const rowsByRound: Record<Round, { cutoff: number; tier: string; color: string }> = {} as any;
              for (const r of rounds) {
                const cutoff = getAdjustedCutoff(rec.predictedCutoff, r, rec.branchCode);
                const { tier, color } = getTier(cutoff, studentInput.rank);
                rowsByRound[r] = { cutoff, tier, color };
              }
              const improvement = Math.round(
                ((rowsByRound['R2E'].cutoff - rowsByRound['R1'].cutoff) / rowsByRound['R1'].cutoff) * 100
              );

              return (
                <tr key={rec.id} style={{
                  borderTop: '1px solid var(--surface-border)',
                  background: idx % 2 === 1 ? 'var(--surface-2)' : 'var(--surface-1)',
                }}>
                  {/* College name */}
                  <td style={{ padding: '0.75rem 1rem', maxWidth: 200 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.collegeName.slice(0, 28)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {rec.branchShortName} • {rec.city}
                    </div>
                  </td>

                  {/* Round columns */}
                  {rounds.map(r => {
                    const { cutoff, tier, color } = rowsByRound[r];
                    return (
                      <td key={r} style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                          {cutoff.toLocaleString('en-IN')}
                        </div>
                        <span style={{
                          display: 'inline-block', padding: '0.1rem 0.45rem',
                          borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
                          background: `${color}20`, color,
                          marginTop: '0.2rem',
                        }}>
                          {tier}
                        </span>
                      </td>
                    );
                  })}

                  {/* Trend */}
                  <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.2rem 0.5rem',
                      background: improvement > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                      borderRadius: '999px',
                      color: improvement > 0 ? '#059669' : '#dc2626',
                      fontWeight: 700, fontSize: '0.75rem',
                    }}>
                      {improvement > 0
                        ? <TrendingUp size={11} />
                        : improvement < 0
                        ? <TrendingDown size={11} />
                        : <Minus size={11} />
                      }
                      {improvement > 0 ? '+' : ''}{improvement}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
        Cutoffs shown are predicted for your rank ({studentInput.rank.toLocaleString('en-IN')}) in category {studentInput.category}. 
        Positive trend = easier to get in later rounds.
      </p>
    </div>
  );
}
