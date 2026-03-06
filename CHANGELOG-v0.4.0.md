# CHANGELOG — v0.4.0

Released: 2026-03-06

Highlights
---------
- Native-first migration of form and layout components (Sprint 10).
- Input control now uses HTML5 Constraint Validation API with Popover hints for inline errors (S10-01).
- Checkbox & Radio components now rely on native :checked/:invalid pseudo-classes and support indeterminate state (S10-03).
- Grid component implemented with CSS Grid + Container Queries and a flexbox fallback for older browsers (S10-05).

Testing
-------
- Unit tests: 95 client unit tests added for S10 components — all passing under vitest + happy-dom.
- Server/shared tests: 208 passing (no regressions).
- E2E: 20 Playwright scenarios for form & layout migration (Chromium/Firefox/WebKit supported).

Notes
-----
- Progressive enhancement: modern browsers get native API paths; fallbacks provided for broader compatibility.
- Happy-dom test environment limitations (Popover API, Container Queries): unit tests focus on API correctness; E2E tests validate visual/CSS behavior in real browsers.

Upgrade Guide
-------------
- No breaking changes expected for apps using pseudo-kit components, but verify any custom CSS that targeted previous structure.

Commits
-------
- See commits in this release for detailed changes to components and tests.

Thank you to contributors and automated test suite ensuring zero regressions.
