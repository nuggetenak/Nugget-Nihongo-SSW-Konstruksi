// ─── ErrorBoundary.jsx ────────────────────────────────────────────────────────
// Reusable class-based error boundary + TabError + FlatCardFallback helpers.
// One presentation (item 38/19) -- EmptyState's icon+title+desc+action shape,
// not a second visual language for failure. Recovery is a reload by default:
// the most likely real failure is a stale lazy-chunk import (item 37), which
// a state-clear can't fix since React just retries the same dead import and
// throws again. A `retry` prop overrides this when the caller has something
// narrower that actually re-fetches.
import { Component } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { JpFront } from './JpDisplay.jsx';
import S from './ErrorBoundary.module.css';

function reload() {
  window.location.reload();
}

// ── Shared presentation ────────────────────────────────────────────────────
function ErrorFallback({
  icon = '⚠️',
  title,
  desc,
  primaryLabel = 'Muat ulang',
  onPrimary = reload,
  secondaryLabel,
  onSecondary,
  technicalDetail,
}) {
  return (
    <div className={S.wrap} role="alert">
      <div className={S.icon} aria-hidden="true">
        {icon}
      </div>
      <div className={S.title}>{title}</div>
      {desc && <div className={S.desc}>{desc}</div>}
      <div className={S.actions}>
        <button className={S.primary} onClick={onPrimary}>
          {primaryLabel}
        </button>
        {onSecondary && (
          <button className={S.secondary} onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
      {technicalDetail && (
        <details className={S.detail}>
          <summary>Detail teknis</summary>
          <pre className={S.detailText}>{technicalDetail}</pre>
        </details>
      )}
    </div>
  );
}

// ── Tab-level fallback ────────────────────────────────────────────────────────
export function TabError({ tab, error }) {
  const { goMode } = useApp();
  return (
    <ErrorFallback
      title={`Tab ${tab} mengalami error`}
      desc="Terjadi kesalahan yang tidak terduga. Progres kamu tersimpan otomatis di perangkat ini, tapi kalau khawatir, cadangkan datamu dulu."
      secondaryLabel="Cadangkan data →"
      onSecondary={() => goMode('ekspor')}
      technicalDetail={error?.message}
    />
  );
}

// ── Flat card fallback for FlipCard (old WebView without 3D CSS) ──────────────
// Degraded rendering, not a failure -- no recovery action needed, so it keeps
// its own card shape rather than the full error presentation above.
export function FlatCardFallback({ card }) {
  const { prefs } = useApp();
  return (
    <div className={S.flatCard}>
      <div lang="ja" className={S.flatCardJp}>
        <JpFront jp={card?.jp} furiganaPolicy={prefs?.furiganaPolicy ?? 'always'} />
      </div>
      <div className={S.flatCardId}>{card?.id_text}</div>
    </div>
  );
}

// ── Generic ErrorBoundary ─────────────────────────────────────────────────────
// Props: fallback (element or (error) => element, overrides everything below),
// title/desc (context-specific copy), retry (replaces the default reload with
// a narrower recovery), secondaryLabel/onSecondary (a second action -- backup
// data where progress is at risk per item 15's reasoning, or an exit path
// where reload is the heavier option and a lighter one already exists).
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
        <ErrorFallback
          title={this.props.title ?? 'Terjadi kesalahan'}
          desc={this.props.desc}
          onPrimary={this.props.retry ?? reload}
          secondaryLabel={this.props.secondaryLabel}
          onSecondary={this.props.onSecondary}
          technicalDetail={this.state.error?.message}
        />
      );
    }
    return this.props.children;
  }
}
