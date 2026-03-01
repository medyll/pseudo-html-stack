# Sprint 7 — Demo Facebook + SSR hydration + Publish

**Duration:** Week 7  
**Capacity:** 3 devs × 5 days = 15 dev-days (~22 pts)  
**Traces to:** PKA-007 + data-pk-hydrated + npm publish

## Sprint Goal
3ème demo livrée, marqueur SSR implémenté, package prêt pour publication npm.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S7-01 | PKA-007 | `demos/facebook/tokens.css` — palette social (blue/white/grey) | 2 | Must |
| S7-02 | PKA-007 | `demos/facebook/index.html` — topbar + stories + feed + profile-card + sidebar | 6 | Must |
| S7-03 | PKA-007 | Responsive Facebook — breakpoints 320/768/1024/1440 validés | 2 | Must |
| S7-04 | Core | `data-pk-hydrated` sur `pseudo-kit-server.renderComponent()` (ADR-08) | 3 | Must |
| S7-05 | Core | `pseudo-kit-client` : détecte `data-pk-hydrated`, skip stamp, adopte `@scope` | 2 | Must |
| S7-06 | PKA-001 | Vérification finale barrel : 66 entrées, URLs résolues, metadata exacte | 2 | Must |
| S7-07 | Publish | `package.json` final, `README.md` `pseudo-kit-assets`, `npm publish --dry-run` | 3 | Must |
| S7-08 | QA | Smoke E2E : 3 demos depuis `file://` + viewer `?assets=auto` | 2 | Must |

**Total:** 22 pts

## Definition of Done
- [ ] `demos/facebook/index.html` ouvre depuis `file://` sans erreur
- [ ] `data-pk-hydrated` ajouté par le server sur chaque composant SSR
- [ ] Client skip le stamp si `data-pk-hydrated` présent
- [ ] Barrel : 46 components + 20 frames, 66 entrées metadata
- [ ] `npm publish --dry-run` passe sans erreur
- [ ] `pseudo-canvas-viewer ?assets=auto` : 66 assets listés et rendus
- [ ] PKA-007 marqué ✅ dans `status.yaml`
- [ ] Progress global : 100%

## Dependencies
- S5-07 (`?assets=auto` viewer — doit voir les 66 assets)
- S6-07 (smoke test des 2 premières demos valide le pattern)

## Risks
- `data-pk-hydrated` nécessite un bump de version dans `pseudo-html-kit` (v0.1.0 → v0.2.0) — prévoir le tag git
- `npm publish` depuis pnpm workspace : vérifier les champs `files`, `exports`, `peerDependencies`
