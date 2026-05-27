# Module Établissements

Établissements, campus, années académiques, périodes, salles, calendrier d'événements.

**Source frontend** : [`etablissement-api.service.ts`](../../src/app/core/services/etablissement-api.service.ts) (`EtablissementApiService`)

**26 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeEtablissement = 'scolaire' | 'universitaire';
type StatutAnnee       = 'en_cours' | 'cloturee' | 'archivee' | 'planifiee';
type TypePeriode       = 'trimestre' | 'semestre';
type TypeSalle         = 'cours' | 'amphi' | 'laboratoire' | 'informatique' | 'sport';
type StatutSalle       = 'disponible' | 'maintenance' | 'indisponible';
type TypeEvenement     = 'vacances' | 'ferie' | 'examen' | 'evenement';
```

### `Etablissement`

```ts
interface Etablissement {
  id: string;
  nom: string;
  code: string;                       // ex. "LYC-PARIS-001"
  type: TypeEtablissement;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb?: string;
  logo?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `Campus`

```ts
interface Campus {
  id: string;
  etablissementId: string;
  etablissement?: Etablissement;      // hydratation
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  telephoneDirecteur?: string;
  principal: boolean;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `AnneeAcademique`

```ts
interface AnneeAcademique {
  id: string;
  etablissementId: string;
  etablissement?: AnneeAcademique;
  libelle: string;                    // ex. "2025-2026"
  dateDebut: string;
  dateFin: string;
  statut: StatutAnnee;
  typePeriode: TypePeriode;
  active: boolean;                    // une seule active à la fois par etablissement
  createdAt: string;
  updatedAt: string;
}
```

### `Periode`

```ts
interface Periode {
  id: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;                    // ex. "Trimestre 1"
  numero: number;                     // 1, 2, 3 selon le type
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `Salle`

```ts
interface Salle {
  id: string;
  campusId: string;
  campus?: Campus;
  code: string;
  nom: string;
  type: TypeSalle;
  capacite: number;
  statut: StatutSalle;
  equipements: Equipement[];
  batiment?: string;
  etage?: number;
  createdAt: string;
  updatedAt: string;
}

interface Equipement {
  id: string;
  nom: string;
  description?: string;
}
```

### `EvenementCalendrier`

```ts
interface EvenementCalendrier {
  id: string;
  etablissementId: string;
  anneeAcademiqueId?: string;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  type: TypeEvenement;
  createdAt: string;
  updatedAt: string;
}
```

### DTOs

```ts
interface CreateEtablissementDto {
  nom: string; code: string; type: TypeEtablissement;
  adresse: string; ville: string; pays: string;
  telephone: string; email: string;
  siteWeb?: string;
}

interface UpdateEtablissementDto extends Partial<CreateEtablissementDto> {
  actif?: boolean;
}

interface CreateCampusDto {
  etablissementId: string;
  nom: string; code: string;
  adresse: string; ville: string;
  telephoneDirecteur?: string;
  principal?: boolean;
}

interface UpdateCampusDto extends Partial<CreateCampusDto> {
  actif?: boolean;
}

interface CreateAnneeAcademiqueDto {
  etablissementId: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  typePeriode: TypePeriode;
}

interface UpdateAnneeAcademiqueDto extends Partial<CreateAnneeAcademiqueDto> {
  statut?: StatutAnnee;
  active?: boolean;
}

interface CreatePeriodeDto {
  anneeAcademiqueId: string;
  libelle: string;
  numero: number;
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
}

interface CreateSalleDto {
  campusId: string;
  code: string; nom: string;
  type: TypeSalle;
  capacite: number;
  equipements?: Equipement[];
  batiment?: string;
  etage?: number;
}

interface UpdateSalleDto extends Partial<CreateSalleDto> {
  statut?: StatutSalle;
}

interface EtablissementFilters {
  search?: string;
  type?: TypeEtablissement;
  actif?: boolean;
  page?: number;
  limit?: number;
}

interface SalleFilters {
  campusId?: string;
  type?: TypeSalle;
  statut?: StatutSalle;
  capaciteMin?: number;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Établissements

### GET /etablissements

Liste paginée des établissements.

**Source frontend** : `EtablissementApiService.getEtablissements()` ([etablissement-api.service.ts:38](../../src/app/core/services/etablissement-api.service.ts#L38))

**Query parameters** : tous les champs de `EtablissementFilters`.

**Response 200** — `PaginatedResponse<Etablissement>`

---

### GET /etablissements/{id}

Détail d'un établissement.

**Source frontend** : `EtablissementApiService.getEtablissement()` ([etablissement-api.service.ts:48](../../src/app/core/services/etablissement-api.service.ts#L48))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Etablissement>`

---

### POST /etablissements

Crée un établissement.

**Source frontend** : `EtablissementApiService.createEtablissement()` ([etablissement-api.service.ts:52](../../src/app/core/services/etablissement-api.service.ts#L52))

**Request body** : `CreateEtablissementDto`

**Response 201** — `ApiResponse<Etablissement>`

**Erreurs**
- `409` `code` déjà utilisé

---

### PATCH /etablissements/{id}

Modifie un établissement.

**Source frontend** : `EtablissementApiService.updateEtablissement()` ([etablissement-api.service.ts:56](../../src/app/core/services/etablissement-api.service.ts#L56))

**Path parameters** : `id: UUID`

**Request body** : `UpdateEtablissementDto`

**Response 200** — `ApiResponse<Etablissement>`

---

### DELETE /etablissements/{id}

Supprime un établissement.

**Source frontend** : `EtablissementApiService.deleteEtablissement()` ([etablissement-api.service.ts:60](../../src/app/core/services/etablissement-api.service.ts#L60))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` établissement contient encore des données (campus, inscriptions, etc.)

---

## Endpoints — Campus

### GET /etablissements/{etablissementId}/campus

Liste des campus d'un établissement.

**Source frontend** : `EtablissementApiService.getCampusByEtablissement()` ([etablissement-api.service.ts:66](../../src/app/core/services/etablissement-api.service.ts#L66))

**Path parameters** : `etablissementId: UUID`

**Response 200** — `ApiResponse<Campus[]>`

---

### GET /campus/{id}

Détail d'un campus.

**Source frontend** : `EtablissementApiService.getCampus()` ([etablissement-api.service.ts:70](../../src/app/core/services/etablissement-api.service.ts#L70))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Campus>`

---

### POST /campus

Crée un campus.

**Source frontend** : `EtablissementApiService.createCampus()` ([etablissement-api.service.ts:74](../../src/app/core/services/etablissement-api.service.ts#L74))

**Request body** : `CreateCampusDto`

**Response 201** — `ApiResponse<Campus>`

---

### PATCH /campus/{id}

Modifie un campus.

**Source frontend** : `EtablissementApiService.updateCampus()` ([etablissement-api.service.ts:78](../../src/app/core/services/etablissement-api.service.ts#L78))

**Path parameters** : `id: UUID`

**Request body** : `UpdateCampusDto`

**Response 200** — `ApiResponse<Campus>`

---

### DELETE /campus/{id}

Supprime un campus.

**Source frontend** : `EtablissementApiService.deleteCampus()` ([etablissement-api.service.ts:82](../../src/app/core/services/etablissement-api.service.ts#L82))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Années académiques

### GET /etablissements/{etablissementId}/annees-academiques

Liste des années académiques d'un établissement.

**Source frontend** : `EtablissementApiService.getAnneesAcademiques()` ([etablissement-api.service.ts:88](../../src/app/core/services/etablissement-api.service.ts#L88))

**Path parameters** : `etablissementId: UUID`

**Response 200** — `ApiResponse<AnneeAcademique[]>`

---

### GET /annees-academiques/{id}

Détail d'une année académique.

**Source frontend** : `EtablissementApiService.getAnneeAcademique()` ([etablissement-api.service.ts:92](../../src/app/core/services/etablissement-api.service.ts#L92))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<AnneeAcademique>`

---

### POST /annees-academiques

Crée une année académique.

**Source frontend** : `EtablissementApiService.createAnneeAcademique()` ([etablissement-api.service.ts:96](../../src/app/core/services/etablissement-api.service.ts#L96))

**Request body** : `CreateAnneeAcademiqueDto`

**Response 201** — `ApiResponse<AnneeAcademique>`

**Erreurs**
- `409` `libelle` déjà utilisé pour cet établissement

---

### PATCH /annees-academiques/{id}

Modifie une année.

**Source frontend** : `EtablissementApiService.updateAnneeAcademique()` ([etablissement-api.service.ts:100](../../src/app/core/services/etablissement-api.service.ts#L100))

**Path parameters** : `id: UUID`

**Request body** : `UpdateAnneeAcademiqueDto`

**Response 200** — `ApiResponse<AnneeAcademique>`

---

### PATCH /annees-academiques/{id}/activer

Active une année (désactive les autres du même établissement).

**Source frontend** : `EtablissementApiService.activerAnneeAcademique()` ([etablissement-api.service.ts:104](../../src/app/core/services/etablissement-api.service.ts#L104))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<AnneeAcademique>`

---

### PATCH /annees-academiques/{id}/cloturer

Clôture une année. **Transition** : `en_cours` → `cloturee`. Empêche toute modification subséquente des données métier rattachées.

**Source frontend** : `EtablissementApiService.cloturerAnneeAcademique()` ([etablissement-api.service.ts:108](../../src/app/core/services/etablissement-api.service.ts#L108))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<AnneeAcademique>`

**Erreurs**
- `409` année a encore des bulletins non publiés ou délibérations non clôturées

---

## Endpoints — Périodes

### GET /annees-academiques/{anneeAcademiqueId}/periodes

Liste des périodes d'une année (trimestres ou semestres).

**Source frontend** : `EtablissementApiService.getPeriodes()` ([etablissement-api.service.ts:114](../../src/app/core/services/etablissement-api.service.ts#L114))

**Path parameters** : `anneeAcademiqueId: UUID`

**Response 200** — `ApiResponse<Periode[]>`

---

### POST /periodes

Crée une période.

**Source frontend** : `EtablissementApiService.createPeriode()` ([etablissement-api.service.ts:118](../../src/app/core/services/etablissement-api.service.ts#L118))

**Request body** : `CreatePeriodeDto`

**Response 201** — `ApiResponse<Periode>`

---

### PATCH /periodes/{id}

Modifie une période.

**Source frontend** : `EtablissementApiService.updatePeriode()` ([etablissement-api.service.ts:122](../../src/app/core/services/etablissement-api.service.ts#L122))

**Path parameters** : `id: UUID`

**Request body** : `Partial<CreatePeriodeDto>`

**Response 200** — `ApiResponse<Periode>`

---

### DELETE /periodes/{id}

Supprime une période.

**Source frontend** : `EtablissementApiService.deletePeriode()` ([etablissement-api.service.ts:126](../../src/app/core/services/etablissement-api.service.ts#L126))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Salles

### GET /salles

Liste paginée des salles.

**Source frontend** : `EtablissementApiService.getSalles()` ([etablissement-api.service.ts:132](../../src/app/core/services/etablissement-api.service.ts#L132))

**Query parameters** : tous les champs de `SalleFilters`.

**Response 200** — `PaginatedResponse<Salle>`

---

### GET /salles/{id}

Détail d'une salle.

**Source frontend** : `EtablissementApiService.getSalle()` ([etablissement-api.service.ts:142](../../src/app/core/services/etablissement-api.service.ts#L142))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Salle>`

---

### POST /salles

Crée une salle.

**Source frontend** : `EtablissementApiService.createSalle()` ([etablissement-api.service.ts:146](../../src/app/core/services/etablissement-api.service.ts#L146))

**Request body** : `CreateSalleDto`

**Response 201** — `ApiResponse<Salle>`

---

### PATCH /salles/{id}

Modifie une salle.

**Source frontend** : `EtablissementApiService.updateSalle()` ([etablissement-api.service.ts:150](../../src/app/core/services/etablissement-api.service.ts#L150))

**Path parameters** : `id: UUID`

**Request body** : `UpdateSalleDto`

**Response 200** — `ApiResponse<Salle>`

---

### DELETE /salles/{id}

Supprime une salle.

**Source frontend** : `EtablissementApiService.deleteSalle()` ([etablissement-api.service.ts:154](../../src/app/core/services/etablissement-api.service.ts#L154))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` salle utilisée par des séances futures

---

## Endpoints — Calendrier

### GET /etablissements/{etablissementId}/calendrier

Liste les événements calendrier d'un établissement.

**Source frontend** : `EtablissementApiService.getEvenements()` ([etablissement-api.service.ts:160](../../src/app/core/services/etablissement-api.service.ts#L160))

**Path parameters** : `etablissementId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `anneeAcademiqueId` | UUID | non | Filtre année |

**Response 200** — `ApiResponse<EvenementCalendrier[]>`

---

### POST /calendrier

Crée un événement calendrier.

**Source frontend** : `EtablissementApiService.createEvenement()` ([etablissement-api.service.ts:168](../../src/app/core/services/etablissement-api.service.ts#L168))

**Request body** : `Partial<EvenementCalendrier>` (au minimum : `etablissementId`, `titre`, `dateDebut`, `dateFin`, `type`)

**Response 201** — `ApiResponse<EvenementCalendrier>`

---

### DELETE /calendrier/{id}

Supprime un événement calendrier.

**Source frontend** : `EtablissementApiService.deleteEvenement()` ([etablissement-api.service.ts:172](../../src/app/core/services/etablissement-api.service.ts#L172))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`
