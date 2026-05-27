# Module Notes & Évaluations

Évaluations, notes individuelles, saisie de masse, workflow soumission/validation/publication, moyennes (matière/UE/générale) et appréciations.

**Source frontend** : [`note-api.service.ts`](../../src/app/core/services/note-api.service.ts) (`NoteApiService`)

**21 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeEvaluation = 'cc' | 'partiel' | 'examen_final' | 'tp' | 'oral' | 'projet' | 'devoir_maison' | 'rattrapage';

type StatutNote        = 'brouillon' | 'soumise' | 'validee' | 'publiee';
type StatutMoyenne     = 'en_cours' | 'calculee' | 'validee';
type StatutEvaluation  = 'planifiee' | 'en_cours' | 'cloturee' | 'annulee';
```

> **Workflow notes** : créées en `brouillon` lors de la saisie → `soumise` après `/soumettre` → `validee` après `/valider` (rôles `validate`) → `publiee` après `/publier` (rôles `publish`). Visibles par l'apprenant/parent uniquement en statut `publiee`.

### `Evaluation`

```ts
interface Evaluation {
  id: string;
  matiereId: string;
  matiereLibelle?: string;
  periodeId: string;
  periodeLibelle?: string;
  anneeAcademiqueId: string;
  classeId?: string;                  // une éval cible classe OU promotion
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  enseignantId: string;
  enseignantNom?: string;
  intitule: string;
  type: TypeEvaluation;
  ponderation: number;                // poids dans la moyenne matière (%)
  coefficient: number;
  noteMax: number;                    // ex. 20
  dateEvaluation: string;
  statut: StatutEvaluation;
  noteSaisieCount?: number;
  totalApprenants?: number;
  createdAt: string;
  updatedAt: string;
}
```

### `Note`

```ts
interface Note {
  id: string;
  evaluationId: string;
  evaluation?: Evaluation;
  apprenantId: string;
  apprenant?: Apprenant;
  valeur: number | null;              // null si absent ou non saisie
  absent: boolean;
  dispense: boolean;
  commentaire?: string;
  statut: StatutNote;
  saisieParId?: string;
  saisieParNom?: string;
  valideParId?: string;
  valideParNom?: string;
  motifModification?: string;
  historiqueModifications?: HistoriqueNote[];
  createdAt: string;
  updatedAt: string;
}

interface HistoriqueNote {
  ancienneValeur: number | null;
  nouvelleValeur: number | null;
  modifiePar: string;                 // userId ou nom
  motif: string;
  date: string;
}
```

### `MoyenneMatiere`

```ts
interface MoyenneMatiere {
  matiereId: string;
  matiereLibelle: string;
  matiereCode: string;
  coefficient: number;
  apprenantId: string;
  periodeId: string;
  moyenne: number | null;
  noteCC?: number | null;
  notePartiel?: number | null;
  noteExamen?: number | null;
  appreciationEnseignant?: string;
  elimitatoire: boolean;
  seusilEliminatoire?: number;
  statut: StatutMoyenne;
}
```

### `MoyenneUE`

```ts
interface MoyenneUE {
  ueId: string;
  ueCode: string;
  ueLibelle: string;
  credits: number;
  apprenantId: string;
  semestreId: string;
  moyenne: number | null;
  credits_acquis: number;
  validee: boolean;
  elimitatoire: boolean;
  matieres: MoyenneMatiere[];
  statut: StatutMoyenne;
}
```

### `MoyenneGenerale`

```ts
interface MoyenneGenerale {
  apprenantId: string;
  apprenant?: Apprenant;
  periodeId?: string;
  anneeAcademiqueId: string;
  moyenne: number | null;
  rang?: number;
  totalApprenants?: number;
  mention?: string;                   // ex. "Bien", "Très bien"
  ectsAcquis?: number;
  ectsTotal?: number;
  validee: boolean;
  moyennesMatiere?: MoyenneMatiere[];
  moyennesUE?: MoyenneUE[];
  statut: StatutMoyenne;
}
```

### `StatistiquesEvaluation`

```ts
interface StatistiquesEvaluation {
  evaluationId: string;
  total: number;                      // nb apprenants total
  notesSaisies: number;
  absents: number;
  dispenses: number;
  moyenne: number;
  noteMin: number;
  noteMax: number;
  tauxReussite: number;               // % au-dessus de 10
  distribution: { tranche: string; count: number }[];  // ex. "0-5", "5-10", "10-15", "15-20"
}
```

### DTOs

```ts
interface CreateEvaluationDto {
  matiereId: string;
  periodeId: string;
  anneeAcademiqueId: string;
  classeId?: string;
  promotionId?: string;
  enseignantId: string;
  intitule: string;
  type: TypeEvaluation;
  ponderation: number;
  coefficient: number;
  noteMax?: number;                   // défaut 20
  dateEvaluation: string;
}

interface UpdateEvaluationDto extends Partial<CreateEvaluationDto> {
  statut?: StatutEvaluation;
}

interface CreateNoteDto {
  evaluationId: string;
  apprenantId: string;
  valeur: number | null;
  absent?: boolean;
  dispense?: boolean;
  commentaire?: string;
}

