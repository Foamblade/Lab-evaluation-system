// ✅ DONE — Reusable Button with loading/disabled states
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | danger | ghost
  size = 'md',         // sm | md | lg
  loading = false,
  disabled = false,
  fullWidth = false,
  id,
  style: extraStyle = {},
}) {
  const baseStyle = {
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all var(--transition-fast)',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
  };

  const sizes = {
    sm: { fontSize: '0.75rem', padding: '8px 16px' },
    md: { fontSize: '0.85rem', padding: '12px 24px' },
    lg: { fontSize: '0.95rem', padding: '14px 32px' },
  };

  const variants = {
    primary: {
      background: 'var(--gradient-green)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    danger: {
      background: 'var(--accent-red-dim)',
      color: 'var(--accent-red)',
      border: '1px solid rgba(248, 81, 73, 0.3)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  const combined = {
    ...baseStyle,
    ...sizes[size],
    ...variants[variant],
    ...extraStyle,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={combined}
      id={id}
    >
      {loading && <Spinner />}
      {loading ? 'Processing...' : children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

// Inject spinner keyframes
if (typeof document !== 'undefined') {
  const styleId = 'labeval-spinner-keyframes';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleEl);
  }
}
