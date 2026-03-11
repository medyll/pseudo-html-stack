# Sprint 13 — Hydration & Migration (v0.5.0)

id: sprint-13
file: artifacts/sprints/sprint-13.md
status: done
progress: 100

stories:
- id: S13-01
  title: "Hydration: Fix SSR↔CSR handshake mismatches"
  points: 5
  status: done
  owner: "frontend-team"
  notes: "Implementation correct; added 12 new server hydration tests (nested slots, loops, script-in-template, props escaping)"
- id: S13-01-fix-e2e
  title: "Fix pseudo-canvas-viewer E2E failure (hydration)"
  points: 3
  status: done
  owner: "developer"
- id: S13-02
  title: "Select/Listbox migration to new Listbox API"
  points: 5
  status: deferred
  owner: "TBD"
  notes: "Deferred to Sprint 14 — scope creep for v0.5.0 cycle"
- id: S13-03
  title: "Fix migration E2E flaky tests (Chromium)"
  points: 3
  status: done
  owner: "frontend-team"
  notes: "Root cause: popovertarget IDL vs HTML attribute; fixed with setAttribute"
- id: S13-04
  title: "Cross-browser fallback validation & bug fixes"
  points: 3
  status: done
  owner: "frontend-team"
  notes: "18/18 Chromium E2E passing; WebKit deferred per Chromium-first policy"
- id: S13-05
  title: "Theme & Skin System (CSS3/HTML5 native)"
  points: 5
  status: done
  owner: "frontend-team"
  files:
    - src/pseudo-assets/theme/theme.css
    - src/pseudo-assets/theme/utils.css
    - src/pseudo-assets/skins/netflix.css
    - src/pseudo-assets/skins/amazon.css
    - src/pseudo-assets/skins/facebook.css

# Notes
Based on bmad/artifacts/prd-next.md
Completed: 2026-03-10
Total coverage at close: 564 passing (226 node:test + 320 vitest + 18 E2E Chromium)
