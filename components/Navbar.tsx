'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { GraduationCap, Sun, Moon, Star, BookOpen, Database, Shield, FileText, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleDarkMode, predictions, shortlist } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      <div className="container" style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            background: 'none', border: 'none', cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{
              fontSize: '0.925rem', fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              KCET Planner
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-brand-500)', fontWeight: 600 }}>
              Pro v2.0
            </div>
          </div>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/data-import')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Database size={15} /> <span className="hide-mobile">Import Data</span>
          </button>

          {/* PDF Allotments link */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/pdfs')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <FileText size={15} /> <span className="hide-mobile">PDF Allotments</span>
          </button>

          {/* Feedback link */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/feedback')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <MessageSquare size={15} /> <span className="hide-mobile">Feedback</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Shield size={15} /> <span className="hide-mobile">Admin</span>
          </button>

          {predictions && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/planner')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <BookOpen size={15} /> My Results
            </button>
          )}

          {shortlist.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/planner?tab=shortlist')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', position: 'relative' }}
            >
              <Star size={15} />
              <span className="hide-mobile">Shortlist</span>
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16,
                background: 'var(--color-brand-500)',
                color: 'white', fontSize: '0.6rem', fontWeight: 700,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {shortlist.length}
              </span>
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
