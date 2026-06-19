'use client';

import React, { useState } from 'react';
import { PDFDocument } from '@/lib/firebase/types';
import { pdfService } from '@/lib/firebase/services/pdfService';
import { FileText, Download, Loader2 } from 'lucide-react';

interface PDFCardProps {
  pdf: PDFDocument;
  onDownloadIncrement?: () => void;
}

export default function PDFCard({ pdf, onDownloadIncrement }: PDFCardProps) {
  const [downloading, setDownloading] = useState(false);

  // Formatter for file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 1. Increment count in DB
      await pdfService.incrementDownload(pdf.year);
      
      // 2. Trigger parent callback
      if (onDownloadIncrement) {
        onDownloadIncrement();
      }

      // 3. Open in a new tab / trigger file download
      if (pdf.downloadUrl && pdf.downloadUrl !== '#') {
        window.open(pdf.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('This is a simulated download in local fallback mode.');
      }
    } catch (error) {
      console.error('Download tracking failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40 relative overflow-hidden group">
      {/* Design accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-300" />
      
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white font-display">
              {pdf.year} Cutoff Allotment
            </h4>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">
              {formatSize(pdf.fileSize)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-h-[40px]">
          {pdf.description || 'No description available for this year\'s allotment file.'}
        </p>
      </div>

      {/* Footer / CTA Section */}
      <div className="flex items-center justify-between gap-4 mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
          Downloads: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{pdf.downloadCount}</span>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-primary btn-sm flex items-center gap-2 group-hover:scale-102 transition-transform duration-200"
        >
          {downloading ? (
            <Loader2 className="animate-spin" size={13} />
          ) : (
            <Download size={13} />
          )}
          Download PDF
        </button>
      </div>
    </div>
  );
}
