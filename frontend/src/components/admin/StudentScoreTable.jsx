// ✅ DONE — Phase 2: Student score table for test detail page
import Badge from '../ui/Badge.jsx';

/**
 * @param {{ scores: Array<{ rank, studentName, studentEmail, totalScore, submissions: Array<{ questionTitle, verdict, score }>, completedAt }> }} props
 */
export default function StudentScoreTable({ scores = [], testTitle = '' }) {
  if (scores.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>📊</span>
        <p style={styles.emptyText}>No submissions yet</p>
        <p style={styles.emptyHint}>// students will appear here after they submit</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableHeader}>
        <h3 style={styles.tableTitle}>
          <span style={{ color: 'var(--accent-orange)' }}>leaderboard</span>
          <span style={{ color: 'var(--text-muted)' }}>(</span>
          <span style={{ color: 'var(--accent-green-bright)' }}>'{testTitle}'</span>
          <span style={{ color: 'var(--text-muted)' }}>)</span>
        </h3>
        <span style={styles.countBadge}>{scores.length} students</span>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>#</th>
              <th style={styles.th}>Student</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Score</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Questions</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, idx) => (
              <tr
                key={s.studentEmail || idx}
                style={styles.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={styles.td}>
                  <span style={{
                    ...styles.rank,
                    ...(idx === 0 ? styles.rank1 : {}),
                    ...(idx === 1 ? styles.rank2 : {}),
                    ...(idx === 2 ? styles.rank3 : {}),
                  }}>
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.studentInfo}>
                    <span style={styles.studentName}>{s.studentName}</span>
                    <span style={styles.studentEmail}>{s.studentEmail}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <span style={{
                    ...styles.scoreValue,
                    color: s.totalScore >= 80
                      ? 'var(--accent-green-bright)'
                      : s.totalScore >= 50
                        ? 'var(--accent-yellow)'
                        : 'var(--accent-red)',
                  }}>
                    {s.totalScore}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <div style={styles.verdictRow}>
                    {s.submissions?.map((sub, i) => (
                      <Badge key={i} verdict={sub.verdict} />
                    ))}
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <span style={styles.timestamp}>
                    {s.completedAt
                      ? new Date(s.completedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-default)',
  },
  tableTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  countBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'var(--bg-primary)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-default)',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },
  th: {
    padding: '12px 20px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border-default)',
    background: 'var(--bg-primary)',
  },
  tr: {
    transition: 'background 150ms ease',
    cursor: 'default',
  },
  td: {
    padding: '14px 20px',
    fontSize: '0.82rem',
    borderBottom: '1px solid rgba(48, 54, 61, 0.4)',
    verticalAlign: 'middle',
  },
  rank: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
  },
  rank1: { fontSize: '1.1rem' },
  rank2: { fontSize: '1.05rem' },
  rank3: { fontSize: '1rem' },
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  studentName: {
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
  },
  studentEmail: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  scoreValue: {
    fontWeight: 700,
    fontSize: '0.95rem',
    fontFamily: 'var(--font-mono)',
  },
  verdictRow: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  empty: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  emptyHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
};
