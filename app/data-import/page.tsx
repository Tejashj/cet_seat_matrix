'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import Navbar from '@/components/Navbar';
import DataImportWizard from '@/components/DataImportWizard';

export default function DataImportPage() {
  const { darkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-2)' }}>
      <Navbar />

      <div style={{ paddingTop: 96, paddingBottom: 64 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="font-display" style={{ fontSize: '2.25rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
              🛠️ Data Management Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Upload and manage your official KEA allotment Excel datasets
            </p>
          </div>

          <DataImportWizard />
        </div>
      </div>
    </div>
  );
}
