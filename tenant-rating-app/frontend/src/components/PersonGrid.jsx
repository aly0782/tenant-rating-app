import React from 'react';
import PersonCard from './PersonCard';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-9 w-28 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * TrustNest grid – matches v0: section "Browse All", "X results", then cards.
 */
export default function PersonGrid({ people, loading, emptyMessage, resultsCount }) {
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Browse All</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  if (!people || people.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Browse All</h2>
          <span className="text-sm text-gray-500">0 results</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-600 text-lg">{emptyMessage || 'No people found.'}</p>
        </div>
      </>
    );
  }

  const count = resultsCount ?? people.length;
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Browse All</h2>
        <span className="text-sm text-gray-500">{count} result{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </div>
    </>
  );
}
