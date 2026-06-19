'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/firebase/services/authService';
import { pdfService } from '@/lib/firebase/services/pdfService';
import { feedbackService } from '@/lib/firebase/services/feedbackService';
import { PDFDocument } from '@/lib/firebase/types';
import PDFUpload from '../PDFSection/PDFUpload';
import FeedbackAdmin from '../Feedback/FeedbackAdmin';
import { 
  FileText, MessageSquare, LogOut, Trash2, 
  Settings, Award, Download, Star, Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pdfs' | 'feedback'>('pdfs');
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [pdfStats, setPdfStats] = useState<{ total: number; downloads: number } | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<{ total: number; averageRating: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const pdfList = await pdfService.getAllPDFs();
      setPdfs(pdfList);

      const pStats = await pdfService.getStats();
      setPdfStats(pStats);

      const fStats = await feedbackService.getStats();
      setFeedbackStats(fStats);
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeletePDF = async (year: number) => {
    if (!window.confirm(`Are you sure you want to delete the PDF for year ${year}? This action cannot be undone.`)) return;
    try {
      await pdfService.deletePDF(year);
      loadDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete PDF.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-black font-display text-zinc-900 dark:text-white flex items-center gap-2">
            🔑 Admin Hub
          </h1>
          <p className="text-sm text-zinc-500">
            Welcome to the Administrative console. Upload documents and moderate reviews.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm self-start flex items-center gap-1.5 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/25"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Total PDFs */}
            <div className="card p-5 space-y-2">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Published PDFs</span>
              <div className="text-3xl font-black font-mono text-zinc-900 dark:text-white flex items-baseline gap-1">
                {pdfStats?.total || 0}
                <span className="text-xs font-normal text-zinc-550">files</span>
              </div>
            </div>

            {/* Total Downloads */}
            <div className="card p-5 space-y-2">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Downloads</span>
              <div className="text-3xl font-black font-mono text-indigo-650 dark:text-indigo-400">
                {(pdfStats?.downloads || 0).toLocaleString()}
              </div>
            </div>

            {/* Total Feedback */}
            <div className="card p-5 space-y-2">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Feedback Count</span>
              <div className="text-3xl font-black font-mono text-zinc-900 dark:text-white flex items-baseline gap-1">
                {feedbackStats?.total || 0}
                <span className="text-xs font-normal text-zinc-550">logs</span>
              </div>
            </div>

            {/* Average Rating */}
            <div className="card p-5 space-y-2">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg User Rating</span>
              <div className="text-3xl font-black font-mono text-amber-500 flex items-center gap-1.5">
                {(feedbackStats?.averageRating || 0).toFixed(1)}
                <Star className="fill-amber-400 text-amber-400 inline" size={20} />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-150 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-5 py-2.5 font-bold text-sm tracking-wide border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'pdfs'
                  ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-white'
              }`}
            >
              <FileText size={16} />
              PDF Management
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-5 py-2.5 font-bold text-sm tracking-wide border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'feedback'
                  ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
              User Feedback Logs
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="space-y-8">
            {activeTab === 'pdfs' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left side: Upload Form */}
                <div className="lg:col-span-1">
                  <PDFUpload onUploadSuccess={loadDashboardData} />
                </div>

                {/* Right side: Table list of all PDF allotments with delete commands */}
                <div className="lg:col-span-2 card p-6 space-y-4">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Active PDFs</h3>
                  
                  {pdfs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-zinc-500">
                      No PDFs available. Upload one to publish it.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-150 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                            <th className="px-4 py-2">Year</th>
                            <th className="px-4 py-2">File Name</th>
                            <th className="px-4 py-2">Downloads</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                          {pdfs.map((pdf) => (
                            <tr key={pdf.year} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                              <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                                {pdf.year}
                              </td>
                              <td className="px-4 py-3 font-mono truncate max-w-[150px] md:max-w-[240px]">
                                {pdf.fileName}
                              </td>
                              <td className="px-4 py-3 font-semibold text-zinc-750 dark:text-zinc-300">
                                {pdf.downloadCount}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleDeletePDF(pdf.year)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                                  aria-label={`Delete ${pdf.year} PDF`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <FeedbackAdmin />
            )}
          </div>
        </>
      )}
    </div>
  );
}
