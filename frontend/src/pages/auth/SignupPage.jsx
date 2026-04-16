// ✅ DONE — SignupPage with name, email, password, role selector, validation
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';

export default function SignupPage() {
  const { signup, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already logged in
  if (user) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      errs.name = 'At least 2 characters';
    }
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
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const result = await signup(form.name.trim(), form.email.trim(), form.password, form.role);
      setSuccess(true);
      const dest = result?.user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      setTimeout(() => navigate(dest, { replace: true }), 1000);
    } catch (err) {
      setServerError(err.message || 'Signup failed');
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
      <div style={styles.bgGrid} />

      <div style={styles.card} className="fade-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.bracket}>&lt;</span>
            <span style={styles.brandName}>LabEval</span>
            <span style={styles.brandSlash}> /</span>
            <span style={styles.bracket}>&gt;</span>
          </div>
          <p style={styles.subtitle}>// create your account</p>
        </div>

        {/* Success message */}
        {success && (
          <div style={styles.successMsg}>
            <span>✓</span> Account created! Redirecting to login...
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div style={styles.serverError}>
            <span style={styles.errorIcon}>⚠</span> {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} id="signup-form">
          {/* Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="signup-name">
              <span style={styles.labelKeyword}>const</span> name <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder='"John Doe"'
              value={form.name}
              onChange={handleChange('name')}
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {}),
              }}
              autoComplete="name"
            />
            {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="signup-email">
              <span style={styles.labelKeyword}>const</span> email <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="signup-email"
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

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="signup-password">
              <span style={styles.labelKeyword}>const</span> password <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange('password')}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              autoComplete="new-password"
            />
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="signup-confirm-password">
              <span style={styles.labelKeyword}>const</span> confirm <span style={styles.labelOp}>=</span>
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span style={styles.fieldError}>{errors.confirmPassword}</span>}
          </div>

          {/* Role selector */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelKeyword}>const</span> role <span style={styles.labelOp}>=</span>
            </label>
            <div style={styles.roleSelector}>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'student' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'student' ? styles.roleBtnActive : {}),
                  ...(form.role === 'student' ? { borderColor: 'var(--accent-green-bright)', color: 'var(--accent-green-bright)', background: 'var(--accent-green-dim)' } : {}),
                }}
                id="signup-role-student"
              >
                <span style={styles.roleIcon}>👨‍🎓</span>
                <span>student</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: 'admin' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'admin' ? styles.roleBtnActive : {}),
                  ...(form.role === 'admin' ? { borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)', background: 'var(--accent-orange-dim)' } : {}),
                }}
                id="signup-role-admin"
              >
                <span style={styles.roleIcon}>🛡️</span>
                <span>admin</span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            id="signup-submit-btn"
            style={{ marginTop: '8px' }}
          >
            createAccount()
          </Button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>// already registered?</span>
          <Link to="/login" style={styles.footerLink}>login()</Link>
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
    top: '10%',
    right: '-8%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(240,136,62,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-5%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(63,185,80,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle, rgba(48,54,61,0.3) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    pointerEvents: 'none',
    opacity: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px 36px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    marginBottom: '10px',
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
  successMsg: {
    background: 'var(--accent-green-dim)',
    color: 'var(--accent-green-bright)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(35, 134, 54, 0.3)',
    fontWeight: 600,
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
    gap: '18px',
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
  roleSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  roleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  roleBtnActive: {
    // overrides applied inline
  },
  roleIcon: {
    fontSize: '1.1rem',
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
    marginTop: '20px',
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
};
