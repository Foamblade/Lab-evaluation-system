// ✅ DONE — Phase 4: Code Editor wrapper (Monaco)
import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

/**
 * Maps our language names to Monaco language identifiers.
 */
const MONACO_LANG_MAP = {
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  python: 'python',
};

/**
 * Default boilerplate code per language.
 */
const BOILERPLATE = {
  c: `#include <stdio.h>

int main() {
    // your code here
    
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // your code here
    
    return 0;
}
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // your code here
        
    }
}
`,
  python: `# your code here

`,
};

/**
 * @param {{
 *   language: string,
 *   code: string,
 *   onChange: (value: string) => void,
 *   onLanguageChange: (lang: string) => void,
 *   readOnly?: boolean,
 *   height?: string
 * }} props
 */
export default function CodeEditor({
  language = 'python',
  code,
  onChange,
  onLanguageChange,
  readOnly = false,
  height = '100%',
}) {
  const editorRef = useRef(null);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleLangSwitch = (newLang) => {
    onLanguageChange?.(newLang);
    // If current code is empty or is boilerplate, swap to new boilerplate
    const currentBoiler = BOILERPLATE[language] || '';
    if (!code || code.trim() === '' || code === currentBoiler) {
      onChange?.(BOILERPLATE[newLang] || '');
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Language selector bar */}
      <div style={styles.toolbar}>
        <div style={styles.langTabs}>
          {Object.keys(BOILERPLATE).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangSwitch(lang)}
              style={{
                ...styles.langTab,
                ...(language === lang ? styles.langTabActive : {}),
              }}
              id={`lang-tab-${lang}`}
            >
              <span style={{
                ...styles.langDot,
                background: language === lang ? 'var(--accent-green-bright)' : 'var(--text-muted)',
              }} />
              {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
        <div style={styles.toolbarRight}>
          <button
            onClick={() => {
              onChange?.(BOILERPLATE[language] || '');
            }}
            style={styles.resetBtn}
            title="Reset code to boilerplate"
            id="reset-code-btn"
          >
            ↺ reset
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ ...styles.editorContainer, height }}>
        <Editor
          language={MONACO_LANG_MAP[language] || 'python'}
          value={code}
          onChange={(val) => onChange?.(val || '')}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            readOnly,
            renderWhitespace: 'selection',
            suggest: { snippetsPreventQuickSuggestions: false },
          }}
          loading={
            <div style={styles.loading}>
              <span style={styles.loadingSpinner} />
              <span>Loading editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1e1e1e', // match VS Dark theme
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: '#252526',
    borderBottom: '1px solid #3c3c3c',
    flexShrink: 0,
    gap: '8px',
  },
  langTabs: {
    display: 'flex',
    gap: '2px',
  },
  langTab: {
    padding: '6px 14px',
    fontSize: '0.72rem',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    color: '#858585',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  },
  langTabActive: {
    color: '#e6edf3',
    background: '#1e1e1e',
  },
  langDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  toolbarRight: {
    display: 'flex',
    gap: '8px',
  },
  resetBtn: {
    padding: '5px 12px',
    fontSize: '0.68rem',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    color: '#858585',
    background: 'transparent',
    border: '1px solid #3c3c3c',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  editorContainer: {
    flex: 1,
    minHeight: 0,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    height: '100%',
    color: '#858585',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-mono)',
  },
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #3c3c3c',
    borderTopColor: '#858585',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
