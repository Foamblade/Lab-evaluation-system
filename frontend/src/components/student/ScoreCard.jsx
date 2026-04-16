// ✅ DONE — Phase 3: Score card for past test results
import Badge from '../ui/Badge.jsx';

/**
 * @param {{ result: { testTitle, totalScore, maxScore, submissions: Array<{questionTitle, verdict, score}>, completedAt } }} props
 */
export default function ScoreCard({ result }) {
  const percentage = result.maxScore > 0
    ? Math.round((result.totalScore / result.maxScore) * 100)
    : 0;

  const scoreColor = percentage >= 80
    ? 'var(--accent-green-bright)'
    : percentage >= 50
      ? 'var(--accent-yellow)'
      : 'var(--accent-red)';

  const scoreGradient = percentage >= 80
    ? 'var(--gradient-green)'
    : percentage >= 50
      ? 'var(--gradient-orange)'
      : 'linear-gradient(135deg, var(--accent-red) 0%, #f0883e 100%)';

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <div style={styles.card}>
      {/* Header: test title + date */}
      <div style={styles.header}>
        <h3 style={styles.testTitle}>{result.testTitle}</h3>
        <span style={styles.date}>
          {result.completedAt ? formatDate(result.completedAt) : '—'}
        </span>
      </div>

      {/* Score ring + percentage */}
      <div style={styles.scoreSection}>
        <div style={styles.scoreRing}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="var(--border-default)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.136} ${213.6 - percentage * 2.136}`}
              strokeDashoffset="53.4"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <span style={{ ...styles.scorePercent, color: scoreColor }}>
            {percentage}%
          </span>
        </div>
        <div style={styles.scoreInfo}>
          <span style={styles.scoreTag}>
            {percentage >= 80 ? '🎉 Excellent' : percentage >= 50 ? '👍 Good' : '📈 Keep Going'}
          </span>
          <span style={styles.scoreDetail}>
            {result.totalScore} / {result.maxScore} points
          </span>
        </div>
      </div>

      {/* Question breakdown */}
      <div style={styles.breakdown}>
        <span style={styles.breakdownTitle}>
          <span style={{ color: 'var(--accent-blue)' }}>results</span>.map()
        </span>
        <div style={styles.questionList}>
          {result.submissions?.map((sub, i) => (
            <div key={i} style={styles.questionRow}>
              <div style={styles.questionLeft}>
                <span style={styles.questionIndex}>
                  <span style={{ color: 'var(--accent-purple)' }}>Q</span>{i + 1}
                </span>
                <span style={styles.questionName}>{sub.questionTitle}</span>
              </div>
              <div style={styles.questionRight}>
                <Badge verdict={sub.verdict} />
                <span style={{
                  ...styles.questionScore,
                  color: sub.score >= 80
                    ? 'var(--accent-green-bright)'
                    : sub.score >= 50
                      ? 'var(--accent-yellow)'
                      : 'var(--accent-red)',
                }}>
                  {sub.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    transition: 'border-color 200ms ease',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px',
  },
  testTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  date: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    padding: '16px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(48, 54, 61, 0.5)',
  },
  scoreRing: {
    position: 'relative',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  scorePercent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.1rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  scoreTag: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  scoreDetail: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  breakdown: {
    borderTop: '1px solid var(--border-default)',
    paddingTop: '16px',
  },
  breakdownTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    display: 'block',
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(48, 54, 61, 0.4)',
  },
  questionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  questionIndex: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  questionName: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  questionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  questionScore: {
    fontSize: '0.85rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    minWidth: '28px',
    textAlign: 'right',
  },
};
