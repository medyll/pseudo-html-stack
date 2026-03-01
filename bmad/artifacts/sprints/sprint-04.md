# Sprint 4 — Frames

**Duration:** Week 4  
**Capacity:** 3 devs × 5 days = 15 dev-days (~30 pts)  
**Traces to:** PKA-003

## Sprint Goal
20 frames squelettes livrés — structures de page vides, slots nommés, zéro contenu placeholder.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S4-01 | PKA-003 | Frames Netflix — `frame-netflix-home`, `frame-netflix-detail` | 4 | Must |
| S4-02 | PKA-003 | Frames Amazon — `frame-amazon-home`, `frame-amazon-product`, `frame-amazon-cart` | 6 | Must |
| S4-03 | PKA-003 | Frames Facebook — `frame-facebook-feed`, `frame-facebook-profile` | 4 | Must |
| S4-04 | PKA-003 | Frames utilitaires — `frame-dashboard`, `frame-landing`, `frame-login`, `frame-signup`, `frame-settings`, `frame-404` | 6 | Must |
| S4-05 | PKA-003 | Frames contenu — `frame-blog-home`, `frame-blog-post`, `frame-pricing`, `frame-portfolio`, `frame-admin`, `frame-chat`, `frame-search-results` | 7 | Should |
| S4-06 | PKA-001 | Sync barrel `framesMeta` (20 entrées : slots, description) | 2 | Must |

**Total:** 29 pts

## Definition of Done
- [ ] 20 frames dans `frames/`
- [ ] Chaque frame : squelette vide avec named slots documentés dans `@slots` JSDoc
- [ ] `frame-netflix-home` slots : `hero`, `row-1`, `row-2`, `row-3`
- [ ] `frame-amazon-product` slots : `breadcrumb`, `media`, `info`, `actions`, `reviews`
- [ ] `frame-facebook-feed` slots : `topbar`, `stories`, `feed`, `sidebar`
- [ ] `framesMeta` barrel complet et synchronisé
- [ ] PKA-003 marqué ✅ dans `status.yaml`

## Dependencies
- S3-04 (barrel organisms complet avant d'ajouter frames)

## Risks
- Frames très complexes (`frame-admin`, `frame-chat`) → limiter aux slots structurels, pas de layout CSS avancé
