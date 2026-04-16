// ✅ DONE — Phase 3: Student test card (live/upcoming/past)
import { useNavigate } from 'react-router-dom';
import useTimer from '../../hooks/useTimer.js';

/**
 * @param {{ test: { _id, title, duration, startTime, questionCount } }} props
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

  // Countdown for upcoming tests
  const { formatted: countdown } = useTimer(test.startTime, { autoStart: status === 'upcoming' });
  // Countdown for live tests (time remaining in test)
  const { formatted: liveCountdown } = useTimer(end, { autoStart: status === 'live' });

  const handleClick = () => {
    if (status === 'live') {
      navigate(`/student/test/${test._id}/lobby`);
    } else if (status === 'ended') {
      navigate(`/student/result/${test._id}`);
    }
    // upcoming — no action
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        ...styles.card,
        ...(status === 'live' ? styles.cardLive : {}),
        cursor: status !== 'upcoming' ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (status !== 'upcoming') {
          e.currentTarget.style.borderColor = statusColor;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = status === 'live' ? 'rgba(63, 185, 80, 0.3)' : 'var(--border-default)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      id={`student-test-card-${test._id}`}
    >
      {/* Status indicator */}
      <div style={styles.topRow}>
        <span style={{
          ...styles.statusBadge,
          color: statusColor,
          background: statusBg,
        }}>
          {status === 'live' && <span style={{ ...styles.liveDot, background: statusColor }} />}
          {status}
        </span>
        <span style={styles.dateInfo}>
          {formatDate(test.startTime)} • {formatTime(test.startTime)}
        </span>
      </div>

      {/* Title */}
      <h3 style={styles.title}>{test.title}</h3>

      {/* Info row */}
      <div style={styles.infoRow}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📝</span>
          <span>{test.questionCount || test.questions?.length || 0} questions</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>⏱</span>
          <span>{test.duration} min</span>
        </div>
      </div>

      {/* Action area based on status */}
      {status === 'live' && (
        <div style={styles.liveAction}>
          <div style={styles.liveTimer}>
            <span style={styles.liveTimerLabel}>ends in</span>
            <span style={styles.liveTimerValue}>{liveCountdown}</span>
          </div>
          <button style={styles.enterBtn} id={`enter-test-${test._id}`}>
            enterTest() <span style={{ fontSize: '1rem' }}>→</span>
          </button>
        </div>
      )}

      {status === 'upcoming' && (
        <div style={styles.upcomingAction}>
          <span style={styles.countdownLabel}>starts in</span>
          <span style={styles.countdownValue}>{countdown}</span>
        </div>
      )}

      {status === 'ended' && (
        <div style={styles.endedAction}>
          <span style={styles.viewResults}>
            viewResults() <span style={{ color: 'var(--accent-blue)' }}>→</span>
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    transition: 'all 200ms ease',
  },
  cardLive: {
    borderColor: 'rgba(63, 185, 80, 0.3)',
    boxShadow: '0 0 24px rgba(63, 185, 80, 0.08)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '14px',
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
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  dateInfo: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '14px',
    lineHeight: 1.3,
  },
  infoRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '18px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  infoIcon: {
    fontSize: '0.9rem',
  },
  liveAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '14px 16px',
    background: 'var(--accent-green-dim)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(63, 185, 80, 0.2)',
  },
  liveTimer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  liveTimerLabel: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  liveTimerValue: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--accent-green-bright)',
    fontFamily: 'var(--font-mono)',
  },
  enterBtn: {
    background: 'var(--gradient-green)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '10px 20px',
    fontSize: '0.78rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
  },
  upcomingAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--accent-blue-dim)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(88, 166, 255, 0.15)',
  },
  countdownLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  countdownValue: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--accent-blue)',
    fontFamily: 'var(--font-mono)',
  },
  endedAction: {
    padding: '12px 16px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    textAlign: 'right',
  },
  viewResults: {
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
};
