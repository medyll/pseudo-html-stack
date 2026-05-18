# Corrections — Package Naming & Consistency

Identified during codebase analysis (2026-05-18). Not yet implemented.

---

## FIX-PKG-01 — Package name mismatch: root package

**Decision (2026-05-18): canonical name = `pseudo-stack`**

| Location | Current | Target |
|----------|---------|--------|
| `package.json` → `name` | `pseudo-stack` | ✅ already correct |
| `README.md` → install snippet | `npm install pseudo-html-kit` | `npm install pseudo-stack` |
| `README.md` → CDN URL | `pseudo-html-kit` | `pseudo-stack` |
| `bin` key | `pseudo-kit` | `pseudo-stack` (or keep as alias — decide) |

**Files to touch:**
- `README.md` (install snippet, CDN URL, all mentions of `pseudo-html-kit`)
- `package.json` → `bin` key
- `README-full.md` if it references `pseudo-html-kit`

---

## FIX-PKG-02 — README references wrong assets package name

**Symptom:** README says `npm install pseudo-kit-assets`, actual package name is `pseudo-stack-assets` (`src/pseudo-assets/package.json`).

**Fix:** Update README section "Component Library (optional)" to use `pseudo-stack-assets`.

Also check: import example in README uses `{ components } from 'pseudo-kit-assets'` → should be `pseudo-stack-assets`.

---

## FIX-PKG-03 — peerDependencies version range (low priority)

**Symptom:** `pseudo-canvas/package.json` and `pseudo-assets/package.json` both declare `peerDependencies: { "pseudo-stack": ">=0.1.0" }`. Root is now `1.0.0`, so the range is technically satisfied — no breakage. But the lower bound `0.1.0` is stale.

**Fix (optional):** Bump lower bound to `>=1.0.0` to make the constraint honest.

---

## FIX-PKG-04 — Missing `status.md` in bmad/

**Symptom:** `bmad/status.md` was absent. `bmad-status` would silently fail.

**Fix:** Generated on 2026-05-18. ✅

---

## Notes

- No code changes required for FIX-PKG-01/02 beyond README + package.json `name` + `bin` key.
- FIX-PKG-01 decision locked: **`pseudo-stack`** (2026-05-18).
- Cascade order: FIX-PKG-01 → FIX-PKG-02 → FIX-PKG-03.
