# Architecture applicative — angular-edu-app

> Documentation de l'architecture **frontend** de l'application Angular.
> Complète le [contrat API](./api-contract/README.md) (orienté backend) et le [README](../README.md) (vue d'ensemble).
> État des lieux **factuel** du code au 2026-06-01. Pour la cible recommandée, voir [architecture-cible.md](./architecture-cible.md).

---

## 1. Stack & principes

| Domaine | Choix |
|---|---|
| Framework | Angular 17.3 — **standalone components** (pas de NgModules) |
| Réactivité | **Signals** (`signal`, `computed`, `effect`) + RxJS pour le HTTP |
| Routing | Router standalone, **lazy-loading** par feature (`loadChildren` / `loadComponent`) |
| UI | Angular Material + CDK |
| State | Stores maison à base de signals (pas de NgRx) |
| HTTP | `HttpClient` + chaîne d'intercepteurs fonctionnels |
| i18n | `@angular/localize` — builds séparés par locale (`en-US` source, `fr`) |
| Détection de changements | `OnPush` sur les composants de shell ; `eventCoalescing` activé |
| Backend | Réel **ou** simulé via intercepteur de mock (`environment.useMocks`) |

**Principes structurants**
- Découpage **`core` / `features` / `layout` / `shared`** (voir §3).
- Tout module métier est **lazy-loaded** et **gardé** (`authGuard` → `tenantGuard` → `roleGuard`).
- Séparation **transport / état** : un service API HTTP (`core/services`) + un store de feature à signals (`features/*/services`).
- **Multi-tenant** et **RBAC** sont transversaux et injectés via intercepteurs + guards + directive.

---

## 2. Démarrage & bootstrap

```
main.ts
  └─ bootstrapApplication(AppComponent, appConfig)
       └─ app.config.ts  → provideRouter(APP_ROUTES) + provideHttpClient(withInterceptors([...])) + animations
            └─ app.routes.ts  → chaîne login → select-tenant → MainLayout(features)
```

Ordre des intercepteurs (défini dans [app.config.ts](../src/app/app.config.ts)) — **l'ordre est significatif** :

```
mockBackend → auth → tenant → error
```

1. **`mockBackendInterceptor`** — court-circuite l'appel vers les handlers en mémoire si `useMocks` (doit être premier).
2. **`authInterceptor`** — injecte `Authorization: Bearer <token>`, redirige sur `/login` au `401`.
3. **`tenantInterceptor`** — injecte `X-Tenant-Id` si un établissement est sélectionné.
4. **`errorInterceptor`** — log centralisé des erreurs HTTP (rethrow).

---

## 3. Découpage en couches

```
src/app/
├── core/          # Transversal, sans UI — singletons providedIn:'root'
│   ├── auth/      # access-matrix.ts, authority-level.ts (RBAC déclaratif)
│   ├── guards/    # auth · tenant · role
│   ├── interceptors/  # mock-backend · auth · tenant · error
│   ├── mocks/     # moteur de mock + seeds par domaine
│   ├── models/    # DTO/entités par domaine (source de vérité TS)
│   ├── services/  # *-api.service.ts → HTTP pur (1 par domaine)
│   └── stores/    # auth.store · tenant.store (signals + localStorage)
├── features/      # 1 dossier par module métier, lazy-loaded
│   └── <feature>/
│        ├── <feature>.routes.ts   # routes internes
│        ├── pages/                # composants routés (écrans)
│        ├── components/           # formulaires, dialogs, sous-vues
│        ├── services/             # *-state.service.ts (store signal de feature)
│        └── models/               # (parfois) modèles locaux
├── layout/        # MainLayout = navbar + sidebar + <router-outlet>
└── shared/        # Réutilisable inter-features
     ├── components/  # navbar, sidebar, confirm-dialog, route-loading-overlay
     └── directives/  # can.directive (*appCan)
```

Alias TS (tsconfig) : `@core/*`, `@features/*`, `@layout/*`, `@shared/*`, `@env/*`.

---

## 4. Routing & navigation

Point d'entrée fonctionnel en 3 étapes ([app.routes.ts](../src/app/app.routes.ts)) :

| Étape | Route | Garde | Rôle |
|---|---|---|---|
| 1 | `/login` | — | Authentification → `AuthSession` en `localStorage` |
| 2 | `/select-tenant` | `authGuard` | Choix de l'établissement → `TenantStore` |
| 3 | `/` (MainLayout) | `authGuard` + `tenantGuard` | Coquille applicative, redirige vers `/academic/students` |

Chaque feature sous `/` est protégée par **`roleGuard`** avec `data.module` :

```ts
{ path: 'notes', canActivate: [roleGuard], data: { module: 'notes' },
  loadChildren: () => import('@features/notes/notes.routes').then(m => m.NOTES_ROUTES) }
```

Échec d'autorisation → redirection vers `/acces-refuse`. Fallback `**` → `/`.

La **sidebar** ([sidebar.component.ts](../src/app/shared/components/sidebar/sidebar.component.ts)) déclare 8 groupes de navigation et **filtre dynamiquement** chaque item via `AuthorizationService.canAccessModule()` — un signal `computed`, donc réactif au changement de session.

---

## 5. Sécurité : authentification, multi-tenant, RBAC

### 5.1 Authentification
- [AuthStore](../src/app/core/stores/auth.store.ts) — `signal<AuthSession>` persisté en `localStorage` (clé `edu.auth`). Expose `isAuthenticated`, `roles`, `token` en `computed`.
- [AuthService](../src/app/core/services/auth.service.ts) — `login` / `logout` / `refresh` (HTTP). `refresh()` **existe mais n'est pas branché** sur un flux de silent-refresh.

### 5.2 Multi-tenant
- [TenantStore](../src/app/core/stores/tenant.store.ts) — établissement courant persisté (clé `edu.tenant`). `tenantInterceptor` propage `X-Tenant-Id`. Cloisonnement enforced **côté backend** (le front fait confiance au JWT/tenant).

### 5.3 RBAC (V1)
Modèle déclaratif, 100 % côté données :

| Pièce | Fichier | Rôle |
|---|---|---|
| Matrice rôle × module → actions | [access-matrix.ts](../src/app/core/auth/access-matrix.ts) | 12 rôles × 15 modules × 7 actions (`read`, `write`, `validate`, `publish`, `delete`, `export`, `sign`) |
| Niveaux d'autorité | [authority-level.ts](../src/app/core/auth/authority-level.ts) | institutionnel / pédagogique / support / externe (catégorisation d'affichage) |
| Service de décision | [authorization.service.ts](../src/app/core/services/authorization.service.ts) | `can(action, module)`, `canAccessModule()`, `hasAnyRole()` |
| Garde de route | [role.guard.ts](../src/app/core/guards/role.guard.ts) | filtre par `data.module` / `data.roles` |
| Directive de template | [can.directive.ts](../src/app/shared/directives/can.directive.ts) | `*appCan="'validate'; module: 'notes'"` |

