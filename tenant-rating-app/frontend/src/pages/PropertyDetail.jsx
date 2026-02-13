import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Home,
  Mail,
  User,
  Plus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';

const API = 'http://localhost:5001';

function AvatarInitials({ name }) {
  const initials = name
    ? name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </span>
  );
}

export default function PropertyDetail() {
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
    fetch(`${API}/api/properties/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Property not found');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isLandlord = user && data && data.property && data.property.landlord_id === user.id;
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
        setData((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId ? { ...r, is_verified: true } : r
          ),
        }));
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
        body: JSON.stringify({ reason: 'Rejected by landlord' }),
      });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          reviews: prev.reviews.filter((r) => r.id !== reviewId),
        }));
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-neutral-border/40 rounded animate-skeleton mb-6" />
        <div className="h-48 bg-neutral-border/30 rounded-xl animate-skeleton" />
        <div className="mt-6 h-32 bg-neutral-border/30 rounded-xl animate-skeleton" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-danger font-medium">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const { property, landlord, reviews } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-neutral-muted mb-6">
        <Link to="/search" className="hover:text-primary transition-colors duration-200">
          Search
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{property.address}</span>
      </nav>

      {/* Header image placeholder */}
      <div className="h-48 sm:h-56 rounded-xl bg-gradient-to-br from-neutral-bg to-neutral-border flex items-center justify-center mb-6 shadow-sm">
        <Home size={48} className="text-neutral-muted/50" />
      </div>

      <div className="space-y-6">
        {/* Property info card */}
        <div className="bg-white rounded-xl border border-neutral-border shadow-sm overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{property.address}</h1>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>{property.address}, {property.city}{property.postal_code ? ` ${property.postal_code}` : ''}</span>
              </li>
              {property.property_type && (
                <li className="flex items-center gap-3 text-gray-700">
                  <Home size={20} className="text-primary shrink-0" />
                  <span className="capitalize">{property.property_type}</span>
                </li>
              )}
              {property.postal_code && (
                <li className="flex items-center gap-3 text-gray-700">
                  <Mail size={20} className="text-primary shrink-0" />
                  <span>{property.postal_code}</span>
                </li>
              )}
              {landlord && (
                <li className="flex items-center gap-3 text-gray-700">
                  <User size={20} className="text-primary shrink-0" />
                  <span>Landlord: {landlord.name}</span>
                </li>
              )}
            </ul>

            {/* Rating block */}
            <div className="mt-6 pt-6 border-t border-neutral-border flex items-center gap-4">
              {property.avg_rating != null ? (
                <>
                  <StarRating rating={Math.round(Number(property.avg_rating))} />
                  <span className="text-2xl font-bold text-gray-900">
                    {Number(property.avg_rating).toFixed(1)}
                  </span>
                  <span className="text-neutral-muted">
                    ({property.review_count ?? 0} reviews)
                  </span>
                </>
              ) : (
                <span className="text-neutral-muted">No reviews yet</span>
              )}
            </div>

            {user && !isLandlord && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setReviewFormOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-200 min-h-[44px]"
                >
                  <Plus size={20} />
                  Leave a Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending reviews (landlord) */}
        {isLandlord && pendingReviews.length > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
              <Clock size={20} className="text-accent-dark" />
              Pending Reviews
            </h2>
            <ul className="space-y-4">
              {pendingReviews.map((r) => (
                <li
                  key={r.id}
                  className="bg-white rounded-lg p-4 border border-accent/20 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 min-w-0">
                      <AvatarInitials name={r.reviewer?.name} />
                      <div>
                        <p className="font-semibold text-gray-900">{r.reviewer?.name ?? 'Reviewer'}</p>
                        <StarRating rating={r.rating} />
                        {r.title && <p className="text-gray-800 mt-1">{r.title}</p>}
                        {r.description && (
                          <p className="text-neutral-muted text-sm mt-1">{r.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={actionLoading === r.id}
                        onClick={() => handleApprove(r.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === r.id}
                        onClick={() => handleReject(r.id)}
                        className="px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
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

        {/* Verified reviews */}
        <div className="bg-white rounded-xl border border-neutral-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <CheckCircle size={20} className="text-success" />
              Verified Reviews
            </h2>
          </div>
          <div className="divide-y divide-neutral-border">
            {verifiedReviews.length === 0 ? (
              <div className="p-6 text-neutral-muted">No verified reviews yet.</div>
            ) : (
              verifiedReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-6 border-l-4 border-primary bg-white"
                >
                  <div className="flex gap-3">
                    <AvatarInitials name={r.reviewer?.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {r.reviewer?.name ?? 'Anonymous'}
                        </span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.title && (
                        <p className="font-medium text-gray-800 mt-1">{r.title}</p>
                      )}
                      {r.description && (
                        <p className="text-neutral-muted text-sm mt-1 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                      {r.created_at && (
                        <p className="text-neutral-muted text-xs mt-2">
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
      </div>

      {reviewFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <ReviewForm
              propertyId={property.id}
              onClose={() => setReviewFormOpen(false)}
              onSubmitted={() => setReviewFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
