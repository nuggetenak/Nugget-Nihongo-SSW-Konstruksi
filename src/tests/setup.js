import '@testing-library/jest-dom';
import { configureFSRS } from '../srs/fsrs-core.js';

// FSRS interval fuzz is on in the app (see DEFAULT_CONFIG in srs/fsrs-core.js — it
// exists to stop due dates piling onto one future day) and off here, because a test
// that asserts an interval has to get the same number twice. One place, so no test
// has to remember to do it and no test can forget.
configureFSRS({ enable_fuzz: false });

// Stub localStorage for tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// jsdom doesn't implement ResizeObserver. FlipCard.jsx uses one to measure
// the back face and size the flip container to whichever face is taller —
// harmless no-op here since no test asserts on the actual measured height,
// just that FlipCard mounts without throwing.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;
