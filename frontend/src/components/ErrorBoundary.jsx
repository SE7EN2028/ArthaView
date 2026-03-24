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
    console.error('ArthaView Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: 16, textAlign: 'center', padding: 32,
        }}>
          <div style={{ fontSize: 60 }}>⚠️</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, color: '#fff' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            ↺ Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
