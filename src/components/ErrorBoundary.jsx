// ─── ErrorBoundary.jsx ────────────────────────────────────────────────────────
// Reusable class-based error boundary + TabError + FlatCardFallback helpers.
import { Component } from 'react';

// ── Tab-level fallback ────────────────────────────────────────────────────────
export function TabError({ tab }) {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Tab {tab} error</div>
      <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>
        Terjadi kesalahan yang tidak terduga.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          fontFamily: 'inherit',
          padding: '10px 24px',
          borderRadius: 12,
          background: 'var(--ssw-surface)',
          border: '1px solid var(--ssw-border)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Muat ulang
      </button>
    </div>
  );
}

// ── Flat card fallback for FlipCard (old WebView without 3D CSS) ──────────────
export function FlatCardFallback({ card }) {
  return (
    <div
      style={{
        padding: 24,
        textAlign: 'center',
        background: 'var(--ssw-surface)',
        borderRadius: 16,
        border: '1px solid var(--ssw-border)',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div lang="ja" style={{ fontSize: 28, fontWeight: 700 }}>{card?.jp}</div>
      <div style={{ marginTop: 8, opacity: 0.7, fontSize: 15 }}>{card?.id_text}</div>
    </div>
  );
}

// ── Generic ErrorBoundary ─────────────────────────────────────────────────────
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Could send to error tracking here
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error)
          : this.props.fallback;
      }
      return (
        <div role="alert" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Terjadi kesalahan</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>
            {this.state.error?.message ?? 'Unknown error'}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              fontFamily: 'inherit',
              padding: '10px 24px',
              borderRadius: 12,
              background: 'var(--ssw-surface)',
              border: '1px solid var(--ssw-border)',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
