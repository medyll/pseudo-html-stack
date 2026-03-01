# Sprint 2 — Molecules

**Duration:** Week 2  
**Capacity:** 3 devs × 5 days = 15 dev-days (~30 pts)  
**Traces to:** PKA-002 (partial — molecules)

## Sprint Goal
16 composants molecules livrés, testés, enregistrés dans le barrel.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S2-01 | PKA-002 | Molecules batch A — `breadcrumb`, `card`, `card-media`, `dropdown`, `form-field`, `list-item` | 6 | Must |
| S2-02 | PKA-002 | Molecules batch B — `menu-item`, `modal`, `notification`, `pagination` | 4 | Must |
| S2-03 | PKA-002 | Molecules batch C — `price-tag`, `product-tile`, `search-bar`, `tab-bar`, `tooltip`, `user-info` | 6 | Must |
| S2-04 | PKA-001 | Sync barrel metadata `componentsMeta` pour les 16 molecules | 2 | Must |
| S2-05 | PKA-002 | Smoke test : chaque molecule s'affiche correctement via `pseudo-kit-client` | 3 | Must |

**Total:** 21 pts

## Definition of Done
- [ ] 16 molecules dans `components/molecules/`
- [ ] Chaque molecule : `<template>` + `<style @scope>` + `@props` JSDoc + slots déclarés
- [ ] `componentsMeta` barrel à jour (33 entrées : 17 atoms + 16 molecules)
- [ ] Responsive 320/768/1024/1440 validé sur `card` et `modal`
- [ ] Pas de régression sur Sprint 1

## Dependencies
- S1-01, S1-02, S1-03 (scaffold + barrel)

## Risks
- `modal` : gestion du focus trap et de l'overlay peut déborder sur Sprint 3 → scope limité au composant visuel
