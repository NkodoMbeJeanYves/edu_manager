# Authentification & Multi-tenant

## Flow JWT

Le frontend utilise un JWT court (1h d'expiration) + refresh token. Le seul endpoint backend nécessaire en V1 est `POST /auth/refresh` — le login est aujourd'hui mocké côté frontend (sera remplacé par `POST /auth/login` à implémenter).

### Endpoints attendus

#### POST /auth/login

> Pas encore consommé en l'état (frontend mock). À implémenter par le back en parallèle de la migration `mockLogin → HTTP`.

**Source frontend** : `AuthService.login()` ([auth.service.ts:17](../../src/app/core/services/auth.service.ts#L17)) — mock local

**Request body**

```ts
interface AuthCredentials {
  email: string;
  password: string;
  tenantCode?: string;
}
```

**Response 200** — `AuthSession`

```ts
interface AuthSession {
  token: string;          // JWT access, exp ~1h
  refreshToken: string;
  user: User;
  expiresAt: number;      // epoch ms
}
```

Voir [99-shared-schemas.md](./99-shared-schemas.md) pour `User`.

**Erreurs**
- `401` identifiants invalides
- `403` compte désactivé (`active: false`)
- `404` tenant inconnu (si `tenantCode` fourni)

---

#### POST /auth/refresh

**Source frontend** : `AuthService.refresh()` ([auth.service.ts:29](../../src/app/core/services/auth.service.ts#L29))

Régénère une session valide à partir du refresh token. Appelé automatiquement par le frontend avant expiration ou sur 401.

**Headers**
- `Authorization: Bearer <refreshToken>` (le refresh token, pas l'access token)

**Request body** : `{}` (vide)

**Response 200** — `AuthSession`

Même format que `/auth/login`.

**Erreurs**
- `401` refresh token invalide ou expiré → frontend force la redirection vers `/login`.

---

## Headers requis sur toutes les autres requêtes

Le frontend injecte automatiquement via interceptors deux headers sur **chaque** requête HTTP (sauf `/auth/refresh`) :

### `Authorization: Bearer <JWT>`

Injecté par [`auth.interceptor.ts`](../../src/app/core/interceptors/auth.interceptor.ts). Si manquant ou expiré côté back → `401`, et le frontend nettoie sa session + redirige vers `/login`.

### `X-Tenant-Id: <uuid>`

Injecté par [`tenant.interceptor.ts`](../../src/app/core/interceptors/tenant.interceptor.ts). Identifie le tenant actif de l'utilisateur courant.

**Règle critique** : tout endpoint qui retourne des données métier **doit filtrer par ce tenant**. Un utilisateur du tenant A ne doit jamais accéder aux données du tenant B, même si l'ID est correct. Refus → `403`.

> Note : le `tenantId` du JWT (claim) doit être identique au `X-Tenant-Id` header. En cas de divergence (impersonation, super_admin switching tenant) → décision back : autoriser uniquement si le user a le rôle `super_admin`, sinon `403`.

---

## Multi-tenant — sélection initiale

Le frontend a une page `/select-tenant` qui appelle aujourd'hui un mock local (`TenantService.loadAvailable()`). À HTTP-iser plus tard si nécessaire :

#### GET /tenants/available (non implémenté frontend HTTP)

Liste les tenants accessibles à l'utilisateur connecté.

**Response 200** — `ApiResponse<Tenant[]>`

```ts
interface Tenant {
  id: string;
  code: string;
  name: string;
  type: 'SCHOOL' | 'UNIVERSITY' | 'MIXED';
  logoUrl?: string;
  active: boolean;
}
```

---

## RBAC — autorisation par module

Une fois authentifié et le tenant validé, chaque endpoint vérifie l'autorisation selon la **matrice de droits V1**, codée côté frontend dans [`src/app/core/auth/access-matrix.ts`](../../src/app/core/auth/access-matrix.ts).

### Rôles

```ts
type UserRole =
  | 'super_admin'       // accès complet tous tenants
  | 'directeur'         // chef d'établissement
  | 'resp_scolarite'    // gestion académique
  | 'resp_financier'    // M12 + reporting financier
  | 'resp_filiere'      // périmètre filière
  | 'enseignant'
  | 'surveillant_examen'
  | 'agent_scolarite'   // saisie sans validation
  | 'agent_comptable'   // M12 uniquement
  | 'apprenant'         // son dossier
  | 'parent'            // dossier enfant
  | 'auditeur';         // lecture seule globale
```

### Actions

`read`, `write`, `validate`, `publish`, `delete`, `export`, `sign`.

### Modules

`academic`, `administration`, `finance`, `etablissements`, `inscriptions`, `notes`, `bulletins`, `structure`, `referentiel`, `edt`, `absences`, `enseignants`, `examens`, `communication`, `reporting`.

### Récap des droits par module

| Rôle | Modules accessibles (actions) |
|---|---|
| `super_admin` | tous, toutes actions |
| `directeur` | tous (mostly `read` + workflow validation sur bulletins, full sur orphans) |
| `resp_scolarite` | inscriptions/edt/absences/finance CRUD, notes read+validate, bulletins read+write+publish, reporting read |
| `resp_financier` | inscriptions read, finance CRUD, reporting read |
| `resp_filiere` | inscriptions/edt/absences/finance read, notes read+validate, bulletins read+publish, reporting read |
| `enseignant` | inscriptions/edt/reporting read, notes/absences/bulletins read+write |
| `surveillant_examen` | edt read, examens read |
| `agent_scolarite` | inscriptions read+write, edt/absences/finance read |
| `agent_comptable` | finance CRUD, reporting read |
| `apprenant` | inscriptions/edt/notes/absences/bulletins/finance read |
| `parent` | inscriptions/edt/notes/absences/bulletins/finance read |
| `auditeur` | tous modules, read uniquement |

Voir le code [`access-matrix.ts`](../../src/app/core/auth/access-matrix.ts) pour la matrice exhaustive.

### Erreurs RBAC

- `401` token absent ou expiré
- `403` authentifié mais aucun de ses rôles ne couvre l'action demandée sur ce module
- `403` également si l'utilisateur essaie d'accéder à une ressource d'un autre tenant

### Périmètre fin (V2, non enforced)

Le frontend a déjà des champs prévus (non utilisés) :
- `User.apprenantId` — si rôle `apprenant`, restreindre aux données de cet apprenant
- `User.enfantIds[]` — si rôle `parent`, restreindre aux données de ces enfants
- (V2) `User.filiereIds[]`, `User.classeIds[]` — pour `resp_filiere` et `enseignant`

En V1, le back **n'a pas** à enforcer ces périmètres fins ; le tenant suffit. À ajouter en V2.
