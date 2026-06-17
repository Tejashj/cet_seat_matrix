'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import StudentForm from '@/components/StudentForm';
import Navbar from '@/components/Navbar';
import {
  GraduationCap, Brain, TrendingUp, Shield, Star, ChevronRight,
  Database, Zap, Award, Users, BookOpen, CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { darkMode, predictions } = useAppStore();
  const router = useRouter();

  // Apply dark mode class to html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero relative pt-20 pb-28 overflow-hidden">
        <div className="hero-grid" />

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '15%', right: '8%',
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: 240, height: 240,
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />

        <div className="container relative z-10">
          {/* Badge */}
          <div className="flex-center mb-8">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(165,180,252,0.4)',
              borderRadius: '999px',
              color: '#a5b4fc',
              fontSize: '0.82rem', fontWeight: 600,
            }}>
              <span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', animation: 'pulse-glow 2s infinite' }} />
              NEW: 2025 Allotment Data Now Available
              <ChevronRight size={12} />
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            textAlign: 'center',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            Your Smartest KCET
            <br />
            <span className="text-gradient" style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #e879f9 50%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Counseling Assistant
            </span>
          </h1>

          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(203,213,225,0.9)',
            maxWidth: 640,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Powered by <strong style={{ color: '#a5b4fc' }}>6 years</strong> of KCET allotment data and
            statistical AI. Get personalized Dream, Realistic &amp; Safe college recommendations in seconds.
          </p>

          {/* CTA */}
          {predictions ? (
            <div className="flex-center gap-3">
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/planner')}>
                <TrendingUp size={18} /> View My Results
              </button>
              <button className="btn btn-lg" style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }} onClick={() => router.push('/planner')}>
                Modify Search
              </button>
            </div>
          ) : (
            <div className="flex-center">
              <button className="btn btn-primary btn-lg" onClick={() => {
                document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <GraduationCap size={18} /> Get Free Recommendations
              </button>
            </div>
          )}

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem', marginTop: '4rem',
            maxWidth: 720, margin: '4rem auto 0',
          }}>
            {[
              { value: '6', label: 'Years of Data', icon: '📊' },
              { value: '50+', label: 'Colleges', icon: '🏛️' },
              { value: '23', label: 'Categories', icon: '🎯' },
              { value: '100%', label: 'Free Forever', icon: '💯' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="stat-card animate-stagger">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{icon}</div>
                <div className="stat-card-value">{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(203,213,225,0.7)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 0', background: 'var(--surface-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Get your personalized KCET option list in 3 simple steps
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', icon: <BookOpen size={28} />, title: 'Enter Your Details', desc: 'Input your KCET rank, category, and preferences. No login required.' },
              { step: '02', icon: <Brain size={28} />, title: 'AI Analysis', desc: '6 years of allotment data is analyzed using weighted historical regression.' },
              { step: '03', icon: <Award size={28} />, title: 'Get Recommendations', desc: 'Receive Dream, Realistic & Safe college lists with confidence scores.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card animate-stagger" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--color-brand-50)',
                  color: 'var(--color-brand-600)',
                  marginBottom: '1.25rem',
                }}>
                  {icon}
                </div>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em',
                  color: 'var(--color-brand-500)', marginBottom: '0.5rem',
                }}>
                  STEP {step}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 0', background: 'var(--surface-2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: <Database size={22} />, title: '6-Year Historical Data', desc: 'KCET allotment patterns from 2020–2025 across 50+ colleges and 23 categories.' },
              { icon: <TrendingUp size={22} />, title: 'Trend Analysis', desc: 'See whether a college-branch combo is getting more competitive or easier over time.' },
              { icon: <Zap size={22} />, title: 'Instant Predictions', desc: 'Get results in under a second with our optimized statistical prediction engine.' },
              { icon: <Shield size={22} />, title: 'Confidence Scoring', desc: 'Every recommendation comes with a confidence score based on historical consistency.' },
              { icon: <Star size={22} />, title: 'Shortlist & Reorder', desc: 'Drag and drop your preferred options into a custom ranked list and export as PDF.' },
              { icon: <Users size={22} />, title: 'All 23 Categories', desc: 'Full support for GM, 1G, 2AG, 2BG, 3AG, 3BG, SC, ST, and all sub-categories.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card animate-stagger" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0,
                  width: 44, height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-brand-100), var(--color-brand-200))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-brand-700)',
                }}>
                  {icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section id="form-section" style={{ padding: '5rem 0', background: 'var(--surface-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              🎓 Get Your Personalized List
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Enter your KCET details below — completely free, no registration needed
            </p>
          </div>
          <StudentForm />
        </div>
      </section>

      {/* ── TRUST FOOTER ── */}
      <footer style={{
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--surface-border)',
        padding: '2rem 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '2rem', marginBottom: '1.5rem',
          }}>
            {[
              { icon: <CheckCircle2 size={16} />, text: '100% Free' },
              { icon: <CheckCircle2 size={16} />, text: 'No Registration' },
              { icon: <CheckCircle2 size={16} />, text: 'Data Privacy' },
              { icon: <CheckCircle2 size={16} />, text: 'For Educational Use' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--color-safe)', fontSize: '0.85rem', fontWeight: 600,
              }}>
                {icon} {text}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            KCET Option Entry Planner Pro v2.0 — Built for Karnataka Engineering Aspirants
            <br />
            Data is synthetic and for educational guidance only. Refer to official KEA website for authoritative information.
          </p>
        </div>
      </footer>
    </div>
  );
}
