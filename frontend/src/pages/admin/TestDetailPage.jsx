// ✅ DONE — Phase 6: Test Detail Page (connected to API)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import StudentScoreTable from '../../components/admin/StudentScoreTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

const DIFFICULTY_COLORS = {
  easy: { color: 'var(--accent-green-bright)', bg: 'var(--accent-green-dim)' },
  medium: { color: 'var(--accent-yellow)', bg: 'rgba(227, 179, 65, 0.12)' },
  hard: { color: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
};

export default function TestDetailPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testRes, lbRes] = await Promise.all([
          axiosInstance.get(`/tests/${testId}`),
          axiosInstance.get(`/results/test/${testId}`),
        ]);
        setTest(testRes.data);
        setLeaderboard(lbRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await axiosInstance.delete(`/tests/${testId}`);
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p>Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorMsg}>⚠ {error || 'Test not found'}</div>
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>← back</Button>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const start = new Date(test.startTime).getTime();
  const end = start + test.duration * 60000;

  let status, statusColor, statusBg;
  if (now < start) {
    status = 'upcoming'; statusColor = 'var(--accent-blue)'; statusBg = 'var(--accent-blue-dim)';
  } else if (now >= start && now <= end) {
    status = 'live'; statusColor = 'var(--accent-green-bright)'; statusBg = 'var(--accent-green-dim)';
  } else {
    status = 'ended'; statusColor = 'var(--text-muted)'; statusBg = 'rgba(72, 79, 88, 0.15)';
  }

  const scores = leaderboard?.leaderboard?.map((entry) => ({
    rank: entry.rank,
    studentName: entry.student?.name || 'Unknown',
    studentEmail: entry.student?.email || '',
    totalScore: entry.totalScore,
    submissions: entry.questionVerdicts?.map((qv) => ({
      questionTitle: qv.questionTitle,
      verdict: qv.verdict,
      score: qv.score,
    })) || [],
    completedAt: entry.completedAt,
  })) || [];

  const questions = test.questions || [];
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>← back to dashboard</button>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.infoTop}>
            <div>
              <h1 style={styles.testTitle}>{test.title}</h1>
              <p style={styles.testMeta}>
                <span style={{ color: 'var(--accent-blue)' }}>@</span>
                {' '}{formatDate(test.startTime)} at {formatTime(test.startTime)}
              </p>
            </div>
            <span style={{ ...styles.statusBadge, color: statusColor, background: statusBg }}>
              {status === 'live' && <span style={{ ...styles.liveDot, background: statusColor }} />}
              {status}
            </span>
          </div>
          <div style={styles.infoStats}>
            <div style={styles.infoStat}>
              <span style={styles.infoStatLabel}>Duration</span>
              <span style={styles.infoStatValue}>{test.duration} min</span>
            </div>
            <div style={styles.infoStatDivider} />
            <div style={styles.infoStat}>
              <span style={styles.infoStatLabel}>Questions</span>
              <span style={styles.infoStatValue}>{questions.length}</span>
            </div>
            <div style={styles.infoStatDivider} />
            <div style={styles.infoStat}>
              <span style={styles.infoStatLabel}>Students</span>
              <span style={styles.infoStatValue}>{scores.length}</span>
            </div>
            <div style={styles.infoStatDivider} />
            <div style={styles.infoStat}>
              <span style={styles.infoStatLabel}>Avg Score</span>
              <span style={{ ...styles.infoStatValue, color: 'var(--accent-green-bright)' }}>
                {scores.length > 0 ? Math.round(scores.reduce((s, e) => s + e.totalScore, 0) / scores.length) : 0}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.questionsSection}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: 'var(--accent-blue)' }}>test</span>.questions
            <span style={{ color: 'var(--text-muted)' }}>[{questions.length}]</span>
          </h2>
          <div style={styles.questionGrid}>
            {questions.map((q, i) => {
              const dc = DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium;
              return (
                <div key={q._id} style={styles.questionCard}>
                  <div style={styles.questionIndex}>
                    <span style={{ color: 'var(--accent-purple)' }}>Q</span>{i + 1}
                  </div>
                  <div style={styles.questionContent}>
                    <span style={styles.questionName}>{q.title}</span>
                  </div>
                  <span style={{ ...styles.diffBadge, color: dc.color, background: dc.bg }}>
                    {q.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.leaderboardSection}>
          <StudentScoreTable scores={scores} testTitle={test.title} />
        </div>

        <div style={styles.actionsRow}>
          <Button variant="danger" size="sm" onClick={handleDelete} id="delete-test-btn">deleteTest()</Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - var(--navbar-height))', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  loadingState: { textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' },
  spinner: { width: '24px', height: '24px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  errorMsg: { background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(248, 81, 73, 0.3)' },
  pageHeader: { marginBottom: '24px' },
  backBtn: { background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-mono)', fontWeight: 500, display: 'inline-block' },
  infoCard: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '24px' },
  infoTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  testTitle: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' },
  testMeta: { fontSize: '0.8rem', color: 'var(--text-secondary)' },
  statusBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '6px 16px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' },
  infoStats: { display: 'flex', alignItems: 'center', gap: '24px', padding: '18px 20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(48, 54, 61, 0.5)', flexWrap: 'wrap' },
  infoStat: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '80px' },
  infoStatLabel: { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoStatValue: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' },
  infoStatDivider: { width: '1px', height: '32px', background: 'var(--border-default)', flexShrink: 0 },
  questionsSection: { marginBottom: '24px' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '16px' },
  questionGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  questionCard: { display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px 20px', transition: 'border-color 150ms ease' },
  questionIndex: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0, width: '36px' },
  questionContent: { flex: 1, minWidth: 0 },
  questionName: { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' },
  diffBadge: { fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  leaderboardSection: { marginBottom: '24px' },
  actionsRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
};
