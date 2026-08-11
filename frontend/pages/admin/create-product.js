import React, { useState, useContext, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/router';

export default function CreateProduct() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category_id: '',
    brand_id: '',
    sku: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDragStart = (e, idx) => setDraggedIndex(idx);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) {
      setDraggedIndex(null);
      return;
    }
    const newImages = [...imageFiles];
    const [movedFile] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIdx, 0, movedFile);
    setImageFiles(newImages);
    setDraggedIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k] !== '') data.append(k, form[k]);
      });
      // append multiple images
      imageFiles.forEach((f) => data.append('images', f));

      const res = await axios.post('/api/admin/products', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Product created successfully');
      setTimeout(() => router.push('/admin/products'), 800);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/home/categories'),
          axios.get('/api/home/brands')
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (err) {
        // ignore silently
      }
    };
    fetchLists();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">Create Product</h2>
              <p className="mt-2 text-sm text-gray-500">Add a new product for the catalog, upload images, and manage product details in one place.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Back to Products
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg border border-gray-200">
          {message && (
            <div className={`mb-4 flex items-start justify-between rounded-lg px-4 py-3 ${message.toLowerCase().includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="pr-4 text-sm leading-6">{message}</p>
              <button
                type="button"
                onClick={() => setMessage('')}
                className="text-lg font-bold leading-none text-current hover:text-opacity-80"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Price</label>
                <input
                  name="discount_price"
                  value={form.discount_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Quantity"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="SKU code"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  name="brand_id"
                  value={form.brand_id}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  className="w-full text-sm text-gray-600"
                />
                <p className="mt-3 text-xs text-gray-500">Upload product photos. Drag thumbnails below to reorder.</p>
              </div>
              {imageFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {imageFiles.map((f, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`overflow-hidden rounded-3xl border ${draggedIndex === idx ? 'border-blue-500 opacity-70' : 'border-gray-200'} bg-white shadow-sm`} 
                    >
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

CreateProduct.noLayout = true;
