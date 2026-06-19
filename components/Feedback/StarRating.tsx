'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export default function StarRating({
  rating,
  onRatingChange,
  interactive = false,
  size = 24
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div 
      className="flex items-center gap-1"
      role="img" 
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= displayRating;
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={`transition-all duration-150 focus:outline-none ${
              interactive 
                ? 'cursor-pointer hover:scale-115 active:scale-95' 
                : 'cursor-default'
            }`}
            aria-label={interactive ? `Rate ${starValue} out of 5 stars` : undefined}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-amber-400 stroke-amber-400 text-amber-400'
                  : 'text-zinc-300 dark:text-zinc-700 stroke-zinc-300 dark:stroke-zinc-700 fill-none'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
