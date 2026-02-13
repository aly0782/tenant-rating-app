import React from 'react';

const OPTIONS = [
  { value: '', label: 'All' },
  { value: 'landlord', label: 'Landlords' },
  { value: 'tenant', label: 'Tenants' },
];

const GOLD = '#D4AF37';

/**
 * TrustNest filter toggle: All / Landlords / Tenants. Gold (#D4AF37) active state.
 */
export default function FilterButtons({ value, onChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by type">
      {OPTIONS.map((opt) => {
        const isActive = (value || '') === opt.value;
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor: isActive ? GOLD : 'white',
              color: isActive ? '#0F3460' : '#374151',
              boxShadow: isActive ? '0 2px 8px rgba(212, 175, 55, 0.35)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
