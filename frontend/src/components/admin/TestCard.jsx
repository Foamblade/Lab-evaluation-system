// ✅ DONE — Phase 2: Test summary card for admin dashboard
import { useNavigate } from 'react-router-dom';

/**
 * @param {{ test: { _id, title, questions, duration, startTime, createdBy } }} props
 */
export default function TestCard({ test }) {
  const navigate = useNavigate();

  const now = Date.now();
  const start = new Date(test.startTime).getTime();
  const end = start + test.duration * 60000;

  let status, statusColor, statusBg;
  if (now < start) {
    status = 'upcoming';
    statusColor = 'var(--accent-blue)';
    statusBg = 'var(--accent-blue-dim)';
  } else if (now >= start && now <= end) {
    status = 'live';
    statusColor = 'var(--accent-green-bright)';
    statusBg = 'var(--accent-green-dim)';
  } else {
    status = 'ended';
    statusColor = 'var(--text-muted)';
    statusBg = 'rgba(72, 79, 88, 0.15)';
  }

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/admin/test/${test._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = statusColor;
        e.currentTarget.style.boxShadow = `0 0 20px ${statusColor}22`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      id={`test-card-${test._id}`}
    >
      {/* Top row: title + status */}
      <div style={styles.topRow}>
        <h3 style={styles.title}>{test.title}</h3>
        <span
          style={{
            ...styles.statusBadge,
            color: statusColor,
            background: statusBg,
          }}
        >
          {status === 'live' && <span style={{ ...styles.liveDot, background: statusColor }} />}
          {status}
        </span>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>questions</span>
          <span style={styles.statValue}>{test.questions?.length || 0}</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statLabel}>duration</span>
          <span style={styles.statValue}>{test.duration} min</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statLabel}>date</span>
          <span style={styles.statValue}>{formatDate(test.startTime)}</span>
        </div>
      </div>

      {/* Bottom row */}
      <div style={styles.bottomRow}>
        <span style={styles.timeInfo}>
          <span style={{ color: 'var(--accent-blue)' }}>@</span> {formatTime(test.startTime)}
        </span>
        <span style={styles.viewLink}>
          view details <span style={{ color: 'var(--accent-blue)' }}>→</span>
        </span>
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
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  statusBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    padding: '14px 16px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(48, 54, 61, 0.5)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'var(--border-default)',
    flexShrink: 0,
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  timeInfo: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  viewLink: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
};
