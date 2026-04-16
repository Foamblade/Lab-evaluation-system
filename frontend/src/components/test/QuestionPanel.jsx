// ✅ DONE — Phase 4: Question Panel (sidebar)
// Shows question title, description, constraints, sample I/O
import { useState } from 'react';
import Badge from '../ui/Badge.jsx';

/**
 * @param {{
 *   question: { _id, title, description, difficulty, timeLimit, memoryLimit, testCases },
 *   questionIndex: number,
 *   totalQuestions: number
 * }} props
 */
export default function QuestionPanel({ question, questionIndex = 0, totalQuestions = 1 }) {
  const [showHints, setShowHints] = useState(false);

  if (!question) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>📝</span>
          <p>No question selected</p>
        </div>
      </div>
    );
  }

  const diffColors = {
    easy: { c: 'var(--accent-green-bright)', bg: 'var(--accent-green-dim)' },
    medium: { c: 'var(--accent-yellow)', bg: 'rgba(227, 179, 65, 0.12)' },
    hard: { c: 'var(--accent-red)', bg: 'var(--accent-red-dim)' },
  };
  const dc = diffColors[question.difficulty] || diffColors.medium;

  // Visible test cases (non-hidden)
  const sampleCases = question.testCases?.filter((tc) => !tc.isHidden) || [];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={styles.qNumber}>
            <span style={{ color: 'var(--accent-purple)' }}>Q</span>
            {questionIndex + 1}
            <span style={{ color: 'var(--text-muted)' }}> / {totalQuestions}</span>
          </span>
          <span style={{
            ...styles.diffBadge,
            color: dc.c,
            background: dc.bg,
          }}>
            {question.difficulty}
          </span>
        </div>
        <h2 style={styles.title}>{question.title}</h2>
      </div>

      {/* Description */}
      <div style={styles.section}>
        <div style={styles.descContent}>
          {question.description.split('\n').map((para, i) => (
            <p key={i} style={styles.paragraph}>
              {para || <br />}
            </p>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={{ color: 'var(--accent-orange)' }}>constraints</span>
        </h3>
        <div style={styles.constraintGrid}>
          <div style={styles.constraint}>
            <span style={styles.constraintIcon}>⏱</span>
            <div>
              <span style={styles.constraintLabel}>Time Limit</span>
              <span style={styles.constraintValue}>{question.timeLimit || 2}s</span>
            </div>
          </div>
          <div style={styles.constraint}>
            <span style={styles.constraintIcon}>💾</span>
            <div>
              <span style={styles.constraintLabel}>Memory Limit</span>
              <span style={styles.constraintValue}>{question.memoryLimit || 128} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Test Cases */}
      {sampleCases.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span style={{ color: 'var(--accent-green-bright)' }}>sampleCases</span>
            <span style={{ color: 'var(--text-muted)' }}>[{sampleCases.length}]</span>
          </h3>
          {sampleCases.map((tc, i) => (
            <div key={i} style={styles.testCase}>
              <div style={styles.tcHeader}>
                <span style={styles.tcIndex}>
                  <span style={{ color: 'var(--accent-purple)' }}>sample</span>[{i}]
                </span>
              </div>
              <div style={styles.tcGrid}>
                <div style={styles.tcBox}>
                  <span style={styles.tcLabel}>
                    <span style={{ color: 'var(--accent-blue)' }}>input</span>:
                  </span>
                  <pre style={styles.tcCode}>{tc.input || '(empty)'}</pre>
                </div>
                <div style={styles.tcBox}>
                  <span style={styles.tcLabel}>
                    <span style={{ color: 'var(--accent-orange)' }}>output</span>:
                  </span>
                  <pre style={styles.tcCode}>{tc.expectedOutput || '(empty)'}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden test case indicator */}
      {question.testCases?.some((tc) => tc.isHidden) && (
        <div style={styles.hiddenNote}>
          <span style={styles.hiddenIcon}>🔒</span>
          <span>+ hidden test cases used for final scoring</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  emptyIcon: { fontSize: '2rem' },
  header: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-default)',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  qNumber: {
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  diffBadge: {
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    marginBottom: '10px',
    display: 'flex',
    gap: '4px',
  },
  descContent: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  },
  paragraph: {
    marginBottom: '8px',
  },
  constraintGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  constraint: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(48, 54, 61, 0.4)',
  },
  constraintIcon: { fontSize: '1rem', flexShrink: 0 },
  constraintLabel: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    display: 'block',
  },
  constraintValue: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  testCase: {
    marginBottom: '12px',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(48, 54, 61, 0.4)',
    overflow: 'hidden',
  },
  tcHeader: {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(48, 54, 61, 0.4)',
  },
  tcIndex: {
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  tcGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  tcBox: {
    padding: '10px 12px',
  },
  tcLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    display: 'block',
    marginBottom: '4px',
  },
  tcCode: {
    fontSize: '0.78rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    background: 'transparent',
    margin: 0,
    padding: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  hiddenNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(227, 179, 65, 0.08)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(227, 179, 65, 0.15)',
    fontSize: '0.72rem',
    color: 'var(--accent-yellow)',
  },
  hiddenIcon: { fontSize: '0.85rem' },
};
