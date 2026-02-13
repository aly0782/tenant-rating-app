import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Home, Clock, MessageCircle, Star, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';

const API = 'https://tenant-rating-app.onrender.com';
const GOLD = '#D4AF37';
const BLUE = '#0F3460';

function AvatarInitials({ name, size = 40 }) {
  const initials = name
    ? name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: BLUE,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  );
}

function Stars({ rating }) {
  const r = rating != null ? Math.round(Number(rating)) : 0;
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          className="shrink-0"
          style={{ color: GOLD, fill: i <= r ? GOLD : 'transparent', stroke: GOLD }}
        />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { id: userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    fetch(`${API}/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Person not found');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const refetch = () => {
    if (!userId) return;
    fetch(`${API}/api/users/${userId}`)
      .then((res) => res.ok && res.json())
      .then((d) => d && setData(d));
  };

  const isSelf = user && data && parseInt(userId, 10) === user.id;
  const verifiedReviews = data?.reviews?.filter((r) => r.is_verified) ?? [];
  const pendingReviews = data?.reviews?.filter((r) => !r.is_verified) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-gray-200" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link to="/search" className="inline-block mt-4 text-[#0F3460] font-semibold hover:underline">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user: person, reviews } = data;
  const showVerified = person.review_count > 0 || person.is_verified;

  // Stats: use review_count, years from created_at, placeholder response
  const memberSince = person.created_at
    ? new Date(person.created_at).getFullYear()
    : null;
  const yearsActive = memberSince ? new Date().getFullYear() - memberSince : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/search" className="hover:text-[#0F3460] font-medium transition-colors">
            Search
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{person.name}</span>
        </nav>

        {/* Profile header: 120px avatar + name + verified + rating */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            <div
              className="w-[120px] h-[120px] rounded-full flex items-center justify-center overflow-hidden shrink-0 mb-5"
              style={{ backgroundColor: 'rgba(15, 52, 96, 0.1)' }}
            >
              {person.avatar_url ? (
                <img
                  src={person.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-4xl font-bold text-white"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                  }}
                >
                  {person.name
                    ? person.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                    : '?'}
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-bold text-gray-900">
              {person.name}
            </h1>
            {showVerified && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-2"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#0F3460' }}
              >
                <ShieldCheck size={16} style={{ color: GOLD }} />
                Verified
              </span>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Stars rating={person.avg_rating} />
              <span className="text-xl font-bold text-gray-900">
                {person.avg_rating != null ? Number(person.avg_rating).toFixed(1) : '—'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {person.review_count ?? 0} review{(person.review_count ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* About / Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">
              {person.city
                ? `${person.name} is a ${person.user_type || 'tenant'} in ${person.city}.`
                : `${person.name} is a ${person.user_type || 'tenant'}.`}
              {' '}
              {person.review_count > 0
                ? `They have ${person.review_count} verified review${person.review_count !== 1 ? 's' : ''} from people they've rented with.`
                : 'No reviews yet.'}
            </p>
          </div>
        </div>

        {/* Stats: 3 columns */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Home, value: person.review_count ?? 0, label: 'Rentals' },
            { icon: Clock, value: yearsActive > 0 ? `${yearsActive}yr` : '—', label: 'Active' },
            { icon: MessageCircle, value: '1hr', label: 'Response' },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center"
            >
              <Icon size={24} className="mx-auto mb-2 text-[#0F3460]" />
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Reviews section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
            {user && !isSelf && (
              <button
                type="button"
                onClick={() => setReviewFormOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white shrink-0 transition-all hover:opacity-90"
                style={{ backgroundColor: BLUE }}
              >
                <Plus size={18} />
                Leave a review
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4" style={{ gap: '16px' }}>
            {verifiedReviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No verified reviews yet.</div>
            ) : (
              verifiedReviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-gray-200 bg-white"
                  style={{
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex gap-4">
                    <AvatarInitials name={r.reviewer?.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900" style={{ fontSize: '16px' }}>
                          {r.reviewer?.name ?? 'Anonymous'}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#0F3460' }}
                        >
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Stars rating={r.rating} />
                      </div>
                      {r.title && (
                        <p className="font-bold text-gray-900 mt-3" style={{ fontSize: '18px' }}>
                          {r.title}
                        </p>
                      )}
                      {r.description && (
                        <p
                          className="italic mt-2 leading-relaxed"
                          style={{ fontSize: '16px', color: '#666' }}
                        >
                          {r.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                        {(r.rental_start_date || r.rental_end_date) && (
                          <span>
                            Rental period:{' '}
                            {r.rental_start_date
                              ? new Date(r.rental_start_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                            {' – '}
                            {r.rental_end_date
                              ? new Date(r.rental_end_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        )}
                        {r.created_at && (
                          <span>
                            Posted:{' '}
                            {new Date(r.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending reviews (when viewing own profile) */}
        {isSelf && pendingReviews.length > 0 && (
          <div
            className="mt-8 rounded-2xl border p-6"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.3)' }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pending reviews</h2>
            <p className="text-sm text-gray-600 mb-4">
              Approve these to make them public on your profile.
            </p>
            <PendingReviewCards
              pendingReviews={pendingReviews}
              onApprove={refetch}
              onReject={refetch}
            />
          </div>
        )}
      </div>

      {/* Review form modal */}
      {reviewFormOpen && (
        <ReviewModal
          personId={person.id}
          personName={person.name}
          onClose={() => setReviewFormOpen(false)}
          onSubmit={() => {
            setReviewFormOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function PendingReviewCards({ pendingReviews, onApprove, onReject }) {
  const [loadingId, setLoadingId] = useState(null);
  const token = localStorage.getItem('token');

  const handleApprove = async (reviewId) => {
    setLoadingId(reviewId);
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onApprove();
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (reviewId) => {
    setLoadingId(reviewId);
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: 'Rejected' }),
      });
      if (res.ok) onReject();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <ul className="space-y-4">
      {pendingReviews.map((r) => (
        <li key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <p className="font-semibold text-gray-900">{r.reviewer?.name ?? 'Someone'}</p>
              <Stars rating={r.rating} />
              {r.title && <p className="text-gray-800 mt-1 font-medium">{r.title}</p>}
              {r.description && <p className="text-gray-500 text-sm mt-1">{r.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                disabled={loadingId === r.id}
                onClick={() => handleApprove(r.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                Approve
              </button>
              <button
                type="button"
                disabled={loadingId === r.id}
                onClick={() => handleReject(r.id)}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
