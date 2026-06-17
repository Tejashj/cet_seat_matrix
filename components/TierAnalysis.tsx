'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { PredictionResult } from '@/lib/prediction/engine';
import { Trophy, TrendingUp, Shield, Zap, Percent } from 'lucide-react';

interface Props {
  result: PredictionResult;
}

const TIER_COLORS: Record<string, string> = {
  Dream: '#f43f5e',
  Realistic: '#f59e0b',
  Safe: '#10b981',
  Reach: '#8b5cf6',
};

export default function TierAnalysis({ result }: Props) {
  const tiers = [
    { name: 'Realistic', count: result.realisticColleges.length, color: TIER_COLORS.Realistic, icon: <Trophy size={18} />, desc: 'Best chances for admission based on your rank' },
    { name: 'Dream', count: result.dreamColleges.length, color: TIER_COLORS.Dream, icon: <Zap size={18} />, desc: 'Cutoff slightly above your rank — try your luck!' },
    { name: 'Safe', count: result.safeColleges.length, color: TIER_COLORS.Safe, icon: <Shield size={18} />, desc: 'High probability of admission — secure backups' },
    { name: 'Reach', count: result.reachColleges.length, color: TIER_COLORS.Reach, icon: <TrendingUp size={18} />, desc: 'Very competitive — very small chance' },
  ];

  const pieData = tiers.filter(t => t.count > 0).map(t => ({ name: t.name, value: t.count }));

  // Top 10 realistic options for bar chart
  const realisticTop10 = result.realisticColleges
    .slice(0, 10)
    .map(r => ({
      name: `${r.collegeCode} ${r.branchShortName}`,
      cutoff: r.predictedCutoff,
      prob: Math.round(r.probabilityOfAdmission * 100),
    }));

  return (
    <div className="animate-fade-in">
      {/* Tier summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {tiers.map(tier => (
          <div key={tier.name} className="card" style={{
            padding: '1.5rem',
            borderLeft: `4px solid ${tier.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ color: tier.color }}>{tier.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {tier.name}
              </span>
            </div>
            <div style={{
              fontSize: '2.5rem', fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              color: tier.color, lineHeight: 1, marginBottom: '0.5rem',
            }}>
              {tier.count}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {tier.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '1.5rem', marginBottom: '2rem',
      }}>
        {/* Pie chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={TIER_COLORS[entry.name]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [Number(value ?? 0).toLocaleString('en-IN'), name as string]}
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                }}
              />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>

          {/* Confidence */}
          <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Percent size={14} style={{ color: 'var(--color-brand-500)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Overall Confidence
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.round(result.overallConfidence * 100)}%` }} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brand-600)', marginTop: '0.35rem' }}>
              {Math.round(result.overallConfidence * 100)}%
            </div>
          </div>
        </div>

        {/* Bar chart - Top Realistic */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            🎯 Top Realistic Options — Predicted Cutoff
          </h3>
          {realisticTop10.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={realisticTop10} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => v.toLocaleString('en-IN')}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toLocaleString('en-IN'), 'Predicted Cutoff']}
                  contentStyle={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="cutoff" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No realistic options found for this rank/category combination.
            </div>
          )}
        </div>
      </div>

      {/* Strategy tips */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          💡 Strategy Tips for Option Entry
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
          {[
            { icon: '🌟', tip: 'Add 2-3 Dream options at the top. You might just get lucky!' },
            { icon: '🎯', tip: 'Fill in 10-15 Realistic options in the middle of your list.' },
            { icon: '🛡️', tip: 'Always add 3-5 Safe options at the bottom as your backup.' },
            { icon: '📋', tip: 'Prioritize colleges closer to your rank for better chances.' },
          ].map(({ icon, tip }) => (
            <div key={tip} style={{
              display: 'flex', gap: '0.625rem',
              padding: '0.875rem',
              background: 'var(--surface-1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)',
            }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
