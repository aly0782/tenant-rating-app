import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, ShieldCheck, Star, Home, Calendar, Clock } from 'lucide-react';

const GOLD = '#D4AF37';

function Stars({ rating }) {
  const r = rating != null ? Math.round(Number(rating)) : 0;
  return (
    <div className="flex gap-0.5 items-center justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          className="shrink-0"
          style={{
            color: GOLD,
            fill: i <= r ? GOLD : 'transparent',
            stroke: GOLD,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Person card (v0-style): avatar, name, badge, rating, location, story/bio, stats row, View profile.
 * Card: white, border #E5E7EB, 24px padding, hover scale 1.02 + shadow. Gaps 8px.
 */
export default function PersonCard({ person }) {
  const {
    id,
    name,
    user_type,
    city,
    avg_rating,
    review_count,
    avatar_url,
    is_verified,
    created_at,
    bio,
  } = person;

  const showVerified = is_verified || (review_count != null && review_count > 0);
  const typeLabel = user_type === 'landlord' ? 'Landlord' : 'Tenant';
  const storySnippet = bio && typeof bio === 'string'
    ? bio.slice(0, 100).trim() + (bio.length > 100 ? '...' : '')
    : 'Trusted rental partner';

  const memberYear = created_at ? new Date(created_at).getFullYear() : null;
  const yearsActive = memberYear ? Math.max(0, new Date().getFullYear() - memberYear) : null;

  const rentals = review_count ?? 0;
  const yearsLabel = yearsActive != null ? `${yearsActive}yr` : '—';
  const responseLabel = '1hr';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex flex-col"
      style={{
        border: '1px solid #E5E7EB',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: '8px' }}>
        {/* Avatar 80px – top center */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
          style={{ backgroundColor: 'rgba(15, 52, 96, 0.08)' }}
        >
          {avatar_url ? (
            <img src={avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-[#0F3460]/50" />
          )}
        </div>

        {/* Name – bold 18px */}
        <h2 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>
          {name}
        </h2>

        {/* Badge – Verified Landlord/Tenant */}
        {showVerified && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#0F3460' }}
          >
            <ShieldCheck size={12} />
            Verified {typeLabel}
          </span>
        )}

        {/* Rating + review count */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Stars rating={avg_rating} />
          <span className="text-base font-bold text-gray-900">
            {avg_rating != null ? Number(avg_rating).toFixed(1) : '—'}
          </span>
          <span className="text-sm text-gray-500">
            ({review_count ?? 0} reviews)
          </span>
        </div>

        {/* Location */}
        {city && (
          <p className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
            <MapPin size={14} />
            {city}
          </p>
        )}

        {/* Story/Bio – italic, gray, 14px, max 100 chars */}
        <p
          className="italic text-center max-w-full"
          style={{ fontSize: '14px', color: '#6B7280' }}
        >
          {storySnippet}
        </p>

        {/* Stats row – 3 mini boxes */}
        <div
          className="grid grid-cols-3 w-full gap-2 mt-1"
          style={{ gap: '8px' }}
        >
          <div
            className="rounded-lg flex flex-col items-center justify-center py-2"
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              padding: '8px',
            }}
          >
            <Home size={16} style={{ color: '#999' }} />
            <span className="font-semibold text-gray-700 text-xs mt-0.5">{rentals}</span>
            <span className="text-xs" style={{ color: '#999' }}>Rentals</span>
          </div>
          <div
            className="rounded-lg flex flex-col items-center justify-center py-2"
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              padding: '8px',
            }}
          >
            <Calendar size={16} style={{ color: '#999' }} />
            <span className="font-semibold text-gray-700 text-xs mt-0.5">{yearsLabel}</span>
            <span className="text-xs" style={{ color: '#999' }}>Active</span>
          </div>
          <div
            className="rounded-lg flex flex-col items-center justify-center py-2"
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              padding: '8px',
            }}
          >
            <Clock size={16} style={{ color: '#999' }} />
            <span className="font-semibold text-gray-700 text-xs mt-0.5">{responseLabel}</span>
            <span className="text-xs" style={{ color: '#999' }}>Response</span>
          </div>
        </div>

        {/* View profile – bottom */}
        <Link
          to={`/person/${id}`}
          className="mt-3 w-full inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white transition-all"
          style={{ backgroundColor: GOLD, minHeight: '44px' }}
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
