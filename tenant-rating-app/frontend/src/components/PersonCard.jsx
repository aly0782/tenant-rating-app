import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck } from 'lucide-react';

const GOLD = '#D4AF37';
const BLUE = '#0F3460';

function Stars({ rating }) {
  const r = rating != null ? Math.round(Number(rating)) : 0;
  return (
    <div className="flex gap-0.5 items-center justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className="shrink-0"
          style={{ color: GOLD, fill: i <= r ? GOLD : 'transparent', stroke: GOLD }}
        />
      ))}
    </div>
  );
}

/**
 * Person card – matches v0 TrustNest: avatar (initials), name, Verified landlord/tenant, 4.9 (32 reviews), location, View profile.
 */
export default function PersonCard({ person }) {
  const { id, name, user_type, city, avg_rating, review_count, avatar_url } = person;

  const initials = name
    ? name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const typeLabel = user_type === 'landlord' ? 'landlord' : 'tenant';
  const locationDisplay = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : '';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex flex-col border border-gray-100"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col items-center text-center p-6 gap-3">
        {/* Avatar – circle with initials (SM, MJ, etc.) */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-xl"
          style={{ backgroundColor: BLUE }}
        >
          {avatar_url ? (
            <img src={avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            initials
          )}
        </div>

        <h2 className="font-bold text-gray-900 text-lg">
          {name}
        </h2>

        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 bg-amber-50 border border-amber-200"
          style={{ color: '#92400e' }}
        >
          <ShieldCheck size={14} className="shrink-0" style={{ color: GOLD }} />
          Verified {typeLabel}
        </span>

        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <Stars rating={avg_rating} />
          <span className="text-sm font-semibold text-gray-900">
            {avg_rating != null ? Number(avg_rating).toFixed(1) : '—'}
          </span>
          <span className="text-sm text-gray-500">
            ({review_count ?? 0} reviews)
          </span>
        </div>

        {locationDisplay && (
          <p className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
            <MapPin size={14} className="shrink-0" />
            {locationDisplay}
          </p>
        )}

        <Link
          to={`/person/${id}`}
          className="mt-2 w-full inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-95"
          style={{ backgroundColor: BLUE, minHeight: '44px' }}
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
