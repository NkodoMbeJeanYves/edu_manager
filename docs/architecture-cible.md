# Architecture cible — recommandations à décider

> Document **d'aide à la décision**. Il part des constats sur l'existant
> ([frontend-architecture.md](./frontend-architecture.md) §10) et propose une cible,
> les options envisageables et une feuille de route priorisée.
> Chaque section se termine par une **recommandation** explicite (👉) à valider ou amender.

---

## 1. Synthèse — ce qu'il faut décider

| # | Sujet | Constat | Recommandation | Effort | Priorité |
|---|---|---|---|---|---|
| A | Patron de state management | 2 patrons divergents + boilerplate dupliqué ×13 | Adopter **`@ngrx/signals` (signalStore)** comme standard unique | M | 🔴 Haute |
| B | Cohérence des modules « académiques » | `of(seed())` en dur, hors mock-backend | Aligner sur le patron 2-niveaux + seeds | M | 🔴 Haute |
| C | API : actions en callback | `onSuccess()` au lieu d'`Observable`/état | Actions **déclaratives** + état `loading/error` typé | S | 🟠 Moyenne |
| D | RBAC fin (`*appCan`) | Directive non appliquée | Appliquer sur toutes les actions mutantes | M | 🟠 Moyenne |
| E | Auth & sécurité | Pas de silent-refresh, JWT en `localStorage` | Refresh interceptor + arbitrage stockage | M | 🟠 Moyenne |
| F | Gestion d'erreur & feedback | Console only, non standardisé | **Notification service** global + error UX | S | 🟠 Moyenne |
| G | Tests | 0 test | Pyramide minimale (unit core + e2e parcours) | L | 🟡 Continue |
| H | Réutilisation UI/CRUD | ~11k lignes, listes/forms répétés | Primitives partagées (data-table, form, page-shell) | L | 🟡 Continue |
| I | Observabilité & qualité | Pas de lint/CI documenté, pas de logs | ESLint + Prettier + CI + Sentry-like | M | 🟡 Continue |

Légende effort : S < 2j · M 2–5j · L > 1 sprint.

---

## 2. Cible d'architecture proposée (vue d'ensemble)

