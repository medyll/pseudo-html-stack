# Sprint 3 — Organisms

**Duration:** Week 3  
**Capacity:** 3 devs × 5 days = 15 dev-days (~30 pts)  
**Traces to:** PKA-002 (complete — organisms)

## Sprint Goal
13 composants organisms livrés → PKA-002 complète (50+ composants disponibles).

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S3-01 | PKA-002 | Organisms batch A — `cart-summary`, `comment-thread`, `content-row`, `feed-post` | 8 | Must |
| S3-02 | PKA-002 | Organisms batch B — `footer`, `hero-banner`, `navbar`, `product-detail` | 8 | Must |
| S3-03 | PKA-002 | Organisms batch C — `profile-card`, `sidebar`, `story-ring`, `thumbnail-grid`, `topbar` | 10 | Must |
| S3-04 | PKA-001 | Sync barrel metadata `componentsMeta` pour les 13 organisms | 2 | Must |

**Total:** 28 pts

## Definition of Done
- [ ] 13 organisms dans `components/organisms/`
- [ ] `navbar` et `sidebar` : named slots `logo`, `links`, `actions` fonctionnels
- [ ] `hero-banner` : named slots `media`, `headline`, `cta`
- [ ] `thumbnail-grid` + `content-row` : compatible `loop=""` du client
- [ ] `componentsMeta` barrel complet (46 entrées)
- [ ] PKA-002 marqué ✅ dans `status.yaml`

## Dependencies
- S2-04 (barrel molecules)

## Risks
- `navbar` responsive mobile → hamburger menu : limiter au CSS pur (pas de JS)
- `thumbnail-grid` avec `loop=""` → vérifier compatibilité avec `pseudo-kit-client` existant
