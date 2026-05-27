# Module Structure pédagogique

Hiérarchie organisationnelle : cycles → filières → niveaux → classes (mode scolaire) ou promotions + groupes (mode universitaire).

**Source frontend** : [`structure-api.service.ts`](../../src/app/core/services/structure-api.service.ts) (`StructureApiService`)

**32 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeCycle                = 'primaire' | 'secondaire' | 'superieur';
type TypeEtablissementFormation = 'scolaire' | 'universitaire';
type TypeGroupe               = 'td' | 'tp' | 'langue' | 'option' | 'sport';
type StatutClasse             = 'active' | 'archivee' | 'fermee';
type SystemeLMD               = 'licence' | 'master' | 'doctorat' | 'bts' | 'dut' | 'autre';
```

### `Cycle`

```ts
interface Cycle {
  id: string;
  etablissementId: string;
  etablissement?: Etablissement;
  libelle: string;
  code: string;
  type: TypeCycle;
  typeFormation: TypeEtablissementFormation;
  description?: string;
  actif: boolean;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}
```

### `Filiere`

```ts
interface Filiere {
  id: string;
  cycleId: string;
  cycle?: Cycle;
  etablissementId: string;
  libelle: string;
  code: string;
  description?: string;
  systemeLMD?: SystemeLMD;
  dureeAnnees?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `Niveau`

```ts
interface Niveau {
  id: string;
  filiereId: string;
  filiere?: Filiere;
  libelle: string;
  code: string;
  ordre: number;
  typeFormation: TypeEtablissementFormation;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `Classe` (mode scolaire)

```ts
interface Classe {
  id: string;
  niveauId: string;
  niveau?: Niveau;
  filiereId: string;
  filiere?: Filiere;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;
  code: string;
  capaciteMax: number;
  effectifActuel: number;
  professeurPrincipalId?: string;
  professeurPrincipalNom?: string;
  statut: StatutClasse;
  salle?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `Promotion` (mode universitaire)

```ts
interface Promotion {
  id: string;
  niveauId: string;
  niveau?: Niveau;
  filiereId: string;
  filiere?: Filiere;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;
  code: string;
  capaciteMax: number;
  effectifActuel: number;
  responsableId?: string;
  responsableNom?: string;
  statut: StatutClasse;
  groupes?: Groupe[];                 // hydratation
  createdAt: string;
  updatedAt: string;
}
```

### `Groupe`

```ts
interface Groupe {
  id: string;
  promotionId: string;
  promotion?: Promotion;
  libelle: string;
  code: string;
  type: TypeGroupe;
  capaciteMax: number;
  effectifActuel: number;
  enseignantId?: string;
  enseignantNom?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `StatsStructure`

```ts
interface StatsStructure {
  totalCycles: number;
  totalFilieres: number;
  totalNiveaux: number;
  totalClasses: number;
  totalPromotions: number;
  totalGroupes: number;
  effectifTotal: number;
  effectifScolaire: number;
  effectifUniversitaire: number;
  tauxRemplissage: number;            // %
}
```

### DTOs

```ts
interface CreateCycleDto {
  etablissementId: string;
  libelle: string; code: string;
  type: TypeCycle;
  typeFormation: TypeEtablissementFormation;
  description?: string;
  ordre?: number;
}
interface UpdateCycleDto extends Partial<CreateCycleDto> { actif?: boolean; }

interface CreateFiliereDto {
  cycleId: string;
  etablissementId: string;
  libelle: string; code: string;
  description?: string;
  systemeLMD?: SystemeLMD;
  dureeAnnees?: number;
}
interface UpdateFiliereDto extends Partial<CreateFiliereDto> { actif?: boolean; }

interface CreateNiveauDto {
  filiereId: string;
  libelle: string; code: string;
  ordre: number;
  typeFormation: TypeEtablissementFormation;
}
interface UpdateNiveauDto extends Partial<CreateNiveauDto> { actif?: boolean; }

interface CreateClasseDto {
  niveauId: string;
  filiereId: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string; code: string;
  capaciteMax: number;
  professeurPrincipalId?: string;
  salle?: string;
}
interface UpdateClasseDto extends Partial<CreateClasseDto> { statut?: StatutClasse; }

interface CreatePromotionDto {
  niveauId: string;
  filiereId: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string; code: string;
  capaciteMax: number;
  responsableId?: string;
}
interface UpdatePromotionDto extends Partial<CreatePromotionDto> { statut?: StatutClasse; }

interface CreateGroupeDto {
  promotionId: string;
  libelle: string; code: string;
  type: TypeGroupe;
  capaciteMax: number;
  enseignantId?: string;
}
interface UpdateGroupeDto extends Partial<CreateGroupeDto> { actif?: boolean; }

interface ClasseFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  filiereId?: string;
  niveauId?: string;
  statut?: StatutClasse;
  search?: string;
  page?: number;
  limit?: number;
}

interface PromotionFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  filiereId?: string;
  niveauId?: string;
  statut?: StatutClasse;
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Cycles

### GET /cycles

Liste des cycles d'un établissement.

**Source frontend** : `StructureApiService.getCycles()` ([structure-api.service.ts:24](../../src/app/core/services/structure-api.service.ts#L24))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<Cycle[]>`

---

### GET /cycles/{id}

Détail d'un cycle.

**Source frontend** : `StructureApiService.getCycle()` ([structure-api.service.ts:30](../../src/app/core/services/structure-api.service.ts#L30))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Cycle>`

---

### POST /cycles

Crée un cycle.

**Source frontend** : `StructureApiService.createCycle()` ([structure-api.service.ts:34](../../src/app/core/services/structure-api.service.ts#L34))

**Request body** : `CreateCycleDto`

**Response 201** — `ApiResponse<Cycle>`

---

### PATCH /cycles/{id}

Modifie un cycle.

**Source frontend** : `StructureApiService.updateCycle()` ([structure-api.service.ts:38](../../src/app/core/services/structure-api.service.ts#L38))

**Path parameters** : `id: UUID`

**Request body** : `UpdateCycleDto`

**Response 200** — `ApiResponse<Cycle>`

---

### DELETE /cycles/{id}

Supprime un cycle.

**Source frontend** : `StructureApiService.deleteCycle()` ([structure-api.service.ts:42](../../src/app/core/services/structure-api.service.ts#L42))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` cycle contient encore des filières

---

## Endpoints — Filières

### GET /filieres

Liste des filières.

**Source frontend** : `StructureApiService.getFilieres()` ([structure-api.service.ts:48](../../src/app/core/services/structure-api.service.ts#L48))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | non | |
| `cycleId` | UUID | non | |

**Response 200** — `ApiResponse<Filiere[]>`

---

### GET /filieres/{id}

Détail d'une filière.

**Source frontend** : `StructureApiService.getFiliere()` ([structure-api.service.ts:55](../../src/app/core/services/structure-api.service.ts#L55))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Filiere>`

---

### POST /filieres

Crée une filière.

**Source frontend** : `StructureApiService.createFiliere()` ([structure-api.service.ts:59](../../src/app/core/services/structure-api.service.ts#L59))

**Request body** : `CreateFiliereDto`

**Response 201** — `ApiResponse<Filiere>`

---

### PATCH /filieres/{id}

Modifie une filière.

**Source frontend** : `StructureApiService.updateFiliere()` ([structure-api.service.ts:63](../../src/app/core/services/structure-api.service.ts#L63))

**Path parameters** : `id: UUID`

**Request body** : `UpdateFiliereDto`

**Response 200** — `ApiResponse<Filiere>`

---

### DELETE /filieres/{id}

Supprime une filière.

**Source frontend** : `StructureApiService.deleteFiliere()` ([structure-api.service.ts:67](../../src/app/core/services/structure-api.service.ts#L67))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` filière contient encore des niveaux ou des inscriptions

---

## Endpoints — Niveaux

### GET /niveaux

Liste des niveaux d'une filière.

**Source frontend** : `StructureApiService.getNiveaux()` ([structure-api.service.ts:73](../../src/app/core/services/structure-api.service.ts#L73))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `filiereId` | UUID | oui | |

**Response 200** — `ApiResponse<Niveau[]>`

---

### POST /niveaux

Crée un niveau.

**Source frontend** : `StructureApiService.createNiveau()` ([structure-api.service.ts:79](../../src/app/core/services/structure-api.service.ts#L79))

**Request body** : `CreateNiveauDto`

**Response 201** — `ApiResponse<Niveau>`

---

### PATCH /niveaux/{id}

Modifie un niveau.

**Source frontend** : `StructureApiService.updateNiveau()` ([structure-api.service.ts:83](../../src/app/core/services/structure-api.service.ts#L83))

**Path parameters** : `id: UUID`

**Request body** : `UpdateNiveauDto`

**Response 200** — `ApiResponse<Niveau>`

---

### DELETE /niveaux/{id}

Supprime un niveau.

**Source frontend** : `StructureApiService.deleteNiveau()` ([structure-api.service.ts:87](../../src/app/core/services/structure-api.service.ts#L87))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` niveau utilisé par classes/promotions actives

---

## Endpoints — Classes

### GET /classes

Liste paginée des classes.

**Source frontend** : `StructureApiService.getClasses()` ([structure-api.service.ts:93](../../src/app/core/services/structure-api.service.ts#L93))

**Query parameters** : tous les champs de `ClasseFilters`.

**Response 200** — `PaginatedResponse<Classe>`

---

### GET /classes/{id}

Détail d'une classe.

**Source frontend** : `StructureApiService.getClasse()` ([structure-api.service.ts:103](../../src/app/core/services/structure-api.service.ts#L103))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Classe>`

---

### POST /classes

Crée une classe.

**Source frontend** : `StructureApiService.createClasse()` ([structure-api.service.ts:107](../../src/app/core/services/structure-api.service.ts#L107))

**Request body** : `CreateClasseDto`

**Response 201** — `ApiResponse<Classe>`

---

### PATCH /classes/{id}

Modifie une classe.

**Source frontend** : `StructureApiService.updateClasse()` ([structure-api.service.ts:111](../../src/app/core/services/structure-api.service.ts#L111))

**Path parameters** : `id: UUID`

**Request body** : `UpdateClasseDto`

**Response 200** — `ApiResponse<Classe>`

---

### DELETE /classes/{id}

Supprime une classe.

**Source frontend** : `StructureApiService.deleteClasse()` ([structure-api.service.ts:115](../../src/app/core/services/structure-api.service.ts#L115))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` classe contient encore des inscriptions actives

---

### GET /classes/{classeId}/apprenants

Liste les apprenants inscrits à une classe.

**Source frontend** : `StructureApiService.getApprenantsByClasse()` ([structure-api.service.ts:119](../../src/app/core/services/structure-api.service.ts#L119))

**Path parameters** : `classeId: UUID`

**Response 200** — `ApiResponse<Apprenant[]>`

---

## Endpoints — Promotions

### GET /promotions

Liste paginée des promotions.

**Source frontend** : `StructureApiService.getPromotions()` ([structure-api.service.ts:127](../../src/app/core/services/structure-api.service.ts#L127))

**Query parameters** : tous les champs de `PromotionFilters`.

**Response 200** — `PaginatedResponse<Promotion>`

---

### GET /promotions/{id}

Détail d'une promotion (avec groupes hydratés).

**Source frontend** : `StructureApiService.getPromotion()` ([structure-api.service.ts:139](../../src/app/core/services/structure-api.service.ts#L139))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Promotion>`

---

### POST /promotions

Crée une promotion.

**Source frontend** : `StructureApiService.createPromotion()` ([structure-api.service.ts:143](../../src/app/core/services/structure-api.service.ts#L143))

**Request body** : `CreatePromotionDto`

**Response 201** — `ApiResponse<Promotion>`

---

### PATCH /promotions/{id}

Modifie une promotion.

**Source frontend** : `StructureApiService.updatePromotion()` ([structure-api.service.ts:147](../../src/app/core/services/structure-api.service.ts#L147))

**Path parameters** : `id: UUID`

**Request body** : `UpdatePromotionDto`

**Response 200** — `ApiResponse<Promotion>`

---

### DELETE /promotions/{id}

Supprime une promotion.

**Source frontend** : `StructureApiService.deletePromotion()` ([structure-api.service.ts:153](../../src/app/core/services/structure-api.service.ts#L153))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

### GET /promotions/{promotionId}/etudiants

Liste les étudiants d'une promotion.

**Source frontend** : `StructureApiService.getEtudiantsByPromotion()` ([structure-api.service.ts:157](../../src/app/core/services/structure-api.service.ts#L157))

**Path parameters** : `promotionId: UUID`

**Response 200** — `ApiResponse<Apprenant[]>`

---

## Endpoints — Groupes

### GET /promotions/{promotionId}/groupes

Liste les groupes d'une promotion.

**Source frontend** : `StructureApiService.getGroupesByPromotion()` ([structure-api.service.ts:165](../../src/app/core/services/structure-api.service.ts#L165))

**Path parameters** : `promotionId: UUID`

**Response 200** — `ApiResponse<Groupe[]>`

---

### POST /groupes

Crée un groupe.

**Source frontend** : `StructureApiService.createGroupe()` ([structure-api.service.ts:171](../../src/app/core/services/structure-api.service.ts#L171))

**Request body** : `CreateGroupeDto`

**Response 201** — `ApiResponse<Groupe>`

---

### PATCH /groupes/{id}

Modifie un groupe.

**Source frontend** : `StructureApiService.updateGroupe()` ([structure-api.service.ts:175](../../src/app/core/services/structure-api.service.ts#L175))

**Path parameters** : `id: UUID`

**Request body** : `UpdateGroupeDto`

**Response 200** — `ApiResponse<Groupe>`

---

### DELETE /groupes/{id}

Supprime un groupe.

**Source frontend** : `StructureApiService.deleteGroupe()` ([structure-api.service.ts:179](../../src/app/core/services/structure-api.service.ts#L179))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Stats

### GET /structure/stats

Statistiques agrégées de la structure d'un établissement.

**Source frontend** : `StructureApiService.getStats()` ([structure-api.service.ts:185](../../src/app/core/services/structure-api.service.ts#L185))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | non | |

**Response 200** — `ApiResponse<StatsStructure>`
