---
description: Démarrer une nouvelle feature ou tâche de développement avec cadrage explicite.
---

Tu vas accompagner l'utilisateur sur une nouvelle feature ou tâche.

## étape 1 — recueillir le cadrage

Demande à l'utilisateur les informations suivantes, dans cet ordre, en une seule fois :

1. **objectif** — en une phrase, qu'est-ce qu'on construit ou modifie.
2. **phase du roadmap** — quelle phase du roadmap on est en train de servir (mouvement, tir, moral, etc.). cette information sert à cadrer le périmètre et à refuser les dérives.
3. **périmètre attendu** — quels fichiers ou modules sont concernés a priori. l'utilisateur peut répondre "à toi de me dire" si ce n'est pas clair.
4. **contraintes spécifiques** — y a-t-il une décision d'architecture, une dépendance, ou une règle de jeu à clarifier avant de coder.

Attends la réponse avant d'aller plus loin.

## étape 2 — reformulation

Une fois les réponses reçues, reformule en bloc structuré :
feature : <objectif>
phase : <phase>
périmètre : <fichiers ou modules>
hors périmètre : <ce qui ne doit pas être touché>
contraintes : <liste ou "aucune">

Demande confirmation à l'utilisateur avant de continuer. Si quelque chose est ambigu, pose les questions de clarification maintenant.

## étape 3 — plan

Une fois le cadrage confirmé, propose un plan d'exécution conforme à la boucle de travail de CLAUDE.md (étapes 1 à 6). Le plan doit :

- découper la tâche en 3 à 6 étapes atomiques,
- préciser pour chaque étape si elle relève du domain, de l'engine, ou de la view,
- identifier les tests à écrire avant l'implémentation,
- signaler les skills à charger (`code-conventions` au minimum, `code-review` à l'étape finale).

Attends validation du plan avant de coder.

## étape 4 — exécution

Suis le plan validé, étape par étape, en respectant la boucle de travail et les invariants architecturaux de CLAUDE.md. À chaque étape :

- annonce ce que tu fais,
- écris les tests d'abord pour le domain et l'engine,
- propose le diff,
- attends validation avant de commit.

## règles de cette session

Tant que cette feature est en cours :

- toute modification hors du périmètre annoncé nécessite une demande explicite à l'utilisateur.
- si tu détectes un besoin d'élargir le périmètre, stop et demande.
- en fin de feature, propose un récap : ce qui a été fait, tests ajoutés, dette éventuelle créée.