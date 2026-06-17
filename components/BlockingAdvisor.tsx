'use client';

import { useState, useMemo } from 'react';
import { COLLEGES } from '@/lib/data/colleges';
import { BRANCHES } from '@/lib/data/branches';
import { CATEGORIES } from '@/lib/data/categories';
import { analyzeBlocking, BlockingDecision, UpgradeTarget, CurrentAllotment } from '@/lib/advisor/blockingAdvisor';
import { ROUND_LABELS, Round } from '@/lib/data/roundFactors';
import {
  Shield, Rocket, AlertTriangle, Plus, Trash2, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Info, Lightbulb, BarChart3, CheckCircle2
} from 'lucide-react';

interface Props {
  studentRank: number;
  studentCategory: string;
}

const DECISION_CONFIG: Record<BlockingDecision, {
  color: string; bg: string; border: string;
  icon: React.ReactNode; label: string; gradient: string;
}> = {
  BLOCK: {
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    icon: <Shield size={28} />, label: 'BLOCK (Freeze Seat)',
    gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
  },
  SLIDE: {
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    icon: <Rocket size={28} />, label: 'SLIDE (Try Upgrade)',
    gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
  },
  CAUTION: {
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    icon: <AlertTriangle size={28} />, label: 'CAUTION (Think Carefully)',
    gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  },
};

const RISK_COLORS = {
  Low: '#10b981', Medium: '#f59e0b', High: '#f97316', 'Very High': '#ef4444',
};

function RiskMeter({ level }: { level: string }) {
  const levels = ['Low', 'Medium', 'High', 'Very High'];
  const idx = levels.indexOf(level);
  const color = RISK_COLORS[level as keyof typeof RISK_COLORS] ?? '#94a3b8';
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
        RISK LEVEL
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
        {levels.map((l, i) => (
          <div key={l} style={{
            flex: 1, height: 8, borderRadius: 4,
            background: i <= idx ? color : 'var(--surface-border)',
            transition: 'background 300ms',
          }} />
        ))}
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color, marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
          {level}
        </span>
      </div>
    </div>
  );
}

