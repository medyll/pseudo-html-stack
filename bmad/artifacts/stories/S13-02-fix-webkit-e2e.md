# S13-02-fix-webkit-e2e — Investigate Playwright WebKit failures (migration-e2e)

points: 5
status: pending
owner: developer

Description:
Playwright full E2E run failed in the WebKit project with timeouts and locator.click errors in tests/migration-e2e.e2e.js (integration: tooltips + notifications). Attach screenshots from test-results and reproduce locally using `npx playwright test tests/migration-e2e.e2e.js --project=webkit`.

Steps to reproduce:
1. Run `npx playwright test tests/migration-e2e.e2e.js --project=webkit` locally.
2. Inspect failing tests and screenshots in test-results/ (files referenced in CI output).

Acceptance criteria:
- Identify root cause (flaky timing, selector mismatch, or browser-specific behavior).
- Add robust fixes or retries/timeouts as appropriate.
- Playwright full suite passes across Chromium, Firefox, and WebKit.

Attachments:
- test-results\\migration-e2e.e2e.js-S9-06-e5428--and-interact-independently-webkit\\test-failed-1.png
- test-results\\migration-e2e.e2e.js-S9-06-2080f-ile-notification-is-present-webkit\\test-failed-1.png
