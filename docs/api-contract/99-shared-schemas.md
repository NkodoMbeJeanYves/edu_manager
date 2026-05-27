# Schémas partagés

Types réutilisés à travers plusieurs modules. Centralisés ici pour éviter la duplication.

---

## Wrappers de réponse

### `ApiResponse<T>`

Toute réponse unitaire (GET single, POST, PATCH).

```ts
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
```

### `PaginatedResponse<T>`

Toute réponse paginée (GET list).

```ts
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Erreur standard (recommandé)

Réponse pour tout code HTTP ≥ 400. Format à confirmer côté back ; ce qui est consommé par le frontend :

```ts
interface ApiError {
  success: false;
  message: string;        // message lisible utilisateur
  code?: string;          // code métier optionnel (ex. INSCRIPTION_LOCKED)
  details?: Record<string, string[]>;  // erreurs par champ pour 422
}
```

---

## Multi-tenant

### `Tenant`

```ts
type TenantType = 'SCHOOL' | 'UNIVERSITY' | 'MIXED';

interface Tenant {
  id: string;            // UUID
  code: string;          // identifiant court, ex. "EDU-LYC-001"
  name: string;
  type: TenantType;
  logoUrl?: string;
  active: boolean;
}

interface TenantContext {
  tenantId: string;
  tenantCode: string;
}
```

---

## Utilisateur & session

### `UserRole`

12 rôles de la matrice RBAC V1.

```ts
type UserRole =
  | 'super_admin'
  | 'directeur'
  | 'resp_scolarite'
  | 'resp_financier'
  | 'resp_filiere'
  | 'enseignant'
  | 'surveillant_examen'
  | 'agent_scolarite'
  | 'agent_comptable'
  | 'apprenant'
  | 'parent'
  | 'auditeur';
```

### `User`

```ts
interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  active: boolean;
  apprenantId?: string;   // si user a un rôle apprenant
  enfantIds?: string[];   // si user a un rôle parent
}
```

### `AuthCredentials`

```ts
interface AuthCredentials {
  email: string;
  password: string;
  tenantCode?: string;
}
```

### `AuthSession`

```ts
interface AuthSession {
  token: string;              // JWT
  refreshToken: string;
  user: User;
  expiresAt: number;          // epoch ms
}
```

---

## Genres et personne

### `Genre`

Réutilisé pour `Apprenant`, `Enseignant`, etc.

```ts
type Genre = 'M' | 'F' | 'AUTRE';
```

---

## Calendrier / temps

### `JourSemaine`

```ts
type JourSemaine = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE';
```

### Format date / heure

- Date : `YYYY-MM-DD` (ex. `2026-05-27`)
- Date-heure : ISO 8601 UTC (ex. `2026-05-27T14:30:00Z`)
- Heure seule : `HH:mm` 24h (ex. `08:30`)

---

## Statuts inter-modules

Plusieurs modules réutilisent des familles de statuts. Détails complets dans chaque fichier module — récap ici :

| Type | Module principal | Valeurs |
|---|---|---|
| `StatutInscription` | [05-inscriptions](./05-inscriptions.md) | `brouillon`, `soumise`, `en_validation`, `validee`, `rejetee`, `annulee`, `en_liste_attente`, `affectee` |
| `StatutDocument` | [07-bulletins](./07-bulletins.md) | `brouillon`, `genere`, `valide`, `signe`, `publie`, `archive` |
| `StatutDeliberation` | [07-bulletins](./07-bulletins.md) | `planifiee`, `preparation`, `en_cours`, `cloturee`, `signee`, `publiee` |
| `StatutSeance` | [08-edt](./08-edt.md) | `planifiee`, `confirmee`, `realisee`, `annulee`, `reportee`, `remplacee` |
| `StatutAbsence` | [09-absences](./09-absences.md) | `non_justifiee`, `en_attente_justificatif`, `justifiee`, `non_excusable` |
| `StatutSession` (examen) | [10-examens](./10-examens.md) | `planifiee`, `en_cours`, `cloturee`, `archivee` |

---

## Pagination & filtres

Tous les endpoints `GET` list acceptent au minimum :

```ts
interface ListQueryParams {
  page?: number;        // 1-indexed, défaut 1
  limit?: number;       // défaut 20, max 100
  search?: string;      // recherche textuelle, scope défini par module
}
```

Les filtres spécifiques sont documentés dans chaque fichier module via le type `XxxFilters`.
