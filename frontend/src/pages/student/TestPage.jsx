// ✅ DONE — Phase 6: Test Page (connected to API — real Judge0 submission)
// QuestionPanel (left) | CodeEditor + OutputPanel (right)
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

  // API state
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch test from API
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axiosInstance.get(`/tests/${testId}`);
        setTest(res.data);
      } catch {
        setTest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Question navigation
  const [activeQ, setActiveQ] = useState(0);
  const [codeMap, setCodeMap] = useState({});
  const [langMap, setLangMap] = useState({});
  const [outputMap, setOutputMap] = useState({});
  const [leftWidth, setLeftWidth] = useState(35);
  const [bottomHeight, setBottomHeight] = useState(35);
  const [submitting, setSubmitting] = useState(false);

  // Initialize code/lang/output maps once test loads
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

  if (!test || !test.questions?.length) {
    return (
      <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Test not found or no questions</p>
          <Button variant="secondary" onClick={() => navigate('/student/dashboard')}>← back</Button>
        </div>
      </div>
    );
  }

  const endTime = new Date(test.startTime).getTime() + test.duration * 60000;
  const currentQ = test.questions[activeQ];
  if (!currentQ) return null;

  const currentCode = codeMap[currentQ._id] || DEFAULT_CODE.python;
  const currentLang = langMap[currentQ._id] || 'python';
  const currentOutput = outputMap[currentQ._id] || { status: 'idle' };

  const handleCodeChange = (val) => {
    setCodeMap((prev) => ({ ...prev, [currentQ._id]: val }));
  };

  const handleLangChange = (lang) => {
    setLangMap((prev) => ({ ...prev, [currentQ._id]: lang }));
  };

  const handleClearOutput = () => {
    setOutputMap((prev) => ({ ...prev, [currentQ._id]: { status: 'idle' } }));
  };

  // Real submit — POST /api/submissions
  const handleSubmit = async () => {
    setSubmitting(true);
    setOutputMap((prev) => ({ ...prev, [currentQ._id]: { status: 'running' } }));

    try {
      const res = await axiosInstance.post('/submissions', {
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
      const msg = err.response?.data?.message || err.message || 'Submission failed';
      setOutputMap((prev) => ({
        ...prev,
        [currentQ._id]: {
          status: 'success',
          verdict: 'RE',
          score: 0,
          executionTime: 0,
          memoryUsed: 0,
          compileError: msg,
          testResults: [],
        },
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Keydown handler: Ctrl+Enter = submit
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [currentQ?._id, submitting]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTimeExpire = useCallback(() => {
    alert('Time is up! Your last submissions have been saved.');
    navigate('/student/dashboard');
  }, [navigate]);

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button onClick={() => navigate('/student/dashboard')} style={styles.exitBtn} id="exit-test-btn">← exit</button>
          <span style={styles.testTitle}>{test.title}</span>
        </div>

        {/* Question tabs */}
        <div style={styles.qTabs}>
          {test.questions.map((q, i) => {
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
          <Timer targetTime={endTime} onExpire={handleTimeExpire} size="sm" />
        </div>
      </div>

      {/* Main content: split layout */}
      <div style={styles.mainContent}>
        {/* Left — Question Panel */}
        <div style={{ ...styles.leftPanel, width: `${leftWidth}%` }}>
          <QuestionPanel question={currentQ} questionIndex={activeQ} totalQuestions={test.questions.length} />
        </div>

        {/* Divider */}
        <div
          style={styles.vDivider}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = leftWidth;
            const onMove = (ev) => {
              const delta = ((ev.clientX - startX) / window.innerWidth) * 100;
              const newWidth = Math.min(60, Math.max(20, startWidth + delta));
              setLeftWidth(newWidth);
            };
            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        />

        {/* Right — Editor + Output */}
        <div style={{ ...styles.rightPanel, width: `${100 - leftWidth}%` }}>
          <div style={{ ...styles.editorArea, height: `${100 - bottomHeight}%` }}>
            <CodeEditor
              language={currentLang}
              code={currentCode}
              onChange={handleCodeChange}
              onLanguageChange={handleLangChange}
            />
          </div>

          {/* Horizontal divider */}
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
                const newH = Math.min(60, Math.max(15, startH + delta));
                setBottomHeight(newH);
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
              <Button variant="secondary" size="sm" onClick={handleSubmit} loading={submitting} id="run-code-btn">▶ run()</Button>
              <Button size="sm" onClick={handleSubmit} loading={submitting} id="submit-code-btn">submit()</Button>
              <span style={styles.kbShortcut}>Ctrl+Enter</span>
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
  exitBtn: { background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 500, cursor: 'pointer', flexShrink: 0, transition: 'all 150ms ease' },
  testTitle: { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  qTabs: { display: 'flex', gap: '4px', flexShrink: 0 },
  qTab: { padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 150ms ease' },
  qTabActive: { color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', borderColor: 'rgba(88, 166, 255, 0.3)' },
  qTabAC: { color: 'var(--accent-green-bright)', borderColor: 'rgba(63, 185, 80, 0.3)' },
  qTabWA: { color: 'var(--accent-orange)', borderColor: 'rgba(240, 136, 62, 0.3)' },
  topRight: { flexShrink: 0 },
  mainContent: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  leftPanel: { background: 'var(--bg-card)', borderRight: '1px solid var(--border-default)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  vDivider: { width: '5px', background: 'var(--bg-primary)', cursor: 'col-resize', flexShrink: 0, transition: 'background 150ms ease', position: 'relative' },
  rightPanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  editorArea: { overflow: 'hidden', flexShrink: 0 },
  hDivider: { height: 'auto', background: 'var(--bg-card)', cursor: 'row-resize', flexShrink: 0, borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 12px', position: 'relative' },
  submitBar: { display: 'flex', alignItems: 'center', gap: '8px' },
  kbShortcut: { fontSize: '0.6rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)' },
  outputArea: { overflow: 'hidden', flexShrink: 0 },
};
