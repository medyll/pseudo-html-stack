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

Implementation Notes
--------------------
Date: 2026-03-08T20:03:31Z

Files to change (proposed)
- tests/migration-e2e.e2e.js — replace fragile page.waitForTimeout(100) usages with deterministic readiness checks (visible(), waitForSelector, or custom `data-ready` attributes). Add a small helper `waitForReady(locator)` at top of file.
- src/client/components/dropdown-*.js / dropdown-pk.html — optional: set `data-ready="true"` on the dropdown root when the popover target is attached and the trigger is initialized.
- src/client/components/notification-*.js — optional: expose `data-interactive` when dismiss button is present; ensure autodismiss timer clears on hover.

Suggested deterministic test patterns (examples to apply across file):
```js
// helper
async function waitForReady(locator) {
  // prefer Playwright's built-in waiting
  await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  // fallback: poll for data-ready
  await page.waitForFunction((el) => el && (el.hasAttribute('data-ready') || window.getComputedStyle(el).display !== 'none'), {}, locator);
}

// example usage instead of page.waitForTimeout(100):
const trigger = dropdown.locator('button.dropdown__trigger');
await waitForReady(trigger);
await trigger.click();
```

Run commands (headed Chromium)
- npx playwright test tests/migration-e2e.e2e.js --project=chromium --headed --trace on
- For a single test: npx playwright test tests/migration-e2e.e2e.js -g "should toggle dropdown menu" --project=chromium --headed --trace on

Notes / Decisions
- Tests will be fixed first (non-invasive). If a flaky case is proven to be component-internal (race during attach), implement a small `data-ready` attribute and document the change.
- Do not change production behavior beyond adding safe, opt-in data attributes.

Next steps
- Developer: apply deterministic waits to tests/migration-e2e.e2e.js and run headed Chromium locally; attach traces/screenshots to PR.
- After reproducing & fixing, update this story with `Files changed:` and commit with conventional commit message referencing S13-03.

Run results (2026-03-08 headed Chromium)
- Command: npx playwright test tests/migration-e2e.e2e.js --project=chromium --headed --trace on
- Failing tests: dropdown toggle; notification auto-dismiss; integration modal+dropdown coexist.
- Artifacts: test-results\migration-e2e.e2e.js-S9-06-d4bde-n-trigger-button-is-clicked-chromium\trace.zip, test-results\migration-e2e.e2e.js-S9-06-50c4b-otification-after-5-seconds-chromium\trace.zip, test-results\migration-e2e.e2e.js-S9-06-e5428--and-interact-independently-chromium\trace.zip

Triage note: see bmad/artifacts/S13-03-dropdown-notification-triage-20260308.md for detailed traces and recommended next steps.
