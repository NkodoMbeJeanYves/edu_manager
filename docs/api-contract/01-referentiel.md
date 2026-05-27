# Module Référentiel pédagogique

Matières, Unités d'Enseignement (UE), programmes, statistiques. Modélise le catalogue pédagogique d'un établissement.

**Source frontend** : [`referentiel-api.service.ts`](../../src/app/core/services/referentiel-api.service.ts) (`ReferentielApiService`)

**18 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeMatiere = 'cours_magistral' | 'td' | 'tp' | 'projet' | 'stage'
                 | 'memoire' | 'seminaire' | 'sport' | 'langue';

type TypeUE = 'fondamentale' | 'complementaire' | 'optionnelle' | 'libre';

type NatureEvaluation = 'cc_uniquement' | 'examen_uniquement' | 'cc_et_examen'
                      | 'tp_et_examen' | 'projet_soutenance';
```

### `Matiere`

```ts
interface Matiere {
  id: string;
  etablissementId: string;
  filiereId?: string;
  niveauId?: string;
  ueId?: string;
  anneeAcademiqueId?: string;
  code: string;                       // ex. "MATH101"
  libelle: string;
  type: TypeMatiere;
  coefficient: number;
  volumeHoraireCM: number;            // cours magistraux
  volumeHoraireTD: number;
  volumeHoraireTP: number;
  volumeHoraireTotal: number;         // calculé serveur = CM+TD+TP
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;              // % contrôle continu
  ponderationExamen: number;          // % examen final (CC+Ex = 100)
  eliminatoire: boolean;
  seuilEliminatoire?: number;
  noteMax: number;                    // ex. 20
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  // hydratations possibles selon scope
  filiere?: Filiere;
  niveau?: Niveau;
  anneeAcademique?: AnneeAcademique;
}
```

### `UE`

```ts
interface UE {
  id: string;
  etablissementId: string;
  filiereId: string;
  niveauId: string;
  anneeAcademiqueId?: string;
  semestre: number;                   // 1 ou 2
  code: string;
  libelle: string;
  type: TypeUE;
  credits: number;                    // crédits ECTS
  coefficient: number;
  volumeHoraireTotal: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire: boolean;
  seuilValidation: number;            // ex. 10/20
  compensable: boolean;               // peut être compensée par autres UE
  matieres?: Matiere[];               // hydratation
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `Programme`

```ts
interface Programme {
  id: string;
  etablissementId: string;
  filiereId: string;
  niveauId: string;
  anneeAcademiqueId: string;
  libelle: string;
  typeFormation: 'scolaire' | 'universitaire';
  ues?: UE[];                         // hydratation
  matieres?: Matiere[];               // hydratation (matières non rattachées à une UE)
  totalCredits?: number;
  totalVolumeHoraire?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### `StatsReferentiel`

```ts
interface StatsReferentiel {
  totalMatieres: number;
  totalUE: number;
  totalProgrammes: number;
  matieresScolaires: number;
  matieresUniversitaires: number;
  matieresEliminatoires: number;
  totalCreditsParNiveau: {
    niveauId: string;
    niveauLibelle: string;
    credits: number;
  }[];
}
```

### DTOs

```ts
interface CreateMatiereDto {
  etablissementId: string;
  filiereId?: string;
  niveauId?: string;
  ueId?: string;
  anneeAcademiqueId?: string;
  code: string;
  libelle: string;
  type: TypeMatiere;
  coefficient: number;
  volumeHoraireCM?: number;
  volumeHoraireTD?: number;
  volumeHoraireTP?: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;              // CC + Ex doivent sommer 100
  ponderationExamen: number;
  eliminatoire?: boolean;
  seuilEliminatoire?: number;
  noteMax?: number;                   // défaut 20
}

interface UpdateMatiereDto extends Partial<CreateMatiereDto> {
  actif?: boolean;
}

interface CreateUEDto {
  etablissementId: string;
  filiereId: string;
  niveauId: string;
  anneeAcademiqueId?: string;
  semestre: number;
  code: string;
  libelle: string;
  type: TypeUE;
  credits: number;
  coefficient: number;
  volumeHoraireTotal?: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire?: boolean;
  seuilValidation?: number;
  compensable?: boolean;
}

interface UpdateUEDto extends Partial<CreateUEDto> {
  actif?: boolean;
}

interface RattacherMatiereUEDto {
  matiereId: string;
  ueId: string;
  coefficient?: number;
}

interface DupliquerReferentielDto {
  sourceAnneeId: string;
  targetAnneeId: string;
  filiereId?: string;                 // si non fourni, duplique toutes les filières
  niveauId?: string;
}

interface MatiereFilters {
  etablissementId?: string;
  filiereId?: string;
  niveauId?: string;
  ueId?: string;
  anneeAcademiqueId?: string;
  type?: TypeMatiere;
  eliminatoire?: boolean;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface UEFilters {
  etablissementId?: string;
  filiereId?: string;
  niveauId?: string;
  anneeAcademiqueId?: string;
  semestre?: number;
  type?: TypeUE;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Matières

### GET /matieres

Liste paginée des matières.

**Source frontend** : `ReferentielApiService.getMatieres()` ([referentiel-api.service.ts:21](../../src/app/core/services/referentiel-api.service.ts#L21))

**Query parameters** : tous les champs de `MatiereFilters`.

**Response 200** — `PaginatedResponse<Matiere>`

---

### GET /matieres/{id}

Détail d'une matière (avec hydratations `filiere`, `niveau`, `anneeAcademique` côté back si pertinent).

**Source frontend** : `ReferentielApiService.getMatiere()` ([referentiel-api.service.ts:33](../../src/app/core/services/referentiel-api.service.ts#L33))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Matiere>`

**Erreurs**
- `404`

---

### POST /matieres

Crée une matière. Le serveur calcule `volumeHoraireTotal = CM + TD + TP`.

**Source frontend** : `ReferentielApiService.createMatiere()` ([referentiel-api.service.ts:37](../../src/app/core/services/referentiel-api.service.ts#L37))

**Request body** : `CreateMatiereDto`

**Response 201** — `ApiResponse<Matiere>`

**Erreurs**
- `409` `code` déjà utilisé dans le tenant
- `422` `ponderationCC + ponderationExamen ≠ 100`

---

### PATCH /matieres/{id}

Modifie une matière.

**Source frontend** : `ReferentielApiService.updateMatiere()` ([referentiel-api.service.ts:41](../../src/app/core/services/referentiel-api.service.ts#L41))

**Path parameters** : `id: UUID`

**Request body** : `UpdateMatiereDto`

**Response 200** — `ApiResponse<Matiere>`

---

### DELETE /matieres/{id}

Supprime une matière.

**Source frontend** : `ReferentielApiService.deleteMatiere()` ([referentiel-api.service.ts:47](../../src/app/core/services/referentiel-api.service.ts#L47))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` matière utilisée par des évaluations ou rattachée à une UE active

---

### GET /matieres/by-niveau

Liste les matières d'un niveau (sans pagination).

**Source frontend** : `ReferentielApiService.getMatieresByNiveau()` ([referentiel-api.service.ts:51](../../src/app/core/services/referentiel-api.service.ts#L51))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `niveauId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | non | Filtre année |

**Response 200** — `ApiResponse<Matiere[]>`

---

### GET /ue/{ueId}/matieres

Liste les matières rattachées à une UE.

**Source frontend** : `ReferentielApiService.getMatieresByUE()` ([referentiel-api.service.ts:62](../../src/app/core/services/referentiel-api.service.ts#L62))

**Path parameters** : `ueId: UUID`

**Response 200** — `ApiResponse<Matiere[]>`

---

### PATCH /matieres/{matiereId}/rattacher-ue

Rattache une matière à une UE.

**Source frontend** : `ReferentielApiService.rattacherMatiereUE()` ([referentiel-api.service.ts:68](../../src/app/core/services/referentiel-api.service.ts#L68))

**Path parameters** : `matiereId: UUID`

**Request body** : `RattacherMatiereUEDto`

**Response 200** — `ApiResponse<Matiere>`

**Erreurs**
- `404` matière ou UE introuvable
- `409` matière déjà rattachée à une UE

---

### PATCH /matieres/{matiereId}/detacher-ue

Détache une matière de son UE.

**Source frontend** : `ReferentielApiService.detacherMatiereUE()` ([referentiel-api.service.ts:74](../../src/app/core/services/referentiel-api.service.ts#L74))

**Path parameters** : `matiereId: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Matiere>`

---

## Endpoints — UE

### GET /ue

Liste paginée des UE.

**Source frontend** : `ReferentielApiService.getUEs()` ([referentiel-api.service.ts:82](../../src/app/core/services/referentiel-api.service.ts#L82))

**Query parameters** : tous les champs de `UEFilters`.

**Response 200** — `PaginatedResponse<UE>`

---

### GET /ue/{id}

Détail d'une UE (avec ses matières hydratées).

**Source frontend** : `ReferentielApiService.getUE()` ([referentiel-api.service.ts:92](../../src/app/core/services/referentiel-api.service.ts#L92))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<UE>`

---

### GET /ue/by-niveau

Liste les UE d'un niveau, optionnellement par semestre.

**Source frontend** : `ReferentielApiService.getUEByNiveau()` ([referentiel-api.service.ts:96](../../src/app/core/services/referentiel-api.service.ts#L96))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `niveauId` | UUID | oui | |
| `semestre` | number | non | 1 ou 2 |
| `anneeAcademiqueId` | UUID | non | |

**Response 200** — `ApiResponse<UE[]>`

---

### POST /ue

Crée une UE.

**Source frontend** : `ReferentielApiService.createUE()` ([referentiel-api.service.ts:109](../../src/app/core/services/referentiel-api.service.ts#L109))

**Request body** : `CreateUEDto`

**Response 201** — `ApiResponse<UE>`

**Erreurs**
- `409` `code` déjà utilisé
- `422` ponderation CC + Ex ≠ 100

---

### PATCH /ue/{id}

Modifie une UE.

**Source frontend** : `ReferentielApiService.updateUE()` ([referentiel-api.service.ts:113](../../src/app/core/services/referentiel-api.service.ts#L113))

**Path parameters** : `id: UUID`

**Request body** : `UpdateUEDto`

**Response 200** — `ApiResponse<UE>`

---

### DELETE /ue/{id}

Supprime une UE. **Cascade** : ses matières sont détachées (pas supprimées).

**Source frontend** : `ReferentielApiService.deleteUE()` ([referentiel-api.service.ts:117](../../src/app/core/services/referentiel-api.service.ts#L117))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Programmes & utilitaires

### GET /programmes

Récupère le programme (UE + matières) d'un niveau pour une année donnée.

**Source frontend** : `ReferentielApiService.getProgramme()` ([referentiel-api.service.ts:123](../../src/app/core/services/referentiel-api.service.ts#L123))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `niveauId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | oui | |

**Response 200** — `ApiResponse<Programme>`

---

### POST /referentiel/dupliquer

Duplique tout le référentiel (matières + UE) d'une année source vers une année cible. Utile pour démarrer une nouvelle année avec le programme précédent.

**Source frontend** : `ReferentielApiService.dupliquerReferentiel()` ([referentiel-api.service.ts:135](../../src/app/core/services/referentiel-api.service.ts#L135))

**Request body** : `DupliquerReferentielDto`

**Response 200** — `ApiResponse<{ count: number }>` — nombre d'entités dupliquées

**Erreurs**
- `404` année source ou cible inconnue
- `409` année cible déjà initialisée (référentiel non vide)

---

### GET /referentiel/stats

Statistiques globales du référentiel.

**Source frontend** : `ReferentielApiService.getStats()` ([referentiel-api.service.ts:143](../../src/app/core/services/referentiel-api.service.ts#L143))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<StatsReferentiel>`
