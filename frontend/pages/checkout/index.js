import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { normalizeImageUrl } from '../../lib/imageUrl';

export default function Checkout(){
  const { token } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || '/api';
  const [items, setItems] = useState([]);
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '', phone: '' });
  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(()=>{
    async function load(){
      if (token) {
        try {
          const res = await axios.get(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
          const serverItems = res.data.map(i=>({ productId: i.product_id, slug: i.slug, title: i.title, price: i.discount_price || i.price, image: i.image, quantity: i.quantity }));
          setItems(serverItems);
          return;
        } catch (err) {
          console.error(err);
        }
      }
      const guest = JSON.parse(localStorage.getItem('cart')||'[]');
      setItems(guest);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token]);

  function updateField(e){ setShipping(prev=>({ ...prev, [e.target.name]: e.target.value })); }

  async function handleSubmit(e){
    e.preventDefault();
    setMessage('');
    setError('');
    if (!items.length) return setMessage('Cart is empty');
    setLoading(true);
    try {
      if (method === 'cod') {
        const res = await axios.post(`${API}/checkout/order`, { items, shipping, payment_method: 'cod' }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        setMessage(`Order placed: ${res.data.orderNumber}`);
        // clear guest cart
        localStorage.removeItem('cart');
        setItems([]);
      } else if (method === 'stripe') {
        // Stripe flow handled in the Card payment component below
        setMessage('Complete payment using the card form below');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Checkout failed');
    } finally { setLoading(false); }
  }

  const subtotal = items.reduce((s,i)=> s + (parseFloat(i.price||0) * (i.quantity||1)), 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>
        {message && <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</div>}
        {error && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input name="name" value={shipping.name} onChange={updateField} placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none focus:border-yellow-400" required />
              <input name="phone" value={shipping.phone} onChange={updateField} placeholder="Phone" className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none focus:border-yellow-400" />
            </div>

            <input name="address" value={shipping.address} onChange={updateField} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none focus:border-yellow-400" required />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input name="city" value={shipping.city} onChange={updateField} placeholder="City" className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none focus:border-yellow-400" required />
              <input name="zip" value={shipping.zip} onChange={updateField} placeholder="ZIP" className="w-full rounded-2xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-white outline-none focus:border-yellow-400" required />
              <label className="inline-flex items-center text-sm text-gray-300"><input type="radio" name="method" value="cod" checked={method==='cod'} onChange={()=>setMethod('cod')} className="mr-2" /> Cash on Delivery</label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center text-sm text-gray-300"><input type="radio" name="method" value="stripe" checked={method==='stripe'} onChange={()=>setMethod('stripe')} className="mr-2" /> Pay with Card (Stripe)</label>
              <div className="text-sm text-gray-500">Secure payments powered by Stripe</div>
            </div>

            {method === 'cod' && (
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:brightness-95">{loading ? 'Processing...' : 'Place Order (COD)'}</button>
              </div>
            )}

            {method === 'stripe' && (
              process.env.NEXT_PUBLIC_STRIPE_PUB ? (
                <div>
                  <Elements stripe={loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB)}>
                    <CardPaymentForm items={items} shipping={shipping} token={token} API={API} setMessage={setMessage} setItems={setItems} />
                  </Elements>
                </div>
              ) : (
                <div className="text-red-300">Stripe public key not configured.</div>
              )
            )}
          </form>

          <aside className="rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <h3 className="text-xl font-semibold text-white">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((it, idx)=>(
                <div key={idx} className="flex items-center gap-3">
                  <img src={normalizeImageUrl(it.image)} className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{it.title}</div>
                    <div className="text-sm text-gray-400">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-semibold text-white">${(parseFloat(it.price||0)*it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4 text-lg font-semibold text-white">Subtotal: ${subtotal.toFixed(2)}</div>
            <div className="mt-3 text-sm text-gray-400">Shipping and taxes calculated at checkout.</div>
            <div className="mt-4">
              <Link href="/shop" className="text-yellow-300">Continue shopping</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CardPaymentForm({ items, shipping, token, API, setMessage, setItems }){
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  async function pay(e){
    e.preventDefault();
    setMessage('');
    if (!items.length) return setMessage('Cart is empty');
    if (!stripe || !elements) return setMessage('Stripe not loaded');
    setProcessing(true);
    try {
      const res = await axios.post(`${API}/checkout/create-payment-intent`, { items, shipping }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const { clientSecret } = res.data;
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      if (result.error) {
        setMessage('Payment failed: ' + result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const orderRes = await axios.post(`${API}/checkout/order`, { items, shipping, payment_method: 'stripe' }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        setMessage(`Payment successful. Order: ${orderRes.data.orderNumber}`);
        localStorage.removeItem('cart');
        setItems([]);
      } else {
        setMessage('Payment processing: ' + (result.paymentIntent?.status || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Payment error');
    } finally { setProcessing(false); }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c0c0c] p-4">
      <div className="mb-3 rounded-2xl border border-white/10 p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button onClick={pay} disabled={processing || !stripe} className="rounded-full bg-yellow-400 px-4 py-2 font-semibold text-black">{processing ? 'Paying...' : 'Pay Now'}</button>
    </div>
  );
}
