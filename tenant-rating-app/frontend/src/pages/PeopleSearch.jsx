import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, User } from 'lucide-react';
import StarRating from '../components/StarRating';

const API = 'https://tenant-rating-app.onrender.com';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-skeleton">
      <div className="p-6 space-y-3">
        <div className="h-6 w-32 rounded-full bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function PeopleSearch() {
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState(''); // '', 'landlord', 'tenant'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const fetchUsers = useCallback(async (searchCity, type) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCity && searchCity.trim()) params.set('city', searchCity.trim());
      if (type) params.set('user_type', type);
      const url = params.toString() ? `${API}/api/users/search?${params.toString()}` : `${API}/api/users/search`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setResults(Array.isArray(data?.users) ? data.users : (data?.users ?? []));
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load people on open (all) and when filter changes. No search required to see everyone.
  useEffect(() => {
    fetchUsers(city.trim(), userType);
  }, [userType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = city.trim();
    setSearched(true);
    await fetchUsers(q || '', userType);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-navy via-navy-light to-navy pt-12 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
        <div className="max-w-3xl mx-auto text-center relative animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Rate landlords & tenants
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Search by city and read verified reviews about people you might rent with
          </p>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl shadow-lg pl-4 pr-3 py-3">
                <Search size={22} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city (e.g. Lisbon, Porto)"
                  className="flex-1 min-w-0 py-1 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
                />
              </div>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="bg-white rounded-xl shadow-lg border-0 px-4 py-3 text-gray-700 font-medium min-h-[48px]"
              >
                <option value="">All (landlords & tenants)</option>
                <option value="landlord">Landlords only</option>
                <option value="tenant">Tenants only</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light disabled:opacity-50 transition-all duration-200 min-h-[48px] shadow-md hover:shadow-lg"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 -mt-6 relative">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <p className="text-lg font-medium text-gray-600">
              {searched ? 'No people found in this city.' : 'No people found. Try again in a moment or check your connection.'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Try another city or change the filter.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {results.map((p) => (
              <Link
                key={p.id}
                to={`/person/${p.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold/20 hover:-translate-y-0.5 transition-all duration-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={28} className="text-navy/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-gray-900 text-lg group-hover:text-navy transition-colors duration-200">
                      {p.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${
                        p.user_type === 'landlord' ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.user_type || 'tenant'}
                      </span>
                      {p.city && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                          <MapPin size={12} />
                          {p.city}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {p.avg_rating != null ? (
                        <>
                          <StarRating rating={Math.round(Number(p.avg_rating))} />
                          <span className="text-sm font-semibold text-gray-800">
                            {Number(p.avg_rating).toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({p.review_count ?? 0} review{(p.review_count ?? 0) !== 1 ? 's' : ''})
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews yet</span>
                      )}
                    </div>
                    <span className="inline-block mt-3 text-gold font-semibold text-sm group-hover:text-gold-dark transition-colors duration-200">
                      View profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
