# S13-01-fix-e2e — Fix pseudo-canvas-viewer E2E failure (hydration)

points: 3
status: done
owner: developer

Description:
Failure observed in Playwright E2E: tests/pseudo-canvas-viewer.e2e.js expects the page title to match /pseudo-canvas-viewer/i but received empty string on initial load. Attach test artifacts (screenshot) and reproduce locally using `npx playwright test tests/pseudo-canvas-viewer.e2e.js --project=chromium`.

Steps to reproduce:
1. Run `npx playwright test tests/pseudo-canvas-viewer.e2e.js --project=chromium`.
2. Observe failure at `E2E-T6: handle query parameters on load` — page title empty.

Acceptance criteria:
- E2E test `tests/pseudo-canvas-viewer.e2e.js` passes across Chromium, Firefox, WebKit.
- Unit and client tests remain green.
- Root cause identified and documented in the story comments.

Attachments:
- test-results\pseudo-canvas-viewer.e2e.j-0eb1b-le-query-parameters-on-load-webkit\test-failed-1.png
- Playwright output saved to bmad/artifacts/ci-playwright-output.txt
