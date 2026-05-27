# Contrat API — angular-edu-app

Documentation REST consolidée des **191 endpoints** consommés par le frontend Angular. Source de vérité unique pour l'équipe backend.

## Index

| # | Module | Endpoints | Fichier |
|---|---|---:|---|
| 0 | Authentification + Multi-tenant | — | [00-auth-tenant.md](./00-auth-tenant.md) |
| 1 | Référentiel pédagogique | 13 | [01-referentiel.md](./01-referentiel.md) |
| 2 | Établissements | 17 | [02-etablissement.md](./02-etablissement.md) |
| 3 | Structure (cycles, filières, classes…) | 21 | [03-structure.md](./03-structure.md) |
| 4 | Enseignants | 13 | [04-enseignants.md](./04-enseignants.md) |
| 5 | Inscriptions | 14 | [05-inscriptions.md](./05-inscriptions.md) |
| 6 | Notes & Évaluations | 20 | [06-notes.md](./06-notes.md) |
| 7 | Bulletins & Délibérations | 20 | [07-bulletins.md](./07-bulletins.md) |
| 8 | Emploi du temps | 20 | [08-edt.md](./08-edt.md) |
| 9 | Absences & Présences | 18 | [09-absences.md](./09-absences.md) |
| 10 | Examens | 12 | [10-examens.md](./10-examens.md) |
| 11 | Communication | 16 | [11-communication.md](./11-communication.md) |
| 12 | Reporting | 6 | [12-reporting.md](./12-reporting.md) |
| 99 | Schémas partagés | — | [99-shared-schemas.md](./99-shared-schemas.md) |

**Total** : 191 endpoints répartis sur 13 services API.

## Conventions transversales

### URL base

Toutes les routes sont relatives à `${environment.apiUrl}` (configuré côté ops/infra).

### Format JSON

- **camelCase** pour toutes les clés (aligné sur les modèles TS du frontend, cf. `src/app/core/models/`).
- **Dates** : ISO 8601 UTC — `2026-05-27T14:30:00Z`.
- **IDs** : UUID v4 par défaut (sauf indication contraire).
- **Heures (HH:mm)** : strings 24h, ex. `08:30`, `14:00`.

### Wrappers de réponse standards

Toute réponse JSON (sauf blob/PDF) respecte l'un de ces deux wrappers — détaillés dans [99-shared-schemas.md](./99-shared-schemas.md).

```ts
// Réponse unitaire
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Réponse paginée
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Pagination

Les endpoints `GET /xxx` retournant `PaginatedResponse<T>` acceptent systématiquement :

| Query param | Type | Défaut | Description |
|---|---|---|---|
| `page` | number | `1` | Numéro de page (1-indexed) |
| `limit` | number | `20` | Items par page (max 100) |

### Codes HTTP

| Code | Sens |
|---|---|
| `200` | Succès (GET, PATCH, POST sans création) |
| `201` | Création (POST créant une ressource) |
| `204` | No content (DELETE) |
| `400` | Paramètres / body invalides |
| `401` | Token absent ou expiré |
| `403` | Authentifié mais hors périmètre (RBAC ou tenant) |
| `404` | Ressource introuvable |
| `409` | Conflit métier (ex. doublon code, transition d'état interdite) |
| `422` | Validation échouée |
| `500` | Erreur serveur |

### Auth + Multi-tenant

Voir [00-auth-tenant.md](./00-auth-tenant.md).

- **Toutes** les requêtes (sauf `POST /auth/refresh`) exigent les headers :
  - `Authorization: Bearer <JWT>`
  - `X-Tenant-Id: <uuid>` (auto-injecté par le frontend)
- Tout endpoint doit filtrer ses résultats par tenant.

### Uploads et binaires

- **Uploads** (photo enseignant, justificatif absence) : `Content-Type: multipart/form-data` avec champ `file` (ou nom précisé dans le module).
- **Exports PDF** : `Content-Type: application/pdf` (response.body = blob).
- **Exports rapports** : `Content-Type` selon format demandé (`application/pdf`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

### RBAC

Chaque endpoint vérifie l'autorisation selon la matrice de droits V1 (12 rôles × 15 modules × 7 actions). Voir le code source : [`src/app/core/auth/access-matrix.ts`](../../src/app/core/auth/access-matrix.ts).

- Rôles : `super_admin`, `directeur`, `resp_scolarite`, `resp_financier`, `resp_filiere`, `enseignant`, `surveillant_examen`, `agent_scolarite`, `agent_comptable`, `apprenant`, `parent`, `auditeur`.
- Actions : `read`, `write`, `validate`, `publish`, `delete`, `export`, `sign`.

Refus d'accès → `403`.

## Hors-scope du contrat

- **Spec OpenAPI** automatique — peut être générée depuis ces `.md` ou les types TS.
- **Diagrammes de transitions d'état** (mermaid) — à ajouter en V2.
- **Codes erreur métier détaillés** (ex. `INSCRIPTION_ALREADY_VALIDATED`) — laissés à l'arbitrage du back.
- **Validation runtime** (Zod, class-validator, Joi) — choix d'implémentation du back.
- **Versionnage API** (`/v1/...`) — choix d'ops.
- **Rate limiting / quotas** — concerne l'infra.
- **WebSocket / SSE** temps réel — non consommés par le frontend actuel.

## Template d'endpoint

Chaque endpoint dans les fichiers modules suit ce format :

```markdown
### VERBE /path

Description courte.

**Source frontend** : `XxxApiService.method()` ([fichier.ts:LIGNE](../../src/app/core/services/xxx-api.service.ts#LLIGNE))

**Path parameters** (si présents)
| Param | Type | Description |
| `id` | UUID | ... |

**Query parameters** (si présents)
| Champ | Type | Requis | Description |
| `etablissementId` | UUID | non | ... |

**Request body** (POST/PATCH/PUT)
\`\`\`ts
interface XxxDto { ... }
\`\`\`

**Response 200/201** — `ApiResponse<Entity>` ou `PaginatedResponse<Entity>`
\`\`\`ts
interface Entity { ... }
\`\`\`

**Erreurs spécifiques** (au-delà des standards)
- `409` ...
```
