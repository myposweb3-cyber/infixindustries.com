import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const { user, logout } = React.useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">Loading admin panel...</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Products', href: '/admin/products', icon: '🛍️' },
    { label: 'Reviews', href: '/admin/reviews', icon: '⭐' },
    { label: 'Categories', href: '/admin?tab=categories', icon: '📂' },
    { label: 'Hero Slides', href: '/admin?tab=hero-slides', icon: '🎬' },
    { label: 'Featured Products', href: '/admin?tab=featured', icon: '✨' },
    { label: 'Best Sellers', href: '/admin?tab=bestsellers', icon: '🔥' },
    { label: 'Top Selling', href: '/admin?tab=topselling', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} relative flex-shrink-0 border-r border-[var(--border)] bg-white transition-all duration-300`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-300 p-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandLogo className="h-16 w-[320px] sm:h-20 sm:w-[380px]" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full border border-slate-300 bg-white p-2 text-sm text-slate-900 transition hover:border-blue-400 hover:text-slate-700"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>

        <nav className="mt-4 space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = 
              (item.href === '/admin' && router.pathname === '/admin' && !router.query.tab) ||
              (item.href.includes('?tab=') && router.query.tab === item.href.split('?tab=')[1]) ||
              (item.href.startsWith('/admin/') && router.pathname === item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <span>{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-300 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/50 bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
          >
            <span className="text-lg">⏏️</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--bg)]">
        <div className="sticky top-0 z-10 border-b backdrop-blur-xl header-dark" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header-bg-dark)' }}>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-14 w-[320px]" />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                View Store
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
