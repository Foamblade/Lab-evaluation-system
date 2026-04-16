// ✅ DONE — App.jsx with all routes + placeholder pages + RootRedirect
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layout
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Auth Pages — ✅ Phase 1
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';

// Admin Pages — ✅ Phase 2
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CreateTestPage from './pages/admin/CreateTestPage.jsx';
import CreateQuestionPage from './pages/admin/CreateQuestionPage.jsx';
import TestDetailPage from './pages/admin/TestDetailPage.jsx';

// Student Pages — ✅ Phase 3
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import TestLobbyPage from './pages/student/TestLobbyPage.jsx';
import ResultPage from './pages/student/ResultPage.jsx';

// Test Page — ✅ Phase 4
import TestPage from './pages/student/TestPage.jsx';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while verifying stored JWT token
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--accent-blue)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            // verifying session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <main style={{ paddingTop: user ? 'var(--navbar-height)' : 0, flex: 1 }}>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth — public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-test" element={
            <ProtectedRoute requiredRole="admin">
              <CreateTestPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-question" element={
            <ProtectedRoute requiredRole="admin">
              <CreateQuestionPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/test/:testId" element={
            <ProtectedRoute requiredRole="admin">
              <TestDetailPage />
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/test/:testId/lobby" element={
            <ProtectedRoute requiredRole="student">
              <TestLobbyPage />
            </ProtectedRoute>
          } />
          <Route path="/student/test/:testId" element={
            <ProtectedRoute requiredRole="student">
              <TestPage />
            </ProtectedRoute>
          } />
          <Route path="/student/result/:testId" element={
            <ProtectedRoute requiredRole="student">
              <ResultPage />
            </ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function NotFound() {
  return (
    <div style={styles.notFound}>
      <div style={styles.notFoundCard} className="fade-in">
        <h1 style={styles.notFound404}>404</h1>
        <p style={styles.notFoundCode}>
          <span style={{ color: 'var(--accent-red)' }}>Error</span>
          <span style={{ color: 'var(--text-muted)' }}>:</span>
          <span style={{ color: 'var(--accent-green-bright)' }}> &apos;Page not found&apos;</span>
        </p>
        <p style={styles.notFoundHint}>
          // the route you requested does not exist
        </p>
        <a href="/" style={styles.notFoundLink}>navigate(&apos;/&apos;)</a>
      </div>
    </div>
  );
}

const styles = {
  notFound: {
    minHeight: 'calc(100vh - var(--navbar-height))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  notFoundCard: {
    textAlign: 'center',
    padding: '48px',
  },
  notFound404: {
    fontSize: '5rem',
    fontWeight: 700,
    background: 'var(--gradient-brand)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
    marginBottom: '16px',
  },
  notFoundCode: {
    fontSize: '1rem',
    fontFamily: 'var(--font-mono)',
    marginBottom: '8px',
  },
  notFoundHint: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  notFoundLink: {
    color: 'var(--accent-blue)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '10px 24px',
    border: '1px solid var(--accent-blue)',
    borderRadius: 'var(--radius-md)',
    display: 'inline-block',
    transition: 'all 150ms ease',
  },
};
