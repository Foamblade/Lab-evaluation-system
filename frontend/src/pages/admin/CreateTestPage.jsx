// ✅ DONE — Phase 6: Create Test Page (connected to API)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import Button from '../../components/ui/Button.jsx';

const DIFFICULTY_COLORS = {
  easy: { color: 'var(--accent-green-bright)', bg: 'var(--accent-green-dim)' },
  medium: { color: 'var(--accent-yellow)', bg: 'rgba(227, 179, 65, 0.12)' },
  hard: { color: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
};

export default function CreateTestPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [form, setForm] = useState({
    title: '',
    duration: '',
    startDate: '',
    startTime: '',
  });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch available questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get('/questions');
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  const toggleQuestion = (qId) => {
    setSelectedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
    if (errors.questions) setErrors((prev) => ({ ...prev, questions: '' }));
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.duration || Number(form.duration) <= 0) errs.duration = 'Duration must be > 0';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (selectedQuestions.length === 0) errs.questions = 'Select at least one question';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await axiosInstance.post('/tests', {
        title: form.title.trim(),
        duration: Number(form.duration),
        startTime: new Date(`${form.startDate}T${form.startTime}`).toISOString(),
        questions: selectedQuestions,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create test' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-in">
        <div style={styles.pageHeader}>
          <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>← back</button>
          <h1 style={styles.pageTitle}>
            <span style={{ color: 'var(--accent-orange)' }}>test</span>.create()
          </h1>
          <p style={styles.pageSubtitle}>// configure and schedule a new test</p>
        </div>

        {success && (
          <div style={styles.successMsg} className="fade-in">
            <span>✓</span> Test created successfully! Redirecting...
          </div>
        )}
        {errors.submit && (
          <div style={styles.errorMsg}>
            <span>⚠</span> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} id="create-test-form">
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <span style={{ color: 'var(--accent-blue)' }}>const</span> testConfig <span style={{ color: 'var(--accent-orange)' }}>=</span> {'{'}
            </h2>
            <div style={styles.fieldsGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="test-title">
                  <span style={{ color: 'var(--accent-green-bright)' }}>title</span>:
                </label>
                <input id="test-title" type="text" placeholder='"Data Structures Lab — Week 3"'
                  value={form.title} onChange={handleChange('title')}
                  style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
                />
                {errors.title && <span style={styles.fieldError}>{errors.title}</span>}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="test-duration">
                  <span style={{ color: 'var(--accent-green-bright)' }}>duration</span>:
                  <span style={styles.hint}> // minutes</span>
                </label>
                <input id="test-duration" type="number" min="1" placeholder="60"
                  value={form.duration} onChange={handleChange('duration')}
                  style={{ ...styles.input, ...(errors.duration ? styles.inputError : {}) }}
                />
                {errors.duration && <span style={styles.fieldError}>{errors.duration}</span>}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="test-start-date">
                  <span style={{ color: 'var(--accent-green-bright)' }}>startDate</span>:
                </label>
                <input id="test-start-date" type="date" value={form.startDate}
                  onChange={handleChange('startDate')}
                  style={{ ...styles.input, ...(errors.startDate ? styles.inputError : {}) }}
                />
                {errors.startDate && <span style={styles.fieldError}>{errors.startDate}</span>}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="test-start-time">
                  <span style={{ color: 'var(--accent-green-bright)' }}>startTime</span>:
                </label>
                <input id="test-start-time" type="time" value={form.startTime}
                  onChange={handleChange('startTime')}
                  style={{ ...styles.input, ...(errors.startTime ? styles.inputError : {}) }}
                />
                {errors.startTime && <span style={styles.fieldError}>{errors.startTime}</span>}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <span style={{ color: 'var(--accent-green-bright)' }}>questions</span>:
                <span style={{ color: 'var(--text-muted)' }}> [{selectedQuestions.length} selected]</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/create-question')} type="button">
                + create new
              </Button>
            </div>
            {errors.questions && <span style={{ ...styles.fieldError, marginBottom: '12px', display: 'block' }}>{errors.questions}</span>}

            {loadingQuestions ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No questions yet. Create one first!
              </div>
            ) : (
              <div style={styles.questionList}>
                {questions.map((q) => {
                  const isSelected = selectedQuestions.includes(q._id);
                  const dc = DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium;
                  return (
                    <div key={q._id} onClick={() => toggleQuestion(q._id)}
                      style={{
                        ...styles.questionItem,
                        borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-default)',
                        background: isSelected ? 'var(--accent-blue-dim)' : 'var(--bg-primary)',
                      }}
                      id={`question-select-${q._id}`}
                    >
                      <div style={styles.questionCheckbox}>
                        <span style={{
                          ...styles.checkIcon,
                          background: isSelected ? 'var(--accent-blue)' : 'transparent',
                          borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-default)',
                          color: isSelected ? '#fff' : 'transparent',
                        }}>✓</span>
                      </div>
                      <div style={styles.questionInfo}>
                        <span style={styles.questionTitle}>{q.title}</span>
                      </div>
                      <span style={{ ...styles.diffBadge, color: dc.color, background: dc.bg }}>
                        {q.difficulty}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={styles.closingBrace}>{'}'}</div>
          </div>

          <div style={styles.submitRow}>
            <Button variant="secondary" type="button" onClick={() => navigate('/admin/dashboard')}>cancel()</Button>
            <Button type="submit" loading={saving} id="create-test-submit-btn">createTest()</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - var(--navbar-height))', padding: '32px 24px' },
  container: { maxWidth: '760px', margin: '0 auto' },
  pageHeader: { marginBottom: '32px' },
  backBtn: { background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontWeight: 500, display: 'inline-block', transition: 'color 150ms ease' },
  pageTitle: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' },
  successMsg: { background: 'var(--accent-green-dim)', color: 'var(--accent-green-bright)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(35, 134, 54, 0.3)', fontWeight: 600 },
  errorMsg: { background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(248, 81, 73, 0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '28px' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px' },
  fieldsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', paddingLeft: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' },
  hint: { color: 'var(--text-muted)', fontWeight: 400, fontStyle: 'italic' },
  input: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 16px', width: '100%', outline: 'none', transition: 'border-color 150ms ease, box-shadow 150ms ease' },
  inputError: { borderColor: 'var(--accent-red)', boxShadow: '0 0 0 3px var(--accent-red-dim)' },
  fieldError: { color: 'var(--accent-red)', fontSize: '0.72rem' },
  questionList: { display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' },
  questionItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms ease' },
  questionCheckbox: { flexShrink: 0 },
  checkIcon: { width: '22px', height: '22px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, transition: 'all 150ms ease' },
  questionInfo: { flex: 1, minWidth: 0 },
  questionTitle: { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' },
  diffBadge: { fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  closingBrace: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '16px' },
  submitRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
};
