import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';

const API = 'http://localhost:5001';

export default function PropertySearch() {
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = city.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const res = await fetch(`${API}/api/properties/search?city=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) setResults(Array.isArray(data) ? data : []);
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Search properties</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. Lisbon)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-gray-500 py-8">Loading...</div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-gray-600 py-8">No properties found.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/property/${p.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
            >
              <p className="font-semibold text-gray-900">{p.address}</p>
              <p className="text-gray-500 text-sm mt-0.5">{p.city}{p.postal_code ? `, ${p.postal_code}` : ''}</p>
              {p.property_type && (
                <p className="text-gray-600 text-sm mt-1 capitalize">{p.property_type}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {p.avg_rating != null ? (
                  <>
                    <StarRating rating={Math.round(Number(p.avg_rating))} />
                    <span className="text-sm text-gray-600">
                      ({p.review_count ?? 0} review{(p.review_count ?? 0) !== 1 ? 's' : ''})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">No reviews yet</span>
                )}
              </div>
              <span className="inline-block mt-4 text-amber-600 font-medium text-sm">View Details →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
