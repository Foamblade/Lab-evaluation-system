// Error Boundary — catches React render crashes and shows fallback UI
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '48px 36px',
            maxWidth: '440px',
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>⚠️</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', fontStyle: 'italic' }}>
              // {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                padding: '10px 24px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--accent-blue)',
                background: 'var(--accent-blue-dim)',
                border: '1px solid rgba(88, 166, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              goHome()
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
