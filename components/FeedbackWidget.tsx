'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { submitFeedback, submitAccuracyReport, getSessionId } from '@/lib/firebase/feedback';
import { Star, X, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface Props {
  rank: number;
  category: string;
  round: string;
  predictedTop3?: string[];
}

type Stage = 'trigger' | 'rating' | 'accuracy' | 'done';

export default function FeedbackWidget({ rank, category, round, predictedTop3 }: Props) {
  const [stage, setStage] = useState<Stage>('trigger');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [wasAccurate, setWasAccurate] = useState<boolean | null>(null);
  const [actualCollege, setActualCollege] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await submitFeedback({
      rank,
      category,
      round,
      rating,
      comment: comment || undefined,
      wasAccurate: wasAccurate ?? undefined,
      actualCollegeCode: actualCollege || undefined,
      predictedTop3,
    });
    setSubmitting(false);
    setStage('done');
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: 'var(--gradient-brand)',
          color: 'white', border: 'none', borderRadius: '999px',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: 'var(--shadow-brand)',
          transition: 'transform 150ms',
        }}
      >
        <Star size={15} fill="white" /> Rate Predictions
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      width: stage === 'trigger' ? 'auto' : 320,
      background: 'var(--surface-1)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    }}>
      {stage === 'trigger' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-glow 2s infinite',
          }}>
            <Star size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              How accurate were these predictions?
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Help us improve for future students</div>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setStage('rating')}
            >
              Rate
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setMinimized(true)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {stage === 'rating' && (
        <div>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
              ⭐ Rate Our Predictions
            </div>
            <button
              onClick={() => setMinimized(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {/* Star rating */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Overall prediction quality?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                    transition: 'transform 150ms',
                    transform: (hoveredStar || rating) >= s ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={28}
                    fill={(hoveredStar || rating) >= s ? '#f59e0b' : 'none'}
                    color={(hoveredStar || rating) >= s ? '#f59e0b' : 'var(--text-muted)'}
                  />
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {rating === 1 ? 'Very Inaccurate' : rating === 2 ? 'Somewhat Off' : rating === 3 ? 'Okay' : rating === 4 ? 'Good' : rating === 5 ? 'Very Accurate! 🎉' : 'Select a rating'}
            </div>

            {/* Accuracy toggle */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Did you get allotted as predicted?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setWasAccurate(true)}
                className={`btn btn-sm`}
                style={{
                  flex: 1, gap: '0.375rem',
                  background: wasAccurate === true ? '#ecfdf5' : 'var(--surface-2)',
                  border: `1.5px solid ${wasAccurate === true ? '#10b981' : 'var(--surface-border)'}`,
                  color: wasAccurate === true ? '#059669' : 'var(--text-secondary)',
                }}
              >
                <ThumbsUp size={13} /> Yes
              </button>
              <button
                onClick={() => setWasAccurate(false)}
                className={`btn btn-sm`}
                style={{
                  flex: 1, gap: '0.375rem',
                  background: wasAccurate === false ? '#fef2f2' : 'var(--surface-2)',
                  border: `1.5px solid ${wasAccurate === false ? '#ef4444' : 'var(--surface-border)'}`,
                  color: wasAccurate === false ? '#dc2626' : 'var(--text-secondary)',
                }}
              >
                <ThumbsDown size={13} /> No
              </button>
            </div>

            {/* Comment */}
            <textarea
              className="input"
              placeholder="Any comments? (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              style={{ resize: 'none', marginBottom: '1rem', fontSize: '0.82rem' }}
            />

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSubmitRating}
              disabled={rating === 0 || submitting}
            >
              {submitting ? <Loader2 size={15} style={{ animation: 'spin-slow 0.7s linear infinite' }} /> : <MessageSquare size={15} />}
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} style={{ color: 'var(--color-safe)', marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Thank you! 🙏
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your feedback helps us improve predictions for future KCET aspirants.
          </p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => setMinimized(true)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
