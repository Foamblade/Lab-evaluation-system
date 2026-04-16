// ✅ DONE — Phase 6: Result Page (connected to API)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

export default function ResultPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Get my results and find the one for this test
        const res = await axiosInstance.get('/results/me');
        const testResult = res.data.find((r) => r.test?._id === testId);
        if (testResult) {
          setResult({
            testTitle: testResult.test?.title || 'Test',
            duration: testResult.test?.duration || 0,
            totalScore: testResult.totalScore,
            maxScore: (testResult.test?.questions?.length || 1) * 100,
            completedAt: testResult.completedAt,
            submissions: testResult.submissions || [],
          });
        }

        // Also get leaderboard for rank
        try {
          const lbRes = await axiosInstance.get(`/results/test/${testId}`);
          const myEntry = lbRes.data.leaderboard?.find(
            (e) => e.student?._id === (testResult?.student || '')
          );
          if (myEntry && result) {
            setResult((prev) => prev ? ({
              ...prev,
              rank: myEntry.rank,
              totalStudents: lbRes.data.totalStudents,
            }) : prev);
          } else if (testResult) {
            // Find rank by matching score
            const lb = lbRes.data.leaderboard || [];
            const myRank = lb.findIndex((e) => e.totalScore === testResult.totalScore) + 1;
            setResult((prev) => prev ? ({
              ...prev,
              rank: myRank || lb.length,
              totalStudents: lbRes.data.totalStudents || lb.length,
            }) : prev);
          }
        } catch {
          // Leaderboard optional
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
          <div style={styles.spinner} />
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '64px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>No results found for this test</p>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>// you may not have submitted yet</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>← back</Button>
          </div>
        </div>
      </div>
    );
  }

  const percentage = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
  const scoreColor = percentage >= 80 ? 'var(--accent-green-bright)' : percentage >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)';
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.container}>
        <button onClick={() => navigate('/student/dashboard')} style={styles.backBtn}>← back to dashboard</button>

        <div style={styles.headerCard}>
          <div style={styles.headerBg} />
          <h1 style={styles.testTitle}>{result.testTitle}</h1>
          <p style={styles.testMeta}>Completed {result.completedAt ? formatDate(result.completedAt) : '—'}</p>

          <div style={styles.scoreDisplay}>
            <div style={styles.scoreRingContainer}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-default)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${percentage * 3.14} ${314 - percentage * 3.14}`} strokeDashoffset="78.5"
                  style={{ transition: 'stroke-dasharray 1.5s ease' }}
                />
              </svg>
              <div style={styles.scoreRingText}>
                <span style={{ ...styles.scorePercent, color: scoreColor }}>{percentage}%</span>
                <span style={styles.scoreLabel}>score</span>
              </div>
            </div>
            <div style={styles.scoreDetails}>
              <div style={styles.scoreDetailRow}>
                <span style={styles.detailLabel}>Total Score</span>
                <span style={{ ...styles.detailValue, color: scoreColor }}>{result.totalScore} / {result.maxScore}</span>
              </div>
              {result.rank && (
                <div style={styles.scoreDetailRow}>
                  <span style={styles.detailLabel}>Rank</span>
                  <span style={styles.detailValue}>
                    #{result.rank} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>of {result.totalStudents}</span>
                  </span>
                </div>
              )}
              <div style={styles.scoreDetailRow}>
                <span style={styles.detailLabel}>Questions Solved</span>
                <span style={styles.detailValue}>
                  {result.submissions.filter((s) => s.verdict === 'AC').length} / {result.submissions.length}
                </span>
              </div>
              <div style={styles.scoreDetailRow}>
                <span style={styles.detailLabel}>Performance</span>
                <span style={styles.detailValue}>
                  {percentage >= 80 ? '🎉 Excellent' : percentage >= 50 ? '👍 Good' : '📈 Keep Going'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.breakdownSection}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: 'var(--accent-blue)' }}>submissions</span>.forEach()
          </h2>
          <div style={styles.questionCards}>
            {result.submissions.map((sub, i) => (
              <div key={i} style={styles.questionCard} className="fade-in">
                <div style={styles.qHeader}>
                  <div style={styles.qLeft}>
                    <span style={styles.qIndex}><span style={{ color: 'var(--accent-purple)' }}>Q</span>{i + 1}</span>
                    <span style={styles.qTitle}>{sub.questionTitle}</span>
                  </div>
                  <Badge verdict={sub.verdict} showLabel />
                </div>
                <div style={styles.qStatsRow}>
                  <div style={styles.qStat}>
                    <span style={styles.qStatLabel}>Score</span>
                    <span style={{
                      ...styles.qStatValue,
                      color: sub.score >= 80 ? 'var(--accent-green-bright)' : sub.score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    }}>{sub.score}</span>
                  </div>
                  <div style={styles.qStatDivider} />
                  <div style={styles.qStat}>
                    <span style={styles.qStatLabel}>Language</span>
                    <span style={styles.qStatValue}>{sub.language || '—'}</span>
                  </div>
                  <div style={styles.qStatDivider} />
                  <div style={styles.qStat}>
                    <span style={styles.qStatLabel}>Time</span>
                    <span style={styles.qStatValue}>{sub.executionTime || 0}ms</span>
                  </div>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${sub.score}%`,
                    background: sub.verdict === 'AC' ? 'var(--gradient-green)' : sub.verdict === 'WA' ? 'var(--gradient-orange)' : 'linear-gradient(135deg, var(--accent-red) 0%, #f0883e 100%)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.actionsRow}>
          <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>backToDashboard()</Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: 'calc(100vh - var(--navbar-height))', padding: '32px 24px' },
  container: { maxWidth: '800px', margin: '0 auto' },
  spinner: { width: '24px', height: '24px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  backBtn: { background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontWeight: 500, display: 'inline-block' },
  headerCard: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' },
  headerBg: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(48,54,61,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none', opacity: 0.5 },
  testTitle: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', position: 'relative', zIndex: 1 },
  testMeta: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '28px', position: 'relative', zIndex: 1 },
  scoreDisplay: { display: 'flex', alignItems: 'center', gap: '32px', position: 'relative', zIndex: 1, flexWrap: 'wrap' },
  scoreRingContainer: { position: 'relative', width: '120px', height: '120px', flexShrink: 0 },
  scoreRingText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
  scorePercent: { fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', lineHeight: 1 },
  scoreLabel: { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' },
  scoreDetails: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' },
  scoreDetailRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(48, 54, 61, 0.4)' },
  detailLabel: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  detailValue: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' },
  breakdownSection: { marginBottom: '24px' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '16px' },
  questionCards: { display: 'flex', flexDirection: 'column', gap: '14px' },
  questionCard: { background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' },
  qHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' },
  qLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
  qIndex: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 },
  qTitle: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  qStatsRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(48, 54, 61, 0.4)', flexWrap: 'wrap' },
  qStat: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: '70px' },
  qStatLabel: { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  qStatValue: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' },
  qStatDivider: { width: '1px', height: '24px', background: 'var(--border-default)', flexShrink: 0 },
  progressBar: { height: '4px', background: 'var(--border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 'var(--radius-full)', transition: 'width 1s ease' },
  actionsRow: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
};
