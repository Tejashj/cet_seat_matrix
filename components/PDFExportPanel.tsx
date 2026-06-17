'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { FileDown, Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button className="btn btn-primary" disabled>
      <Loader2 size={16} style={{ animation: 'spin-slow 0.7s linear infinite' }} />
      Loading PDF...
    </button>
  ),
});

export default function PDFExportPanel() {
  const { predictions, studentInput, shortlist } = useAppStore();

  if (!predictions || !studentInput) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No predictions available.
      </div>
    );
  }

  const exportList = shortlist.length > 0 ? shortlist : predictions.recommendations.slice(0, 30);

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📄</div>
          <h2 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Export Option Entry PDF
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Download a professional PDF with your personalized KCET option entry list.
            {shortlist.length > 0
              ? ` Your shortlist of ${shortlist.length} options will be exported.`
              : ` Top ${exportList.length} recommendations will be exported.`}
          </p>
        </div>

        {/* Preview info */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem', marginBottom: '2rem',
        }}>
          {[
            { label: 'Student Rank', value: studentInput.rank.toLocaleString('en-IN') },
            { label: 'Category', value: studentInput.category },
            { label: 'Options to Export', value: exportList.length },
            { label: 'Overall Confidence', value: `${Math.round(predictions.overallConfidence * 100)}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '0.875rem',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        <PDFDownloadButton
          predictions={predictions}
          studentInput={studentInput}
          exportList={exportList}
        />

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
          PDF is generated locally — your data never leaves your device.
        </p>
      </div>
    </div>
  );
}
