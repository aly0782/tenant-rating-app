import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';

const API = 'http://localhost:5001';

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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!data) return null;

  const { property, landlord, reviews } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">{property.address}</h1>
          <p className="text-gray-600 mt-1">
            {property.city}
            {property.postal_code ? `, ${property.postal_code}` : ''}
            {property.property_type ? ` · ${property.property_type}` : ''}
          </p>
          {landlord && (
            <p className="text-gray-500 text-sm mt-2">Landlord: {landlord.name}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {property.avg_rating != null ? (
              <>
                <StarRating rating={Math.round(Number(property.avg_rating))} />
                <span className="text-gray-600">
                  {Number(property.avg_rating).toFixed(1)} · {property.review_count ?? 0} reviews
                </span>
              </>
            ) : (
              <span className="text-gray-400">No reviews yet</span>
            )}
          </div>
        </div>

        {user && !isLandlord && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={() => setReviewFormOpen(true)}
              className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600"
            >
              Leave a Review
            </button>
          </div>
        )}

        {isLandlord && pendingReviews.length > 0 && (
          <div className="p-6 border-b border-gray-100 bg-amber-50/50">
            <h2 className="font-semibold text-gray-800 mb-3">Pending Reviews</h2>
            <ul className="space-y-3">
              {pendingReviews.map((r) => (
                <li key={r.id} className="bg-white rounded-lg p-4 border border-amber-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{r.reviewer?.name ?? 'Reviewer'}</p>
                      <StarRating rating={r.rating} />
                      {r.title && <p className="text-gray-700 mt-1">{r.title}</p>}
                      {r.description && <p className="text-gray-600 text-sm mt-1">{r.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading === r.id}
                        onClick={() => handleApprove(r.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === r.id}
                        onClick={() => handleReject(r.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
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

        <div className="p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Verified Reviews</h2>
          {verifiedReviews.length === 0 ? (
            <p className="text-gray-500">No verified reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {verifiedReviews.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{r.reviewer?.name ?? 'Anonymous'}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.title && <p className="font-medium text-gray-700 mt-1">{r.title}</p>}
                  {r.description && <p className="text-gray-600 text-sm mt-1">{r.description}</p>}
                  {r.created_at && (
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {reviewFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
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
