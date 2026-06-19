'use client';

import React, { useState, useEffect } from 'react';
import { feedbackService } from '@/lib/firebase/services/feedbackService';
import { Feedback } from '@/lib/firebase/types';
import StarRating from './StarRating';
import { 
  Download, Trash2, Mail, Users, Star, 
  Search, ShieldAlert, CheckCircle, Loader2 
} from 'lucide-react';

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [minRank, setMinRank] = useState<string>('');
  const [maxRank, setMaxRank] = useState<string>('');

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const allFeedback = await feedbackService.getAllFeedback();
      setFeedback(allFeedback);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      setFeedback(prev => prev.filter(fb => fb.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete feedback');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (feedback.length === 0) return;
    
    // Header
    const headers = ['ID', 'Rank', 'Category', 'Round', 'Rating', 'Comment', 'Email', 'Timestamp', 'UserAgent', 'PageUrl'];
    
    // Rows
    const rows = filteredFeedback.map(fb => [
      fb.id || '',
      fb.rank || 0,
      fb.category || '',
      fb.round || '',
      fb.rating || 0,
      `"${(fb.comment || '').replace(/"/g, '""')}"`,
      fb.email || '',
      fb.timestamp ? new Date(fb.timestamp).toISOString() : '',
      `"${(fb.userAgent || '').replace(/"/g, '""')}"`,
      fb.pageUrl || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kcet_planner_feedback_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredFeedback = feedback.filter(fb => {
    // 1. Text Search (Comment, Email, Category)
    const text = searchTerm.toLowerCase();
    const matchesSearch = 
      (fb.comment && fb.comment.toLowerCase().includes(text)) ||
      (fb.email && fb.email.toLowerCase().includes(text)) ||
      (fb.category && fb.category.toLowerCase().includes(text));

    // 2. Rating Filter
    const matchesRating = ratingFilter === 'all' || Math.round(fb.rating) === Number(ratingFilter);

    // 3. Rank Filter
    const rankVal = fb.rank || 0;
    const matchesMinRank = minRank === '' || rankVal >= Number(minRank);
    const matchesMaxRank = maxRank === '' || rankVal <= Number(maxRank);

    return matchesSearch && matchesRating && matchesMinRank && matchesMaxRank;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Filter Feedback Logs</h4>
          <button
            onClick={handleExportCSV}
            disabled={filteredFeedback.length === 0}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Keywords</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-400">
                <Search size={13} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search comment or email..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none dark:bg-zinc-900 dark:text-white"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Min Rank */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Min Rank</label>
            <input
              type="number"
              value={minRank}
              onChange={(e) => setMinRank(e.target.value)}
              placeholder="Min rank..."
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none dark:bg-zinc-900 dark:text-white"
            />
          </div>

          {/* Max Rank */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Max Rank</label>
            <input
              type="number"
              value={maxRank}
              onChange={(e) => setMaxRank(e.target.value)}
              placeholder="Max rank..."
              className="w-full text-xs px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-red-650 dark:text-red-400 rounded-lg text-xs">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="card p-12 text-center text-zinc-500 text-sm">
          No feedback entries matches these filters.
        </div>
      ) : (
        <div className="card overflow-hidden border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Student Stats</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredFeedback.map((fb) => (
                  <tr key={fb.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                    {/* Stars */}
                    <td className="px-4 py-3 whitespace-nowrap align-top">
                      <StarRating rating={fb.rating} size={12} />
                    </td>

                    {/* Student details */}
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users size={11} className="text-zinc-400" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {fb.rank ? fb.rank.toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium">
                          Cat: <span className="text-zinc-700 dark:text-zinc-300">{fb.category || 'N/A'}</span> • Rd: <span className="text-zinc-700 dark:text-zinc-300">{fb.round || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3 align-top max-w-xs md:max-w-md">
                      <p className="text-zinc-700 dark:text-zinc-300 break-words font-medium italic">
                        "{fb.comment}"
                      </p>
                      {fb.pageUrl && (
                        <span className="text-[9px] font-mono text-zinc-400 mt-1 block">
                          URL: {fb.pageUrl}
                        </span>
                      )}
                    </td>

                    {/* Contact Email */}
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {fb.email ? (
                        <a 
                          href={`mailto:${fb.email}`} 
                          className="flex items-center gap-1 text-indigo-650 hover:underline dark:text-indigo-400 font-semibold"
                        >
                          <Mail size={11} />
                          {fb.email}
                        </a>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 align-top whitespace-nowrap text-zinc-500">
                      {fb.timestamp ? new Date(fb.timestamp).toLocaleString() : 'N/A'}
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(fb.id!)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        aria-label="Delete feedback log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
