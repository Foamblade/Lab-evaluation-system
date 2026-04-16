// ✅ DONE — ProtectedRoute with role guard
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Wraps routes that require authentication.
 * - If user is null → redirect to /login
 * - If user exists but wrong role → redirect to correct dashboard
 * - Otherwise → render children
 *
 * @param {{ children: React.ReactNode, requiredRole: 'admin' | 'student' }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (requiredRole && user.role !== requiredRole) {
    const correctPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={correctPath} replace />;
  }

  return children;
}
