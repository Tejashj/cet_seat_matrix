'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { CATEGORIES } from '@/lib/data/categories';
import { CITIES } from '@/lib/data/colleges';
import { BRANCHES } from '@/lib/data/branches';
import { StudentInput } from '@/lib/prediction/engine';
import { Round, ROUND_LABELS } from '@/lib/data/roundFactors';
import {
  Search, Loader2, ChevronDown, ChevronUp, Settings2, MapPin,
  GraduationCap, Trophy, AlertCircle, Layers
} from 'lucide-react';

const COLLEGE_TYPES = [
  { key: 'includeGovernment', label: 'Government', emoji: '🏛️' },
  { key: 'includeAided', label: 'Aided', emoji: '🤝' },
  { key: 'includePrivate', label: 'Private / Unaided', emoji: '🏢' },
];

export default function StudentForm() {
  const router = useRouter();
  const { setStudentInput, setPredictions, setLoading, setError, loading } = useAppStore();

  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('GM');
  const [round, setRound] = useState<Round>('R1');
  const [gender, setGender] = useState('');
  const [rural, setRural] = useState(false);
  const [kannadaMedium, setKannadaMedium] = useState(false);
  const [ph, setPh] = useState(false);
  const [exDefence, setExDefence] = useState(false);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [collegeTypes, setCollegeTypes] = useState({
    includeGovernment: true,
    includeAided: true,
    includePrivate: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formError, setFormError] = useState('');

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleBranch = (code: string) => {
    setSelectedBranches(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const rankNum = parseInt(rank);
    if (!rank || isNaN(rankNum) || rankNum < 1 || rankNum > 200000) {
      setFormError('Please enter a valid KCET rank between 1 and 200,000.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let customHistory: any[] = [];
      try {
        const { loadAllUploadedData } = await import('@/lib/data/indexedDB');
        const allData = await loadAllUploadedData();
        customHistory = allData
          .filter(r => r.category === category)
          .map(r => ({
            collegeCode: r.collegeCode,
            branchCode: r.branchCode,
            category: r.category,
            year: r.academicYear,
            cutoff: r.cutoffRank,
            round: r.round,
          }));
      } catch (dbError) {
        console.warn('IndexedDB read bypassed or failed:', dbError);
      }

      const input: StudentInput = {
        rank: rankNum,
        category,
        round,
        gender: gender || undefined,
        rural,
        kannadaMedium,
        ph,
        exDefence,
        preferredCities: selectedCities.length > 0 ? selectedCities : undefined,
        preferredBranches: selectedBranches.length > 0 ? selectedBranches : undefined,
        includeGovernment: collegeTypes.includeGovernment,
        includeAided: collegeTypes.includeAided,
        includePrivate: collegeTypes.includePrivate,
        customHistory: customHistory.length > 0 ? customHistory : undefined,
      };

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Prediction failed');
      }

      const result = await res.json();
      setStudentInput(input);
      setPredictions(result);
      router.push('/planner');
    } catch (err: any) {
      setError(err.message);
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 760, margin: '0 auto' }}
      className="animate-fade-in"
    >
      <div className="card" style={{ padding: '2.5rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Enter Your KCET Details
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No registration required • Results in under 1 second
          </p>
        </div>

        {/* Error */}
        {formError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.875rem 1rem',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#dc2626', fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={16} /> {formError}
          </div>
        )}

        {/* ── RANK + CATEGORY + ROUND (primary fields) ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem', marginBottom: '1.25rem',
        }}>
          {/* Rank */}
          <div className="input-group">
            <label className="input-label" htmlFor="rank">
              <Trophy size={13} style={{ display: 'inline', marginRight: 4 }} />
              KCET Rank *
            </label>
            <input
              id="rank"
              type="number"
              className="input"
              placeholder="e.g. 5000"
              value={rank}
              onChange={e => setRank(e.target.value)}
              min={1}
              max={200000}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Between 1 and 2,00,000
            </span>
          </div>

          {/* Category */}
          <div className="input-group">
            <label className="input-label" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>
                  {cat.code} — {cat.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Round */}
          <div className="input-group">
            <label className="input-label" htmlFor="round">
              <Layers size={13} style={{ display: 'inline', marginRight: 4 }} />
              Target Round *
            </label>
            <select
              id="round"
              className="input"
              value={round}
              onChange={e => setRound(e.target.value as Round)}
              style={{ cursor: 'pointer' }}
            >
              {(Object.entries(ROUND_LABELS) as [Round, string][]).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender */}
        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
          <label className="input-label">Gender (optional)</label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Male', 'Female', 'Transgender'].map(g => (
              <label key={g} className="checkbox-label" style={{
                padding: '0.5rem 0.875rem',
                border: `1.5px solid ${gender === g ? 'var(--color-brand-500)' : 'var(--surface-border)'}`,
                borderRadius: 'var(--radius-md)',
                background: gender === g ? 'var(--color-brand-50)' : 'var(--surface-1)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(gender === g ? '' : g)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: gender === g ? 600 : 400, color: gender === g ? 'var(--color-brand-700)' : 'var(--text-secondary)' }}>
                  {g}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quota checkboxes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            Quotas / Reservations
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { key: 'rural', label: 'Rural Quota', state: rural, setState: setRural },
              { key: 'km', label: 'Kannada Medium', state: kannadaMedium, setState: setKannadaMedium },
              { key: 'ph', label: 'PH / Differently Abled', state: ph, setState: setPh },
              { key: 'ex', label: 'Ex-Defence', state: exDefence, setState: setExDefence },
            ].map(({ key, label, state, setState }) => (
              <label key={key} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={e => setState(e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.75rem 1rem',
            background: 'var(--surface-2)', border: '1.5px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600,
            marginBottom: showAdvanced ? '1.25rem' : '2rem',
            transition: 'all 150ms',
          }}
        >
          <Settings2 size={16} />
          Advanced Filters (Cities, Branches, College Types)
          {showAdvanced ? <ChevronUp size={16} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={16} style={{ marginLeft: 'auto' }} />}
        </button>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
            {/* City filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                Preferred Cities (leave blank = all cities)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {CITIES.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(city)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1.5px solid ${selectedCities.includes(city) ? 'var(--color-brand-500)' : 'var(--surface-border)'}`,
                      background: selectedCities.includes(city) ? 'var(--color-brand-100)' : 'var(--surface-1)',
                      color: selectedCities.includes(city) ? 'var(--color-brand-700)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">
                Preferred Branches (leave blank = all branches)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {BRANCHES.map(branch => (
                  <button
                    key={branch.code}
                    type="button"
                    onClick={() => toggleBranch(branch.code)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1.5px solid ${selectedBranches.includes(branch.code) ? 'var(--color-brand-500)' : 'var(--surface-border)'}`,
                      background: selectedBranches.includes(branch.code) ? 'var(--color-brand-100)' : 'var(--surface-1)',
                      color: selectedBranches.includes(branch.code) ? 'var(--color-brand-700)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                  >
                    {branch.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* College type filter */}
            <div>
              <label className="input-label">College Types</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {COLLEGE_TYPES.map(({ key, label, emoji }) => (
                  <label key={key} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={collegeTypes[key as keyof typeof collegeTypes]}
                      onChange={e => setCollegeTypes(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    {emoji} {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', fontSize: '1rem', justifyContent: 'center' }}
          id="predict-btn"
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin-slow 0.7s linear infinite' }} />
              Analyzing 6 years of data...
            </>
          ) : (
            <>
              <Search size={18} />
              Get My Recommendations
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1rem' }}>
          Results are for guidance only. Always verify with KEA official website.
        </p>
      </div>
    </form>
  );
}
