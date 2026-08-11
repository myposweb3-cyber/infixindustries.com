import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Please sign in to access this page.</p>
        <Link href="/" className="text-blue-600 underline">
          Go to Home
        </Link>
      </div>
    );
  }
  if (requiredRole && user.role !== requiredRole) {
    return <div className="p-6">Access denied.</div>;
  }
  return children;
}
