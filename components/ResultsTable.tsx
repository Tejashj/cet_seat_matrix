'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Recommendation, Tier } from '@/lib/prediction/engine';
import {
  Star, StarOff, TrendingUp, TrendingDown, Minus,
  ChevronUp, ChevronDown, ArrowUpDown, Building2, MapPin,
  IndianRupee, BarChart3, Award
} from 'lucide-react';

type SortField = 'priority' | 'predictedCutoff' | 'confidenceScore' | 'annualFee' | 'avgPackage' | 'collegeName';
type SortDir = 'asc' | 'desc';
type FilterTier = 'all' | Tier;

interface Props {
  recommendations: Recommendation[];
}

function TierBadge({ tier }: { tier: Tier }) {
  const classes: Record<Tier, string> = {
    Dream: 'badge badge-dream',
    Realistic: 'badge badge-realistic',
    Safe: 'badge badge-safe',
    Reach: 'badge badge-reach',
  };
  const emojis: Record<Tier, string> = {
    Dream: '🌟', Realistic: '🎯', Safe: '🛡️', Reach: '🚀',
  };
  return (
    <span className={classes[tier]}>
      {emojis[tier]} {tier}
    </span>
  );
}

function TrendIcon({ dir }: { dir: string }) {
  if (dir === 'Rising') return <TrendingUp size={14} style={{ color: 'var(--color-dream)' }} />;
  if (dir === 'Falling') return <TrendingDown size={14} style={{ color: 'var(--color-safe)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'var(--color-safe)' : pct >= 60 ? 'var(--color-realistic)' : 'var(--color-dream)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 80 }}>
      <div className="progress-bar" style={{ flex: 1, height: 5 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{pct}%</span>
    </div>
  );
}

export default function ResultsTable({ recommendations }: Props) {
  const { addToShortlist, removeFromShortlist, isShortlisted } = useAppStore();

  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th onClick={() => handleSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {label}
        {sortField === field ? (
          sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        ) : (
          <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
        )}
      </div>
    </th>
  );

  const filtered = useMemo(() => {
    let list = [...recommendations];

    if (filterTier !== 'all') list = list.filter(r => r.tier === filterTier);
    if (filterType !== 'all') list = list.filter(r => r.collegeType === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.collegeName.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.collegeCode.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortField) {
        case 'priority': va = a.priority; vb = b.priority; break;
        case 'predictedCutoff': va = a.predictedCutoff; vb = b.predictedCutoff; break;
        case 'confidenceScore': va = a.confidenceScore; vb = b.confidenceScore; break;
        case 'annualFee': va = a.annualFee; vb = b.annualFee; break;
        case 'avgPackage': va = a.avgPackage; vb = b.avgPackage; break;
        case 'collegeName': va = a.collegeName; vb = b.collegeName; break;
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

    return list;
  }, [recommendations, filterTier, filterType, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const tierCounts = useMemo(() => ({
    all: recommendations.length,
    Dream: recommendations.filter(r => r.tier === 'Dream').length,
    Realistic: recommendations.filter(r => r.tier === 'Realistic').length,
    Safe: recommendations.filter(r => r.tier === 'Safe').length,
    Reach: recommendations.filter(r => r.tier === 'Reach').length,
  }), [recommendations]);

  return (
    <div className="animate-fade-in">
      {/* ── Filters ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
        alignItems: 'center', marginBottom: '1.25rem',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <input
            className="input"
            placeholder="Search college, branch, city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '2.25rem' }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Building2 size={15} />
          </span>
        </div>

        {/* Tier filter pills */}
        {(['all', 'Dream', 'Realistic', 'Safe', 'Reach'] as const).map(tier => (
          <button
            key={tier}
            type="button"
            onClick={() => { setFilterTier(tier); setPage(1); }}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer',
              border: `1.5px solid ${filterTier === tier ? 'var(--color-brand-500)' : 'var(--surface-border)'}`,
              background: filterTier === tier ? 'var(--color-brand-100)' : 'var(--surface-1)',
              color: filterTier === tier ? 'var(--color-brand-700)' : 'var(--text-secondary)',
              transition: 'all 150ms',
            }}
          >
            {tier === 'all' ? 'All' : tier} {tierCounts[tier] > 0 && <span style={{ opacity: 0.65 }}>({tierCounts[tier === 'all' ? 'all' : tier]})</span>}
          </button>
        ))}

        {/* College type filter */}
        <select
          className="input"
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1); }}
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value="all">All Types</option>
          <option value="Government">Government</option>
          <option value="Aided">Aided</option>
          <option value="Unaided">Private/Unaided</option>
          <option value="Autonomous">Autonomous</option>
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> options
        {search && ` matching "${search}"`}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', background: 'var(--surface-1)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader field="priority" label="#" />
              <th>College</th>
              <th className="hide-mobile">Branch</th>
              <SortHeader field="predictedCutoff" label="Cutoff" />
              <th>Tier</th>
              <SortHeader field="confidenceScore" label="Confidence" />
              <th className="hide-mobile">Trend</th>
              <SortHeader field="annualFee" label="Fee" />
              <SortHeader field="avgPackage" label="Pkg" />
              <th>★</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No results found. Try removing some filters.
                </td>
              </tr>
            ) : paginated.map((rec, i) => {
              const saved = isShortlisted(rec.id);
              return (
                <tr key={rec.id} className="animate-stagger" style={{ animationDelay: `${i * 0.03}s` }}>
                  {/* Priority */}
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26,
                      background: i < 3 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--surface-3)',
                      color: i < 3 ? 'white' : 'var(--text-secondary)',
                      borderRadius: '50%',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {rec.priority}
                    </span>
                  </td>

                  {/* College */}
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {rec.collegeName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <MapPin size={10} />
                      {rec.city}
                      <span style={{
                        marginLeft: '0.25rem', padding: '0 0.4rem',
                        background: 'var(--surface-3)', borderRadius: '4px',
                        fontSize: '0.68rem', fontWeight: 600,
                      }}>
                        {rec.naac}
                      </span>
                    </div>
                  </td>

                  {/* Branch */}
                  <td className="hide-mobile">
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{rec.branchShortName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.branchName}
                    </div>
                  </td>

                  {/* Predicted cutoff */}
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                      {rec.predictedCutoff.toLocaleString('en-IN')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: rec.safetyMargin > 0 ? 'var(--color-safe)' : 'var(--color-dream)' }}>
                      {rec.safetyMargin > 0 ? '+' : ''}{rec.safetyMargin.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Tier */}
                  <td><TierBadge tier={rec.tier} /></td>

                  {/* Confidence */}
                  <td><ConfidenceBar score={rec.confidenceScore} /></td>

                  {/* Trend */}
                  <td className="hide-mobile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <TrendIcon dir={rec.trendDirection} />
                      {rec.trendDirection}
                    </div>
                  </td>

                  {/* Fee */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.8rem' }}>
                      <IndianRupee size={11} />
                      {(rec.annualFee / 1000).toFixed(0)}K
                    </div>
                  </td>

                  {/* Package */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.8rem' }}>
                      <Award size={11} />
                      {rec.avgPackage}L
                    </div>
                  </td>

                  {/* Shortlist */}
                  <td>
                    <button
                      className="btn btn-icon btn-ghost"
                      onClick={() => saved ? removeFromShortlist(rec.id) : addToShortlist(rec)}
                      title={saved ? 'Remove from shortlist' : 'Add to shortlist'}
                      style={{ color: saved ? '#f59e0b' : 'var(--text-muted)' }}
                    >
                      {saved ? <Star size={16} fill="#f59e0b" /> : <StarOff size={16} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', marginTop: '1.25rem',
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p = page <= 4 ? i + 1 : page + i - 3;
            if (p < 1 || p > totalPages) return null;
            return (
              <button
                key={p}
                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
