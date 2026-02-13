import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import PersonGrid from '../components/PersonGrid';

const API = 'https://tenant-rating-app.onrender.com';

/**
 * TrustNest search page – matches v0: hero, search by name or location, filters, Browse All + results.
 */
export default function SearchPeople() {
  const [city, setCity] = useState('');
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    let url = `${API}/api/users/search?city=${encodeURIComponent(query)}`;
    if (filter) url += `&user_type=${filter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setResults(data?.users ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
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
        {!searched && !loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Browse All</h2>
            <p className="text-gray-500 text-center max-w-md">
              Enter a city or location above and click Search to find landlords and tenants.
            </p>
          </div>
        ) : (
          <PersonGrid
            people={results}
            loading={loading}
            resultsCount={results.length}
            emptyMessage="No people found in this city. Try another city or change the filter."
          />
        )}
      </div>
    </div>
  );
}
