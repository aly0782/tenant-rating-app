import React, { useState, useEffect, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import PersonGrid from '../components/PersonGrid';

const API = 'https://tenant-rating-app.onrender.com';

/**
 * TrustNest search page – matches v0: hero, search by name or location, filters, Browse All + results.
 * Loads all people on mount so /search shows people immediately.
 */
export default function SearchPeople() {
  const [city, setCity] = useState('');
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback((searchQuery, userType) => {
    setLoading(true);
    setError(null);
    let url = `${API}/api/users/search`;
    const params = new URLSearchParams();
    if (searchQuery && searchQuery.trim()) params.set('city', searchQuery.trim());
    if (userType) params.set('user_type', userType);
    if (params.toString()) url += `?${params.toString()}`;
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setResults(data?.users ?? []);
      })
      .catch((err) => {
        console.error('Search API error:', err);
        setResults([]);
        setError('Could not load people. The server may be starting (try again in a moment) or check your connection.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Load people on page open (all) and when filter changes. No search required to see everyone.
  useEffect(() => {
    fetchUsers(city.trim(), filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) {
      fetchUsers('', filter);
      return;
    }
    fetchUsers(query, filter);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFBFC' }}>
      <HeroSection />

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
        <SearchBar
          value={city}
          onChange={setCity}
          onSubmit={handleSearch}
          placeholder="Search by name or location"
          loading={loading}
        />
        <FilterButtons value={filter} onChange={setFilter} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 flex-1">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center text-sm">
            {error}
          </div>
        )}
        <PersonGrid
          people={results}
          loading={loading}
          resultsCount={results.length}
          emptyMessage={error ? null : 'No people found. Try a different search or filter.'}
        />
      </div>
    </div>
  );
}
