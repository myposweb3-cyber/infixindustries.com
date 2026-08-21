import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { normalizeImageUrl } from '../../lib/imageUrl';
import { formatMoney } from '../../lib/currency';

function AuthAddToCart({ product }){
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || '/api';

  async function handleAdd(){
    if (token) {
      setLoading(true);
      try {
        await axios.post(`${API}/cart`, { product_id: product.id, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
        alert('Added to cart');
      } catch (err) {
        console.error(err);
        alert('Failed to add to cart');
      } finally { setLoading(false); }
    } else {
      const cart = JSON.parse(localStorage.getItem('cart')||'[]');
      const existing = cart.find(i => (
        (product.id && i.productId === product.id) ||
        (!product.id && i.slug === product.slug)
      ));
      if (existing) existing.quantity = (existing.quantity||1)+1; else cart.push({ productId: product.id, slug: product.slug, title: product.title, price: product.discount_price || product.price, image: product.image, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart');
    }
  }

  return (
    <button onClick={handleAdd} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

export default function ProductPage({ data }){
  if(!data || !data.product) return <div className="p-6">Product not found</div>
  const { product, reviews, related } = data;
  const images = Array.isArray(product.images)
    ? product.images
    : product.images
      ? (() => { try { return JSON.parse(product.images); } catch(e){ return []; } })()
      : [];
  const gallery = images.map(img => normalizeImageUrl(typeof img === 'string' ? img : img.url)).filter(Boolean);
  const hasValidMainImage = product.image && !/(placeholder\.com|placehold\.it)/.test(product.image);
  const mainImage = hasValidMainImage ? normalizeImageUrl(product.image) : (gallery.length ? gallery[0] : normalizeImageUrl(product.image));
  const thumbnails = gallery.filter(img => img !== mainImage).slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.06)]">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="w-full lg:w-2/5">
                  <img src={mainImage} alt={product.title} className="h-96 w-full rounded-[28px] object-cover" />
                  <div className="mt-3 flex gap-2">
                    {thumbnails.map((img, i) => (
                      <img key={i} src={img} alt={`img-${i}`} className="h-20 w-20 rounded-2xl object-cover" />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="product-detail-title text-2xl font-semibold">{product.title}</h1>
                  <p className="mt-2 text-sm text-gray-500">SKU: {product.sku || '—'}</p>
                  <div className="shop-product-price mt-4 text-3xl font-semibold">{formatMoney(product.discount_price || product.price)}</div>
                  <p className="product-detail-copy mt-4 text-sm leading-7">{product.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <AuthAddToCart product={product} />
                    <button onClick={() => { window.location.href = '/cart'; }} className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 transition hover:border-blue-400">View Cart</button>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">Stock: {product.stock}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.06)]">
              <h2 className="product-detail-heading text-xl font-semibold">Customer Reviews</h2>
              {reviews.length === 0 && <p className="mt-3 text-sm text-gray-400">No reviews yet.</p>}
              {reviews.map(r => (
                <div key={r.id} className="border-b border-slate-200 py-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{r.user_name || 'Anonymous'}</strong>
                    <span className="text-blue-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{r.title}</div>
                  <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.06)]">
              <h3 className="product-detail-heading text-lg font-semibold">Related Products</h3>
              {related.map(r => (
                <Link key={r.id} href={`/product/${r.slug}`} className="mt-4 block">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-3">
                    <img src={normalizeImageUrl(r.image)} className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <div className="product-detail-title font-medium">{r.title}</div>
                      <div className="text-sm text-blue-400">{formatMoney(r.discount_price || r.price)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <h3 className="product-detail-heading text-lg font-semibold">Product Details</h3>
              <p className="product-detail-copy mt-3 text-sm">Category ID: {product.category}</p>
              <p className="product-detail-copy mt-2 text-sm">Brand ID: {product.brand}</p>
              <p className="product-detail-copy mt-2 text-sm">Rating: {product.rating}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx){
  const { slug } = ctx.params;
  const requestHost = ctx.req?.headers?.host || '';
  const isLocalRequest = requestHost.startsWith('localhost') || requestHost.startsWith('127.0.0.1');
  const API = isLocalRequest
    ? 'http://localhost:4000/api'
    : `http${ctx.req?.headers?.['x-forwarded-proto'] === 'https' ? 's' : ''}://${requestHost}/api`;
  try{
    // Try fetch by slug first
    const res = await axios.get(`${API}/products/slug/${slug}`);
    if (res && res.data && res.data.product) {
      return { props: { data: res.data } };
    }
  }catch(err){
    // continue to try by id below
  }

  // If slug is numeric (we linked with id fallback), try fetching by id
  if (/^\d+$/.test(String(slug))) {
    try {
      const res2 = await axios.get(`${API}/products/${slug}`);
      if (res2 && res2.data) {
        // normalize shape to match previous { product, reviews, related }
        return { props: { data: { product: res2.data, reviews: [], related: [] } } };
      }
    } catch (err) {
      // fallthrough
    }
  }

  return { props: { data: null } };
}
