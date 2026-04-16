// ✅ DONE — Loading spinner
export default function Spinner({ size = 32, color = 'var(--accent-blue)' }) {
  return (
    <div style={styles.wrapper}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `3px solid var(--border-default)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
};
