// ✅ DONE — Phase 6: Admin Dashboard (connected to API)
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import TestCard from '../../components/admin/TestCard.jsx';
import Button from '../../components/ui/Button.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axiosInstance.get('/tests');
        setTests(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const getStatus = (test) => {
    const now = Date.now();
    const start = new Date(test.startTime).getTime();
    const end = start + test.duration * 60000;
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const filteredTests = useMemo(() => {
    if (filter === 'all') return tests;
    return tests.filter((t) => getStatus(t) === filter);
  }, [filter, tests]);

  const liveCount = tests.filter((t) => getStatus(t) === 'live').length;
  const upcomingCount = tests.filter((t) => getStatus(t) === 'upcoming').length;
  const endedCount = tests.filter((t) => getStatus(t) === 'ended').length;

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.container}>
        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={{ color: 'var(--accent-orange)' }}>admin</span>.dashboard()
            </h1>
            <p style={styles.pageSubtitle}>// manage tests, questions, and student scores</p>
          </div>
          <div style={styles.headerActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/create-question')}
              id="dashboard-create-question-btn"
            >
              + question
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/create-test')}
              id="dashboard-create-test-btn"
            >
              + new test
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📋</span>
            <div>
              <span style={styles.statNumber}>{tests.length}</span>
              <span style={styles.statLabel}>Total Tests</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🟢</span>
            <div>
              <span style={styles.statNumber}>{liveCount}</span>
              <span style={styles.statLabel}>Live Now</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⏳</span>
            <div>
              <span style={styles.statNumber}>{upcomingCount}</span>
              <span style={styles.statLabel}>Upcoming</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <span style={styles.statNumber}>{endedCount}</span>
              <span style={styles.statLabel}>Completed</span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={styles.errorMsg}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p>Loading tests...</p>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && (
          <>
            <div style={styles.filterBar}>
              <div style={styles.filterTabs}>
                {[
                  { key: 'all', label: 'All Tests', count: tests.length },
                  { key: 'live', label: 'Live', count: liveCount },
                  { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
                  { key: 'ended', label: 'Ended', count: endedCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      ...styles.filterTab,
                      ...(filter === tab.key ? styles.filterTabActive : {}),
                    }}
                    id={`filter-tab-${tab.key}`}
                  >
                    {tab.label}
                    <span style={{
                      ...styles.filterCount,
                      ...(filter === tab.key ? styles.filterCountActive : {}),
                    }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tests grid */}
            {filteredTests.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No {filter} tests found</p>
                <p style={styles.emptyHint}>// create a new test to get started</p>
              </div>
            ) : (
              <div style={styles.testsGrid}>
                {filteredTests.map((test, i) => (
                  <div key={test._id} style={{ animationDelay: `${i * 60}ms` }} className="fade-in">
                    <TestCard test={test} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - var(--navbar-height))',
    padding: '32px 24px',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '24px', marginBottom: '32px', flexWrap: 'wrap',
  },
  pageTitle: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' },
  headerActions: { display: 'flex', gap: '10px', flexShrink: 0 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px', marginBottom: '32px',
  },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 200ms ease',
  },
  statIcon: { fontSize: '1.6rem', flexShrink: 0 },
  statNumber: {
    fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)',
    display: 'block', lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '0.7rem', color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  errorMsg: {
    background: 'var(--accent-red-dim)', color: 'var(--accent-red)',
    padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
    marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
    border: '1px solid rgba(248, 81, 73, 0.3)',
  },
  loadingState: {
    textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.85rem',
  },
  spinner: {
    width: '24px', height: '24px', border: '3px solid var(--border-default)',
    borderTopColor: 'var(--accent-blue)', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
  },
  filterBar: { marginBottom: '24px' },
  filterTabs: {
    display: 'flex', gap: '4px', background: 'var(--bg-card)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
    padding: '6px', overflowX: 'auto',
  },
  filterTab: {
    padding: '10px 18px', fontSize: '0.78rem', fontWeight: 500,
    color: 'var(--text-secondary)', background: 'transparent', border: 'none',
    borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  filterTabActive: {
    background: 'var(--bg-primary)', color: 'var(--accent-blue)', fontWeight: 600,
  },
  filterCount: {
    fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)',
    background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
    minWidth: '22px', textAlign: 'center',
  },
  filterCountActive: { background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  testsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px', marginBottom: '32px',
  },
  emptyState: {
    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center', marginBottom: '32px',
  },
  emptyIcon: { fontSize: '2.5rem', display: 'block', marginBottom: '16px' },
  emptyText: { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' },
  emptyHint: { fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' },
};
