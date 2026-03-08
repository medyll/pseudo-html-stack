# S13-03 — Fix migration E2E flaky tests (Chromium)

Status: in_progress
Owner: frontend-team


Summary
-------
This story tracks the remaining flaky migration E2E failures observed in the Chromium Playwright run after the previous quick test-fix pass. Failures to address:
- Dropdown/menu visibility not opening reliably
- Notification autodismiss/dismiss timing and dismiss-button visibility
- Integration overlay: modal intercepting pointer events and blocking dropdown clicks

Acceptance criteria
-------------------
- Reproduce each failing case locally in headed Chromium
- For each failure either: (a) fix the test to wait for a robust readiness signal, or (b) fix the component to provide a readiness hook/attribute
- All migration-e2e tests pass under the Chromium project in CI locally before marking done
- Update bmad/status.yaml and dashboard to reflect changes and close related bugs

Tasks
-----
1. s13-03-triage-dropdown (in_progress) — reproduce dropdown/menu visibility and determine root cause (selectors vs popover state) — owner: frontend-team
2. s13-03-triage-notification (done) — reproduce notification autodismiss/dismiss timing; ensure dismiss button visible and autodismiss reliable — owner: frontend-team
3. s13-03-fix-integration-overlay (in_progress) — reproduce integration overlay and implement ordering/z-index or test ordering fix — owner: frontend-team
4. s13-03-fix-migration-e2e-flaky-chromium (in_progress) — implement fixes, update tests, and prepare changes for review — owner: frontend-team

Notes
-----
- Short-term approach: prefer non-invasive test fixes (waits or readiness checks) unless the component clearly misbehaves.
- Keep WebKit-related issues deferred per Chromium-first policy; this story targets Chromium-only failures.

