'use client';

import React from 'react';
import PDFList from '@/components/PDFSection/PDFList';

export default function PDFsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white">
          🏛️ Historical KCET Cutoff PDFs
        </h1>
        <p className="text-sm text-zinc-550 max-w-2xl">
          Download past year KEA official engineering cutoff allotment PDFs from 2020 to 2025. Track trends and explore previous counseling cycles.
        </p>
      </div>
      
      <PDFList />
    </div>
  );
}
