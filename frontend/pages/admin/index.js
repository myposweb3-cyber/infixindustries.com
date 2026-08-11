import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import { formatMoney } from '../../lib/currency';
import { useRouter } from 'next/router';
import { normalizeImageUrl } from '../../lib/imageUrl';

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
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-[24px] bg-[#08111f] p-8 border border-white/5">
          <h2 className="text-2xl font-semibold text-white mb-4">Admin Sign In</h2>
          {loginError && <div className="mb-4 rounded-md bg-rose-900/30 p-3 text-sm text-rose-300">{loginError}</div>}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" required className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-3 text-white outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" required className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-3 py-3 text-white outline-none" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full rounded-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] py-3 font-semibold text-white">{loginLoading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p className="mt-4 text-sm text-slate-400">Use the seeded admin account (admin@infix.local / admin123) or create an admin user in the database.</p>
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

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`rounded-[28px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ${color}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-2xl text-yellow-300">{icon}</div>
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
              <StatCard title="Pending Orders" value={stats.stats.pendingOrders} icon="⏳" color="border-yellow-500" />
              <StatCard title="Total Products" value={stats.stats.totalProducts} icon="🛍️" color="border-purple-500" />
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#111111]/95 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0c0c0c] border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-3 text-sm font-medium text-yellow-300">{order.order_number}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{order.shipping_name}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-white">{formatMoney(order.total)}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'paid' || order.status === 'completed' ? 'bg-emerald-900/20 text-emerald-300' :
                            order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-300' :
                            order.status === 'processing' ? 'bg-sky-900/20 text-sky-300' :
                            order.status === 'shipped' ? 'bg-violet-900/20 text-violet-300' :
                            order.status === 'cancelled' ? 'bg-rose-900/20 text-rose-300' :
                            'bg-white/10 text-gray-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
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
      <div className="rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <h2 className="text-xl font-bold text-white mb-4">Browse & Manage Categories</h2>
        <div className="mb-8 p-6 rounded-3xl border border-yellow-400/20 bg-[#0c0c0c]">
          <h3 className="font-semibold text-white mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-white outline-none"
            />
            <input
              type="text"
              placeholder="Slug"
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-white outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none"
            rows={4}
          />
          <div className="mt-4">
            <input
              ref={categoryImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
              className="rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-white w-full"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveCategory} className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,183,255,0.25)] transition hover:brightness-110">{editingCategory ? 'Save Category' : 'Add Category'}</button>
            {editingCategory && (
              <button onClick={reset} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:bg-white/20">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <p className="text-gray-400 col-span-full">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)]">
                {cat.image && <img src={normalizeImageUrl(cat.image)} alt={cat.name} className="w-full h-32 object-cover rounded-2xl mb-3" />}
                <h3 className="font-semibold text-white">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Slug: {cat.slug}</p>
                <p className="text-xs text-gray-400 mt-1">{cat.description || 'No description'}</p>
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
                    className="flex-1 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-black hover:bg-yellow-400"
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
      <div className="rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{heading}</h2>
            <p className="text-sm text-gray-400 mt-1">{subheading}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6">
            <h3 className="font-semibold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={productForm.title}
                onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Slug"
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category ID"
                value={productForm.category}
                onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Brand ID"
                value={productForm.brand}
                onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none"
              rows={4}
            />
            <div className="mt-4">
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white w-full"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={productForm.is_best_seller}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, is_best_seller: e.target.checked }))}
                />
                Best Seller
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={saveProduct} className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,183,255,0.25)] transition hover:brightness-110">{editingProduct ? 'Save Product' : 'Add Product'}</button>
              {editingProduct && <button onClick={resetForm} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:bg-white/20">Cancel</button>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.2)]">
            <h3 className="font-semibold text-white mb-4">{heading}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <p className="text-gray-400">No products found.</p>
              ) : (
                products.map((prod) => (
                  <div key={prod.id} className="rounded-3xl border border-white/10 bg-[#111111] p-4">
                    <img src={normalizeImageUrl(prod.image)} alt={prod.title} className="w-full h-32 object-cover rounded-2xl mb-3" />
                    <h4 className="font-semibold text-white text-sm truncate">{prod.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">Price: {formatMoney(prod.price)}</p>
                    <p className="text-xs text-gray-400 mt-1">Stock: {prod.stock}</p>
                    <p className="text-xs text-gray-400 mt-1">Featured: {prod.is_featured ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-gray-400 mt-1">Best Seller: {prod.is_best_seller ? 'Yes' : 'No'}</p>
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
                        className="flex-1 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-black hover:bg-yellow-400"
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
      <div className="rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <h2 className="text-xl font-bold text-white mb-4">Top Selling Hardware Products</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6">
            <h3 className="font-semibold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={productForm.title}
                onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Slug"
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white outline-none"
              />
            </div>
            <textarea
              placeholder="Description"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none"
              rows={4}
            />
            <div className="mt-4">
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-2 text-white w-full"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button onClick={saveProduct} className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">{editingProduct ? 'Save Product' : 'Add Product'}</button>
              {editingProduct && <button onClick={resetForm} className="rounded-full bg-white/10 px-5 py-2 text-white hover:bg-white/20">Cancel</button>}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111111] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300">Product</th>
                  <th className="px-4 py-3 text-left text-gray-300">Price</th>
                  <th className="px-4 py-3 text-left text-gray-300">Sold</th>
                  <th className="px-4 py-3 text-left text-gray-300">Revenue</th>
                  <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-white">{product.name}</td>
                      <td className="px-4 py-3 text-yellow-300">{formatMoney(product.price || 0)}</td>
                      <td className="px-4 py-3 text-gray-300">{product.quantity_sold || 0}</td>
                      <td className="px-4 py-3 text-green-300">{formatMoney(product.revenue || 0)}</td>
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
                            className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-400"
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
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No top selling products found.</td>
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

export default AdminDashboard;

AdminDashboard.noLayout = true;