interface UpdateNoteDto {
  valeur?: number | null;
  absent?: boolean;
  dispense?: boolean;
  commentaire?: string;
  motifModification?: string;         // requis si la note a déjà été validée
}

interface SaisieNoteMasse {
  evaluationId: string;
  notes: {
    apprenantId: string;
    valeur: number | null;
    absent?: boolean;
    dispense?: boolean;
    commentaire?: string;
  }[];
}

interface ValiderNotesDto {
  evaluationId: string;
  commentaire?: string;
}

interface PublierNotesDto {
  evaluationId: string;
}

interface ApprecierMatiereDto {
  matiereId: string;
  apprenantId: string;
  periodeId: string;
  appreciation: string;
}

interface EvaluationFilters {
  matiereId?: string;
  periodeId?: string;
  anneeAcademiqueId?: string;
  classeId?: string;
  promotionId?: string;
  enseignantId?: string;
  type?: TypeEvaluation;
  statut?: StatutEvaluation;
  page?: number;
  limit?: number;
}

interface NoteFilters {
  evaluationId?: string;
  apprenantId?: string;
  matiereId?: string;
  periodeId?: string;
  statut?: StatutNote;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Évaluations

### GET /evaluations

Liste paginée des évaluations.

**Source frontend** : `NoteApiService.getEvaluations()` ([note-api.service.ts:22](../../src/app/core/services/note-api.service.ts#L22))

**Query parameters** : tous les champs de `EvaluationFilters`.

**Response 200** — `PaginatedResponse<Evaluation>`

---

### GET /evaluations/{id}

Détail d'une évaluation.

**Source frontend** : `NoteApiService.getEvaluation()` ([note-api.service.ts:34](../../src/app/core/services/note-api.service.ts#L34))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Evaluation>`

---

### POST /evaluations

Crée une évaluation.

**Source frontend** : `NoteApiService.createEvaluation()` ([note-api.service.ts:38](../../src/app/core/services/note-api.service.ts#L38))

**Request body** : `CreateEvaluationDto`

**Response 201** — `ApiResponse<Evaluation>` (statut `planifiee`)

---

### PATCH /evaluations/{id}

Modifie une évaluation.

**Source frontend** : `NoteApiService.updateEvaluation()` ([note-api.service.ts:42](../../src/app/core/services/note-api.service.ts#L42))

**Path parameters** : `id: UUID`

**Request body** : `UpdateEvaluationDto`

**Response 200** — `ApiResponse<Evaluation>`

---

### DELETE /evaluations/{id}

Supprime une évaluation. **Cascade** : les notes associées sont supprimées.

**Source frontend** : `NoteApiService.deleteEvaluation()` ([note-api.service.ts:48](../../src/app/core/services/note-api.service.ts#L48))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` évaluation contient des notes publiées

---

### PATCH /evaluations/{id}/cloturer

Clôture une évaluation (interdit nouvelle saisie sans réouverture admin).

**Source frontend** : `NoteApiService.cloturerEvaluation()` ([note-api.service.ts:52](../../src/app/core/services/note-api.service.ts#L52))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Evaluation>` (statut `cloturee`)

---

### GET /evaluations/{id}/statistiques

Stats d'une évaluation (moyenne, distribution, taux réussite).

**Source frontend** : `NoteApiService.getStatistiques()` ([note-api.service.ts:58](../../src/app/core/services/note-api.service.ts#L58))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<StatistiquesEvaluation>`

---

## Endpoints — Notes

### GET /notes

Liste paginée des notes.

**Source frontend** : `NoteApiService.getNotes()` ([note-api.service.ts:66](../../src/app/core/services/note-api.service.ts#L66))

**Query parameters** : tous les champs de `NoteFilters`.

**Response 200** — `PaginatedResponse<Note>`

---

### GET /evaluations/{evaluationId}/notes

Toutes les notes d'une évaluation.

**Source frontend** : `NoteApiService.getNotesByEvaluation()` ([note-api.service.ts:76](../../src/app/core/services/note-api.service.ts#L76))

**Path parameters** : `evaluationId: UUID`

**Response 200** — `ApiResponse<Note[]>`

---

### GET /apprenants/{apprenantId}/notes

Notes d'un apprenant (optionnellement filtrées).

**Source frontend** : `NoteApiService.getNotesByApprenant()` ([note-api.service.ts:82](../../src/app/core/services/note-api.service.ts#L82))

**Path parameters** : `apprenantId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `periodeId` | UUID | non | |
| `anneeAcademiqueId` | UUID | non | |

**Response 200** — `ApiResponse<Note[]>` (filtrées sur celles `publiees` si l'utilisateur est apprenant/parent)

---

### POST /notes

Crée une note individuelle.

**Source frontend** : `NoteApiService.createNote()` ([note-api.service.ts:95](../../src/app/core/services/note-api.service.ts#L95))

**Request body** : `CreateNoteDto`

**Response 201** — `ApiResponse<Note>` (statut initial `brouillon`)

**Erreurs**
- `422` `valeur` hors plage `[0, evaluation.noteMax]`
- `409` note déjà existante pour ce couple (evaluationId, apprenantId)

---

### PATCH /notes/{id}

Modifie une note. Si la note était déjà validée, `motifModification` est requis et un enregistrement `HistoriqueNote` est créé.

**Source frontend** : `NoteApiService.updateNote()` ([note-api.service.ts:99](../../src/app/core/services/note-api.service.ts#L99))

**Path parameters** : `id: UUID`

**Request body** : `UpdateNoteDto`

**Response 200** — `ApiResponse<Note>`

---

### POST /notes/masse

Saisie en masse (upsert) des notes d'une évaluation. Idempotent : remplace les notes existantes.

**Source frontend** : `NoteApiService.saisirNotesMasse()` ([note-api.service.ts:105](../../src/app/core/services/note-api.service.ts#L105))

**Request body** : `SaisieNoteMasse`

**Response 200** — `ApiResponse<Note[]>`

---

## Endpoints — Workflow d'évaluation

### PATCH /evaluations/{evaluationId}/soumettre

Soumet les notes pour validation. **Transition notes** : `brouillon` → `soumise`.

**Source frontend** : `NoteApiService.soumettreNotes()` ([note-api.service.ts:113](../../src/app/core/services/note-api.service.ts#L113))

**Path parameters** : `evaluationId: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Evaluation>`

**Erreurs**
- `422` notes incomplètes (pas saisies pour tous les apprenants)

---

### PATCH /evaluations/{evaluationId}/valider

Valide et publie les notes (atomique dans le mock — à confirmer côté back). **Transition notes** : `soumise` → `validee` (+ `publiee`).

**Source frontend** : `NoteApiService.validerNotes()` ([note-api.service.ts:119](../../src/app/core/services/note-api.service.ts#L119))

**Path parameters** : `evaluationId: UUID`

**Request body** : `ValiderNotesDto`

**Response 200** — `ApiResponse<Evaluation>`

**Erreurs**
- `403` rôle insuffisant (`validate` sur `notes`)

---

### PATCH /evaluations/{evaluationId}/publier

Publie les notes (rend visibles aux apprenants/parents). **Transition notes** : `validee` → `publiee`.

**Source frontend** : `NoteApiService.publierNotes()` ([note-api.service.ts:125](../../src/app/core/services/note-api.service.ts#L125))

**Path parameters** : `evaluationId: UUID`

**Request body** : `PublierNotesDto`

**Response 200** — `ApiResponse<Evaluation>`

**Erreurs**
- `403` rôle insuffisant (`publish` sur `notes`)

---

## Endpoints — Moyennes

### GET /moyennes/{classeOuPromotionId}

Moyennes générales rangées de tous les apprenants d'une classe ou promotion.

**Source frontend** : `NoteApiService.getMoyennesClasse()` ([note-api.service.ts:133](../../src/app/core/services/note-api.service.ts#L133))

**Path parameters** : `classeOuPromotionId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `periodeId` | UUID | oui | |
| `type` | `'classe' \| 'promotion'` | oui | Type de l'ID en path (défaut `classe`) |

**Response 200** — `ApiResponse<MoyenneGenerale[]>` (triées par rang)

---

### GET /apprenants/{apprenantId}/moyennes

Moyenne générale d'un apprenant pour une année (avec détails matières).

**Source frontend** : `NoteApiService.getMoyennesApprenant()` ([note-api.service.ts:146](../../src/app/core/services/note-api.service.ts#L146))

**Path parameters** : `apprenantId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `anneeAcademiqueId` | UUID | oui | |

**Response 200** — `ApiResponse<MoyenneGenerale>` (avec `moyennesMatiere` hydratées)

---

### POST /moyennes/calculer

Force le recalcul des moyennes d'une période (et optionnellement d'une classe).

**Source frontend** : `NoteApiService.calculerMoyennes()` ([note-api.service.ts:156](../../src/app/core/services/note-api.service.ts#L156))

**Request body**

```ts
{
  periodeId: string;
  classeId?: string;
}
```

**Response 200** — `ApiResponse<void>` — opération asynchrone côté back acceptable, le calcul peut être différé

---

### GET /apprenants/{apprenantId}/moyennes-ue

Moyennes par UE d'un apprenant pour un semestre (mode universitaire).

**Source frontend** : `NoteApiService.getMoyennesUE()` ([note-api.service.ts:163](../../src/app/core/services/note-api.service.ts#L163))

**Path parameters** : `apprenantId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `semestreId` | UUID | oui | (= periodeId de type semestre) |

**Response 200** — `ApiResponse<MoyenneUE[]>` (avec `matieres` hydratées)

---

## Endpoints — Appréciations

### PATCH /appreciations

Saisit ou met à jour une appréciation enseignant sur une matière × apprenant × période.

**Source frontend** : `NoteApiService.saisirAppreciation()` ([note-api.service.ts:175](../../src/app/core/services/note-api.service.ts#L175))

**Request body** : `ApprecierMatiereDto`

**Response 200** — `ApiResponse<MoyenneMatiere>` (avec `appreciationEnseignant` mise à jour)
