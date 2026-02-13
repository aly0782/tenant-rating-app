import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ user, onLogout }) {
  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/search" className="font-bold text-gray-900 text-lg">
          Tenant Rating
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Search
          </Link>
          <span className="text-gray-500 text-sm">Hi, {user.name}</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
