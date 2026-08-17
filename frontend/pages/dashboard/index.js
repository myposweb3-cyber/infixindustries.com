import { useAuth } from '../../hooks/useAuth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useRouter } from 'next/router';

const dashboardItems = [
  {
    title: 'My Orders',
    description: 'Track order history and shipping updates in one place.',
    icon: '📦',
  },
  {
    title: 'Wishlist',
    description: 'Review saved products and move favorites to cart.',
    icon: '💖',
  },
  {
    title: 'Addresses',
    description: 'Manage all billing and shipping addresses securely.',
    icon: '🏠',
  },
  {
    title: 'Downloads',
    description: 'Access digital purchases, invoices, and order receipts.',
    icon: '⬇️',
  },
];

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCardClick = (title) => {
    window.alert(`${title} feature is coming soon. Stay tuned!`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 scroll-reveal" data-reveal-delay="0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Welcome back, <span className="font-semibold text-gray-900">{user?.name || user?.email}</span>. Manage your account, orders, and preferences from one clean dashboard.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-white shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardItems.map((item, idx) => (
          <div
            key={item.title}
            className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-blue-500/20 scroll-reveal"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl">{item.icon}</div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Dashboard</span>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
            <button
              type="button"
              onClick={() => handleCardClick(item.title)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]"
            >
              Open {item.title}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Account overview</p>
            <h2 className="mt-3 text-2xl font-bold">A better dashboard experience</h2>
          </div>
          <p className="mt-4 max-w-xl text-sm text-cyan-100 md:mt-0">
            Your customer dashboard should feel clean, easy to scan, and fast to use. These cards help highlight the most important actions first.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

Dashboard.noLayout = true;
