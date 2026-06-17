'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import Navbar from '@/components/Navbar';
import ResultsTable from '@/components/ResultsTable';
import TierAnalysis from '@/components/TierAnalysis';
import ShortlistPanel from '@/components/ShortlistPanel';
import BlockingAdvisor from '@/components/BlockingAdvisor';
import RoundComparison from '@/components/RoundComparison';
import {
  BarChart3, Star, List, ArrowLeft, RefreshCw,
  Trophy, Zap, Shield, TrendingUp, Target, Clock
} from 'lucide-react';

type Tab = 'results' | 'tiers' | 'shortlist' | 'blocking' | 'round-compare';

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode, predictions, studentInput, shortlist, clearPredictions } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const tab = searchParams.get('tab');
    return (tab === 'shortlist' || tab === 'tiers' || tab === 'results' || tab === 'blocking' || tab === 'round-compare') ? tab : 'results';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Redirect if no predictions
  useEffect(() => {
    if (!predictions) {
      router.push('/');
    }
  }, [predictions, router]);

  if (!predictions || !studentInput) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'results', label: 'Recommendations', icon: <List size={16} />, count: predictions.totalRecommendations },
    { key: 'tiers', label: 'Tier Analysis', icon: <BarChart3 size={16} /> },
    { key: 'round-compare', label: 'Cross-Round Cutoffs', icon: <TrendingUp size={16} /> },
    { key: 'shortlist', label: 'My Shortlist', icon: <Star size={16} />, count: shortlist.length },
    { key: 'blocking', label: 'Seat Blocking Advisor', icon: <Shield size={16} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <Navbar />

      <div style={{ paddingTop: 80 }}>
        {/* ── Summary Header ── */}
        <div style={{
          background: 'var(--gradient-hero)',
          padding: '2.5rem 0 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            {/* Back button */}
            <button
              className="btn btn-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}
              onClick={() => router.push('/')}
            >
              <ArrowLeft size={14} /> Back to Form
            </button>

            <div style={{
              display: 'flex', flexWrap: 'wrap',
              alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem',
            }}>
              {/* Student info */}
              <div>
                <h1 className="font-display" style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  color: 'white', fontWeight: 800, marginBottom: '0.5rem',
                }}>
                  🎓 Recommendations for Rank {studentInput.rank.toLocaleString('en-IN')}
                </h1>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.625rem',
                  alignItems: 'center',
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(165,180,252,0.2)',
                    border: '1px solid rgba(165,180,252,0.3)',
                    borderRadius: '999px',
                    color: '#c7d2fe',
                    fontSize: '0.82rem', fontWeight: 700,
                  }}>
                    Category: {studentInput.category}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.82rem', color: 'rgba(203,213,225,0.8)',
                  }}>
                    <Clock size={12} />
                    Generated {new Date(predictions.predictionTimestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Modify / Clear */}
              <button
                className="btn btn-sm"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
                onClick={() => {
                  clearPredictions();
                  router.push('/');
                }}
              >
                <RefreshCw size={13} /> New Search
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.875rem', marginTop: '2rem',
              maxWidth: 640,
            }}>
              {[
                { icon: <List size={16} />, value: predictions.totalRecommendations, label: 'Total Options', color: '#a5b4fc' },
                { icon: <Zap size={16} />, value: predictions.dreamColleges.length, label: 'Dream', color: '#f87171' },
                { icon: <Target size={16} />, value: predictions.realisticColleges.length, label: 'Realistic', color: '#fbbf24' },
                { icon: <Shield size={16} />, value: predictions.safeColleges.length, label: 'Safe', color: '#34d399' },
              ].map(({ icon, value, label, color }) => (
                <div key={label} style={{
                  textAlign: 'center',
                  padding: '0.875rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ color, marginBottom: '0.25rem' }}>{icon}</div>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 900,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: 'white', lineHeight: 1, marginBottom: '0.2rem',
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.7)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs + Content ── */}
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Tab list */}
          <div className="tabs-list" style={{ marginBottom: '1.5rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab-trigger ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                id={`tab-${tab.key}`}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span style={{
                      background: activeTab === tab.key ? 'var(--color-brand-500)' : 'var(--surface-border)',
                      color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                      borderRadius: '999px',
                      padding: '0 0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      minWidth: 18,
                    }}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'results' && (
              <ResultsTable recommendations={predictions.recommendations} />
            )}
            {activeTab === 'tiers' && (
              <TierAnalysis result={predictions} />
            )}
            {activeTab === 'round-compare' && (
              <RoundComparison baseResult={predictions} studentInput={studentInput} />
            )}
            {activeTab === 'shortlist' && (
              <ShortlistPanel studentRank={studentInput.rank} />
            )}
            {activeTab === 'blocking' && (
              <BlockingAdvisor studentRank={studentInput.rank} studentCategory={studentInput.category} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
