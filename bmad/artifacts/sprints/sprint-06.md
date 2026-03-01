# Sprint 6 — Demos Netflix & Amazon

**Duration:** Week 6  
**Capacity:** 3 devs × 5 days = 15 dev-days (~22 pts)  
**Traces to:** PKA-005, PKA-006

## Sprint Goal
2 apps demo complètes et responsives — Netflix-style et Amazon-style — ouvrables depuis `file://`.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S6-01 | PKA-005 | `demos/netflix/tokens.css` — palette dark, variables typo/spacing/radius | 2 | Must |
| S6-02 | PKA-005 | `demos/netflix/index.html` — hero-banner + 3 content-rows + thumbnails + modal détail | 6 | Must |
| S6-03 | PKA-005 | Responsive Netflix — breakpoints 320/768/1024/1440 validés | 2 | Must |
| S6-04 | PKA-006 | `demos/amazon/tokens.css` — palette e-commerce (orange/navy), variables | 2 | Must |
| S6-05 | PKA-006 | `demos/amazon/index.html` — navbar + search-bar + product grid + product-detail + cart-summary | 6 | Must |
| S6-06 | PKA-006 | Responsive Amazon — breakpoints 320/768/1024/1440 validés | 2 | Must |
| S6-07 | PKA-005/006 | Smoke test `file://` : 2 demos ouvrent sans erreur console | 2 | Must |

**Total:** 22 pts

## Definition of Done
- [ ] `demos/netflix/index.html` ouvre depuis `file://` : layout Netflix visible sans erreur
- [ ] `demos/amazon/index.html` ouvre depuis `file://` : layout Amazon visible sans erreur
- [ ] Responsive testé à 320px (mobile) et 1440px (large) pour chaque demo
- [ ] Zéro dépendance externe (CDN, fonts, etc.) — tout via `pseudo-kit-assets` + `pseudo-html-kit`
- [ ] Console navigateur propre (0 erreurs, 0 warnings)
- [ ] PKA-005 et PKA-006 marqués ✅ dans `status.yaml`

## Dependencies
- S3-03 (navbar, hero-banner, thumbnail-grid, content-row, sidebar)
- S4-01, S4-02 (frames Netflix et Amazon)

## Risks
- Fonts externes (Google Fonts) : utiliser system fonts stack uniquement (`-apple-system, sans-serif`)
- Images : utiliser CSS `aspect-ratio` + `background-color` placeholder — pas d'images réelles
