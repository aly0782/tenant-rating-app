import React from 'react';
import PersonCard from './PersonCard';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
        <div className="h-4 w-20 bg-gray-100 rounded mb-4" />
        <div className="h-9 w-28 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * TrustNest grid: 3 columns desktop, 24px gaps.
 */
export default function PersonGrid({ people, loading, emptyMessage }) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ gap: '24px' }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <p className="text-gray-600 text-lg">{emptyMessage || 'No people found.'}</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      style={{ gap: '24px' }}
    >
      {people.map((p) => (
        <PersonCard key={p.id} person={p} />
      ))}
    </div>
  );
}
