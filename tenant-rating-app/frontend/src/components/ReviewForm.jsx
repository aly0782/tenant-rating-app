import React, { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';

const API = 'https://tenant-rating-app.onrender.com';

export default function ReviewForm({ reviewedUserId, reviewedUserName, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1 || rating > 5) {
      setError('Please select a rating (1-5 stars).');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
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
          reviewed_user_id: parseInt(reviewedUserId, 10),
          rating,
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <p className="text-emerald-600 font-semibold text-lg mb-6">
          Review submitted! Waiting for their approval.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">
          Rate {reviewedUserName}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Rating *</label>
        <StarRating rating={rating} onChange={setRating} interactive />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          placeholder="e.g. Responsive and fair"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] resize-none"
          placeholder="Tell others about your experience with this person..."
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
