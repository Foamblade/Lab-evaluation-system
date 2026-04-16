// ✅ DONE — Phase 6: Test Lobby Page (connected to API)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import Timer from '../../components/student/Timer.jsx';
import useTimer from '../../hooks/useTimer.js';
import Button from '../../components/ui/Button.jsx';

export default function TestLobbyPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axiosInstance.get(`/tests/${testId}`);
        setTest(res.data);
      } catch {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
          <div style={styles.spinner} />
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ color: 'var(--accent-red)', padding: '24px' }}>Test not found</div>
          <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>← back</Button>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const start = new Date(test.startTime).getTime();
  const end = start + test.duration * 60000;
  const questionCount = test.questions?.length || 0;

  let status;
  if (now < start) status = 'upcoming';
  else if (now >= start && now <= end) status = 'live';
  else status = 'ended';

  return (
    <div style={styles.page}>
      <div style={styles.container} className="fade-in">
        <button onClick={() => navigate('/student/dashboard')} style={styles.backBtn}>← back to dashboard</button>
        <div style={styles.lobbyCard}>
          <div style={styles.bgPattern} />
          <div style={styles.statusRow}>
            {status === 'upcoming' && (
              <span style={{ ...styles.statusBadge, color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)' }}>upcoming</span>
            )}
            {status === 'live' && (
              <span style={{ ...styles.statusBadge, color: 'var(--accent-green-bright)', background: 'var(--accent-green-dim)' }}>
                <span style={styles.liveDot} /> live now
              </span>
            )}
            {status === 'ended' && (
              <span style={{ ...styles.statusBadge, color: 'var(--text-muted)', background: 'rgba(72, 79, 88, 0.15)' }}>ended</span>
            )}
          </div>
          <h1 style={styles.testTitle}>{test.title}</h1>
          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>📝</span>
              <div>
                <span style={styles.infoValue}>{questionCount}</span>
                <span style={styles.infoLabel}>Questions</span>
              </div>
            </div>
            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>⏱</span>
              <div>
                <span style={styles.infoValue}>{test.duration} min</span>
                <span style={styles.infoLabel}>Duration</span>
              </div>
            </div>
            <div style={styles.infoBox}>
              <span style={styles.infoIcon}>🌐</span>
              <div>
                <span style={styles.infoValue}>C, C++, Java, Python</span>
                <span style={styles.infoLabel}>Languages</span>
              </div>
            </div>
          </div>

          {status === 'upcoming' && (
            <div style={styles.timerSection}>
              <Timer targetTime={start} label="Test Starts In" size="lg" />
              <div style={styles.waitNote}>
                <span style={{ color: 'var(--accent-blue)' }}>ℹ</span>
                <span>The "Enter Test" button will appear when the test goes live.</span>
              </div>
            </div>
          )}
          {status === 'live' && (
            <div style={styles.timerSection}>
              <Timer targetTime={end} label="Test Ends In" size="lg" />
              <div style={styles.enterSection}>
                <div style={styles.instructions}>
                  <h3 style={styles.instructTitle}>// before you begin</h3>
                  <ul style={styles.instructList}>
                    <li>You can submit multiple times — best score counts</li>
                    <li>Each question is scored independently (0-100)</li>
                    <li>Partial scoring: (passed cases / total) × 100</li>
                    <li>Timer runs even if you leave the page</li>
                  </ul>
                </div>
                <Button onClick={() => navigate(`/student/test/${test._id}`)} fullWidth id="enter-test-btn"
                  style={{ padding: '16px 32px', fontSize: '1rem' }}>
                  enterTest() →
                </Button>
              </div>
            </div>
          )}
          {status === 'ended' && (
            <div style={styles.timerSection}>
              <div style={styles.endedMsg}>
                <span style={styles.endedIcon}>🏁</span>
                <div>
                  <p style={styles.endedTitle}>Test has ended</p>
                  <p style={styles.endedHint}>// check your results below</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate(`/student/result/${test._id}`)} fullWidth id="view-results-btn">
                viewResults()
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - var(--navbar-height))', padding: '32px 24px', display: 'flex', justifyContent: 'center' },
  container: { maxWidth: '620px', width: '100%' },
  spinner: { width: '24px', height: '24px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  backBtn: { background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontWeight: 500, display: 'inline-block' },
  lobbyCard: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '24px' },
  bgPattern: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(48,54,61,0.2) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', opacity: 0.6 },
  statusRow: { marginBottom: '20px', position: 'relative', zIndex: 1 },
  statusBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '6px 18px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green-bright)', animation: 'pulse 1.5s ease-in-out infinite' },
  testTitle: { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '28px', position: 'relative', zIndex: 1, lineHeight: 1.4 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px', position: 'relative', zIndex: 1 },
  infoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(48, 54, 61, 0.5)', textAlign: 'left' },
  infoIcon: { fontSize: '1.3rem', flexShrink: 0 },
  infoValue: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' },
  infoLabel: { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  timerSection: { position: 'relative', zIndex: 1 },
  waitNote: { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '12px 20px', background: 'var(--accent-blue-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(88, 166, 255, 0.15)' },
  enterSection: { marginTop: '28px' },
  instructions: { textAlign: 'left', marginBottom: '24px', padding: '20px 24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' },
  instructTitle: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' },
  instructList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 0 },
  endedMsg: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: '20px', textAlign: 'left' },
  endedIcon: { fontSize: '2rem', flexShrink: 0 },
  endedTitle: { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' },
  endedHint: { fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' },
};
