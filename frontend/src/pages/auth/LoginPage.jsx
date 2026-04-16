// ✅ DONE — LoginPage with email + password, mock login, role redirect
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // If already logged in, redirect
  if (user) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email format';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Minimum 6 characters';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const result = await login(form.email, form.password);
      const dest = result.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed');
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card} className="fade-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.bracket}>&lt;</span>
            <span style={styles.brandName}>LabEval</span>
            <span style={styles.brandSlash}> /</span>
            <span style={styles.bracket}>&gt;</span>
          </div>
          <p style={styles.subtitle}>// authenticate to continue</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div style={styles.serverError}>
            <span style={styles.errorIcon}>⚠</span> {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} id="login-form">
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-email">
              <span style={styles.labelKeyword}>const</span> email <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange('email')}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              autoComplete="email"
            />
            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">
              <span style={styles.labelKeyword}>const</span> password <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange('password')}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              autoComplete="current-password"
            />
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            id="login-submit-btn"
            style={{ marginTop: '8px' }}
          >
            login()
          </Button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>// no account yet?</span>
          <Link to="/signup" style={styles.footerLink}>signup()</Link>
        </div>


      </div>

      {/* Floating code lines decoration */}
      <div style={styles.codeDecor}>
        <div style={styles.codeLine}>
          <span style={{ color: 'var(--accent-purple)' }}>import</span>
          <span style={{ color: 'var(--text-primary)' }}> {'{ student }'}</span>
          <span style={{ color: 'var(--accent-purple)' }}> from</span>
          <span style={{ color: 'var(--accent-green-bright)' }}> &apos;labeval&apos;</span>
        </div>
        <div style={styles.codeLine}>
          <span style={{ color: 'var(--accent-blue)' }}>const</span>
          <span style={{ color: 'var(--text-primary)' }}> result </span>
          <span style={{ color: 'var(--accent-orange)' }}>=</span>
          <span style={{ color: 'var(--accent-blue)' }}> await</span>
          <span style={{ color: 'var(--accent-yellow)' }}> evaluate</span>
          <span style={{ color: 'var(--text-primary)' }}>(code)</span>
        </div>
        <div style={styles.codeLine}>
          <span style={{ color: 'var(--accent-purple)' }}>if</span>
          <span style={{ color: 'var(--text-primary)' }}> (result.verdict </span>
          <span style={{ color: 'var(--accent-orange)' }}>===</span>
          <span style={{ color: 'var(--accent-green-bright)' }}> &apos;AC&apos;</span>
          <span style={{ color: 'var(--text-primary)' }}>)</span>
          <span style={{ color: 'var(--accent-yellow)' }}> celebrate</span>
          <span style={{ color: 'var(--text-primary)' }}>()</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-15%',
    right: '-10%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(188,140,255,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 36px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    marginBottom: '12px',
  },
  bracket: {
    color: 'var(--accent-blue)',
    fontSize: '2rem',
    fontWeight: 700,
  },
  brandName: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  brandSlash: {
    color: 'var(--accent-blue)',
    fontSize: '1.6rem',
    fontWeight: 700,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  },
  serverError: {
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(248, 81, 73, 0.2)',
  },
  errorIcon: {
    fontSize: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  labelKeyword: {
    color: 'var(--accent-blue)',
  },
  labelOp: {
    color: 'var(--accent-orange)',
  },
  input: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    width: '100%',
    outline: 'none',
  },
  inputError: {
    borderColor: 'var(--accent-red)',
    boxShadow: '0 0 0 3px var(--accent-red-dim)',
  },
  fieldError: {
    color: 'var(--accent-red)',
    fontSize: '0.72rem',
    marginTop: '2px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  footerText: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  },
  footerLink: {
    color: 'var(--accent-blue)',
    fontSize: '0.8rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
  devNote: {
    marginTop: '24px',
    padding: '12px 16px',
    background: 'rgba(227, 179, 65, 0.08)',
    border: '1px solid rgba(227, 179, 65, 0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.72rem',
    color: 'var(--accent-yellow)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    lineHeight: 1.5,
  },
  devNoteIcon: {
    fontSize: '0.9rem',
    flexShrink: 0,
    marginTop: '1px',
  },
  codeDecor: {
    position: 'absolute',
    bottom: '40px',
    left: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    opacity: 0.25,
    pointerEvents: 'none',
    zIndex: 0,
  },
  codeLine: {
    fontSize: '0.72rem',
    display: 'flex',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
};
