'use client';

import React from 'react';
import FeedbackForm from '@/components/Feedback/FeedbackForm';
import FeedbackDisplay from '@/components/Feedback/FeedbackDisplay';

export default function FeedbackPage() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white">
          💬 Candidate Feedback & Reviews
        </h1>
        <p className="text-sm text-zinc-550 max-w-2xl">
          We want to make counseling as transparent and accurate as possible. Share your seat allocation result, rate our predictions, or check what other engineering candidates are saying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Submit feedback */}
        <div className="lg:col-span-1">
          <FeedbackForm />
        </div>

        {/* Right Side: Feedback logs / charts */}
        <div className="lg:col-span-2">
          <FeedbackDisplay />
        </div>
      </div>
    </div>
  );
}