> ⚠️ **État** : la directive `*appCan` existe mais **n'est pas encore appliquée massivement** dans les templates (étape 6 RBAC en attente). Aujourd'hui la protection est essentiellement au niveau **route + module** ; les boutons d'action fins ne sont pas tous masqués.

---

## 6. Gestion de l'état & accès aux données

### 6.1 Patron à 2 niveaux (modules « riches »)
Modules : `notes`, `bulletins`, `edt`, `absences`, `inscriptions`, `examens`, `structure`, `referentiel`, `etablissements`, `enseignants`, `communication`, `reporting`.

```
Composant (page)
   │  inject(XxxStateService)
   ▼
XxxStateService  (features/xxx/services)      ← store signal de feature
   │  - signal<XxxState> privé
   │  - computed() publics (sélecteurs + dérivés)
   │  - actions impératives load/create/update… avec callback onSuccess
   ▼
XxxApiService    (core/services)              ← HTTP pur, retourne Observable<ApiResponse<T>>
   ▼
HttpClient → intercepteurs → (mock | backend réel)
```

Exemple représentatif : [note-state.service.ts](../src/app/features/notes/services/note-state.service.ts) — un unique `signal<NoteState>` + ~15 `computed` (sélecteurs + dérivés métier comme `progressionSaisie`, `notesMoyenne`) + actions qui font `state.update(...)` au retour HTTP.

Caractéristiques observées de ce patron :
- État local de feature, **non partagé** entre features (chaque store est `providedIn:'root'` mais cloisonné par domaine).
- Les actions prennent un **callback `onSuccess?: () => void`** plutôt que de retourner un `Observable` (les erreurs sont stockées dans `state.error`).
- Pagination, `loading`, `error` gérés dans le state de chaque feature.

