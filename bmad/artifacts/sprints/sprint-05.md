# Sprint 5 — pseudo-canvas-viewer

**Duration:** Week 5  
**Capacity:** 3 devs × 5 days = 15 dev-days (~28 pts)  
**Traces to:** PKA-004

## Sprint Goal
`pseudo-canvas-viewer.html` livré — Figma-style, 3 panels, drag-and-drop + `?canvas=` + `?assets=auto`.

## Stories

| ID | Epic | Title | Pts | Priority |
|---|---|---|---|---|
| S5-01 | PKA-004 | Layout 3-panel (CSS grid) + `viewer.css` avec `@scope` | 3 | Must |
| S5-02 | PKA-004 | `CanvasLoader` — `fetch(?canvas=url)` + `FileReader` drag-and-drop | 4 | Must |
| S5-03 | PKA-004 | `RegistryParser` — `DOMParser` → array de `ComponentDescriptor` | 3 | Must |
| S5-04 | PKA-004 | `PanelLeft` — arbre de composants groupé par `layer` (atoms/molecules/organisms/frames) | 3 | Must |
| S5-05 | PKA-004 | `CanvasRenderer` — stamp live via instance locale `PseudoKitClient` | 5 | Must |
| S5-06 | PKA-004 | `PropsPanel` — génère `<input>` depuis `@props`, re-render live au changement | 5 | Must |
| S5-07 | PKA-004 | `?assets=auto` — auto-découverte et auto-registration depuis `componentsMeta` + `framesMeta` | 3 | Should |
| S5-08 | PKA-004 | Message fallback `file://` protocol (invite à utiliser drag-and-drop) | 2 | Should |

**Total:** 28 pts

## Definition of Done
- [ ] `viewer/pseudo-canvas-viewer.html` ouvre depuis `file://` sans erreur
- [ ] Drag-and-drop d'un `.html` descriptor → composants listés dans le panel gauche
- [ ] `?canvas=./pseudo-canvas-demo.html` depuis serveur local → rendu correct
- [ ] `?assets=auto` → les 66 assets sont listés et prévisualisables
- [ ] Sélection d'un composant → stamp live dans le canvas central
- [ ] Modification d'une prop → re-render immédiat
- [ ] `@scope` viewer CSS — aucun style ne fuit hors des panels
- [ ] PKA-004 marqué ✅ dans `status.yaml`

## Dependencies
- S4-06 (barrel `framesMeta` complet — nécessaire pour `?assets=auto`)
- Peer dep `pseudo-html-kit` accessible depuis le viewer

## Risks
- `PseudoKitClient` en mode "instance locale" : vérifier que l'API permet plusieurs instances isolées
- `PropsPanel` : types complexes (`enum`, `[]`, `[field:type]`) → parser minimal, afficher `<input type="text">` pour tout type inconnu
