import React, { useState } from 'react';
import { Star } from 'lucide-react';

const API = 'https://tenant-rating-app.onrender.com';
const GOLD = '#D4AF37';
const BLUE = '#0F3460';

/**
 * ReviewModal – appears when user clicks "Leave a review" on a profile.
 * Props: personId, personName, onClose, onSubmit (called after successful POST)
 */
export default function ReviewModal({ personId, personName, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const displayStars = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1 || rating > 5) {
      setError('Please select a rating (1–5 stars).');
      return;
    }
    if (!title.trim()) {
      setError('Please add a title.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewed_user_id: parseInt(personId, 10),
          rating,
          title: title.trim(),
          description: details.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      onSubmit?.();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      {/* White card */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <h2 id="review-modal-title" className="text-[28px] font-bold text-gray-900">
          Rate {personName}
        </h2>
        <p className="mt-2 text-base text-gray-500" style={{ fontSize: '16px' }}>
          Your honest review helps others make better decisions.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Section 1: Your rating – 5 interactive gold stars 40px */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3460]"
                  style={{ color: displayStars >= value ? GOLD : '#d1d5db' }}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star
                    size={40}
                    className="transition-colors"
                    style={{
                      fill: displayStars >= value ? GOLD : 'transparent',
                      stroke: displayStars >= value ? GOLD : '#d1d5db',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Title – border-bottom only (Stripe style) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was your experience?"
              className="w-full py-3 text-gray-900 placeholder-gray-400 focus:outline-none border-0 border-b border-gray-200 focus:border-b-2 focus:border-[#0F3460] transition-colors"
              required
            />
          </div>

          {/* Section 3: Details (optional) – textarea, border-bottom only, 120px height */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Share more about your experience..."
              className="w-full py-3 text-gray-900 placeholder-gray-400 focus:outline-none border-0 border-b border-gray-200 focus:border-b-2 focus:border-[#0F3460] transition-colors resize-none"
              style={{ minHeight: '120px' }}
              rows={4}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-white rounded-lg transition-opacity disabled:opacity-50"
              style={{ backgroundColor: BLUE, height: '44px' }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
