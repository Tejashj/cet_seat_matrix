'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Recommendation } from '@/lib/prediction/engine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  recommendation: Recommendation;
  studentRank: number;
}

export default function CutoffTrendChart({ recommendation, studentRank }: Props) {
  const data = recommendation.historicalCutoffs.map(h => ({
    year: h.year.toString(),
    cutoff: h.cutoff,
  }));

  const minCutoff = Math.min(...data.map(d => d.cutoff));
  const maxCutoff = Math.max(...data.map(d => d.cutoff));
  const domain = [Math.max(0, minCutoff - 500), maxCutoff + 500];

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
      }}>
        {recommendation.trendDirection === 'Rising' ? (
          <TrendingDown size={14} style={{ color: 'var(--color-dream)' }} />
        ) : recommendation.trendDirection === 'Falling' ? (
          <TrendingUp size={14} style={{ color: 'var(--color-safe)' }} />
        ) : (
          <Minus size={14} style={{ color: 'var(--text-muted)' }} />
        )}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          6-Year Cutoff Trend •{' '}
          <span style={{
            color: recommendation.trendDirection === 'Rising'
              ? 'var(--color-dream)'
              : recommendation.trendDirection === 'Falling'
              ? 'var(--color-safe)'
              : 'var(--text-muted)',
            fontWeight: 700,
          }}>
            {recommendation.trendDirection}
            {recommendation.trendPercent > 0 && ` (${recommendation.trendPercent.toFixed(1)}%)`}
          </span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <YAxis
            domain={domain}
            tickFormatter={v => v.toLocaleString('en-IN')}
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            width={55}
          />
          <Tooltip
            formatter={(v) => [Number(v ?? 0).toLocaleString('en-IN'), 'Cutoff Rank']}
            contentStyle={{
              background: 'var(--surface-1)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
            }}
          />
          <ReferenceLine
            y={studentRank}
            stroke="#f43f5e"
            strokeDasharray="5 3"
            label={{ value: 'Your Rank', position: 'insideTopRight', fontSize: 9, fill: '#f43f5e' }}
          />
          <Line
            type="monotone"
            dataKey="cutoff"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 3 }}
            activeDot={{ r: 5, fill: '#8b5cf6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
