'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingChartProps {
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  total: number;
}

export default function RatingChart({ ratings, total }: RatingChartProps) {
  const maxCount = Math.max(...Object.values(ratings), 1);

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = ratings[stars as 1 | 2 | 3 | 4 | 5] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={stars} className="flex items-center gap-3 text-sm">
            {/* Label */}
            <div className="flex items-center gap-1 w-8 justify-end text-zinc-600 dark:text-zinc-400 font-medium">
              <span>{stars}</span>
              <Star size={13} className="fill-amber-400 text-amber-400" />
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Count & Percent */}
            <div className="w-16 text-right text-xs text-zinc-500 dark:text-zinc-500 font-mono">
              {percentage.toFixed(0)}% ({count})
            </div>
          </div>
        );
      })}
    </div>
  );
}
