'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { feedbackService } from '@/lib/firebase/services/feedbackService';
import StarRating from './StarRating';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export default function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const { studentInput } = useAppStore();
  
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [rank, setRank] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [round, setRound] = useState('R2'); // Default to Round 2

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-populate values from global store
  useEffect(() => {
    if (studentInput) {
      if (studentInput.rank) setRank(studentInput.rank);
      if (studentInput.category) setCategory(studentInput.category);
    }
  }, [studentInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please add a comment explaining your experience.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await feedbackService.submitFeedback({
        rank: rank ? Number(rank) : 0,
        category: category || 'General Merit',
        round,
        rating,
        comment,
        email: email || undefined,
        isProcessed: false
      });
      setSuccess(true);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Thank You for Your Feedback!</h3>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-sm text-sm">
          Your feedback helps us refine our AI models and cutoff recommendations. We appreciate your support!
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="btn btn-secondary btn-sm mt-2"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5 animate-fade-in">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Share Your Experience</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Let us know how accurate the predictor was or suggest features you'd like to see.
      </p>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Star Rating Select */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          Rating *
        </label>
        <StarRating rating={rating} onRatingChange={setRating} interactive={true} size={30} />
      </div>

      {/* Comment Field */}
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          Comment *
        </label>
        <textarea
          id="comment"
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think of the predictions? Did they match your actual allotment?"
          className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Row: Rank and Category (Auto-populated) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="rank" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Your KCET Rank
          </label>
          <input
            type="number"
            id="rank"
            value={rank}
            onChange={(e) => setRank(e.target.value !== '' ? Number(e.target.value) : '')}
            placeholder="e.g. 15000"
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. GM, 2AG, etc."
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="round" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Target Round
          </label>
          <select
            id="round"
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          >
            <option value="R1">Round 1</option>
            <option value="R2">Round 2</option>
            <option value="R3">Round 3 (Casual)</option>
          </select>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          Email Address (Optional)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com (For response follow-ups)"
          className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Submitting...
          </>
        ) : (
          <>
            <Send size={16} />
            Submit Feedback
          </>
        )}
      </button>
    </form>
  );
}
