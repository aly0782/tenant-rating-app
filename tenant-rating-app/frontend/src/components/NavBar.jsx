import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, LogOut, User } from 'lucide-react';

export default function NavBar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-40 bg-primary shadow-nav">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/search"
          className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90 transition-all duration-200"
        >
          <span className="bg-white/20 rounded-lg p-1.5">
            <Search size={20} className="text-white" />
          </span>
          Tenant Rating
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="text-white/90 hover:text-white font-medium text-sm transition-all duration-200 hidden sm:block"
          >
            Search
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 min-h-[44px] px-2 py-1.5 rounded-lg text-white/90 hover:bg-white/10 transition-all duration-200"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold text-white">
                {initials}
              </span>
              <span className="font-medium text-white hidden sm:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <Menu size={18} className="text-white/80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-neutral-border py-1 animate-fade-in">
                <div className="px-4 py-3 border-b border-neutral-border">
                  <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-neutral-muted truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-700 hover:bg-neutral-bg transition-all duration-200"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
