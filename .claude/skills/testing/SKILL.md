---
name: testing
description: Conventions de test à appliquer pour tout ajout ou modification de tests dans le projet warhammer. Définit la philosophie macro/fonctionnelle : les tests figent des comportements observables, pas des détails d'implémentation.
auto_invoke: true
---

# Testing — Warhammer

## Philosophie

Les tests sont des **filets de sécurité comportementaux**, pas des descriptions d'implémentation.

Un bon test répond à : *"que se passe-t-il quand..."*, pas *"comment ça fonctionne en interne"*.

Un test est sain si on peut réécrire l'implémentation sans le modifier.

## Tests macro (à écrire)

Un test macro teste un **comportement observable** : ce que le système produit, pas comment il le produit.

```ts
// ✅ comportement observable : l'attaque réduit les PV
it('les dégâts non sauvegardés réduisent les PV de la cible', () => {
  const { state: next } = resolveAttack(state, 'a', 'b', alwaysHit)
  expect(next.units['b']?.remainingWounds).toBe(2)
})

// ✅ comportement observable : le déplacement impossible ne modifie pas le state
it('refuse un déplacement qui dépasse la stat move', () => {
  const { state, events } = applyMove(BASE_STATE, 'unit-1', { x: 3, y: 10 }, UNIT_RADIUS_IN)
  expect(state).toBe(BASE_STATE)
  expect(events).toHaveLength(0)
})

// ✅ comportement observable : l'IA attaque quand un ennemi est à portée
it('attaque quand un ennemi est à portée avec LOS', () => {
  expect(decide(state)).toEqual({ type: 'attack', attackerId: 'p2', targetPosition: { x: 5, y: 0 } })
})
```

## Tests micro (à éviter)

Un test micro est couplé à un **détail technique interne** : valeur intermédiaire, structure d'un événement, état d'une variable privée, sous-fonction isolée.

```ts
// ❌ couplé à la structure interne de l'événement
it('retourne les jets individuels dans l\'événement', () => {
  expect(event.hitRolls).toEqual([6, 1])
  expect(event.saveRolls).toEqual([3])
})

// ❌ teste une sous-fonction privée extraite pour les besoins du test
it('moveToward retourne des coordonnées entières', () => {
  expect(moveToward({ x: 0, y: 0 }, { x: 7, y: 0 }, 6)).toEqual({ x: 5, y: 0 })
})

// ❌ vérifie un détail de calcul intermédiaire, pas un comportement
it('décrémente remainingMove de la distance exacte parcourue', () => {
  expect(state.units['unit-1']?.remainingMove).toBeCloseTo(2.0)
})
```

Si une propriété interne (comme `hitRolls`) doit être testée, c'est probablement parce qu'elle est un **output fonctionnel** (affichage dans le log de dés). Dans ce cas, formuler le test en termes de ce que l'utilisateur verra, pas de la structure de données.

## Règles de nommage

- `describe` → nom du **comportement ou scénario**, pas du nom de la fonction.
- `it` → phrase qui complète *"il [verbe]..."* ou *"quand X, alors Y"*.

```ts
// ❌ couplé au nom de la fonction
describe('resolveAttack', () => { ... })

// ✅ décrit le domaine
describe('résolution d\'une attaque', () => { ... })
describe('déplacement d\'une unité', () => { ... })
describe('décision de l\'IA', () => { ... })
```

## Structure d'un fichier de test

```ts
// 1. imports vitest + fonction(s) testée(s) + types domain
// 2. helpers de construction d'état (makeUnit, makeState) — locaux au fichier
// 3. describe par scénario métier
//    it par cas de comportement
```

Les helpers `makeUnit` / `makeState` sont **locaux** à chaque fichier de test. Pas de factory partagée entre fichiers (couplage de test à test).

## Déterminisme

- Pas de `Math.random` dans les tests — toujours injecter un rng contrôlé.
- `seededRng(n)` pour un comportement reproductible.
- Pour forcer tous les jets à réussir ou échouer, utiliser une fonction anonyme : `() => 0.99` ou `() => 0.01`.
- Pas d'horloge réelle (`Date.now`, `setTimeout`) dans les tests de logique.

## Couverture

- Couvrir les **cas nominaux** (ça marche) et les **cas de rejet** (ça ne marche pas, state inchangé).
- Ne pas couvrir les chemins qui n'existent pas dans le domain (pas de test défensif pour des cas impossibles).
- La couche `view/` n'est pas testée unitairement (rendu Pixi).
- Le hook `useAiPlayer` n'est pas testé (React + timers — tester `decide()` à la place).
