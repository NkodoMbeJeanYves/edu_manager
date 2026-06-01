# angular-edu-app

Application Angular 17 (standalone components, signals) de **gestion d'établissement scolaire/universitaire**, multi-tenant et internationalisée (i18n fr/en). C'est un SPA orienté back-office administratif avec un backend qui peut être **réel ou simulé (mocks)**.

## Vue d'ensemble

| | |
|---|---|
| **Framework** | Angular 17.3 (standalone, signals, lazy-loading) |
| **UI** | Angular Material + CDK |
| **i18n** | `@angular/localize` (configurations `fr` / `en`) |
| **Architecture** | `core/` (transversal) · `features/` (modules métier) · `layout/` · `shared/` |
| **Backend** | Réel (HttpClient + proxy) ou simulé via intercepteur de mock |

## Le point d'entrée fonctionnel

Le démarrage technique est `main.ts` → `app.config.ts` (qui enregistre le router, le `HttpClient` et les 4 intercepteurs), mais le **point d'entrée fonctionnel** pour l'utilisateur est une chaîne de 3 étapes définie dans `app.routes.ts` :

1. **`/login`** → `login.page.ts` : authentification. Le formulaire produit une `AuthSession` stockée dans le `AuthStore` (signal + `localStorage`, clé `edu.auth`).
2. **`/select-tenant`** → l'utilisateur choisit son établissement (multi-tenant). Stocké dans le `TenantStore` (clé `edu.tenant`).
3. **`/`** (racine) → protégée par `authGuard` **+** `tenantGuard`, charge le `MainLayoutComponent` (navbar + sidebar + `<router-outlet>`). Par défaut, redirige vers **`/academic/students`** — c'est l'écran d'accueil réel de l'app.

Les trois gardes empilées :

- **`authGuard`** → renvoie vers `/login` si pas de session valide (avec `?redirect=`).
- **`tenantGuard`** → renvoie vers `/select-tenant` si aucun établissement choisi.
- **`roleGuard`** → contrôle par module, sinon redirige vers `/acces-refuse`.

## Les features (modules métier)

Chaque feature est **lazy-loaded** (`loadChildren`), protégée par `roleGuard` avec un `data.module`. La sidebar les regroupe en 8 sections, et **filtre dynamiquement** ce qui est affiché selon les droits de l'utilisateur :

| Groupe | Modules / écrans |
|---|---|
| **Academic** | students, teachers, timetable, grades, sessions |
| **Administration** | users, roles, departments |
| **Finance** | payments, invoices |
| **Institution** | etablissements, structure, referentiel (catalogue), enseignants (RH) |
| **Vie scolaire** | inscriptions, edt (emplois du temps), absences |
| **Évaluation** | notes (saisie/moyennes), bulletins (+ délibérations), examens |
| **Communication** | notifications, messages, annonces, modèles |
| **Reporting** | dashboard, pédagogique, absentéisme, financier |

Structure type d'une feature (ex. `features/notes/notes.routes.ts`) : un dossier `pages/` (composants de route), `components/` (formulaires, dialogs), `models/`, parfois `services/`. Les modèles et services API centraux sont dans `src/app/core/`.

## Le système d'autorisation (RBAC)

C'est le cœur transversal de l'app — la **RBAC V1** :

- **12 rôles** (`super_admin`, `directeur`, `resp_scolarite`, `enseignant`, `apprenant`, `parent`, `auditeur`…) regroupés en 4 **niveaux d'autorité** (`authority-level.ts`) : institutionnel / pédagogique / support / externe.
- Une **matrice d'accès** (`access-matrix.ts`) : pour chaque (rôle × module), la liste des actions autorisées (`read`, `write`, `validate`, `publish`, `delete`, `export`, `sign`).
- Le `AuthorizationService` expose `can(action, module)`, `canAccessModule()`, `hasAnyRole()` — utilisé par le `roleGuard`, la sidebar, et la directive `*appCan` (`shared/directives/can.directive.ts`).

> **Note** : l'application massive de `*appCan` dans les templates est encore en cours — la directive existe mais n'est pas encore posée partout.

## Le backend mocké

Un `mockBackendInterceptor` intercepte **en premier** les appels HTTP. Si `environment.useMocks === true`, il route vers des handlers en mémoire (`core/mocks/mock-routes.ts` + seeds) au lieu d'un vrai serveur, avec une latence simulée de 180 ms.

Configuration par environnement :

| Fichier | `useMocks` | `apiUrl` | Usage |
|---|---|---|---|
| `environment.ts` (base) | `true` | `https://api.example.com` | App pleinement fonctionnelle sans backend |
| `environment.development.ts` | `false` | `/api/v1` | Vrai backend via `proxy.conf.json` |
| `environment.production.ts` | `false` | API distante | Production |

En mode mock, les emails de test sont dans `core/mocks/seeds/auth.mock.ts` :

| Email | Rôle |
|---|---|
| `admin@test.com` | super_admin |
| `directeur@test.com` | directeur |
| `scolarite@test.com` | resp_scolarite |
| `enseignant@test.com` | enseignant |
| `apprenant@test.com` | apprenant |
| `parent@test.com` | parent |
| `auditeur@test.com` | auditeur |

N'importe quel mot de passe ≥ 6 caractères est accepté.

## Démarrage

```bash
npm install

# Servir en anglais (par défaut) ou en français
npm start          # ng serve --configuration=en
npm run start:fr   # ng serve --configuration=fr

# Build
npm run build:en
npm run build:fr

# Tests
npm test

# Extraction des chaînes i18n
npm run extract-i18n
```

## Arborescence (résumé)

```
src/app/
├── core/                 # Transversal
│   ├── auth/             # access-matrix, authority-level (RBAC)
│   ├── guards/           # auth, tenant, role
│   ├── interceptors/     # mock-backend, auth, tenant, error
│   ├── mocks/            # mock-routes + seeds par domaine
│   ├── models/           # modèles de données par domaine
│   ├── services/         # services API par domaine
│   └── stores/           # auth.store, tenant.store (signals)
├── features/             # Modules métier (lazy-loaded)
│   ├── academic/ administration/ finance/ etablissements/
│   ├── inscriptions/ notes/ bulletins/ structure/ referentiel/
│   ├── edt/ absences/ enseignants/ examens/ communication/ reporting/
│   └── auth/ tenant-select/ acces-refuse/
├── layout/main-layout/   # Coquille applicative (navbar + sidebar + outlet)
└── shared/               # Composants, directives (*appCan), dialogs réutilisables
```
