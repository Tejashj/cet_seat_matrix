'use client';

import React from 'react';
import { PDFDocument } from '@/lib/firebase/types';
import { FileText, Download, Award, BarChart } from 'lucide-react';

interface PDFStatsProps {
  pdfs: PDFDocument[];
}

export default function PDFStats({ pdfs }: PDFStatsProps) {
  const totalPDFs = pdfs.length;
  const totalDownloads = pdfs.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
  
  // Find year with maximum downloads
  let topYear = 'N/A';
  let maxDownloads = -1;
  pdfs.forEach(p => {
    if (p.downloadCount > maxDownloads) {
      maxDownloads = p.downloadCount;
      topYear = String(p.year);
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
      {/* Stat 1: Total files */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <FileText size={22} />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Available Documents
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
            {totalPDFs}
          </div>
          <span className="text-[10px] text-zinc-500">Cutoff PDFs stored</span>
        </div>
      </div>

      {/* Stat 2: Total downloads */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Download size={22} />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Total Downloads
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
            {totalDownloads.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500">Across all years</span>
        </div>
      </div>

      {/* Stat 3: Top Allotment */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Award size={22} />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Most Popular Year
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
            {topYear}
          </div>
          <span className="text-[10px] text-zinc-500">
            {maxDownloads > 0 ? `${maxDownloads.toLocaleString()} downloads` : 'No downloads yet'}
          </span>
        </div>
      </div>
    </div>
  );
}
