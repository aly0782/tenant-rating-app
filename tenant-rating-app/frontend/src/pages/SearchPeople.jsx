import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import PersonGrid from '../components/PersonGrid';

const API = 'https://tenant-rating-app.onrender.com';

/**
 * TrustNest search page: Hero + SearchBar + FilterButtons + PersonGrid.
 * GET /api/users/search?city={query}&user_type=...
 */
export default function SearchPeople() {
  const [city, setCity] = useState('');
  const [filter, setFilter] = useState(''); // '', 'landlord', 'tenant'
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
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <HeroSection
        heading="Find & rate landlords and tenants"
        subheading="Search by city and read verified reviews from people who rented together."
      />

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
        <SearchBar
          value={city}
          onChange={setCity}
          onSubmit={handleSearch}
          placeholder="Enter city (e.g. Lisbon, Porto)"
          loading={loading}
        />
        <FilterButtons value={filter} onChange={setFilter} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {!searched && !loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            Enter a city above and click Search to find landlords and tenants.
          </div>
        ) : (
          <PersonGrid
            people={results}
            loading={loading}
            emptyMessage="No people found in this city. Try another city or change the filter."
          />
        )}
      </div>
    </div>
  );
}
