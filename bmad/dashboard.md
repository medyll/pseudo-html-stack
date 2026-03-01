# 📋 BMAD Dashboard — pseudo-html-kit

> **Sync:** 2026-03-01 | **Phase:** Implementation | **Progress:** 95% setup | **Team:** 3 devs | **Timeline:** 7 sprints × 1 semaine

---

## 🏗️ Workflow Status

| Phase | Status | Artifact |
|:------|:------:|:---------|
| **1 – Analysis** | ✅ Done | [product-brief.md](artifacts/product-brief.md) |
| **2 – Planning** | ✅ Done | [prd.md](artifacts/prd.md) · [tech-spec.md](artifacts/tech-spec.md) |
| **3 – Solutioning** | ✅ Done | [architecture.md](artifacts/architecture.md) |
| **4 – Implementation** | 🔵 In Progress | [sprints/](artifacts/sprints/) |

---

## 🏃 Sprint Roadmap (7 semaines)

| Sprint | Semaine | Thème | Pts | Epic | Status |
|:-------|:-------:|:------|:---:|:-----|:------:|
| [Sprint 1](artifacts/sprints/sprint-01.md) | W1 | Foundation & Atoms | 25 | PKA-001 + PKA-002 | ⏳ |
| [Sprint 2](artifacts/sprints/sprint-02.md) | W2 | Molecules | 21 | PKA-002 | ⏳ |
| [Sprint 3](artifacts/sprints/sprint-03.md) | W3 | Organisms | 28 | PKA-002 | ⏳ |
| [Sprint 4](artifacts/sprints/sprint-04.md) | W4 | Frames (20 squelettes vides) | 29 | PKA-003 | ⏳ |
| [Sprint 5](artifacts/sprints/sprint-05.md) | W5 | pseudo-canvas-viewer | 28 | PKA-004 | ⏳ |
| [Sprint 6](artifacts/sprints/sprint-06.md) | W6 | Demos Netflix & Amazon | 22 | PKA-005/006 | ⏳ |
| [Sprint 7](artifacts/sprints/sprint-07.md) | W7 | Demo Facebook + SSR + Publish | 22 | PKA-007 + core | ⏳ |

**Total : 175 pts · 7 semaines · 3 devs**

---

## 🎯 Backlog

| ID | Feature | Sprint | Status |
|:---|:--------|:------:|:------:|
| PKA-001 | `pseudo-kit-assets` scaffold + barrel | S1 | ⏳ |
| PKA-002 | 46 composants (17 atoms + 16 molecules + 13 organisms) | S1→S3 | ⏳ |
| PKA-003 | 20 frames squelettes vides | S4 | ⏳ |
| PKA-004 | `pseudo-canvas-viewer.html` (Figma-style) | S5 | ⏳ |
| PKA-005 | Netflix demo app | S6 | ⏳ |
| PKA-006 | Amazon demo app | S6 | ⏳ |
| PKA-007 | Facebook demo app | S7 | ⏳ |

---

## 🏛️ Architecture (locked)

```
pseudo-kit-assets/ (new npm package)
├── components/atoms/      (17) — @scope, mobile-first, named+default slots
├── components/molecules/  (16) — idem
├── components/organisms/  (13) — idem
├── frames/                (20) — squelettes vides, named slots uniquement
├── index.js               — components + frames (URLs) + componentsMeta + framesMeta
├── demos/
│   ├── netflix/   tokens.css + index.html
│   ├── amazon/    tokens.css + index.html
│   └── facebook/  tokens.css + index.html
└── viewer/
    └── pseudo-canvas-viewer.html  — drag-and-drop + ?canvas= + ?assets=auto
```

**Peer dep:** `pseudo-html-kit` | **Browser min:** Chrome 118 / FF 128 / Safari 17.4

---

## ✅ Toutes les décisions verrouillées (10/10)

| # | Décision | Valeur |
|---|---|---|
| 1 | Package | `pseudo-kit-assets` npm séparé |
| 2 | Nommage | `name.html` (sans préfixe) |
| 3 | Auto-registration | ❌ Explicite uniquement |
| 4 | CSS | `@scope` sur chaque `<style>` |
| 5 | Breakpoints | 320/768/1024/1440px mobile-first |
| 6 | Slots | Default + named dans tous les composants |
| 7 | Frames | Squelettes vides (pas de placeholder) |
| 8 | Viewer | Drag-and-drop + `?canvas=` + `?assets=auto` |
| 9 | tokens.css | Par demo — pas dans le package |
| 10 | SSR marker | `data-pk-hydrated` sur chaque composant SSR |

---

## 🧪 QA

| Metric | Value |
|:-------|:------|
| Test plan | ⏳ Pending |
| Last run | 100/100 ✅ |
| Open bugs | 0 |

---

## 👉 Recommended Next Step

```
/dev-story S1-01  — scaffold pseudo-kit-assets (package.json, peerDeps, pnpm workspace)
```

---

## 🛠️ Actions

- `/dev-story S1-01` — ✅ Démarrer Sprint 1 story 1
- `/dev-story S1-04` — Atoms batch A
- `/test-plan` — Préparer le plan de test
- `/update-dashboard` — Refresh
- `/next` — Orchestrator suggère l'étape suivante
