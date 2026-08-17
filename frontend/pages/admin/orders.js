import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import { formatMoney } from '../../lib/currency';

const OrdersManagement = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [page, status, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await axios.get(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data.orders);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const viewOrder = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ord = response.data.order || {};
      try {
        ord.shipping = ord.shipping_address ? JSON.parse(ord.shipping_address) : null;
      } catch (e) {
        ord.shipping = null;
      }

      setSelectedOrder(ord);
      setItems(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await axios.patch(
        `/api/admin/orders/${selectedOrder.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update order in list
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setNewStatus('');
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'paid', 'completed', 'cancelled'];

  if (loading && !orders.length) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900">Order Management</h2>

          {/* Search & Filter */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-sm font-medium text-blue-600">{order.order_number}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{order.shipping_name}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{formatMoney(order.total)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid' || order.status === 'completed' ? 'bg-emerald-900/20 text-emerald-300' :
                        order.status === 'pending' ? 'bg-blue-900/20 text-blue-300' :
                        order.status === 'processing' ? 'bg-sky-900/20 text-sky-300' :
                        order.status === 'shipped' ? 'bg-violet-900/20 text-violet-300' :
                        order.status === 'delivered' ? 'bg-emerald-900/20 text-emerald-300' :
                        order.status === 'cancelled' ? 'bg-rose-900/20 text-rose-300' :
                        'bg-white/10 text-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => viewOrder(order.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-[32px] border border-slate-300 bg-white max-w-2xl w-full mx-4 p-6 max-h-screen overflow-y-auto shadow-[0_30px_90px_rgba(15,23,42,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-slate-900">Order #{selectedOrder.order_number}</h3>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setNewStatus('');
                    setItems([]);
                  }}
                  className="text-2xl font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-400">{formatMoney(selectedOrder.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Current Status</p>
                    <p className="text-lg font-semibold capitalize text-slate-900">{selectedOrder.status}</p>
                  </div>
                </div>

                {/* Customer details */}
                <div className="border-t border-slate-300 pt-4">
                  <h4 className="text-sm text-slate-600 mb-2">Customer</h4>
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold">{selectedOrder.customer_name || (selectedOrder.shipping && selectedOrder.shipping.name) || selectedOrder.shipping_name}</p>
                    <p className="text-slate-600">{selectedOrder.customer_email || ''}</p>
                    <p className="text-slate-600">{selectedOrder.customer_phone || ''}</p>
                  </div>
                </div>

                {/* Items list */}
                <div className="border-t border-slate-300 pt-4">
                  <h4 className="text-sm text-slate-600 mb-2">Items</h4>
                  <div className="space-y-2">
                    {items.length ? items.map(it => (
                      <div key={it.id} className="flex items-center gap-3 bg-slate-50 rounded p-3">
                        {it.product_image && (
                          <img src={it.product_image} alt={it.product_title} className="h-12 w-12 rounded object-cover" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{it.product_title || 'Unknown product'}</div>
                          <div className="text-xs text-slate-600">Qty: {it.quantity} · {formatMoney(it.price)}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-slate-600">No items found for this order.</div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select new status...</option>
                      {statusOptions.map(s => (
                        <option key={s} value={s} disabled={s === selectedOrder.status}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!newStatus}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setNewStatus('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersManagement;

OrdersManagement.noLayout = true;