export default function BlockingAdvisor({ studentRank, studentCategory }: Props) {
  // Current allotment state
  const [currentCollege, setCurrentCollege] = useState('');
  const [currentBranch, setCurrentBranch] = useState('');
  const [currentRound, setCurrentRound] = useState<Round>('R1');

  // Upgrade targets
  const [targets, setTargets] = useState<UpgradeTarget[]>([
    { collegeCode: '', branchCode: '', priority: 1 },
  ]);

  const [result, setResult] = useState<ReturnType<typeof analyzeBlocking> | null>(null);
  const [expandedUpgrade, setExpandedUpgrade] = useState<number | null>(null);

  const addTarget = () => {
    setTargets(prev => [...prev, { collegeCode: '', branchCode: '', priority: prev.length + 1 }]);
  };

  const removeTarget = (idx: number) => {
    setTargets(prev => prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, priority: i + 1 })));
  };

  const updateTarget = (idx: number, field: keyof UpgradeTarget, value: string | number) => {
    setTargets(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const canAnalyze = currentCollege && currentBranch &&
    targets.some(t => t.collegeCode && t.branchCode);

  const handleAnalyze = () => {
    const validTargets = targets.filter(t => t.collegeCode && t.branchCode);
    const analysis = analyzeBlocking(
      studentRank,
      studentCategory,
      { collegeCode: currentCollege, branchCode: currentBranch, allottedInRound: currentRound },
      validTargets,
      currentRound
    );
    setResult(analysis);
  };

  const config = result ? DECISION_CONFIG[result.decision] : null;

  return (
    <div className="animate-fade-in">
      {/* Explainer */}
      <div style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        padding: '1rem', background: 'rgba(99,102,241,0.07)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
      }}>
        <Info size={18} style={{ color: 'var(--color-brand-500)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>What is blocking?</strong> After each KCET round, you must choose to either{' '}
          <strong>Freeze</strong> (accept current seat, exit process) or <strong>Slide</strong> (stay in process hoping for upgrade in next round).
          Sliding carries risk — if Round 2/R2E gives nothing better, you may lose your current seat.
          This AI analyzes your specific situation and gives a recommendation.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* ── LEFT PANEL: Inputs ── */}
        <div>
          {/* Current Allotment */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: 'var(--color-safe)' }} /> Your Current Allotted Seat
            </h3>

            <div className="input-group">
              <label className="input-label">Round you received this seat in</label>
              <select className="input" value={currentRound} onChange={e => setCurrentRound(e.target.value as Round)}>
                {(Object.entries(ROUND_LABELS) as [Round, string][]).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Allotted College</label>
              <select className="input" value={currentCollege} onChange={e => setCurrentCollege(e.target.value)}>
                <option value="">— Select college —</option>
                {COLLEGES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Allotted Branch</label>
              <select className="input" value={currentBranch} onChange={e => setCurrentBranch(e.target.value)}>
                <option value="">— Select branch —</option>
                {BRANCHES.map(b => (
                  <option key={b.code} value={b.code}>{b.shortName} — {b.name}</option>
                ))}
              </select>
            </div>

            {currentCollege && currentBranch && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem', background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)',
              }}>
                <CheckCircle2 size={14} style={{ color: 'var(--color-safe)' }} />
                <span>
                  <strong>{COLLEGES.find(c => c.code === currentCollege)?.name}</strong>
                  {' — '}{BRANCHES.find(b => b.code === currentBranch)?.shortName}
                </span>
              </div>
            )}
          </div>

          {/* Upgrade targets */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Rocket size={16} style={{ color: 'var(--color-reach)' }} /> Upgrade Targets (preferred seats)
            </h3>

            {targets.map((target, idx) => (
              <div key={idx} style={{
                padding: '0.875rem', marginBottom: '0.75rem',
                background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--surface-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--color-brand-500)', color: 'white',
                    fontSize: '0.72rem', fontWeight: 700,
                  }}>{idx + 1}</span>
                  {targets.length > 1 && (
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => removeTarget(idx)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <select
                  className="input"
                  value={target.collegeCode}
                  onChange={e => updateTarget(idx, 'collegeCode', e.target.value)}
                  style={{ marginBottom: '0.5rem', fontSize: '0.82rem' }}
                >
                  <option value="">— Target college —</option>
                  {COLLEGES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={target.branchCode}
                  onChange={e => updateTarget(idx, 'branchCode', e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                >
                  <option value="">— Target branch —</option>
                  {BRANCHES.map(b => (
                    <option key={b.code} value={b.code}>{b.shortName} — {b.name}</option>
                  ))}
                </select>
              </div>
            ))}

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: '0.375rem' }}
              onClick={addTarget}
              disabled={targets.length >= 5}
            >
              <Plus size={14} /> Add Another Target
            </button>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            id="analyze-blocking-btn"
          >
            <BarChart3 size={18} /> Analyze My Blocking Decision
          </button>
        </div>

        {/* ── RIGHT PANEL: Results ── */}
        <div>
          {!result ? (
            <div style={{
              height: '100%', minHeight: 400,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '2rem',
              border: '2px dashed var(--surface-border)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <Lightbulb size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                AI Blocking Advisor
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Fill in your current allotted seat and the seats you'd prefer to upgrade to.
                Our AI will analyze whether blocking or sliding is a better move for your specific situation.
              </p>
            </div>
          ) : config && (
            <div className="animate-fade-in">
              {/* Main Decision Banner */}
              <div style={{
                background: config.gradient,
                border: `2px solid ${config.border}`,
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1.25rem',
              }}>
                <div style={{ color: config.color, marginBottom: '0.5rem' }}>{config.icon}</div>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: config.color, marginBottom: '0.25rem',
                  letterSpacing: '-0.02em',
                }}>
                  {result.decision}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: config.color, marginBottom: '0.75rem' }}>
                  {config.label}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.25rem 0.875rem',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: '999px',
                  fontSize: '0.8rem', fontWeight: 700, color: config.color,
                }}>
                  {Math.round(result.confidence * 100)}% Confidence
                </div>
              </div>

              {/* Top recommendation */}
              <div style={{
                padding: '0.875rem 1rem',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.87rem', color: 'var(--text-primary)',
                fontWeight: 600, marginBottom: '1.25rem',
                lineHeight: 1.5,
              }}>
                {result.topRecommendation}
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem', background: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Seat Score
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>
                    {result.currentSeatScore}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <div style={{ padding: '0.875rem', background: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Expected Upgrade Value
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-brand-600)', lineHeight: 1 }}>
                    {result.expectedUpgradeValue.toFixed(0)}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Risk meter */}
              <div style={{ padding: '0.875rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <RiskMeter level={result.riskLevel} />
              </div>

              {/* Reasoning */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
                  Why this recommendation?
                </div>
                {result.reasoning.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                    fontSize: '0.82rem', color: 'var(--text-secondary)',
                    padding: '0.4rem 0',
                    borderBottom: i < result.reasoning.length - 1 ? '1px solid var(--surface-border)' : 'none',
                  }}>
                    <span style={{ flexShrink: 0, width: 18, height: 18, background: 'var(--color-brand-100)', color: 'var(--color-brand-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, marginTop: 1 }}>
                      {i + 1}
                    </span>
                    {r}
                  </div>
                ))}
              </div>

              {/* Upgrade analyses */}
              {result.upgradeAnalyses.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
                    Upgrade Probability Analysis
                  </div>
                  {result.upgradeAnalyses.map((u, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: u.isRealistic ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
                      border: `1px solid ${u.isRealistic ? 'rgba(16,185,129,0.2)' : 'var(--surface-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                            {u.collegeName.slice(0, 35)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>
                            — {u.branchName}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700,
                          color: u.isRealistic ? '#059669' : '#dc2626',
                        }}>
                          {u.isRealistic ? '✓ Realistic' : '✗ Stretch'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>Next round: <strong style={{ color: u.upgradeProb > 0.5 ? '#059669' : 'var(--text-primary)' }}>{Math.round(u.upgradeProb * 100)}%</strong></span>
                        <span>Final round: <strong style={{ color: u.upgradeProbFinal > 0.5 ? '#059669' : 'var(--text-primary)' }}>{Math.round(u.upgradeProbFinal * 100)}%</strong></span>
                        <span>Value gain: <strong>+{u.valueGain}</strong></span>
                      </div>
                      <div className="progress-bar" style={{ marginTop: '0.4rem' }}>
                        <div className="progress-fill" style={{
                          width: `${u.upgradeProb * 100}%`,
                          background: u.isRealistic ? '#10b981' : '#f59e0b',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next steps */}
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
                  🎯 Your Next Steps
                </div>
                {result.nextSteps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                    fontSize: '0.82rem', color: 'var(--text-secondary)',
                    padding: '0.3rem 0',
                  }}>
                    <span style={{ color: 'var(--color-brand-500)', fontWeight: 700, flexShrink: 0 }}>→</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
