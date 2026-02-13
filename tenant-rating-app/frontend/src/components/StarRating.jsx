import React from 'react';

/**
 * Reusable star rating.
 * @param {number} rating - 1-5
 * @param {function} onChange - (value) => {} when interactive
 * @param {boolean} interactive - if true, stars are clickable
 */
export default function StarRating({ rating = 0, onChange, interactive = false }) {
  const handleClick = (value) => {
    if (interactive && onChange) onChange(value);
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!interactive}
          onClick={() => handleClick(value)}
          className={`p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded ${
            interactive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
          }`}
          aria-label={`${value} star${value > 1 ? 's' : ''}`}
        >
          <span
            className={`text-xl ${
              value <= rating ? 'text-amber-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
