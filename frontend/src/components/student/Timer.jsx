// ✅ DONE — Phase 3: Timer display component
import useTimer from '../../hooks/useTimer.js';

/**
 * Visual countdown timer.
 * @param {{ targetTime: Date|string, onExpire?: () => void, label?: string, size?: 'sm'|'md'|'lg' }} props
 */
export default function Timer({ targetTime, onExpire, label = 'Time Remaining', size = 'md' }) {
  const { days, hours, minutes, seconds, isExpired, formatted, totalSeconds } = useTimer(targetTime, { onExpire });

  const isUrgent = totalSeconds > 0 && totalSeconds <= 300; // < 5 min
  const isWarning = totalSeconds > 300 && totalSeconds <= 600; // < 10 min

  const sizes = {
    sm: { digit: '1.1rem', label: '0.6rem', pad: '8px 12px', gap: '6px' },
    md: { digit: '1.6rem', label: '0.65rem', pad: '12px 16px', gap: '10px' },
    lg: { digit: '2.4rem', label: '0.7rem', pad: '16px 20px', gap: '14px' },
  };
  const s = sizes[size];

  if (isExpired) {
    return (
      <div style={styles.wrapper}>
        <span style={styles.label}>{label}</span>
        <div style={{ ...styles.expiredBadge }}>
          <span style={styles.expiredIcon}>⏰</span>
          Time&apos;s Up!
        </div>
      </div>
    );
  }

  const segments = [
    ...(days > 0 ? [{ value: String(days), unit: 'days' }] : []),
    { value: String(hours).padStart(2, '0'), unit: 'hrs' },
    { value: String(minutes).padStart(2, '0'), unit: 'min' },
    { value: String(seconds).padStart(2, '0'), unit: 'sec' },
  ];

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>{label}</span>
      <div style={{ ...styles.timerRow, gap: s.gap }}>
        {segments.map((seg, i) => (
          <div key={seg.unit} style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
            <div style={{
              ...styles.digitBox,
              padding: s.pad,
              ...(isUrgent ? styles.urgent : {}),
              ...(isWarning ? styles.warning : {}),
            }}>
              <span style={{
                ...styles.digit,
                fontSize: s.digit,
                ...(isUrgent ? { color: 'var(--accent-red)' } : {}),
                ...(isWarning ? { color: 'var(--accent-yellow)' } : {}),
              }}>
                {seg.value}
              </span>
              <span style={{ ...styles.unit, fontSize: s.label }}>{seg.unit}</span>
            </div>
            {i < segments.length - 1 && (
              <span style={{
                ...styles.colon,
                fontSize: s.digit,
                ...(isUrgent ? { color: 'var(--accent-red)' } : {}),
              }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  digitBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: '52px',
    transition: 'all 300ms ease',
  },
  digit: {
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  unit: {
    color: 'var(--text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  colon: {
    fontWeight: 700,
    color: 'var(--text-muted)',
    lineHeight: 1,
    animation: 'pulse 1s ease-in-out infinite',
  },
  urgent: {
    borderColor: 'rgba(248, 81, 73, 0.4)',
    background: 'var(--accent-red-dim)',
    animation: 'pulse 1s ease-in-out infinite',
  },
  warning: {
    borderColor: 'rgba(227, 179, 65, 0.3)',
    background: 'rgba(227, 179, 65, 0.08)',
  },
  expiredBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(248, 81, 73, 0.3)',
    fontSize: '1rem',
    fontWeight: 700,
  },
  expiredIcon: {
    fontSize: '1.2rem',
  },
};
