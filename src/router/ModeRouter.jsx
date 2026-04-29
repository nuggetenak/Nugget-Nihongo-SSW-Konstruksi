// ─── router/ModeRouter.jsx ────────────────────────────────────────────────────
// Renders the active mode wrapped in Suspense + ErrorBoundary.
// Reads mode from AppContext, passes correct props to each mode.
// ─────────────────────────────────────────────────────────────────────────────

import { Component, Suspense } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { VOCAB_SOURCES, getCatsForTrack } from '../data/categories.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import { MODE_COMPONENTS } from './modes.js';

// ── Loading fallback ───────────────────────────────────────────────────────
function ModeLoader() {
  return (
    <div
      style={{
        minHeight: '50dvh',
        display: 'grid',
        placeItems: 'center',
        color: T.textDim,
        fontSize: 13,
      }}
    >
      Memuat mode…
    </div>
  );
}

// ── Error boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '60dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
            Mode ini mengalami error
          </div>
          <div style={{ fontSize: 12, color: T.textDim, maxWidth: 280 }}>
            {this.state.error?.message ?? 'Terjadi kesalahan yang tidak terduga.'}
          </div>
          <button
            onClick={this.props.onExit}
            style={{
              marginTop: 8,
              fontFamily: 'inherit',
              padding: '10px 24px',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.text,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Menu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── ModeRouter ────────────────────────────────────────────────────────────
export default function ModeRouter() {
  const { mode, exitMode, track } = useApp();
  const { known, unknown, starred, quizWrong, toggleStar, handleMark } = useProgress();
  const srs = useSRSContext();

  if (!mode) return null;

  const ModeComponent = MODE_COMPONENTS[mode];
  if (!ModeComponent) return null;

  // Build filtered cards for modes that need them
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  const filteredCards = CARDS.filter((c) => {
    if (trackCatKeys && !trackCatKeys.has(c.category)) return false;
    return true;
  });

  // Prop map — each mode gets exactly what it needs
  const modeProps = {
    kartu: {
      cards: filteredCards,
      known,
      unknown,
      onMark: handleMark,
      onExit: exitMode,
      srs,
      starred,
      onToggleStar: toggleStar,
    },
    ulasan: { srs, onExit: exitMode },
    kuis:   {
      cards: filteredCards,
      allCards: CARDS,
      onExit: exitMode,
    },
    sprint:   { cards: filteredCards, onExit: exitMode },
    fokus:    { known, unknown, quizWrong, onExit: exitMode },
    stats:    { known, unknown, quizWrong, onExit: exitMode },
  };

  const props = modeProps[mode] ?? { onExit: exitMode };

  return (
    <ErrorBoundary onExit={exitMode}>
      <Suspense fallback={<ModeLoader />}>
        <ModeComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
