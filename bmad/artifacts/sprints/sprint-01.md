# Sprint 1 — Foundation & Atoms

**Duration:** Week 1  
**Capacity:** 3 devs × 5 days = 15 dev-days (~30 pts)  
**Traces to:** PKA-001, PKA-002 (partial — atoms)

## Sprint Goal
Scaffolding du package `pseudo-kit-assets` opérationnel + 17 composants atoms livrés.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S1-01 | PKA-001 | Init repo `pseudo-kit-assets` (package.json, peerDeps, pnpm workspace) | 2 | Must |
| S1-02 | PKA-001 | Barrel `index.js` — exports `components` + `frames` (URLs via `import.meta.url`) | 3 | Must |
| S1-03 | PKA-001 | Barrel metadata — exports `componentsMeta` + `framesMeta` (props/slots/layer) | 3 | Must |
| S1-04 | PKA-002 | Atoms batch A — `avatar`, `badge`, `button`, `chip`, `divider` | 5 | Must |
| S1-05 | PKA-002 | Atoms batch B — `icon`, `image`, `input`, `label`, `loader` | 5 | Must |
| S1-06 | PKA-002 | Atoms batch C — `progress-bar`, `rating`, `skeleton`, `spinner`, `tag`, `textarea`, `toggle` | 7 | Must |

**Total:** 25 pts

## Definition of Done
- [ ] `pnpm install` dans `pseudo-kit-assets/` fonctionne
- [ ] Barrel `index.js` : les 4 exports sont importables et résolvent des URLs valides
- [ ] 17 atoms — chaque fichier contient `<template>`, `<style @scope>`, commentaire `@props`
- [ ] Chaque atom répond à `@media` 768 / 1024 / 1440px
- [ ] `pnpm run test` passe (100/100) dans `pseudo-html-kit`

## Dependencies
- Aucune — PKA-001 est le point de départ

## Risks
- `import.meta.url` résolution depuis CDN vs. `file://` — tester les 2 modes dès S1-02
