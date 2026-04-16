// ✅ DONE — Phase 4: Output Panel
// Shows execution result, verdict, test case results, compile errors
import Badge from '../ui/Badge.jsx';

/**
 * @param {{
 *   output: {
 *     status: 'idle' | 'running' | 'success' | 'error',
 *     verdict?: string,
 *     score?: number,
 *     executionTime?: number,
 *     memoryUsed?: number,
 *     compileError?: string,
 *     runtimeError?: string,
 *     testResults?: Array<{ passed: boolean, input?: string, expected?: string, actual?: string }>,
 *     stdout?: string
 *   },
 *   onClear?: () => void
 * }} props
 */
export default function OutputPanel({ output, onClear }) {
  if (!output || output.status === 'idle') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>
            <span style={{ color: 'var(--accent-blue)' }}>output</span>
            <span style={{ color: 'var(--text-muted)' }}>Panel</span>
          </span>
        </div>
        <div style={styles.idle}>
          <span style={styles.idleIcon}>⚡</span>
          <p style={styles.idleText}>Run your code to see output</p>
          <p style={styles.idleHint}>// Ctrl+Enter to submit</p>
        </div>
      </div>
    );
  }

  if (output.status === 'running') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>
            <span style={{ color: 'var(--accent-blue)' }}>output</span>
            <span style={{ color: 'var(--text-muted)' }}>Panel</span>
          </span>
        </div>
        <div style={styles.running}>
          <div style={styles.spinner} />
          <p style={styles.runningText}>Compiling & executing...</p>
          <p style={styles.runningHint}>// running against test cases</p>
        </div>
      </div>
    );
  }

  // success or error
  const hasError = output.compileError || output.runtimeError;
  const testResults = output.testResults || [];
  const passed = testResults.filter((t) => t.passed).length;

  return (
    <div style={styles.wrapper}>
      {/* Header with verdict */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>
          <span style={{ color: 'var(--accent-blue)' }}>output</span>
          <span style={{ color: 'var(--text-muted)' }}>Panel</span>
        </span>
        <div style={styles.headerRight}>
          {output.verdict && <Badge verdict={output.verdict} showLabel />}
          {onClear && (
            <button onClick={onClear} style={styles.clearBtn} id="clear-output-btn">
              clear
            </button>
          )}
        </div>
      </div>

      <div style={styles.content}>
        {/* Score + Stats */}
        {output.verdict && !hasError && (
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Score</span>
              <span style={{
                ...styles.statValue,
                color: output.score >= 80
                  ? 'var(--accent-green-bright)'
                  : output.score >= 50
                    ? 'var(--accent-yellow)'
                    : 'var(--accent-red)',
              }}>
                {output.score ?? 0}
              </span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statLabel}>Cases</span>
              <span style={styles.statValue}>{passed}/{testResults.length}</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statLabel}>Time</span>
              <span style={styles.statValue}>{output.executionTime || 0}ms</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statLabel}>Memory</span>
              <span style={styles.statValue}>{output.memoryUsed || 0} KB</span>
            </div>
          </div>
        )}

        {/* Compile error */}
        {output.compileError && (
          <div style={styles.errorBlock}>
            <span style={styles.errorTitle}>
              <span style={{ color: 'var(--accent-red)' }}>CompilationError</span>:
            </span>
            <pre style={styles.errorPre}>{output.compileError}</pre>
          </div>
        )}

        {/* Runtime error */}
        {output.runtimeError && (
          <div style={styles.errorBlock}>
            <span style={styles.errorTitle}>
              <span style={{ color: 'var(--accent-red)' }}>RuntimeError</span>:
            </span>
            <pre style={styles.errorPre}>{output.runtimeError}</pre>
          </div>
        )}

        {/* Stdout */}
        {output.stdout && (
          <div style={styles.stdoutBlock}>
            <span style={styles.stdoutTitle}>
              <span style={{ color: 'var(--accent-green-bright)' }}>stdout</span>:
            </span>
            <pre style={styles.stdoutPre}>{output.stdout}</pre>
          </div>
        )}

        {/* Test case results */}
        {testResults.length > 0 && (
          <div style={styles.testResults}>
            <span style={styles.tcTitle}>
              <span style={{ color: 'var(--accent-blue)' }}>testResults</span>
              <span style={{ color: 'var(--text-muted)' }}>[{testResults.length}]</span>
            </span>
            <div style={styles.tcList}>
              {testResults.map((tc, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.tcItem,
                    borderLeftColor: tc.passed ? 'var(--accent-green-bright)' : 'var(--accent-red)',
                  }}
                >
                  <div style={styles.tcHeader}>
                    <span style={styles.tcIndex}>
                      case[{i}]
                    </span>
                    <span style={{
                      ...styles.tcStatus,
                      color: tc.passed ? 'var(--accent-green-bright)' : 'var(--accent-red)',
                    }}>
                      {tc.passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                  </div>
                  {!tc.passed && tc.expected && (
                    <div style={styles.tcDiff}>
                      <div style={styles.tcDiffRow}>
                        <span style={styles.tcDiffLabel}>expected:</span>
                        <pre style={styles.tcDiffCode}>{tc.expected}</pre>
                      </div>
                      <div style={styles.tcDiffRow}>
                        <span style={{ ...styles.tcDiffLabel, color: 'var(--accent-red)' }}>actual:</span>
                        <pre style={{ ...styles.tcDiffCode, color: 'var(--accent-red)' }}>{tc.actual || '(no output)'}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-default)',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    display: 'flex',
    gap: '4px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  clearBtn: {
    padding: '4px 10px',
    fontSize: '0.65rem',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    background: 'transparent',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 16px',
  },
  idle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '32px',
  },
  idleIcon: { fontSize: '1.8rem' },
  idleText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  idleHint: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  running: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '32px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid var(--border-default)',
    borderTopColor: 'var(--accent-blue)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  runningText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  runningHint: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(48, 54, 61, 0.4)',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: '50px',
  },
  statLabel: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'var(--border-default)',
    flexShrink: 0,
  },
  errorBlock: {
    marginBottom: '14px',
    background: 'var(--accent-red-dim)',
    border: '1px solid rgba(248, 81, 73, 0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
  },
  errorTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'block',
    marginBottom: '8px',
  },
  errorPre: {
    fontSize: '0.75rem',
    color: 'var(--accent-red)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0,
    lineHeight: 1.5,
  },
  stdoutBlock: {
    marginBottom: '14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
  },
  stdoutTitle: {
    fontSize: '0.72rem',
    fontWeight: 600,
    display: 'block',
    marginBottom: '8px',
  },
  stdoutPre: {
    fontSize: '0.78rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0,
    lineHeight: 1.5,
  },
  testResults: {
    marginBottom: '14px',
  },
  tcTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'flex',
    gap: '4px',
    marginBottom: '10px',
  },
  tcList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tcItem: {
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(48, 54, 61, 0.4)',
    borderLeftWidth: '3px',
    overflow: 'hidden',
  },
  tcHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
  },
  tcIndex: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  tcStatus: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  tcDiff: {
    padding: '0 12px 10px',
  },
  tcDiffRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  tcDiffLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--accent-green-bright)',
    flexShrink: 0,
    width: '60px',
  },
  tcDiffCode: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
};
