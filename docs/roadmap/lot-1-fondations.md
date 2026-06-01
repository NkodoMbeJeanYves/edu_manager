# Lot 1 — Fondations · Tickets

> Découpage en tickets du **Lot 1** de la [feuille de route](../architecture-cible.md#5-feuille-de-route-proposée).
> Objectif du lot : **fiabiliser avant de refactorer** — gestion d'erreur, sécurité du token, premiers tests.
> Ces 3 chantiers (F, E, G) sont à faible risque et constituent le socle des Lots 2–4.
>
> Convention : `S` < 2j · `M` 2–5j. Cases à cocher = critères d'acceptation (DoD).

---

## EPIC F — Gestion d'erreur & feedback utilisateur

> Réf. décision [F](../architecture-cible.md#f-gestion-derreur--feedback-utilisateur). Aujourd'hui `errorInterceptor` ne fait que `console.error`, les `MatSnackBar` sont dispersés et chaque feature stocke un `error: string` affiché de façon hétérogène.

### F1 — `NotificationService` centralisé `[S]`

**Contexte.** Les notifications de succès/erreur sont ouvertes à la main via `MatSnackBar` dans chaque page (ex. [saisie-notes.component.ts](../../src/app/features/notes/pages/saisie-notes/saisie-notes.component.ts)). Pas de convention de durée, de couleur, ni d'i18n.

**Tâches.**
- [ ] Créer `core/services/notification.service.ts` (wrapper `MatSnackBar`).
- [ ] API : `success(msg)`, `error(msg)`, `info(msg)`, `warn(msg)` — durées et styles standardisés.
- [ ] Messages passés en clés i18n (`$localize`) ou texte déjà localisé.
- [ ] Succès → snackbar courte (3 s) ; erreur → persistante avec action « Fermer ».

**Critères d'acceptation.**
- [ ] Un seul point d'entrée pour toute notif applicative.
- [ ] Aucune ouverture directe de `MatSnackBar` hors de ce service (lint/revue).

**Fichiers.** `+ core/services/notification.service.ts`
**Dépendances.** aucune.

---

### F2 — Mapping HTTP centralisé dans `errorInterceptor` `[S]`

**Contexte.** [error.interceptor.ts](../../src/app/core/interceptors/error.interceptor.ts) ne fait que logger puis rethrow. Les codes métier (`401/403/409/422/5xx`) ne sont pas traduits en messages utilisateur.

**Tâches.**
- [ ] Mapper les statuts HTTP → message i18n par défaut :
  - `403` → « Accès non autorisé », `404` → « Ressource introuvable », `409` → « Conflit », `422` → « Validation échouée », `5xx` → « Erreur serveur ».
- [ ] Pousser une notif via `NotificationService` (F1) **sauf** `401` (géré par le refresh — ticket E1) et `422` (remonté au formulaire — voir note).
- [ ] Conserver le `console.error` de diagnostic.
- [ ] Permettre l'**opt-out** par requête (header/contexte `X-Skip-Error-Toast`) pour les cas gérés localement.

**Critères d'acceptation.**
- [ ] Une erreur réseau non gérée affiche systématiquement une notif claire.
- [ ] Les `422` n'affichent pas de toast générique (laissés au formulaire).

**Fichiers.** `~ core/interceptors/error.interceptor.ts`
**Dépendances.** F1.
**Note.** Le détail d'affichage des erreurs de validation `422` au niveau champ est hors-scope de ce ticket (sera traité avec les helpers de formulaire, Lot 4 / décision H).

---

### F3 — `ErrorHandler` global Angular `[S]`

**Contexte.** Les exceptions non-HTTP (erreurs JS runtime) ne sont ni capturées ni remontées.

**Tâches.**
- [ ] Implémenter `core/errors/global-error-handler.ts` (`implements ErrorHandler`).
- [ ] Logger + notif utilisateur générique (« Une erreur inattendue est survenue »).
- [ ] Provider dans `app.config.ts` : `{ provide: ErrorHandler, useClass: GlobalErrorHandler }`.
- [ ] Point d'extension prêt pour un outil externe (Sentry-like) — décision I, branchement réel hors-scope.

**Critères d'acceptation.**
- [ ] Une exception non catchée déclenche une notif et un log structuré, sans page blanche.

**Fichiers.** `+ core/errors/global-error-handler.ts` · `~ app.config.ts`
**Dépendances.** F1.

---

## EPIC E — Authentification & sécurité du token

> Réf. décision [E](../architecture-cible.md#e-authentification--stockage-du-token). `AuthService.refresh()` existe mais n'est branché nulle part ; au `401` l'[auth.interceptor.ts](../../src/app/core/interceptors/auth.interceptor.ts) déconnecte sèchement. `expiresAt` est déjà présent dans [auth.store.ts](../../src/app/core/stores/auth.store.ts).

### E1 — Silent-refresh sur `401` `[M]`

**Contexte.** Sur expiration du token, l'utilisateur est éjecté vers `/login` même si un refresh-token valide existe.

**Tâches.**
- [ ] Dans `authInterceptor`, intercepter le `401` : appeler `AuthService.refresh()` **une seule fois**, mettre à jour `AuthStore`, **rejouer** la requête initiale.
- [ ] Gérer la **concurrence** : si plusieurs requêtes tombent en `401` simultanément, un seul refresh en vol ; les autres attendent son résultat (pattern `BehaviorSubject<string|null>` + `filter`/`take(1)` ou `shareReplay`).
- [ ] Si le refresh échoue → `AuthStore.clear()` + redirection `/login`.
- [ ] Ne pas tenter de refresh sur l'appel `/auth/refresh` lui-même (boucle).

**Critères d'acceptation.**
- [ ] Un token expiré est renouvelé de façon transparente, la requête réussit sans re-login.
- [ ] 5 requêtes parallèles sur token expiré → **1** seul appel `/auth/refresh`.
- [ ] Refresh KO → déconnexion propre.

**Fichiers.** `~ core/interceptors/auth.interceptor.ts` · possible `~ core/services/auth.service.ts` (persistance du refreshToken)
**Dépendances.** aucune (idéalement après F2 pour exclure le `401` du toast générique).
**Risque.** Logique concurrente subtile → couvrir par tests (G3).

---

### E2 — Refresh proactif avant expiration `[S]`

**Contexte.** `AuthStore.isAuthenticated` compare déjà `expiresAt > Date.now()`. On peut renouveler **avant** expiration plutôt qu'attendre un `401`.

**Tâches.**
- [ ] Au bootstrap d'une session, programmer un refresh à `expiresAt − marge` (ex. −60 s).
- [ ] Annuler/replanifier au login/logout et à chaque nouvelle session.
- [ ] Réutiliser le flux de E1 (pas de duplication de logique de refresh).

**Critères d'acceptation.**
- [ ] En usage continu, aucun `401` n'est déclenché par l'expiration (le refresh proactif passe avant).

**Fichiers.** `~ core/stores/auth.store.ts` ou `+ core/services/session-timer.service.ts`
**Dépendances.** E1.

---

### E3 — Arbitrage du stockage du token `[S — décision]`

**Contexte.** Le JWT est en `localStorage` (clé `edu.auth`), exposé au XSS. Décision à prendre **avec le backend**.

**Tâches.**
- [ ] Rédiger une **ADR** comparant : `localStorage` (statu quo) vs cookie `HttpOnly+Secure+SameSite` pour le refresh-token vs token en mémoire + refresh cookie.
- [ ] Statuer avec l'équipe backend (le cookie `HttpOnly` implique un travail côté API).
- [ ] Selon décision : soit documenter le risque résiduel `localStorage`, soit créer le ticket d'implémentation cookie.

**Critères d'acceptation.**
- [ ] Une décision tracée (ADR mergée) ; pas forcément d'implémentation dans ce lot.

**Fichiers.** `+ docs/adr/0001-stockage-token.md`
**Dépendances.** aucune (peut démarrer en parallèle).

---

## EPIC G — Tests (socle)

> Réf. décision [G](../architecture-cible.md#g-tests). 0 test aujourd'hui. On sécurise d'abord le **critique sécurité** (RBAC) et un **parcours e2e**, pour dérisquer les refactos des Lots 2–3.

### G0 — Choix de stack & setup `[S — décision + setup]`

**Tâches.**
- [ ] Trancher : **Vitest + Playwright** ou **Jest + Cypress** (cf. [question 3](../architecture-cible.md#7-questions-ouvertes-pour-larbitrage)).
- [ ] Configurer le runner unitaire + un script `npm test` opérationnel (le `ng test` actuel n'a aucune spec).
- [ ] Configurer le runner e2e contre le build mock (`useMocks: true`).
- [ ] (Optionnel) seuil de couverture initial bas, à monter progressivement.

**Critères d'acceptation.**
- [ ] `npm test` exécute au moins une spec verte localement.

**Fichiers.** `~ package.json` · config runner.
**Dépendances.** aucune ; **bloque** G1–G3.

---

### G1 — Tests unitaires RBAC (critique sécurité) `[S]`

**Contexte.** [access-matrix.ts](../../src/app/core/auth/access-matrix.ts) et [authorization.service.ts](../../src/app/core/services/authorization.service.ts) gouvernent toute l'autorisation. Code pur → idéal à tester en premier.

**Tâches.**
- [ ] `actionsFor(role, module)` : couvrir rôles `FULL`/`R`/vide et modules orphelins.
- [ ] `AuthorizationService.can()` / `canAccessModule()` / `hasAnyRole()` avec sessions multi-rôles (cumul des droits).
- [ ] Cas limites : aucun rôle → tout refusé ; `super_admin` → tout autorisé.

**Critères d'acceptation.**
- [ ] Matrice 12 rôles × actions couverte sur un échantillon représentatif.
- [ ] Régression détectée si une cellule de la matrice change par erreur.

**Fichiers.** `+ core/auth/access-matrix.spec.ts` · `+ core/services/authorization.service.spec.ts`
**Dépendances.** G0.

---

### G2 — Test e2e parcours d'entrée `[S]`

**Contexte.** Le parcours `login → select-tenant → liste` est le chemin critique d'accès. Le mock-backend permet un e2e déterministe sans backend.

**Tâches.**
- [ ] Scénario : login `admin@test.com` → sélection tenant → arrivée sur `/academic/students`.
- [ ] Vérifier la redirection `authGuard` (accès direct à une route protégée → `/login?redirect=`).
- [ ] Vérifier le filtrage sidebar selon le rôle (ex. `enseignant` ne voit pas Administration).

**Critères d'acceptation.**
- [ ] Le parcours passe en CI sur le build mock.

**Fichiers.** `+ e2e/auth-flow.spec.ts`
**Dépendances.** G0.

---

### G3 — Tests du flux de refresh `[S]`

**Contexte.** La logique concurrente de E1 est subtile et porte un risque de régression élevé.

**Tâches.**
- [ ] `401` unique → refresh + rejeu réussi.
- [ ] N requêtes parallèles en `401` → **un seul** `/auth/refresh`.
- [ ] Refresh KO → `clear()` + redirection `/login`.

**Critères d'acceptation.**
- [ ] Les 3 scénarios verts ; sert de filet pour E1/E2.

**Fichiers.** `+ core/interceptors/auth.interceptor.spec.ts`
**Dépendances.** G0, E1.

---

## Récapitulatif du lot

| Ticket | Titre | Effort | Dépend de |
|---|---|---|---|
| F1 | NotificationService | S | — |
| F2 | Mapping HTTP errorInterceptor | S | F1 |
| F3 | ErrorHandler global | S | F1 |
| E1 | Silent-refresh 401 | M | (F2) |
| E2 | Refresh proactif | S | E1 |
| E3 | ADR stockage token | S | — |
| G0 | Stack de test & setup | S | — |
| G1 | Tests RBAC | S | G0 |
| G2 | E2e parcours d'entrée | S | G0 |
| G3 | Tests refresh | S | G0, E1 |

**Chemin critique conseillé :** `F1 → F2 → E1 → G3` (cœur sécurité/erreurs), en parallèle de `G0 → G1/G2` et `E3` (décision).
**Estimation indicative :** ~1 sprint (1 dev) ou ½ sprint à deux en parallélisant les EPICs.

**Definition of Done du lot.**
- [ ] Toute erreur HTTP/runtime produit un retour utilisateur cohérent (EPIC F).
- [ ] L'expiration de token ne déconnecte plus l'utilisateur en usage normal (EPIC E).
- [ ] `npm test` + e2e tournent en CI avec le socle RBAC + parcours + refresh couverts (EPIC G).
- [ ] Décision de stockage du token tracée en ADR (E3).
