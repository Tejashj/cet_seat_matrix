'use client';

import React, { useState, useEffect } from 'react';
import { feedbackService } from '@/lib/firebase/services/feedbackService';
import { Feedback } from '@/lib/firebase/types';
import StarRating from './StarRating';
import RatingChart from './RatingChart';
import { Star, MessageSquare, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function FeedbackDisplay() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    averageRating: number;
    ratings: { 1: number; 2: number; 3: number; 4: number; 5: number };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const allFeedback = await feedbackService.getAllFeedback();
      setFeedbackList(allFeedback);
      
      const aggregateStats = await feedbackService.getStats();
      setStats(aggregateStats);
    } catch (error) {
      console.error('Failed to load feedback list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  const filteredFeedback = feedbackList.filter(item => {
    if (filterRating === 'all') return true;
    return Math.round(item.rating) === filterRating;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Block */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avg Card */}
          <div className="card p-6 flex flex-col items-center justify-center text-center space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Average Rating</h4>
            <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={stats.averageRating} size={20} />
            <p className="text-xs text-zinc-500">Based on {stats.total} submissions</p>
          </div>

          {/* Distribution Chart Card */}
          <div className="card p-6 md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rating Distribution</h4>
            <RatingChart ratings={stats.ratings} total={stats.total} />
          </div>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-indigo-500 shrink-0" size={18} />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Reviews ({filteredFeedback.length})</h3>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Filter className="text-zinc-500" size={14} />
          <span className="text-zinc-500 font-medium">Filter:</span>
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : paginatedFeedback.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-500 text-sm">
          No feedback matching this selection was found.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedFeedback.map((item) => (
            <div 
              key={item.id} 
              className="card p-5 border border-zinc-100 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/30 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-4">
                <StarRating rating={item.rating} size={15} />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just now'}
                </span>
              </div>

              {/* Comment */}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                "{item.comment}"
              </p>

              {/* Footer specs */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                {item.rank > 0 && (
                  <span>Rank: <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{item.rank.toLocaleString()}</strong></span>
                )}
                {item.category && (
                  <span>Category: <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{item.category}</strong></span>
                )}
                {item.round && (
                  <span>Round: <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{item.round}</strong></span>
                )}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
