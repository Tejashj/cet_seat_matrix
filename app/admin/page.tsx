'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import Navbar from '@/components/Navbar';
import { getRecentFeedback, getAccuracyStats } from '@/lib/firebase/feedback';
import {
  Star, MessageSquare, ShieldCheck, AlertCircle, Loader2,
  TrendingUp, BarChart3, Clock, UserCheck, CheckCircle2
} from 'lucide-react';

export default function AdminPage() {
  const { darkMode } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<{
    total: number;
    accurate: number;
    inaccurate: number;
    rate: number;
  } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await getRecentFeedback(30);
      const stats = await getAccuracyStats();
      setFeedbackList(feed);
      setAccuracyStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Calculate average rating
  const avgRating = feedbackList.length > 0
    ? (feedbackList.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackList.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <Navbar />

      <div style={{ paddingTop: 96, paddingBottom: 64 }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '2.25rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                🔑 Admin Feedback Dashboard
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Monitor system performance, user ratings, and prediction accuracy reports
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={loadAdminData} disabled={loading}>
              {loading ? <Loader2 className="spinner" size={14} /> : 'Refresh Data'}
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '1rem',
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
              color: '#dc2626', fontSize: '0.88rem', marginBottom: '2rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{error}</div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 className="spinner" size={36} style={{ color: 'var(--color-brand-500)' }} />
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Analytics overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {/* Avg rating */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Rating</span>
                    <Star size={18} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                    {avgRating} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ 5.0</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {feedbackList.filter(f => f.rating > 0).length} reviews</span>
                </div>

                {/* Total reports */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Accuracy Reports</span>
                    <BarChart3 size={18} style={{ color: 'var(--color-brand-500)' }} />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>
                    {accuracyStats ? accuracyStats.total : 0}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total reports submitted</span>
                </div>

                {/* Accuracy rate */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AI Accuracy Rate</span>
                    <TrendingUp size={18} style={{ color: 'var(--color-safe)' }} />
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-safe)' }}>
                    {accuracyStats ? (accuracyStats.rate * 100).toFixed(0) : 0}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {accuracyStats ? accuracyStats.accurate : 0} match • {accuracyStats ? accuracyStats.inaccurate : 0} miss
                  </span>
                </div>
              </div>

              {/* Feed table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} style={{ color: 'var(--color-brand-500)' }} /> Recent Feedback Logs
                </h3>

                {feedbackList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No feedback logs found. (If Firebase environment variables are not set, local fallbacks are generated on the fly).
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {feedbackList.map((item, idx) => (
                      <div key={item.id || idx} style={{
                        padding: '1rem', background: 'var(--surface-2)',
                        border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {/* Stars */}
                            {item.rating > 0 && (
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={13} style={{
                                    color: s <= item.rating ? '#fbbf24' : 'var(--surface-border)',
                                    fill: s <= item.rating ? '#fbbf24' : 'none'
                                  }} />
                                ))}
                              </div>
                            )}
                            {item.type === 'accuracy' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '0.15rem 0.5rem', borderRadius: 999,
                                fontSize: '0.7rem', fontWeight: 700,
                                background: item.isAccurate ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: item.isAccurate ? '#10b981' : '#ef4444'
                              }}>
                                <ShieldCheck size={11} />
                                {item.isAccurate ? 'Accurate Prediction' : 'Inaccurate Prediction'}
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <Clock size={11} />
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                          </div>
                        </div>

                        {item.comment && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0.5rem 0' }}>
                            "{item.comment}"
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem' }}>
                          {item.rank && <span>Rank: <strong>{item.rank.toLocaleString()}</strong></span>}
                          {item.category && <span>Category: <strong>{item.category}</strong></span>}
                          {item.round && <span>Round: <strong>{item.round}</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
