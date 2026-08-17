import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/login`,
        { email, password, cart: guestCart }
      );
      const { user, token, refreshToken } = res.data;
      login(user, token, refreshToken);
      // clear guest cart after successful merge/login
      localStorage.removeItem('cart');
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,199,0,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)] p-4">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Login</h1>
        {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none focus:border-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-400 py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
