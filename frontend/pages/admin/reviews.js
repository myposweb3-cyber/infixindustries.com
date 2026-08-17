import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';

const ReviewsManagement = () => {
  const { token } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: '', comment: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchReviews();
  }, [token, page]);

  const fetchReviews = async (pageNumber = page) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/reviews', {
        params: { page: pageNumber, limit: 20, search },
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data.reviews || []);
      setPages(res.data.pages || 1);
      setPage(pageNumber);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchReviews(1);
  };

  const openEditor = (review) => {
    setSelectedReview(review);
    setEditForm({
      rating: review.rating || 1,
      title: review.title || '',
      comment: review.comment || ''
    });
  };

  const closeEditor = () => {
    setSelectedReview(null);
    setEditForm({ rating: 5, title: '', comment: '' });
  };

  const handleSave = async () => {
    if (!selectedReview) return;
    try {
      setSaving(true);
      const res = await axios.put(
        `/api/admin/reviews/${selectedReview.id}`,
        {
          rating: editForm.rating,
          title: editForm.title,
          comment: editForm.comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.review;
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setSelectedReview(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (review) => {
    if (!confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/admin/reviews/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      if (selectedReview?.id === review.id) closeEditor();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    const filled = '★'.repeat(rating || 0);
    const empty = '☆'.repeat(5 - (rating || 0));
    return `${filled}${empty}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
            <p className="text-sm text-slate-600">Manage and update customer reviews for products.</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, user, title or comment"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 w-full md:w-96 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Search</button>
          </form>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading reviews...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Comment</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-500">No reviews found.</td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{review.product_title || 'Unknown'}</td>
                        <td className="px-4 py-3">{review.user_name || 'Anonymous'}</td>
                        <td className="px-4 py-3 text-blue-400">{renderStars(review.rating)}</td>
                        <td className="px-4 py-3">{review.title || '—'}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{review.comment || '—'}</td>
                        <td className="px-4 py-3">{new Date(review.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => openEditor(review)}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(review)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-700">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {selectedReview && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Edit Review</h2>
                <p className="text-sm text-slate-600">Product: {selectedReview.product_title || 'Unknown'}</p>
                <p className="text-sm text-slate-600">Customer: {selectedReview.user_name || 'Anonymous'}</p>
              </div>
              <button
                onClick={closeEditor}
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Rating</span>
                <select
                  value={editForm.rating}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Title</span>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </label>
            </div>
            <label className="mt-4 space-y-2 block">
              <span className="text-sm font-medium text-slate-700">Comment</span>
              <textarea
                value={editForm.comment}
                onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                rows={6}
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Review'}
              </button>
              <button
                onClick={closeEditor}
                className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsManagement;

ReviewsManagement.noLayout = true;
