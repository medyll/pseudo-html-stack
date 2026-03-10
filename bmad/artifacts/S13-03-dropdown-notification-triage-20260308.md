S13-03 Triage — Dropdown & Notification Failures (Chromium)

Run summary (headed Chromium)
- Command: npx playwright test tests/migration-e2e.e2e.js --project=chromium --headed --trace on
- Date: 2026-03-08T20:33:xxZ

Failing tests (trace + screenshot paths):
1. should toggle dropdown menu when trigger button is clicked
   - test-results\migration-e2e.e2e.js-S9-06-d4bde-n-trigger-button-is-clicked-chromium\trace.zip
   - test-results\migration-e2e.e2e.js-S9-06-d4bde-n-trigger-button-is-clicked-chromium\test-failed-1.png
2. should auto-dismiss notification after 5 seconds
   - test-results\migration-e2e.e2e.js-S9-06-50c4b-otification-after-5-seconds-chromium\trace.zip
   - test-results\migration-e2e.e2e.js-S9-06-50c4b-otification-after-5-seconds-chromium\test-failed-1.png
3. Integration: modal + dropdown coexistence
   - test-results\migration-e2e.e2e.js-S9-06-e5428--and-interact-independently-chromium\trace.zip
   - test-results\migration-e2e.e2e.js-S9-06-e5428--and-interact-independently-chromium\test-failed-1.png

Immediate observations
- Dropdown-related waits still time out; the menu does not report visible/display or :popover-open in these runs. Some tests passed earlier which suggests flakiness or race at registration/init.
- Notification auto-dismiss did not remove element within 30s in some runs; may indicate timers not firing or test environment throttle.

Recommended next steps
1. Reproduce failing dropdown case in a single headed browser session with DevTools open to inspect DOM and popover state (frontend developer manual reproduction).
2. Add a small `data-ready` attribute in dropdown component when popover target attaches OR expose a method to open programmatically for tests.
3. Investigate notification autodismiss timer implementation; ensure timers run under test environment (no requestAnimationFrame dependency that can pause).
4. Assign deep triage to frontend-team and link artifacts above.

Assigned: frontend-team
Status: pending deeper triage
