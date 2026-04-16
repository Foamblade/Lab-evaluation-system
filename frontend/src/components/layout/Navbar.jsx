// ✅ DONE — Navbar with role-aware links
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [
        { to: '/admin/dashboard', label: '> Dashboard' },
        { to: '/admin/create-test', label: '> Create_Test' },
        { to: '/admin/create-question', label: '> Create_Question' },
      ]
    : [
        { to: '/student/dashboard', label: '> Dashboard' },
      ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard')}>
          <span style={styles.bracket}>&lt;</span>
          <span style={styles.brandText}>LabEval</span>
          <span style={styles.brandSlash}> /</span>
          <span style={styles.bracket}>&gt;</span>
        </div>

        {/* Desktop Links */}
        <div style={styles.links}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side — User info + Logout */}
        <div style={styles.rightSection}>
          <div style={styles.userInfo}>
            <span style={{
              ...styles.roleBadge,
              background: isAdmin ? 'var(--accent-orange-dim)' : 'var(--accent-green-dim)',
              color: isAdmin ? 'var(--accent-orange)' : 'var(--accent-green-bright)',
            }}>
              {user.role}
            </span>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} id="navbar-logout-btn">
            logout()
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          style={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          id="navbar-mobile-toggle"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.mobileLink,
                ...(isActive ? styles.activeMobileLink : {}),
              })}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={styles.mobileDivider} />
          <div style={styles.mobileUserRow}>
            <span style={{
              ...styles.roleBadge,
              background: isAdmin ? 'var(--accent-orange-dim)' : 'var(--accent-green-dim)',
              color: isAdmin ? 'var(--accent-orange)' : 'var(--accent-green-bright)',
            }}>
              {user.role}
            </span>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button onClick={handleLogout} style={{ ...styles.logoutBtn, width: '100%' }}>
            logout()
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--navbar-height)',
    background: 'rgba(13, 17, 23, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-default)',
    zIndex: 1000,
  },
  container: {
    maxWidth: '1280px',
    height: '100%',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 150ms ease',
  },
  bracket: {
    color: 'var(--accent-blue)',
    fontSize: '1.35rem',
    fontWeight: 700,
  },
  brandText: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  brandSlash: {
    color: 'var(--accent-blue)',
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
  },
  activeLink: {
    color: 'var(--accent-blue)',
    background: 'var(--accent-blue-dim)',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  roleBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  userName: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--accent-red)',
    border: '1px solid rgba(248, 81, 73, 0.3)',
    fontSize: '0.75rem',
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
  mobileToggle: {
    display: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '1.3rem',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
  },
  mobileMenu: {
    position: 'absolute',
    top: 'var(--navbar-height)',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-default)',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    animation: 'slideDown 0.2s ease-out',
  },
  mobileLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    transition: 'all 150ms ease',
  },
  activeMobileLink: {
    color: 'var(--accent-blue)',
    background: 'var(--accent-blue-dim)',
  },
  mobileDivider: {
    height: '1px',
    background: 'var(--border-default)',
    margin: '8px 0',
  },
  mobileUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
  },
};
