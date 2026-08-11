import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import { formatMoney } from '../../lib/currency';
import { normalizeImageUrl } from '../../lib/imageUrl';

const ProductsManagement = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category_id: '',
    brand_id: '',
    sku: ''
  });
  const [createImages, setCreateImages] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);

  useEffect(() => {
    fetchProducts();
    // fetch categories/brands for edit selects
    const fetchLists = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/home/categories'),
          axios.get('/api/home/brands')
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (err) {
        // ignore
      }
    };
    fetchLists();
  }, [page, token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await axios.get(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(response.data.products);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const toggleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedProducts([]);
    } else {
      setSelectAll(true);
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  useEffect(() => {
    if (page) {
      setSelectedProducts([]);
      setSelectAll(false);
    }
  }, [page]);

  useEffect(() => {
    if (products.length === 0) {
      setSelectAll(false);
      return;
    }

    if (selectedProducts.length === products.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
  }, [selectedProducts, products]);

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) {
      alert('Please select at least one product to delete.');
      return;
    }

    if (!confirm(`Delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`)) return;

    try {
      const results = await Promise.allSettled(
        selectedProducts.map((id) =>
          axios.delete(`/api/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      const failed = results.filter((item) => item.status === 'rejected');
      if (failed.length) {
        alert(`${failed.length} product(s) could not be deleted. Refreshing list for remaining items.`);
      } else {
        setMessage('Selected products deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }

      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete selected products: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateImagesChange = (e) => {
    setCreateImages(Array.from(e.target.files));
  };

  const openCreateModal = () => {
    setCreateForm({
      title: '',
      description: '',
      price: '',
      discount_price: '',
      stock: '',
      category_id: '',
      brand_id: '',
      sku: ''
    });
    setCreateImages([]);
    setCreateModalOpen(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: '',
      description: '',
      price: '',
      discount_price: '',
      stock: '',
      category_id: '',
      brand_id: '',
      sku: ''
    });
    setCreateImages([]);
  };

  const handleCreateProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!createForm.title) {
      alert('Product title is required');
      return;
    }

    setCreateLoading(true);
    try {
      const data = new FormData();
      Object.keys(createForm).forEach((key) => {
        if (createForm[key] !== '') data.append(key, createForm[key]);
      });
      createImages.forEach((file) => data.append('images', file));

      await axios.post('/api/admin/products', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Product created successfully!');
      setCreateModalOpen(false);
      resetCreateForm();
      fetchProducts();
    } catch (err) {
      alert('Failed to create product: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (product) => {
    // fetch full product details to include images
    (async () => {
      try {
        const res = await axios.get(`/api/admin/products/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectedProduct(product);
        setEditForm(res.data);
      } catch (err) {
        alert('Failed to load product details');
      }
    })();
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editForm.name) {
      alert('Product name is required');
      return;
    }

    try {
      await axios.put(
        `/api/admin/products/${editForm.id}`,
        {
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          discount_price: editForm.discount_price ? parseFloat(editForm.discount_price) : null,
          stock: parseInt(editForm.stock),
          category_id: editForm.category_id ? parseInt(editForm.category_id) : null,
          brand_id: editForm.brand_id ? parseInt(editForm.brand_id) : null,
          sku: editForm.sku || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Product updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setSelectedProduct(null);
      setEditForm(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(
        `/api/admin/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleNewImagesChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const uploadNewImages = async () => {
    if (!newImages.length || !editForm) return;
    try {
      const fd = new FormData();
      newImages.forEach(f => fd.append('images', f));
      const res = await axios.post(`/api/admin/products/${editForm.id}/images`, fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      setEditForm({ ...editForm, images: res.data.images });
      setNewImages([]);
    } catch (err) {
      alert('Failed to upload images');
    }
  };

  const handleDeleteImage = async (img) => {
    if (!editForm) return;
    if (!confirm('Delete this image?')) return;
    try {
      await axios.delete(`/api/admin/products/${editForm.id}/images`, { headers: { Authorization: `Bearer ${token}` }, data: { image: img } });
      // Filter out by URL regardless of format (string or object)
      const updated = (editForm.images || []).filter(i => getImageUrl(i) !== img);
      setEditForm({ ...editForm, images: updated });
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  // Helper to extract image URL (handles both string format and object format)
  const getImageUrl = (img) => typeof img === 'string' ? img : img.url;
  const getImageThumb = (img) => typeof img === 'string' ? null : img.thumb;

  // Reorder images via drag-and-drop
  const handleDragStart = (e, idx) => {
    setDraggedImage(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedImage === null || draggedImage === targetIdx) {
      setDraggedImage(null);
      return;
    }

    const images = editForm.images || [];
    const newOrder = [...images];
    const [movedImg] = newOrder.splice(draggedImage, 1);
    newOrder.splice(targetIdx, 0, movedImg);

    // Reorder via backend API
    try {
      const imageUrls = newOrder.map(img => getImageUrl(img));
      await axios.patch(`/api/admin/products/${editForm.id}/images/reorder`, { imageOrder: imageUrls }, { headers: { Authorization: `Bearer ${token}` } });
      setEditForm({ ...editForm, images: newOrder });
      setMessage('Images reordered successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to reorder images');
    }

    setDraggedImage(null);
  };

  if (loading && !products.length) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-[#0c0c0c]"
                />
                Select all visible
              </label>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={!selectedProducts.length}
                className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition disabled:opacity-50"
              >
                Delete selected ({selectedProducts.length})
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,183,255,0.25)] transition hover:brightness-110"
            >
              Add Product
            </button>
          </div>

          {message && (
            <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100 flex justify-between items-center">
              {message}
              <button onClick={() => setMessage('')} className="text-xl font-bold text-emerald-100">✕</button>
            </div>
          )}
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-end mb-6">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-2 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setPage(1);
                  fetchProducts();
                }}
                className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
              >
                Clear
              </button>
            </div>
          </form>

          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative rounded-[28px] border border-white/10 bg-[#0c0c0c] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-yellow-400/20 hover:shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
                <label className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-sm text-gray-200 shadow">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="h-4 w-4 rounded border-white/20 bg-[#0c0c0c]"
                  />
                  Select
                </label>
                <img
                  src={normalizeImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-3xl mb-3"
                />
                <h3 className="font-semibold text-white line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-400 mt-1">Category: {product.category_name || 'N/A'}</p>
                
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-bold text-green-400">{formatMoney(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-bold text-sky-400">{product.stock}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
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

        {/* Edit Modal */}
        {editForm && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
            onClick={() => {
              setSelectedProduct(null);
              setEditForm(null);
            }}
          >
            <div className="min-h-screen px-4 py-8 flex items-start justify-center">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Edit Product</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setEditForm(null);
                    }}
                    className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.discount_price || ''}
                        onChange={(e) => setEditForm({ ...editForm, discount_price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editForm.category_id || editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={editForm.brand_id || editForm.brand || ''}
                      onChange={(e) => setEditForm({ ...editForm, brand_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                      <input type="file" multiple accept="image/*" onChange={handleNewImagesChange} />
                      {newImages.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {newImages.map((f, i) => (
                            <img key={i} src={URL.createObjectURL(f)} className="w-20 h-20 object-cover rounded" />
                          ))}
                          <button type="button" onClick={uploadNewImages} className="px-3 py-2 bg-blue-600 text-white rounded ml-2">Upload</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Existing Images</label>
                      <p className="text-xs text-gray-500 mb-2">Drag to reorder, click × to delete</p>
                      <div className="flex gap-2 flex-wrap">
                        {(editForm.images && Array.isArray(editForm.images) ? editForm.images : (editForm.images ? JSON.parse(editForm.images) : [])).map((img, idx) => {
                          const imgUrl = getImageUrl(img);
                          const thumbUrl = getImageThumb(img) || imgUrl;
                          return (
                            <div
                              key={idx}
                              draggable
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, idx)}
                              className={`relative cursor-move ${draggedImage === idx ? 'opacity-50' : ''}`}
                            >
                              <img src={thumbUrl} alt="" className="w-24 h-24 object-cover rounded border-2 border-gray-200" />
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(imgUrl)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(editForm.id);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setEditForm(null);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
            onClick={() => {
              resetCreateForm();
              setCreateModalOpen(false);
            }}
          >
            <div className="min-h-screen px-4 py-8 flex items-start justify-center">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Create Product</h3>
                  <button
                    type="button"
                    onClick={() => {
                      resetCreateForm();
                      setCreateModalOpen(false);
                    }}
                    className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="title"
                      value={createForm.title}
                      onChange={handleCreateChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={createForm.description}
                      onChange={handleCreateChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={createForm.price}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="discount_price"
                        value={createForm.discount_price}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={createForm.stock}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={createForm.sku}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category_id"
                        value={createForm.category_id}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        value={createForm.brand_id}
                        onChange={handleCreateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCreateImagesChange}
                      className="w-full"
                    />
                    {createImages.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {createImages.map((file, idx) => (
                          <img
                            key={idx}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {createLoading ? 'Saving...' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetCreateForm();
                        setCreateModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;

ProductsManagement.noLayout = true;
