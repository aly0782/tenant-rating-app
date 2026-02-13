import React from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable star rating. Gold when selected, gray when not. Large stars, smooth transitions.
 */
export default function StarRating({ rating = 0, onChange, interactive = false }) {
  const size = 24;

  const handleClick = (value) => {
    if (interactive && onChange) onChange(value);
  };

  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!interactive}
          onClick={() => handleClick(value)}
          className={`p-0.5 focus:outline-none focus:ring-2 focus:ring-primary rounded transition-all duration-200 ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          aria-label={`${value} star${value > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              value <= rating ? 'text-accent fill-accent' : 'text-neutral-border fill-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
