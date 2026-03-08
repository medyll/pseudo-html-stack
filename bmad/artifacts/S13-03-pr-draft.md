# PR Draft: S13-03 — Deterministic fixes for migration E2E (Chromium)

Summary
-------
This PR will include deterministic, non-invasive changes to stabilize the Chromium-first migration E2E tests:

- Add deterministic readiness hooks (data-ready/data-interactive) to dropdown and notification components OR add targeted, explicit readiness checks in the test where changing component code is unsafe.
- Adjust tests to use presence/visibility checks for dismiss buttons, and avoid force-clicks unless strictly necessary with a clear fallback.
- Tidy modal/backdrop behavior to prevent unintended pointer interception (z-index or pointer-events adjustments) or add overlay signaling attributes.

Files changed (expected)
------------------------
- src/server/canvas-normalize.js (possible small normalization helpers) — optional
- src/client/components/* (dropdown/notification): add data-ready flags — optional
- tests/migration-e2e.e2e.js: readiness checks, tolerant assertions, deterministic interactions — likely
- playwright.config.js (confirm Chromium-only profile for CI) — if required

Checklist
---------
- [ ] Implement minimal code changes (if necessary) with comments and tests
- [ ] Update migration-e2e.e2e.js with readiness checks
- [ ] Run headed Chromium locally and attach logs/screenshots
- [ ] Create PR, request review from frontend-team

Notes
-----
Prefer test-side waits first to minimize runtime changes. If component changes are made, keep them small and reversible with feature flags or data- attributes.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
