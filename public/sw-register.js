// ─── sw-register.js ──────────────────────────────────────────────────────────
// Service worker registration. An external file rather than an inline <script>
// in index.html, because index.html carries a Content-Security-Policy with
// `script-src 'self'` and an inline block is exactly what that forbids.
//
// This was found by loading the built app in a browser and reading the console,
// not by reading the policy: the CSP looked correct, the app rendered correctly,
// the fonts loaded — and the service worker silently never registered, which
// would have shipped an offline-first PWA with no offline. A policy is only as
// good as the run that proves it.
//
// Hashing the inline block would also have satisfied the CSP, and was rejected:
// the hash changes on every edit to these fifteen lines, so the first person to
// touch them breaks the PWA and finds out from a user.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/Nugget-Nihongo-SSW-Konstruksi/sw.js', {
        scope: '/Nugget-Nihongo-SSW-Konstruksi/',
      })
      .then(function (reg) {
        // Check for SW updates every time the page loads
        reg.update();
      })
      .catch(function (err) {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
