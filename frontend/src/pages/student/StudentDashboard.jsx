// ✅ DONE — Phase 6: Student Dashboard (connected to API)
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axiosInstance from '../../api/axiosInstance.js';
import TestCard from '../../components/student/TestCard.jsx';
import ScoreCard from '../../components/student/ScoreCard.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, resultsRes] = await Promise.all([
          axiosInstance.get('/tests'),
          axiosInstance.get('/results/me'),
        ]);
        setTests(testsRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (test) => {
    const now = Date.now();
    const start = new Date(test.startTime).getTime();
    const end = start + test.duration * 60000;
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const liveTests = useMemo(() => tests.filter((t) => getStatus(t) === 'live'), [tests]);
  const upcomingTests = useMemo(() => tests.filter((t) => getStatus(t) === 'upcoming'), [tests]);
  const endedTests = useMemo(() => tests.filter((t) => getStatus(t) === 'ended'), [tests]);

  // Transform results for ScoreCard
  const pastResults = results.map((r) => ({
    testTitle: r.test?.title || 'Unknown Test',
    totalScore: r.totalScore,
    maxScore: (r.test?.questions?.length || 1) * 100,
    completedAt: r.completedAt,
    submissions: r.submissions || [],
  }));

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.container}>
        {/* Welcome card */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeLeft}>
            <h1 style={styles.welcomeTitle}>
              <span style={{ color: 'var(--accent-green-bright)' }}>hello</span>, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p style={styles.welcomeHint}>// your coding dashboard</p>
          </div>
          <div style={styles.miniStats}>
            <div style={styles.miniStat}>
              <span style={{ ...styles.miniStatNum, color: 'var(--accent-green-bright)' }}>{liveTests.length}</span>
              <span style={styles.miniStatLabel}>Live</span>
            </div>
            <div style={styles.miniStat}>
              <span style={{ ...styles.miniStatNum, color: 'var(--accent-blue)' }}>{upcomingTests.length}</span>
              <span style={styles.miniStatLabel}>Upcoming</span>
            </div>
            <div style={styles.miniStat}>
              <span style={styles.miniStatNum}>{endedTests.length}</span>
              <span style={styles.miniStatLabel}>Completed</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {[
            { key: 'tests', label: 'Active Tests', icon: '📝' },
            { key: 'scores', label: 'Past Scores', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
              id={`tab-${tab.key}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p>Loading dashboard...</p>
          </div>
        )}

        {/* Active Tests tab */}
        {!loading && activeTab === 'tests' && (
          <div>
            {liveTests.length > 0 && (
              <div style={styles.testSection}>
                <h2 style={styles.sectionTitle}>
                  <span style={styles.liveIndicator} />
                  <span style={{ color: 'var(--accent-green-bright)' }}>live</span> now
                </h2>
                <div style={styles.testGrid}>
                  {liveTests.map((t) => <TestCard key={t._id} test={{ ...t, questionCount: t.questions?.length || 0 }} />)}
                </div>
              </div>
            )}
            {upcomingTests.length > 0 && (
              <div style={styles.testSection}>
                <h2 style={styles.sectionTitle}>
                  <span style={{ color: 'var(--accent-blue)' }}>upcoming</span> tests
                </h2>
                <div style={styles.testGrid}>
                  {upcomingTests.map((t) => <TestCard key={t._id} test={{ ...t, questionCount: t.questions?.length || 0 }} />)}
                </div>
              </div>
            )}
            {liveTests.length === 0 && upcomingTests.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No active tests right now</p>
                <p style={styles.emptyHint}>// check back later for upcoming tests</p>
              </div>
            )}
          </div>
        )}

        {/* Past Scores tab */}
        {!loading && activeTab === 'scores' && (
          <div>
            {pastResults.length > 0 ? (
              <div style={styles.scoresGrid}>
                {pastResults.map((r, i) => <ScoreCard key={i} result={r} />)}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📊</span>
                <p style={styles.emptyText}>No scores yet</p>
                <p style={styles.emptyHint}>// take a test to see your scores here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - var(--navbar-height))', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  welcomeCard: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' },
  welcomeLeft: {},
  welcomeTitle: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' },
  welcomeHint: { color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' },
  miniStats: { display: 'flex', gap: '24px' },
  miniStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  miniStatNum: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' },
  miniStatLabel: { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tabBar: { display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '6px', marginBottom: '28px' },
  tab: { padding: '12px 24px', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center', fontFamily: 'var(--font-mono)' },
  tabActive: { background: 'var(--bg-primary)', color: 'var(--accent-blue)', fontWeight: 600 },
  loadingState: { textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' },
  spinner: { width: '24px', height: '24px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  testSection: { marginBottom: '32px' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  liveIndicator: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green-bright)', animation: 'pulse 1.5s ease-in-out infinite' },
  testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  scoresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' },
  emptyState: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '16px' },
  emptyText: { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' },
  emptyHint: { fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' },
};
