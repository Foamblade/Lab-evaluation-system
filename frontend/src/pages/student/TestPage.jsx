// ✅ FIXED — TestPage with Submit Test button + already-submitted check
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import QuestionPanel from '../../components/test/QuestionPanel.jsx';
import CodeEditor from '../../components/test/CodeEditor.jsx';
import OutputPanel from '../../components/test/OutputPanel.jsx';
import Timer from '../../components/student/Timer.jsx';
import Button from '../../components/ui/Button.jsx';

const DEFAULT_CODE = {
  c: `#include <stdio.h>\n\nint main() {\n    // your code here\n    \n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    \n    return 0;\n}\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n        \n    }\n}\n`,
  python: `# your code here\n\n`,
};

export default function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // ALL hooks at the top
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [activeQ, setActiveQ] = useState(0);
  const [codeMap, setCodeMap] = useState({});
  const [langMap, setLangMap] = useState({});
  const [outputMap, setOutputMap] = useState({});
  const [leftWidth, setLeftWidth] = useState(35);
  const [bottomHeight, setBottomHeight] = useState(35);
  const [submitting, setSubmitting] = useState(false);
  const [submitTestLoading, setSubmitTestLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Fetch test + check if already submitted
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testRes, checkRes] = await Promise.all([
          axiosInstance.get(`/tests/${testId}`),
          axiosInstance.get(`/submissions/check-submitted/${testId}`),
        ]);
        setTest(testRes.data);
        if (checkRes.data.submitted) {
          setAlreadySubmitted(true);
        }
      } catch {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  // Initialize maps when test loads
  useEffect(() => {
    if (!test?.questions) return;
    const cm = {}, lm = {}, om = {};
    test.questions.forEach((q) => {
      cm[q._id] = DEFAULT_CODE.python;
      lm[q._id] = 'python';
      om[q._id] = { status: 'idle' };
    });
    setCodeMap(cm);
    setLangMap(lm);
    setOutputMap(om);
  }, [test]);

  // Derived values
  const questions = test?.questions || [];
  const currentQ = questions[activeQ] || null;
  const currentCode = currentQ ? (codeMap[currentQ._id] || DEFAULT_CODE.python) : '';
  const currentLang = currentQ ? (langMap[currentQ._id] || 'python') : 'python';
  const currentOutput = currentQ ? (outputMap[currentQ._id] || { status: 'idle' }) : { status: 'idle' };
  const endTime = test ? new Date(test.startTime).getTime() + test.duration * 60000 : Date.now();

  const handleCodeChange = useCallback((val) => {
    if (!currentQ) return;
    setCodeMap((prev) => ({ ...prev, [currentQ._id]: val }));
  }, [currentQ?._id]);

  const handleLangChange = useCallback((lang) => {
    if (!currentQ) return;
    setLangMap((prev) => ({ ...prev, [currentQ._id]: lang }));
  }, [currentQ?._id]);

  const handleClearOutput = useCallback(() => {
    if (!currentQ) return;
    setOutputMap((prev) => ({ ...prev, [currentQ._id]: { status: 'idle' } }));
  }, [currentQ?._id]);

  // Helper to execute code against an endpoint and update output
  const executeCode = useCallback(async (endpoint) => {
    if (!currentQ || submitting) return;
    setSubmitting(true);
    setOutputMap((prev) => ({ ...prev, [currentQ._id]: { status: 'running' } }));

    try {
      const res = await axiosInstance.post(endpoint, {
        testId: test._id,
        questionId: currentQ._id,
        code: codeMap[currentQ._id] || '',
        language: langMap[currentQ._id] || 'python',
      });

      const data = res.data;
      setOutputMap((prev) => ({
        ...prev,
        [currentQ._id]: {
          status: 'success',
          verdict: data.verdict,
          score: data.score,
          executionTime: data.executionTime,
          memoryUsed: data.memoryUsed,
          compileError: data.compileError,
          testResults: data.testResults || [],
        },
      }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed';
      setOutputMap((prev) => ({
        ...prev,
        [currentQ._id]: {
          status: 'success',
          verdict: 'RE',
          score: 0,
          compileError: msg,
          testResults: [],
        },
      }));
    } finally {
      setSubmitting(false);
    }
  }, [currentQ?._id, submitting, test?._id, codeMap, langMap]);

  // Run code — evaluate against sample cases only, NOT saved to DB
  const handleRun = useCallback(() => executeCode('/submissions/run'), [executeCode]);

  // Submit code — evaluate against ALL cases, SAVED to DB (visible to admin)
  const handleSubmit = useCallback(() => executeCode('/submissions'), [executeCode]);

  // Submit entire test (finalize — no more attempts)
  const handleSubmitTest = useCallback(async () => {
    setSubmitTestLoading(true);
    try {
      await axiosInstance.post('/submissions/submit-test', { testId: test._id });
      setAlreadySubmitted(true);
      setShowSubmitConfirm(false);
      navigate(`/student/result/${test._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit test');
    } finally {
      setSubmitTestLoading(false);
    }
  }, [test?._id, navigate]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  const handleTimeExpire = useCallback(() => {
    // Auto-submit test when time expires
    axiosInstance.post('/submissions/submit-test', { testId }).catch(() => {});
    alert('Time is up! Your test has been submitted.');
    navigate('/student/dashboard');
  }, [navigate, testId]);

  // ── RENDER ──────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  // Already submitted — redirect to results
  if (alreadySubmitted) {
    return (
      <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🔒</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Test Already Submitted</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
            // you have already finalized this test. No more attempts allowed.
          </p>
          <Button onClick={() => navigate(`/student/result/${testId}`)}>viewResults()</Button>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Test not found or no questions</p>
          <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>← back</Button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Question not found</p>
          <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>← back</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Submit Test Confirmation Modal */}
      {showSubmitConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowSubmitConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>⚠️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Submit Test?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              Once you submit, you <strong style={{ color: 'var(--accent-red)' }}>cannot reattempt</strong> this test.
              Your best scores for each question will be saved.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(false)}>cancel()</Button>
              <Button variant="danger" onClick={handleSubmitTest} loading={submitTestLoading}>
                confirmSubmit()
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.testTitle}>{test.title}</span>
        </div>

        {/* Question tabs */}
        <div style={styles.qTabs}>
          {questions.map((q, i) => {
            const qOutput = outputMap[q._id];
            const hasResult = qOutput?.status === 'success';
            const isAC = hasResult && qOutput?.verdict === 'AC';
            return (
              <button
                key={q._id}
                onClick={() => setActiveQ(i)}
                style={{
                  ...styles.qTab,
                  ...(activeQ === i ? styles.qTabActive : {}),
                  ...(isAC ? styles.qTabAC : {}),
                  ...(hasResult && !isAC ? styles.qTabWA : {}),
                }}
                id={`question-tab-${i}`}
              >
                Q{i + 1}
              </button>
            );
          })}
        </div>

        <div style={styles.topRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Timer targetTime={endTime} onExpire={handleTimeExpire} size="sm" />
            <button onClick={() => setShowSubmitConfirm(true)} style={styles.submitTestBtn} id="submit-test-btn">
              🏁 Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.mainContent}>
        <div style={{ ...styles.leftPanel, width: `${leftWidth}%` }}>
          <QuestionPanel question={currentQ} questionIndex={activeQ} totalQuestions={questions.length} />
        </div>

        <div
          style={styles.vDivider}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftWidth;
            const onMove = (ev) => {
              const delta = ((ev.clientX - startX) / window.innerWidth) * 100;
              setLeftWidth(Math.min(60, Math.max(20, startWidth + delta)));
            };
            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        />

        <div style={{ ...styles.rightPanel, width: `${100 - leftWidth}%` }}>
          <div style={{ ...styles.editorArea, height: `${100 - bottomHeight}%` }}>
            <CodeEditor
              language={currentLang}
              code={currentCode}
              onChange={handleCodeChange}
              onLanguageChange={handleLangChange}
            />
          </div>

          <div
            style={styles.hDivider}
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.clientY;
              const startH = bottomHeight;
              const container = e.currentTarget.parentElement;
              const onMove = (ev) => {
                const containerH = container.getBoundingClientRect().height;
                const delta = ((startY - ev.clientY) / containerH) * 100;
                setBottomHeight(Math.min(60, Math.max(15, startH + delta)));
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            <div style={styles.submitBar}>
              <Button variant="secondary" size="sm" onClick={handleRun} loading={submitting} id="run-code-btn">▶ run()</Button>
              <Button size="sm" onClick={handleSubmit} loading={submitting} id="submit-code-btn">submit()</Button>
              <span style={styles.kbShortcut}>Ctrl+Enter = submit</span>
            </div>
          </div>

          <div style={{ ...styles.outputArea, height: `${bottomHeight}%` }}>
            <OutputPanel output={currentOutput} onClear={handleClearOutput} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)', flexShrink: 0, minHeight: '48px' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 },
  exitBtn: { background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 500, cursor: 'pointer', flexShrink: 0 },
  testTitle: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  qTabs: { display: 'flex', gap: '4px', flexShrink: 0 },
  qTab: { padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 150ms ease' },
  qTabActive: { color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', borderColor: 'rgba(88, 166, 255, 0.3)' },
  qTabAC: { color: 'var(--accent-green-bright)', borderColor: 'rgba(63, 185, 80, 0.3)' },
  qTabWA: { color: 'var(--accent-orange)', borderColor: 'rgba(240, 136, 62, 0.3)' },
  topRight: { flexShrink: 0 },
  submitTestBtn: {
    padding: '6px 16px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
    color: '#fff', background: 'var(--accent-red)', border: 'none',
    borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
  },
  mainContent: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  leftPanel: { background: 'var(--bg-card)', borderRight: '1px solid var(--border-default)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  vDivider: { width: '5px', background: 'var(--bg-primary)', cursor: 'col-resize', flexShrink: 0 },
  rightPanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  editorArea: { overflow: 'hidden', flexShrink: 0 },
  hDivider: { height: 'auto', background: 'var(--bg-card)', cursor: 'row-resize', flexShrink: 0, borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 12px' },
  submitBar: { display: 'flex', alignItems: 'center', gap: '8px' },
  kbShortcut: { fontSize: '0.6rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)' },
  outputArea: { overflow: 'hidden', flexShrink: 0 },
  // Modal styles
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)', padding: '36px 32px', maxWidth: '420px',
    width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)',
  },
};
