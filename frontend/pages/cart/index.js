import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { normalizeImageUrl } from '../../lib/imageUrl';
import { formatMoney } from '../../lib/currency';

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const merged = [];
    const byProduct = new Map();

    cart.forEach((item) => {
      const key = item.productId || item.slug || item.title;
      const existing = byProduct.get(key);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      } else {
        const normalized = { ...item, quantity: item.quantity || 1 };
        byProduct.set(key, normalized);
        merged.push(normalized);
      }
    });

    localStorage.setItem('cart', JSON.stringify(merged));
    return merged;
  } catch(e) { return []; }
}

export default function CartPage(){
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(()=>{
    async function load(){
      if (token) {
        try {
          const res = await axios.get(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
          // server returns rows with cart_id, quantity, product_id, title, slug, price, discount_price, image
          const serverItems = res.data.map(i=>({ cart_id: i.cart_id, productId: i.product_id, slug: i.slug, title: i.title, price: i.discount_price || i.price, image: i.image, quantity: i.quantity }));
          setItems(serverItems);
          // clear guest cart
          localStorage.removeItem('cart');
          return;
        } catch (err){
          console.error('Failed to fetch server cart', err);
        }
      }
      setItems(readCart());
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token]);

  async function updateQty(index, qty){
    const next = items.slice();
    next[index].quantity = qty;
    setItems(next);
    if (token && next[index].cart_id) {
      try {
        await axios.put(`${API}/cart/${next[index].cart_id}`, { quantity: qty }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error('Failed update cart item', err); }
    } else {
      localStorage.setItem('cart', JSON.stringify(next));
    }
  }

  async function removeItem(index){
    const next = items.slice();
    const removed = next.splice(index,1)[0];
    setItems(next);
    if (token && removed.cart_id) {
      try { await axios.delete(`${API}/cart/${removed.cart_id}`, { headers: { Authorization: `Bearer ${token}` } }); } catch (err) { console.error(err); }
    } else {
      localStorage.setItem('cart', JSON.stringify(next));
    }
  }

  const subtotal = items.reduce((s,i)=> s + (parseFloat(i.price||0) * (i.quantity||1)), 0);

  if (!items.length) return <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]"><div className="mx-auto max-w-6xl px-6 py-16"><div className="rounded-[32px] border border-slate-200 bg-slate-50 p-10 shadow-[0_24px_70px_rgba(148,163,184,0.06)]"><h1 className="text-3xl font-semibold text-slate-900">Your cart is empty</h1><p className="mt-3 text-gray-500">Add some premium tools and hardware to get started.</p><Link href="/shop" className="mt-6 inline-flex rounded-full bg-blue-400 px-6 py-3 font-semibold text-white transition hover:brightness-95">Shop now</Link></div></div></div>

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((it, idx)=> (
              <div key={idx} className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-[0_20px_60px_rgba(148,163,184,0.06)] sm:flex-row sm:items-center">
                <img src={normalizeImageUrl(it.image)} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="flex-1">
                  <Link href={`/product/${it.slug}`} className="font-semibold text-slate-900">{it.title}</Link>
                  <div className="mt-1 text-sm text-gray-500">{formatMoney(it.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={it.quantity} min="1" onChange={e=> updateQty(idx, parseInt(e.target.value||1,10))} className="w-16 rounded-2xl border border-slate-200 bg-slate-100 px-2 py-2 text-slate-900 outline-none" />
                  <button onClick={()=> removeItem(idx)} className="rounded-full border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.06)]">
            <h3 className="text-xl font-semibold text-slate-900">Order Summary</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">Items: <span className="text-slate-900">{items.length}</span></div>
              <div className="flex items-center justify-between">Subtotal: <span className="text-slate-900">{formatMoney(subtotal)}</span></div>
            </div>
            <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-400 px-4 py-3 text-center font-semibold text-white transition hover:brightness-95">Proceed to Checkout</Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
