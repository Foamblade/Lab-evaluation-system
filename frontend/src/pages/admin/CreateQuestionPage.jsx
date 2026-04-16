// ✅ DONE — Phase 6: Create Question Page (connected to API)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import TestCaseForm from '../../components/admin/TestCaseForm.jsx';
import Button from '../../components/ui/Button.jsx';

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeLimit: '2',
    memoryLimit: '128',
  });
  const [testCases, setTestCases] = useState([
    { input: '', expectedOutput: '', isHidden: false },
  ]);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.timeLimit || Number(form.timeLimit) <= 0) errs.timeLimit = 'Must be > 0';
    if (!form.memoryLimit || Number(form.memoryLimit) <= 0) errs.memoryLimit = 'Must be > 0';
    if (testCases.length === 0) {
      errs.testCases = 'At least one test case is required';
    } else {
      const emptyCase = testCases.find((tc) => !tc.input.trim() || !tc.expectedOutput.trim());
      if (emptyCase) errs.testCases = 'All test cases must have input and expected output';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await axiosInstance.post('/questions', {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        testCases,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create question' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-in">
        {/* Header */}
        <div style={styles.pageHeader}>
          <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>
            ← back
          </button>
          <h1 style={styles.pageTitle}>
            <span style={{ color: 'var(--accent-orange)' }}>question</span>.create()
          </h1>
          <p style={styles.pageSubtitle}>// define the problem, constraints, and test cases</p>
        </div>

        {success && (
          <div style={styles.successMsg} className="fade-in">
            <span>✓</span> Question created successfully! Redirecting...
          </div>
        )}
        {errors.submit && (
          <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(248, 81, 73, 0.3)' }}>
            <span>⚠</span> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} id="create-question-form">
          {/* Section 1: Basic Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <span style={{ color: 'var(--accent-blue)' }}>const</span> questionConfig <span style={{ color: 'var(--accent-orange)' }}>=</span> {'{'}
            </h2>

            {/* Title */}
            <div style={{ ...styles.fieldGroup, paddingLeft: '16px' }}>
              <label style={styles.label} htmlFor="question-title">
                <span style={{ color: 'var(--accent-green-bright)' }}>title</span>:
              </label>
              <input
                id="question-title"
                type="text"
                placeholder='"Two Sum"'
                value={form.title}
                onChange={handleChange('title')}
                style={{
                  ...styles.input,
                  ...(errors.title ? styles.inputError : {}),
                }}
              />
              {errors.title && <span style={styles.fieldError}>{errors.title}</span>}
            </div>

            {/* Description */}
            <div style={{ ...styles.fieldGroup, paddingLeft: '16px' }}>
              <label style={styles.label} htmlFor="question-description">
                <span style={{ color: 'var(--accent-green-bright)' }}>description</span>:
                <span style={styles.hint}> // supports Markdown</span>
              </label>
              <textarea
                id="question-description"
                placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                value={form.description}
                onChange={handleChange('description')}
                rows={6}
                style={{
                  ...styles.textarea,
                  ...(errors.description ? styles.inputError : {}),
                }}
              />
              {errors.description && <span style={styles.fieldError}>{errors.description}</span>}
            </div>

            {/* Difficulty + Limits */}
            <div style={{ ...styles.fieldsRow, paddingLeft: '16px' }}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="question-difficulty">
                  <span style={{ color: 'var(--accent-green-bright)' }}>difficulty</span>:
                </label>
                <div style={styles.difficultySelector}>
                  {['easy', 'medium', 'hard'].map((d) => {
                    const colors = {
                      easy: { c: 'var(--accent-green-bright)', bg: 'var(--accent-green-dim)' },
                      medium: { c: 'var(--accent-yellow)', bg: 'rgba(227, 179, 65, 0.12)' },
                      hard: { c: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
                    };
                    const isActive = form.difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, difficulty: d }))}
                        style={{
                          ...styles.diffBtn,
                          color: isActive ? colors[d].c : 'var(--text-muted)',
                          background: isActive ? colors[d].bg : 'transparent',
                          borderColor: isActive ? colors[d].c : 'var(--border-default)',
                        }}
                        id={`difficulty-${d}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="question-time-limit">
                  <span style={{ color: 'var(--accent-green-bright)' }}>timeLimit</span>:
                  <span style={styles.hint}> // seconds</span>
                </label>
                <input
                  id="question-time-limit"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={form.timeLimit}
                  onChange={handleChange('timeLimit')}
                  style={{
                    ...styles.input,
                    ...(errors.timeLimit ? styles.inputError : {}),
                  }}
                />
                {errors.timeLimit && <span style={styles.fieldError}>{errors.timeLimit}</span>}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="question-memory-limit">
                  <span style={{ color: 'var(--accent-green-bright)' }}>memoryLimit</span>:
                  <span style={styles.hint}> // MB</span>
                </label>
                <input
                  id="question-memory-limit"
                  type="number"
                  min="1"
                  placeholder="128"
                  value={form.memoryLimit}
                  onChange={handleChange('memoryLimit')}
                  style={{
                    ...styles.input,
                    ...(errors.memoryLimit ? styles.inputError : {}),
                  }}
                />
                {errors.memoryLimit && <span style={styles.fieldError}>{errors.memoryLimit}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Test Cases */}
          <div style={styles.section}>
            <TestCaseForm testCases={testCases} onChange={setTestCases} />
            {errors.testCases && (
              <span style={{ ...styles.fieldError, marginTop: '12px', display: 'block' }}>
                {errors.testCases}
              </span>
            )}

            <div style={styles.closingBrace}>{'}'}</div>
          </div>

          {/* Submit */}
          <div style={styles.submitRow}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/admin/dashboard')}
            >
              cancel()
            </Button>
            <Button type="submit" loading={saving} id="create-question-submit-btn">
              createQuestion()
            </Button>
          </div>
        </form>


      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - var(--navbar-height))',
    padding: '32px 24px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '32px',
  },
  backBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '12px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    display: 'inline-block',
  },
  pageTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '6px',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontStyle: 'italic',
  },
  successMsg: {
    background: 'var(--accent-green-dim)',
    color: 'var(--accent-green-bright)',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(35, 134, 54, 0.3)',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  hint: {
    color: 'var(--text-muted)',
    fontWeight: 400,
    fontStyle: 'italic',
  },
  input: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  textarea: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: 1.6,
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
  inputError: {
    borderColor: 'var(--accent-red)',
    boxShadow: '0 0 0 3px var(--accent-red-dim)',
  },
  fieldError: {
    color: 'var(--accent-red)',
    fontSize: '0.72rem',
  },
  fieldsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px',
  },
  difficultySelector: {
    display: 'flex',
    gap: '8px',
  },
  diffBtn: {
    padding: '8px 16px',
    fontSize: '0.78rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    background: 'transparent',
  },
  closingBrace: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginTop: '16px',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  devNote: {
    marginTop: '24px',
    padding: '14px 18px',
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
