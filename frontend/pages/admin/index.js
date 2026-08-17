import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import { formatMoney } from '../../lib/currency';
import { useRouter } from 'next/router';
import { normalizeImageUrl } from '../../lib/imageUrl';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../lib/getCroppedImg';

const AdminDashboard = () => {
  const router = useRouter();
  const { token, login } = useContext(AuthContext);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const categoryImageRef = useRef();
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroSlideTitle, setHeroSlideTitle] = useState('');
  const [heroSlideLink, setHeroSlideLink] = useState('');
  const [heroImage, setHeroImage] = useState(null);
  const heroImageRef = useRef();
  const [editingHeroSlide, setEditingHeroSlide] = useState(null);
  const activeTab = router.query.tab || 'dashboard';

  // If not authenticated, show inline admin login form
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await axios.post(`${base}/auth/login`, { email: adminEmail, password: adminPassword });
      const { user, token: accessToken, refreshToken } = res.data;
      // store via AuthContext
      login(user, accessToken, refreshToken);
      // refresh data after login
      router.replace('/admin');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchCategories();
    fetchFeaturedProducts();
    fetchBestSellers();
    fetchHeroSlides();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Admin Sign In</h2>
          {loginError && <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{loginError}</div>}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Email</label>
              <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Password</label>
              <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] py-3 font-semibold text-white">{loginLoading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p className="mt-4 text-sm text-slate-600">Use the seeded admin account (admin@infix.local / admin123) or create an admin user in the database.</p>
        </div>
      </div>
    );
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setTopProducts(response.data.topProducts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Fetch categories failed', err.message);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get('/api/products?featured=true');
      setFeaturedProducts(res.data.items || []);
    } catch (err) {
      console.error('Fetch featured products failed', err.message);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const res = await axios.get('/api/products?best_seller=true');
      setBestSellers(res.data.items || []);
    } catch (err) {
      console.error('Fetch best sellers failed', err.message);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await axios.get('/api/admin/hero-slides', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHeroSlides(res.data || []);
    } catch (err) {
      console.error('Fetch hero slides failed', err.message);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ${color}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-600">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">{icon}</div>
      </div>
    </div>
  );

  if (loading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  if (!stats) return <AdminLayout><div className="p-8">No data</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Orders" value={stats.stats.totalOrders} icon="📦" color="border-blue-500" />
              <StatCard title="Total Revenue" value={formatMoney(stats.stats.totalRevenue)} icon="💰" color="border-green-500" />
              <StatCard title="Pending Orders" value={stats.stats.pendingOrders} icon="⏳" color="border-blue-500" />
              <StatCard title="Total Products" value={stats.stats.totalProducts} icon="🛍️" color="border-purple-500" />
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.recentOrders.map((order) => (
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
                            order.status === 'cancelled' ? 'bg-rose-900/20 text-rose-300' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            token={token}
            categories={categories}
            fetchCategories={fetchCategories}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategorySlug={newCategorySlug}
            setNewCategorySlug={setNewCategorySlug}
            newCategoryDescription={newCategoryDescription}
            setNewCategoryDescription={setNewCategoryDescription}
            categoryImage={categoryImage}
            setCategoryImage={setCategoryImage}
            categoryImageRef={categoryImageRef}
          />
        )}

        {activeTab === 'featured' && (
          <ProductManagementTab
            token={token}
            products={featuredProducts}
            fetchProducts={fetchFeaturedProducts}
            defaultFlags={{ is_featured: true, is_best_seller: false }}
            heading="Featured Products"
            subheading="Manage featured products and upload images for promotion."
          />
        )}

        {activeTab === 'bestsellers' && (
          <ProductManagementTab
            token={token}
            products={bestSellers}
            fetchProducts={fetchBestSellers}
            defaultFlags={{ is_featured: false, is_best_seller: true }}
            heading="Best Sellers"
            subheading="Manage the best-selling hardware products."
          />
        )}

        {activeTab === 'topselling' && (
          <TopSellingTab token={token} products={topProducts} refreshAll={() => { fetchStats(); fetchFeaturedProducts(); fetchBestSellers(); }} />
        )}

        {activeTab === 'hero-slides' && (
          <HeroSlidesTab
            token={token}
            heroSlides={heroSlides}
            fetchHeroSlides={fetchHeroSlides}
            heroSlideTitle={heroSlideTitle}
            setHeroSlideTitle={setHeroSlideTitle}
            heroSlideLink={heroSlideLink}
            setHeroSlideLink={setHeroSlideLink}
            heroImage={heroImage}
            setHeroImage={setHeroImage}
            heroImageRef={heroImageRef}
            editingHeroSlide={editingHeroSlide}
            setEditingHeroSlide={setEditingHeroSlide}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const CategoriesTab = ({
  token,
  categories,
  fetchCategories,
  editingCategory,
  setEditingCategory,
  newCategoryName,
  setNewCategoryName,
  newCategorySlug,
  setNewCategorySlug,
  newCategoryDescription,
  setNewCategoryDescription,
  categoryImage,
  setCategoryImage,
  categoryImageRef
}) => {
  const saveCategory = async () => {
    if (!newCategoryName || !newCategorySlug) {
      alert('Name and slug are required');
      return;
    }
    const fd = new FormData();
    fd.append('name', newCategoryName);
    fd.append('slug', newCategorySlug);
    if (newCategoryDescription) fd.append('description', newCategoryDescription);
    if (categoryImage) fd.append('image', categoryImage);

    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/admin/categories', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      reset();
      fetchCategories();
    } catch (err) {
      alert('Failed to save category: ' + (err.response?.data?.error || err.message));
    }
  };

  const reset = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategorySlug('');
    setNewCategoryDescription('');
    setCategoryImage(null);
    if (categoryImageRef.current) categoryImageRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-300 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Browse & Manage Categories</h2>
        <div className="mb-8 p-6 rounded-3xl border border-blue-300/20 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
            />
            <input
              type="text"
              placeholder="Slug"
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            rows={4}
          />
          <div className="mt-4">
            <input
              ref={categoryImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 w-full"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveCategory} className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300/30 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:brightness-110">{editingCategory ? 'Save Category' : 'Add Category'}</button>
            {editingCategory && (
              <button onClick={reset} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-slate-200">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <p className="text-slate-600 col-span-full">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="rounded-3xl border border-slate-300 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
                {cat.image && <img src={normalizeImageUrl(cat.image)} alt={cat.name} className="w-full h-32 object-cover rounded-2xl mb-3" />}
                <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-600 mt-1">Slug: {cat.slug}</p>
                <p className="text-xs text-slate-600 mt-1">{cat.description || 'No description'}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setNewCategoryName(cat.name);
                      setNewCategorySlug(cat.slug);
                      setNewCategoryDescription(cat.description || '');
                      setCategoryImage(null);
                      if (categoryImageRef.current) categoryImageRef.current.value = '';
                    }}
                    className="flex-1 rounded-full bg-blue-400 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this category?')) return;
                      try {
                        await axios.delete(`/api/admin/categories/${cat.id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchCategories();
                      } catch (err) {
                        alert('Delete failed');
                      }
                    }}
                    className="flex-1 rounded-full bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ProductManagementTab = ({ token, products, fetchProducts, defaultFlags, heading, subheading }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    is_featured: defaultFlags.is_featured,
    is_best_seller: defaultFlags.is_best_seller
  });
  const [imageFile, setImageFile] = useState(null);
  const imageRef = useRef();

  useEffect(() => {
    setProductForm((prev) => ({ ...prev, is_featured: defaultFlags.is_featured, is_best_seller: defaultFlags.is_best_seller }));
  }, [defaultFlags]);

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      brand: '',
      is_featured: defaultFlags.is_featured,
      is_best_seller: defaultFlags.is_best_seller
    });
    setImageFile(null);
    if (imageRef.current) imageRef.current.value = '';
  };

  const saveProduct = async () => {
    if (!productForm.title || !productForm.slug) {
      alert('Title and slug are required');
      return;
    }
    const fd = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if ((key === 'category' || key === 'brand' || key === 'sku' || key === 'description') && value === '') return;
      fd.append(key, value);
    });
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
            <p className="text-sm text-slate-600 mt-1">{subheading}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div className="rounded-3xl border border-slate-300 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={productForm.title}
                onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Slug"
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category ID"
                value={productForm.category}
                onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Brand ID"
                value={productForm.brand}
                onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              rows={4}
            />
            <div className="mt-4">
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 w-full"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={productForm.is_best_seller}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, is_best_seller: e.target.checked }))}
                />
                Best Seller
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={saveProduct} className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:brightness-110">{editingProduct ? 'Save Product' : 'Add Product'}</button>
              {editingProduct && <button onClick={resetForm} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-slate-200">Cancel</button>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.1)]">
            <h3 className="font-semibold text-slate-900 mb-4">{heading}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <p className="text-slate-600">No products found.</p>
              ) : (
                products.map((prod) => (
                  <div key={prod.id} className="rounded-3xl border border-slate-300 bg-white p-4">
                    <img src={normalizeImageUrl(prod.image)} alt={prod.title} className="w-full h-32 object-cover rounded-2xl mb-3" />
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{prod.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">Price: {formatMoney(prod.price)}</p>
                    <p className="text-xs text-slate-600 mt-1">Stock: {prod.stock}</p>
                    <p className="text-xs text-slate-600 mt-1">Featured: {prod.is_featured ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-slate-600 mt-1">Best Seller: {prod.is_best_seller ? 'Yes' : 'No'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductForm({
                            title: prod.title || '',
                            slug: prod.slug || '',
                            description: prod.description || '',
                            price: prod.price || '',
                            stock: prod.stock || '',
                            category: prod.category || '',
                            brand: prod.brand || '',
                            is_featured: prod.is_featured || false,
                            is_best_seller: prod.is_best_seller || false
                          });
                          if (imageRef.current) imageRef.current.value = '';
                          setImageFile(null);
                        }}
                        className="flex-1 rounded-full bg-blue-400 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this product?')) return;
                          try {
                            await axios.delete(`/api/products/${prod.id}`, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchProducts();
                          } catch (err) {
                            alert('Delete failed');
                          }
                        }}
                        className="flex-1 rounded-full bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopSellingTab = ({ token, products, refreshAll }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    is_featured: false,
    is_best_seller: false
  });
  const [imageFile, setImageFile] = useState(null);
  const imageRef = useRef();

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      brand: '',
      is_featured: false,
      is_best_seller: false
    });
    setImageFile(null);
    if (imageRef.current) imageRef.current.value = '';
  };

  const saveProduct = async () => {
    if (!productForm.title || !productForm.slug) {
      alert('Title and slug are required');
      return;
    }
    const fd = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if ((key === 'category' || key === 'brand' || key === 'sku' || key === 'description') && value === '') return;
      fd.append(key, value);
    });
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      resetForm();
      refreshAll();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      refreshAll();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-300 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Top Selling Hardware Products</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="rounded-3xl border border-slate-300 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={productForm.title}
                onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Slug"
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              rows={4}
            />
            <div className="mt-4">
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 w-full"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button onClick={saveProduct} className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">{editingProduct ? 'Save Product' : 'Add Product'}</button>
              {editingProduct && <button onClick={resetForm} className="rounded-full bg-slate-200 px-5 py-2 text-slate-700 hover:bg-slate-300">Cancel</button>}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-300 bg-white p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-700">Product</th>
                  <th className="px-4 py-3 text-left text-slate-700">Price</th>
                  <th className="px-4 py-3 text-left text-slate-700">Sold</th>
                  <th className="px-4 py-3 text-left text-slate-700">Revenue</th>
                  <th className="px-4 py-3 text-left text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-900">{product.name}</td>
                      <td className="px-4 py-3 text-blue-600">{formatMoney(product.price || 0)}</td>
                      <td className="px-4 py-3 text-slate-600">{product.quantity_sold || 0}</td>
                      <td className="px-4 py-3 text-green-600">{formatMoney(product.revenue || 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const { data } = await axios.get(`/api/products/${product.id}`,
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setEditingProduct(product);
                                setProductForm({
                                  title: data.title || product.name || '',
                                  slug: data.slug || '',
                                  description: data.description || '',
                                  price: data.price || '',
                                  stock: data.stock || '',
                                  category: data.category || '',
                                  brand: data.brand || '',
                                  is_featured: data.is_featured || false,
                                  is_best_seller: data.is_best_seller || false
                                });
                                if (imageRef.current) imageRef.current.value = '';
                                setImageFile(null);
                              } catch (err) {
                                alert('Failed to load product details for edit');
                              }
                            }}
                            className="rounded-full bg-blue-400 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-full bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-600">No top selling products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSlidesTab = ({
  token,
  heroSlides,
  fetchHeroSlides,
  heroSlideTitle,
  setHeroSlideTitle,
  heroSlideLink,
  setHeroSlideLink,
  heroImage,
  setHeroImage,
  heroImageRef,
  editingHeroSlide,
  setEditingHeroSlide
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadHeroSlide = async () => {
    if (!heroImage) {
      alert('Please select an image');
      return;
    }
    if (!previewUrl) {
      alert('Image preview failed');
      return;
    }

    setUploading(true);
    try {
      let imageToUpload = heroImage;

      // If crop was applied, use the cropped image
      if (croppedAreaPixels) {
        try {
          const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
          imageToUpload = new File([croppedBlob], heroImage.name, { type: 'image/jpeg' });
        } catch (cropErr) {
          console.warn('Crop failed, using original image:', cropErr);
        }
      }

      const fd = new FormData();
      fd.append('image', imageToUpload);
      fd.append('title', heroSlideTitle || '');
      fd.append('link', heroSlideLink || '');

      const res = await axios.post('/api/admin/hero-slides', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Hero slide uploaded successfully');
      setHeroSlideTitle('');
      setHeroSlideLink('');
      setHeroImage(null);
      setPreviewUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (heroImageRef.current) heroImageRef.current.value = '';
      await fetchHeroSlides();
    } catch (err) {
      alert('Failed to upload hero slide: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const updateHeroSlide = async () => {
    if (!editingHeroSlide || !heroSlideTitle) {
      alert('Title is required');
      return;
    }
    setUploading(true);
    try {
      const res = await axios.put(`/api/admin/hero-slides/${editingHeroSlide.id}`, {
        title: heroSlideTitle,
        link: heroSlideLink
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Hero slide updated successfully');
      setHeroSlideTitle('');
      setHeroSlideLink('');
      setEditingHeroSlide(null);
      setPreviewUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      await fetchHeroSlides();
    } catch (err) {
      alert('Failed to update hero slide: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const deleteHeroSlide = async (id) => {
    if (!window.confirm('Delete this hero slide?')) return;
    try {
      await axios.delete(`/api/admin/hero-slides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Hero slide deleted');
      await fetchHeroSlides();
    } catch (err) {
      alert('Failed to delete hero slide: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-300 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Hero Slides Management</h2>
        <p className="text-sm text-slate-600 mb-6">Manage banner images shown on the homepage. Images are cropped to 1920x600 (16:9). You can adjust the crop area before uploading.</p>

        <div className="mb-8 p-6 rounded-3xl border border-blue-400/20 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-4">{editingHeroSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Slide Title"
              value={heroSlideTitle}
              onChange={(e) => setHeroSlideTitle(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-slate-900 outline-none"
            />
            <input
              type="text"
              placeholder="Link (optional)"
              value={heroSlideLink}
              onChange={(e) => setHeroSlideLink(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-slate-900 outline-none"
            />
          </div>

          {!editingHeroSlide && (
            <div className="mt-4">
              <input
                ref={heroImageRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-slate-900 w-full"
              />
              <p className="mt-2 text-xs text-slate-600">Select a high-resolution landscape image. You'll be able to crop it to 16:9 aspect ratio.</p>
            </div>
          )}

          {previewUrl && !editingHeroSlide && (
            <div className="mt-6 space-y-4">
              <div className="relative w-full h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-300">
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-700">Zoom: {zoom.toFixed(1)}x</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2 flex-wrap">
            {editingHeroSlide ? (
              <>
                <button
                  onClick={updateHeroSlide}
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-50"
                >
                  {uploading ? 'Updating...' : 'Update Slide'}
                </button>
                <button
                  onClick={() => {
                    setEditingHeroSlide(null);
                    setHeroSlideTitle('');
                    setHeroSlideLink('');
                    setHeroImage(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {previewUrl && (
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setHeroImage(null);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setCroppedAreaPixels(null);
                      if (heroImageRef.current) heroImageRef.current.value = '';
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={uploadHeroSlide}
                  disabled={uploading || !heroImage}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Slide'}
                </button>
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 mb-4">Current Hero Slides</h3>
        {heroSlides.length === 0 ? (
          <p className="text-slate-600">No hero slides created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="rounded-2xl border border-slate-300 bg-white overflow-hidden">
                {slide.image && (
                  <img
                    src={normalizeImageUrl(slide.image)}
                    alt={slide.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{slide.title || '(No title)'}</h4>
                  {slide.link && (
                    <p className="text-xs text-slate-600 mt-1 truncate">Link: {slide.link}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(slide.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingHeroSlide(slide);
                        setHeroSlideTitle(slide.title || '');
                        setHeroSlideLink(slide.link || '');
                        setHeroImage(null);
                        setPreviewUrl(null);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-400 text-white rounded-lg font-semibold hover:bg-blue-500 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHeroSlide(slide.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

AdminDashboard.noLayout = true;
