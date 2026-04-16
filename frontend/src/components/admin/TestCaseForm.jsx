// ✅ DONE — Phase 2: Test case form (add/remove input-output pairs)
import { useState } from 'react';
import Button from '../ui/Button.jsx';

/**
 * @param {{ testCases: Array<{input, expectedOutput, isHidden}>, onChange: (cases) => void }} props
 */
export default function TestCaseForm({ testCases = [], onChange }) {
  const addCase = () => {
    onChange([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const removeCase = (index) => {
    const updated = testCases.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateCase = (index, field, value) => {
    const updated = testCases.map((tc, i) =>
      i === index ? { ...tc, [field]: value } : tc
    );
    onChange(updated);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h4 style={styles.headerTitle}>
            <span style={{ color: 'var(--accent-blue)' }}>testCases</span>
            <span style={{ color: 'var(--text-muted)' }}>[{testCases.length}]</span>
          </h4>
          <p style={styles.headerHint}>// input-output pairs for evaluation</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={addCase}
          id="add-test-case-btn"
        >
          + add case
        </Button>
      </div>

      {testCases.length === 0 && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📝</span>
          <p style={styles.emptyText}>No test cases added</p>
          <p style={styles.emptyHint}>// click &quot;+ add case&quot; to create your first test case</p>
        </div>
      )}

      <div style={styles.caseList}>
        {testCases.map((tc, index) => (
          <div key={index} style={styles.caseCard} className="fade-in">
            {/* Case header */}
            <div style={styles.caseHeader}>
              <span style={styles.caseIndex}>
                <span style={{ color: 'var(--accent-purple)' }}>case</span>
                <span style={{ color: 'var(--accent-orange)' }}>[{index}]</span>
              </span>
              <div style={styles.caseActions}>
                <label style={styles.hiddenToggle}>
                  <input
                    type="checkbox"
                    checked={tc.isHidden}
                    onChange={(e) => updateCase(index, 'isHidden', e.target.checked)}
                    style={styles.checkbox}
                    id={`test-case-hidden-${index}`}
                  />
                  <span style={{
                    ...styles.hiddenLabel,
                    color: tc.isHidden ? 'var(--accent-yellow)' : 'var(--text-muted)',
                  }}>
                    {tc.isHidden ? '🔒 hidden' : '👁 visible'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeCase(index)}
                  style={styles.removeBtn}
                  title="Remove test case"
                  id={`remove-test-case-${index}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Input / Output fields */}
            <div style={styles.fieldsRow}>
              <div style={styles.fieldCol}>
                <label style={styles.fieldLabel}>
                  <span style={{ color: 'var(--accent-green-bright)' }}>input</span>:
                </label>
                <textarea
                  value={tc.input}
                  onChange={(e) => updateCase(index, 'input', e.target.value)}
                  placeholder="stdin input..."
                  rows={3}
                  style={styles.textarea}
                  id={`test-case-input-${index}`}
                />
              </div>
              <div style={styles.fieldCol}>
                <label style={styles.fieldLabel}>
                  <span style={{ color: 'var(--accent-orange)' }}>expectedOutput</span>:
                </label>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) => updateCase(index, 'expectedOutput', e.target.value)}
                  placeholder="expected stdout..."
                  rows={3}
                  style={styles.textarea}
                  id={`test-case-output-${index}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {},
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',
  },
  headerTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '4px',
  },
  headerHint: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  emptyState: {
    background: 'var(--bg-primary)',
    border: '1px dashed var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '36px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  emptyHint: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  caseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  caseCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
  },
  caseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  caseIndex: {
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'flex',
    gap: '2px',
  },
  caseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  hiddenToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontSize: '0.72rem',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
    accentColor: 'var(--accent-yellow)',
  },
  hiddenLabel: {
    fontWeight: 500,
    fontSize: '0.72rem',
  },
  removeBtn: {
    background: 'var(--accent-red-dim)',
    color: 'var(--accent-red)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 150ms ease',
    padding: 0,
  },
  fieldsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  fieldCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  textarea: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    resize: 'vertical',
    minHeight: '60px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 150ms ease',
  },
};
