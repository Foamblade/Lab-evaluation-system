// ✅ DONE — Verdict badge: AC / WA / TLE / CE / RE
const VERDICT_STYLES = {
  AC: {
    background: 'var(--accent-green-dim)',
    color: 'var(--accent-green-bright)',
    label: 'Accepted',
  },
  WA: {
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    label: 'Wrong Answer',
  },
  TLE: {
    background: 'var(--accent-orange-dim)',
    color: 'var(--accent-orange)',
    label: 'Time Limit',
  },
  CE: {
    background: 'var(--accent-purple-dim)',
    color: 'var(--accent-purple)',
    label: 'Compile Error',
  },
  RE: {
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    label: 'Runtime Error',
  },
  pending: {
    background: 'rgba(139, 148, 158, 0.15)',
    color: 'var(--text-secondary)',
    label: 'Pending',
  },
};

export default function Badge({ verdict = 'pending', showLabel = false }) {
  const v = VERDICT_STYLES[verdict] || VERDICT_STYLES.pending;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.7rem',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      background: v.background,
      color: v.color,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: v.color,
      }} />
      {showLabel ? v.label : verdict}
    </span>
  );
}
