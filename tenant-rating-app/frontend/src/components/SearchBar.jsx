import React from 'react';
import { Search } from 'lucide-react';

/**
 * TrustNest search bar: white background, icon on left, centered.
 */
export default function SearchBar({ value, onChange, onSubmit, placeholder, loading }) {
  return (
    <form onSubmit={onSubmit} className="flex justify-center">
      <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg w-full max-w-xl px-4 py-3.5">
        <Search size={22} className="text-gray-400 shrink-0" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Enter city (e.g. Lisbon, Porto)'}
          className="flex-1 min-w-0 py-1 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
          aria-label="Search by city"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 px-6 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: '#0F3460' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
