import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import StarRating from '../components/StarRating';

const API = 'http://localhost:5001';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-border overflow-hidden shadow-sm animate-skeleton">
      <div className="h-36 bg-neutral-border/30" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-neutral-border/40 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-neutral-border/40" />
          <div className="h-6 w-20 rounded-full bg-neutral-border/40" />
        </div>
        <div className="h-4 w-1/2 bg-neutral-border/40 rounded" />
      </div>
    </div>
  );
}

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
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Find trusted rentals
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Search by city and read verified tenant & landlord reviews
          </p>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex gap-2 bg-white rounded-xl shadow-lg p-2">
              <div className="flex-1 flex items-center gap-2 pl-4">
                <Search size={22} className="text-neutral-muted" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city (e.g. Lisbon)"
                  className="flex-1 py-3 text-gray-900 placeholder-neutral-muted focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8 -mt-4">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 text-neutral-muted">
            <p className="text-lg font-medium">No properties found.</p>
            <p className="text-sm mt-1">Try another city name.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {results.map((p) => (
              <Link
                key={p.id}
                to={`/property/${p.id}`}
                className="block bg-white rounded-xl border border-neutral-border overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <div className="h-36 bg-gradient-to-br from-neutral-bg to-neutral-border/50 flex items-center justify-center">
                  <MapPin size={40} className="text-neutral-muted/60" />
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{p.address}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <MapPin size={12} />
                      {p.city}
                    </span>
                    {p.property_type && (
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-border/60 text-neutral-muted text-xs font-medium capitalize">
                        {p.property_type}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {p.avg_rating != null ? (
                      <>
                        <StarRating rating={Math.round(Number(p.avg_rating))} />
                        <span className="text-sm font-semibold text-gray-700">
                          {Number(p.avg_rating).toFixed(1)}
                        </span>
                        <span className="text-sm text-neutral-muted">
                          ({p.review_count ?? 0} review{(p.review_count ?? 0) !== 1 ? 's' : ''})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-muted">No reviews yet</span>
                    )}
                  </div>
                  <span className="inline-block mt-4 text-primary font-semibold text-sm">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
