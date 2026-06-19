'use client';

import React, { useState, useEffect } from 'react';
import { pdfService } from '@/lib/firebase/services/pdfService';
import { PDFDocument } from '@/lib/firebase/types';
import PDFCard from './PDFCard';
import PDFStats from './PDFStats';
import { Search, Loader2, AlertCircle, FileQuestion } from 'lucide-react';

export default function PDFList() {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'yearDesc' | 'yearAsc' | 'downloadsDesc'>('yearDesc');

  const loadPDFs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pdfService.getAllPDFs();
      setPdfs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve PDF documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPDFs();
  }, []);

  const handleDownloadIncrement = () => {
    // Refresh lists to display updated counts in UI
    pdfService.getAllPDFs().then(data => setPdfs(data)).catch(() => {});
  };

  // Search and Sort Filtering
  const filteredAndSortedPDFs = pdfs
    .filter(pdf => {
      const search = searchQuery.toLowerCase();
      return (
        pdf.year.toString().includes(search) ||
        pdf.fileName.toLowerCase().includes(search) ||
        (pdf.description && pdf.description.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'yearDesc') return b.year - a.year;
      if (sortBy === 'yearAsc') return a.year - b.year;
      if (sortBy === 'downloadsDesc') return b.downloadCount - a.downloadCount;
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. PDF Stats at Top */}
      {!loading && !error && <PDFStats pdfs={pdfs} />}

      {/* 2. Controls: Search and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by year or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="yearDesc">Newest Year First</option>
            <option value="yearAsc">Oldest Year First</option>
            <option value="downloadsDesc">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* 3. Main content */}
      {error && (
        <div className="flex gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <h5 className="font-bold">Error Loading Files</h5>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className="card p-5 space-y-4 border border-zinc-100 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/30 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-150 dark:border-zinc-800">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedPDFs.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-400">
            <FileQuestion size={24} />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No PDF documents match search</h4>
          <p className="text-xs text-zinc-500 max-w-sm">
            Try adjusting your search keywords, or clear the search field.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPDFs.map((pdf) => (
            <PDFCard 
              key={pdf.id || pdf.year} 
              pdf={pdf} 
              onDownloadIncrement={handleDownloadIncrement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