### 6.2 Patron simplifié (modules « académiques »)
Modules : `academic/{students, teachers, timetable, grades, sessions}`, `administration`, `finance`.

Ces services (ex. [students.service.ts](../src/app/features/academic/students/students.service.ts)) **ne passent pas par la couche mock-backend** : ils renvoient des données en dur via `of(this.seed()).pipe(delay(...))` directement dans le service. Pas de state-service à signals dédié, pas d'`*-api.service` dans `core`.

> C'est une **incohérence d'architecture** entre les deux familles de modules (voir [architecture-cible.md](./architecture-cible.md) §2).

---

## 7. Système de mock backend

Permet de faire tourner l'app **sans backend réel** (`environment.useMocks: true`).

| Pièce | Fichier | Rôle |
|---|---|---|
| Intercepteur | [mock-backend.interceptor.ts](../src/app/core/interceptors/mock-backend.interceptor.ts) | matche la requête sur `MOCK_ROUTES`, renvoie un `HttpResponse` 200 (latence simulée 180 ms) |
| Registre de routes | [mock-routes.ts](../src/app/core/mocks/mock-routes.ts) | agrège tous les seeds (ordre = priorité de matching) |
| Store CRUD | [mock-storage.ts](../src/app/core/mocks/mock-storage.ts) | persistance `sessionStorage` par onglet ; helper console `__mockReset()` |
| Helpers | [mock-helpers.ts](../src/app/core/mocks/mock-helpers.ts) | `matchPath`, `relativePath` |
| Seeds | `core/mocks/seeds/*.mock.ts` | données + handlers par domaine (auth, referentiel, structure, notes, bulletins, edt…) |

Comptes de test (mode mock) dans [auth.mock.ts](../src/app/core/mocks/seeds/auth.mock.ts) : `admin@test.com` (super_admin), `enseignant@test.com`, `apprenant@test.com`, etc. — n'importe quel mot de passe ≥ 6 caractères.

> Les modules « académiques » (§6.2) n'ont **pas** de seed ici → leurs données vivent en dur dans les services.

---

## 8. Configuration & build

| Environnement | Fichier | `useMocks` | `apiUrl` |
|---|---|---|---|
| Base (mock) | [environment.ts](../src/environments/environment.ts) | `true` | `https://api.example.com` |
| Développement | `environment.development.ts` | `false` | `/api/v1` (via `proxy.conf.json`) |
| Production | `environment.production.ts` | `false` | API distante |

Le remplacement de fichier est piloté par `angular.json` (`fileReplacements` des configurations `development` / `production`).

**i18n** : `sourceLocale: en-US`, locale `fr` via `src/locale/messages.fr.xlf`. Builds dédiés `build:en` / `build:fr` (un bundle par langue). Extraction : `npm run extract-i18n`.

---

## 9. Carte des modules métier

15 modules fonctionnels (détail des écrans dans le [README](../README.md#les-features-modules-métier), endpoints dans le [contrat API](./api-contract/README.md)) :

`academic` · `administration` · `finance` · `etablissements` · `inscriptions` · `notes` · `bulletins` · `structure` · `referentiel` · `edt` · `absences` · `enseignants` · `examens` · `communication` · `reporting`.

Workflows métier transverses récurrents (machine à états) : `brouillon → soumis → validé → publié/signé` (notes, bulletins, inscriptions, délibérations).

---

## 10. Limites connues de l'existant

Synthèse factuelle (détail et remédiation dans [architecture-cible.md](./architecture-cible.md)) :

1. **Deux patrons de service incohérents** (riches vs académiques) → §6.
2. Actions de store en **callback** plutôt qu'`Observable` → composition/erreurs difficiles.
3. **Aucun test** (`0` fichier `.spec.ts`).
4. **`*appCan` non appliqué** → actions non masquées selon les droits.
5. **Pas de silent-refresh** du token (déconnexion sèche au 401).
6. **Gestion d'erreur utilisateur** non standardisée (log console, `error` string par feature).
7. **Boilerplate de store dupliqué** sur ~13 features.
8. Données mock **en deux endroits** (seeds vs services académiques).
9. Quelques **hacks temporels** (`setTimeout(…, 1500)` dans la saisie de notes).
