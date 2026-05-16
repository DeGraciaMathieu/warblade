---
name: code-review
description: Grille de revue de code à appliquer avant de proposer un diff au utilisateur, ou lorsque l'utilisateur demande explicitement une review. Vérifie l'architecture en couches, la pureté des fonctions du domain, la couverture des tests, le respect des conventions, et les pièges classiques du projet wargame (mutations, dépendances inversées, hardcode de règles, pipeline d'événements mal utilisé). Doit être appliquée systématiquement en auto-review avant tout diff non trivial.
---

# revue de code — wargame

passer chaque point dans l'ordre. signaler les problèmes trouvés avant de proposer le code, ou les lister explicitement si l'utilisateur a demandé une review.

## 1. architecture

- [ ] aucun import de `pixi.js`, `zustand`, `immer` ou du dom dans `src/domain/` ou `src/engine/`.
- [ ] aucun import remontant la pyramide (view ← engine ← domain).
- [ ] le code ajouté est dans la bonne couche. règle métier → domain ou engine. rendu ou interaction → view.
- [ ] si une nouvelle abstraction est introduite, elle est justifiée par au moins deux usages concrets, pas par une anticipation.

## 2. pureté et état

- [ ] toute fonction de `domain/` est pure : pas d'i/o, pas de hasard non injecté, pas de date système, pas de mutation d'argument.
- [ ] les fonctions d'engine retournent un nouveau state, ne mutent pas l'entrée.
- [ ] les mutations zustand passent par immer.
- [ ] pas de référence partagée entre l'ancien et le nouveau state qui pourrait causer une mutation accidentelle.

## 3. typage

- [ ] aucun `any`. aucun `as` non justifié.
- [ ] les unions discriminées exhaustives sont vérifiées par un `assertNever` dans le `default` du switch.
- [ ] les types exportés ont un nom qui décrit le concept métier, pas le shape.
- [ ] pas de duplication de type (chercher si un type existant convient avant d'en créer un).

## 4. pipeline d'événements et règles

- [ ] aucune logique spécifique à une unité, une arme ou une faction n'est dans le moteur. tout passe par data + hooks.
- [ ] un nouveau comportement spécial est implémenté comme un hook enregistré sur un événement, pas comme une branche dans le moteur.
- [ ] les événements produits sont typés et ont un payload suffisant pour le log et l'undo.
- [ ] l'ordre de résolution des hooks est explicite et testé.

## 5. géométrie

- [ ] utilise flatten-js plutôt que des calculs manuels pour les intersections et polygones.
- [ ] les distances sont en pouces dans toute la couche métier (conversion px ↔ pouces uniquement en view).
- [ ] cas limites couverts : socles à distance nulle, lof rasante sur un coin de polygone, cible derrière soi-même.

## 6. tests

- [ ] toute logique ajoutée dans domain ou engine a au moins un test vitest.
- [ ] les tests sont déterministes (rng seedé).
- [ ] les noms de tests décrivent un comportement observable, pas l'implémentation.
- [ ] au moins un cas limite par fonction publique.
- [ ] les tests existants passent toujours.

## 7. conventions et lisibilité

- [ ] nommage métier, pas technique.
- [ ] pas de fichier `utils.ts` ou de fonction sans contexte clair.
- [ ] pas de commentaire qui paraphrase le code. commentaires uniquement pour le "pourquoi" non évident.
- [ ] pas de `console.log` résiduel.
- [ ] longueur de fonction raisonnable : si > 40 lignes, vérifier qu'il n'y a pas une extraction naturelle.

## 8. cohérence projet

- [ ] le diff reste dans le périmètre de la phase courante (cf. CLAUDE.md).
- [ ] aucune nouvelle dépendance npm sans demande préalable.
- [ ] pas de modification incidente non liée à la tâche (si nécessaire, en faire un commit séparé).
- [ ] si le diff touche au combat, aux armes, aux dégâts ou à l'activation → vérifier la conformité avec le skill `combat` (pattern retour, rng injecté, pas de hardcode).
- [ ] si le diff touche au terrain, aux obstacles, au mouvement ou à la LOS → vérifier la conformité avec le skill `terrain` (données dans `data/`, géométrie dans `domain/`).

## format de retour

quand cette skill est invoquée explicitement pour review :

- lister les problèmes par section, du plus grave au plus mineur.
- distinguer **bloquant** (doit être corrigé), **suggestion** (devrait l'être), **nit** (préférence stylistique).
- pour chaque point, citer la ligne ou l'extrait concerné et proposer une correction concrète.
- terminer par un verdict synthétique en une ligne.

en auto-review interne (avant un diff), corriger silencieusement les bloquants et suggestions, ne pas verbaliser sauf si un choix mérite d'être expliqué à l'utilisateur.