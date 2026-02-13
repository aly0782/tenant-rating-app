import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Plus, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';

const API = 'https://tenant-rating-app.onrender.com';

function AvatarInitials({ name }) {
  const initials = name
    ? name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <span className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </span>
  );
}

export default function PersonProfile() {
  const { user } = useAuth();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    fetch(`${API}/api/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Person not found');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isSelf = user && data && parseInt(id, 10) === user.id;
  const verifiedReviews = data?.reviews?.filter((r) => r.is_verified) ?? [];
  const pendingReviews = data?.reviews?.filter((r) => !r.is_verified) ?? [];

  const handleApprove = async (reviewId) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const profileRes = await fetch(`${API}/api/users/${id}`);
        if (profileRes.ok) {
          const updated = await profileRes.json();
          setData(updated);
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: 'Rejected' }),
      });
      if (res.ok)
        setData((prev) => ({
          ...prev,
          reviews: prev.reviews.filter((r) => r.id !== reviewId),
        }));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 w-56 bg-gray-200 rounded animate-skeleton mb-8" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-skeleton" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-red-600 font-medium bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const { person, reviews } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/search" className="hover:text-navy font-medium transition-colors duration-200">
          Search
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{person.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-navy/10 flex items-center justify-center shrink-0 overflow-hidden">
              {person.avatar_url ? (
                <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-navy/40" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
              <p className="text-gray-500 mt-1 capitalize">{person.user_type || 'tenant'}</p>
              {person.city && (
                <p className="flex items-center gap-1.5 text-gray-600 mt-2">
                  <MapPin size={18} className="text-navy shrink-0" />
                  {person.city}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                {person.avg_rating != null ? (
                  <>
                    <StarRating rating={Math.round(Number(person.avg_rating))} />
                    <span className="text-2xl font-bold text-gray-900">
                      {Number(person.avg_rating).toFixed(1)}
                    </span>
                    <span className="text-gray-500">({person.review_count ?? 0} reviews)</span>
                  </>
                ) : (
                  <span className="text-gray-500">No reviews yet</span>
                )}
              </div>
              {user && !isSelf && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 min-h-[44px]"
                  >
                    <Plus size={20} />
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSelf && pendingReviews.length > 0 && (
        <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6 mb-8">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <Clock size={22} className="text-gold-dark" />
            Pending reviews (approve to make public)
          </h2>
          <ul className="space-y-4">
            {pendingReviews.map((r) => (
              <li key={r.id} className="bg-white rounded-xl p-4 border border-gold/20 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.reviewer?.name ?? 'Someone'}</p>
                    <StarRating rating={r.rating} />
                    {r.title && <p className="text-gray-800 mt-1 font-medium">{r.title}</p>}
                    {r.description && <p className="text-gray-500 text-sm mt-1">{r.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoading === r.id}
                      onClick={() => handleApprove(r.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === r.id}
                      onClick={() => handleReject(r.id)}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 min-h-[44px]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <CheckCircle size={22} className="text-emerald-600" />
            Verified Reviews
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {verifiedReviews.length === 0 ? (
            <div className="p-8 text-gray-500 text-center">No verified reviews yet.</div>
          ) : (
            verifiedReviews.map((r) => (
              <div
                key={r.id}
                className="p-6 border-l-4 border-gold bg-white hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="flex gap-4">
                  <AvatarInitials name={r.reviewer?.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {r.reviewer?.name ?? 'Anonymous'}
                      </span>
                      <StarRating rating={r.rating} />
                    </div>
                    {r.title && (
                      <p className="font-medium text-gray-800 mt-2">{r.title}</p>
                    )}
                    {r.description && (
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                    {r.created_at && (
                      <p className="text-gray-400 text-xs mt-3">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {reviewFormOpen && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <ReviewForm
              reviewedUserId={person.id}
              reviewedUserName={person.name}
              onClose={() => setReviewFormOpen(false)}
              onSubmitted={() => {
                setReviewFormOpen(false);
                fetch(`${API}/api/users/${id}`)
                  .then((res) => res.ok && res.json())
                  .then(setData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