On **garde la base** (standalone + signals + lazy-loading + intercepteurs + RBAC déclaratif), qui est saine et moderne. On **normalise** les couches et on **comble les manques** transverses.

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION  (features/*/pages, components)                  │
│   • Smart pages (routées) ↔ store de feature                   │
│   • Dumb components (Input/Output, OnPush)                      │
│   • Primitives partagées : <app-data-table>, <app-page>, form  │  ← H
├──────────────────────────────────────────────────────────────┤
│  STATE  (features/*/<domain>.store.ts)                         │
│   • signalStore (@ngrx/signals) — 1 store / domaine            │  ← A
│   • withEntities + withComputed + withMethods (rxMethod)       │
│   • état { loading, error, pagination } standardisé            │  ← C
├──────────────────────────────────────────────────────────────┤
│  DATA ACCESS  (core/services/*-api.service.ts)                 │
│   • HTTP pur, Observable<ApiResponse<T>>                       │
│   • mapping DTO ↔ modèle si divergence back                    │
├──────────────────────────────────────────────────────────────┤
│  CROSS-CUTTING  (core)                                         │
│   • auth/tenant stores · interceptors (+ refresh) ← E          │
│   • RBAC : matrix + guard + *appCan partout       ← D          │
│   • NotificationService + global error handler    ← F          │
│   • mock-backend unifié (tous les domaines)       ← B          │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Décisions détaillées

### A. State management : standardiser sur `@ngrx/signals`

**Problème.** Chaque feature « riche » réimplémente le même squelette (`signal<State>` + ~15 `computed` + actions `state.update`). ~13 copies → bug-prone, verbeux.

**Options.**
| Option | Pour | Contre |
|---|---|---|
| **Garder le store maison** | Zéro dépendance | Boilerplate, pas d'entité/normalisation, à maintenir |
| **`@ngrx/signals` (signalStore)** 👈 | Officiel, signals-first, `withEntities`/`rxMethod`, peu de boilerplate, testable | 1 dépendance, courbe d'apprentissage légère |
| **NgRx « classique » (store/effects)** | Très outillé, devtools | Lourd, RxJS-centric, à contre-courant des signals ici |

👉 **Recommandation : `@ngrx/signals`.** Migrer feature par feature (commencer par une, ex. `notes`, comme référence). Factoriser un `withRequestStatus()` custom (loading/error/pagination) réutilisé par tous les stores → supprime la duplication décrite en §C.

### B. Aligner les modules « académiques »

**Problème.** `academic/*`, `administration`, `finance` renvoient `of(seed())` en dur, ne passent pas par `mock-backend`, n'ont pas d'`*-api.service`. Incohérent et non représentatif du futur backend.

👉 **Recommandation.** Pour chaque entité : créer le `*-api.service` dans `core/services`, le seed dans `core/mocks/seeds`, et le `signalStore` de feature. Supprimer les `seed()` inline. Bénéfice : un **seul** chemin de données, prêt à brancher le vrai backend en basculant `useMocks`.

### C. Actions déclaratives plutôt que callbacks

**Problème.** `action(dto, onSuccess?)` : pas de valeur de retour, erreurs piégées dans `state.error`, composition impossible, et hacks type `setTimeout(…, 1500)` pour attendre un chargement.

👉 **Recommandation.** Avec `@ngrx/signals` + `rxMethod`, les composants réagissent aux **signals** (`store.loading()`, `store.notes()`) plutôt qu'à des callbacks. Pour les enchaînements (ex. « sauver puis fermer le dialog »), exposer une méthode retournant l'`Observable` ou s'appuyer sur un `effect`/résultat d'état. Supprimer tous les `setTimeout` d'attente.

### D. RBAC fin — appliquer `*appCan`

**Problème.** Les gardes protègent les **routes** ; les **actions** (boutons Valider/Publier/Supprimer/Signer) restent visibles même sans droit.

👉 **Recommandation.** Passe systématique : tout bouton/menu mutant porte `*appCan="'<action>'; module: '<module>'"`. Établir une **convention** (action ↔ libellé bouton) et la documenter. C'est l'étape 6 RBAC déjà identifiée — la faire en **session mécanique dédiée** (cf. note projet : ne pas mélanger à une session feature/design).

### E. Authentification & stockage du token

**Problème.** `AuthService.refresh()` existe mais n'est pas branché ; au `401` l'utilisateur est déconnecté sèchement. JWT en `localStorage` (exposé au XSS).

**Options de stockage.** `localStorage` (simple, vulnérable XSS) · cookie `HttpOnly+Secure+SameSite` (recommandé si le back le permet) · mémoire + refresh cookie.

👉 **Recommandation.**
1. **Refresh interceptor** : au `401`, tenter `refresh()` une fois, rejouer la requête, sinon logout (avec file d'attente des requêtes concurrentes).
2. Arbitrer le **stockage** avec l'équipe backend : viser cookie `HttpOnly` pour le refresh-token ; à défaut, garder `localStorage` mais documenter le risque.
3. Vérifier l'expiration côté client (`expiresAt`) déjà présente — déclencher le refresh **proactivement** avant expiration.

### F. Gestion d'erreur & feedback utilisateur

**Problème.** `errorInterceptor` ne fait que logger ; chaque feature stocke un `error` string affiché de façon hétérogène ; succès via `MatSnackBar` dispersés.

👉 **Recommandation.** Introduire un `NotificationService` (wrapper `MatSnackBar`/toast) + un `ErrorHandler` global Angular. L'`errorInterceptor` mappe les codes HTTP (`401/403/409/422/5xx`) vers des messages i18n et pousse une notification. Standardiser : *succès* → snackbar courte, *erreur* → snackbar/notif persistante, *validation 422* → erreurs de champ dans le formulaire.

### G. Tests

**Problème.** Aucun test → toute régression passe inaperçue, refactos (A, B) risquées.

👉 **Recommandation — pyramide minimale d'abord :**
- **Unit (Vitest/Jest)** : `access-matrix` + `authorization.service` (pur, critique sécurité), helpers mock, un signalStore de référence.
- **Composant** : pages CRUD critiques (saisie de notes, inscriptions) via Testing Library.
- **E2E (Playwright/Cypress)** : 2–3 parcours clés (login→tenant→liste, workflow notes brouillon→publié) en s'appuyant sur le **mock-backend** existant (atout réel).

### H. Réutilisation UI / CRUD

**Problème.** ~11 363 lignes de templates inline (cf. [phase-b-inline-templates.md](./phase-b-inline-templates.md)) ; listes filtrables + formulaires CRUD répétés sur 50+ composants.

👉 **Recommandation.** Extraire des **primitives partagées** dans `shared/` :
- `<app-page>` (titre + actions + slot) — coquille d'écran.
- `<app-data-table>` (colonnes déclaratives, pagination, tri, état loading/empty) au-dessus de `MatTable`.
- Helpers de formulaire (build + affichage erreurs i18n).
- Terminer l'extraction des templates inline (Phase B) **avant** d'industrialiser.

### I. Qualité & observabilité

👉 **Recommandation.** ESLint (`@angular-eslint`) + Prettier + hook pre-commit ; pipeline **CI** (lint + build:en/fr + tests) sur la PR ; intégration d'un outil d'**erreurs runtime** (Sentry-like) branché sur l'`ErrorHandler` global de §F.

---

## 4. Ce qu'on ne change PAS (et pourquoi)

- **Standalone + signals + lazy-loading** : moderne, performant, bon choix → on conserve.
- **RBAC déclaratif par matrice** : élégant, centralisé, testable → on étend (D), on ne refait pas.
- **Mock-backend par intercepteur** : excellent pour dev/démo/tests → on **généralise** (B), on garde.
- **Découpage core/features/shared/layout** : sain → on le **respecte plus strictement**.
- **i18n par build** : déjà en place → on garde.

---

## 5. Feuille de route proposée

> Ordonnée pour **réduire le risque** : on fiabilise (tests + erreurs) avant de refactorer en masse.

**Lot 1 — Fondations (faible risque, fort levier)**
1. (F) `NotificationService` + error handler + mapping HTTP.
2. (E) Refresh interceptor + arbitrage stockage token.
3. (G) Tests unitaires sécurité (`access-matrix`, `authorization`) + 1 e2e login.

**Lot 2 — Normalisation du state**
4. (A) Introduire `@ngrx/signals`, migrer **`notes`** en référence + `withRequestStatus()`.
5. (C) Supprimer callbacks/`setTimeout` sur la feature migrée.
6. Migrer les autres features riches une à une.

**Lot 3 — Cohérence & RBAC**
7. (B) Aligner `academic`/`administration`/`finance` (api-service + seed + store).
8. (D) Appliquer `*appCan` partout (session dédiée mécanique).

**Lot 4 — Industrialisation UI**
9. (H) Phase B (extraction templates) puis primitives `data-table` / `page` / form.
10. (I) ESLint/Prettier + CI complète.

---

## 6. Risques & points d'attention

- **Migration state (A)** : faire **feature par feature**, jamais en big-bang ; garder l'ancien et le nouveau patron cohabitant le temps de la bascule.
- **RBAC `*appCan` (D)** : risque de churn énorme → session dédiée, revue ciblée (note projet : ne pas mélanger à du feature/design).
- **Stockage token (E)** : dépend d'une **décision backend** (cookie `HttpOnly`) — à arbitrer ensemble avant de coder.
- **Contrat API** : la cible suppose le respect des wrappers `ApiResponse`/`PaginatedResponse` déjà spécifiés ([api-contract](./api-contract/README.md)) — toute divergence back se gère dans la couche `*-api.service` (mapping), pas dans les stores.

---

## 7. Questions ouvertes pour l'arbitrage

1. Adopte-t-on **`@ngrx/signals`** comme standard (sujet A) ou garde-t-on le store maison factorisé ?
2. Stockage du token : **cookie `HttpOnly`** (implique travail backend) ou statu quo `localStorage` documenté (sujet E) ?
3. Stack de test : **Vitest + Playwright** ou **Jest + Cypress** (sujet G) ?
4. Priorité business : fiabilisation (Lots 1–2) **avant** nouvelles features, ou en parallèle ?
