# Module Inscriptions

Inscriptions des apprenants (nouvelles et réinscriptions), workflow brouillon → validée, périodes d'inscription.

**Source frontend** : [`inscription-api.service.ts`](../../src/app/core/services/inscription-api.service.ts) (`InscriptionApiService`)

**19 endpoints**.

---

## Schémas du module

### Enums

```ts
type StatutInscription =
  | 'brouillon'
  | 'incomplete'
  | 'complete'
  | 'en_validation'
  | 'validee'
  | 'rejetee'
  | 'annulee'
  | 'en_attente';

type TypeInscription = 'nouvelle' | 'reinscription';
type TypeAffectation = 'classe' | 'promotion' | 'groupe';
```

> **Workflow** : `brouillon → complete → en_validation → validee | rejetee`. Transitions via endpoints dédiés (`/soumettre`, `/valider`, `/rejeter`).

### `Inscription`

```ts
interface Inscription {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;              // hydratation
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  etablissementId: string;
  type: TypeInscription;
  statut: StatutInscription;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  groupes?: GroupeInscription[];
  ueInscrites?: UeInscription[];
  numeroInscription: string;          // ex. "INS-2024-001234"
  dateInscription: string;
  dateLimiteValidation?: string;
  dateValidation?: string;
  validePar?: string;                 // userId
  motifRejet?: string;
  fraisInscription?: number;
  fraisPayes?: boolean;
  listAttente?: boolean;
  positionListeAttente?: number;
  documentsManquants?: string[];
  commentaire?: string;
  reinscriptionDepuis?: string;       // inscriptionId précédente
  createdAt: string;
  updatedAt: string;
}

interface GroupeInscription {
  groupeId: string;
  groupeCode: string;
  groupeLibelle: string;
  type: 'td' | 'tp' | 'langue' | 'option';
}

interface UeInscription {
  ueId: string;
  ueCode: string;
  ueLibelle: string;
  credits: number;
  obligatoire: boolean;
  statut: 'inscrite' | 'validee' | 'echec';
}

interface HistoriqueStatut {
  statut: StatutInscription;
  date: string;
  par: string;                        // userId ou nom
  commentaire?: string;
}
```

### `PeriodeInscription`

```ts
interface PeriodeInscription {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  type: TypeInscription;
  dateOuverture: string;
  dateCloture: string;
  ouverte: boolean;
  capaciteMax?: number;
  inscritsCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### `InscriptionStats`

```ts
interface InscriptionStats {
  total: number;
  parStatut: Record<StatutInscription, number>;
  nouvelles: number;
  reinscriptions: number;
  enAttente: number;
  validees: number;
  tauxCompletion: number;             // %
}
```

### DTOs

```ts
interface CreateInscriptionDto {
  apprenantId: string;
  anneeAcademiqueId: string;
  etablissementId: string;
  type: TypeInscription;
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
  ueInscrites?: { ueId: string }[];
  commentaire?: string;
}

interface UpdateInscriptionDto {
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
  ueInscrites?: { ueId: string }[];
  commentaire?: string;
  dateLimiteValidation?: string;
}

interface ValiderInscriptionDto {
  commentaire?: string;
}

interface RejeterInscriptionDto {
  motifRejet: string;                 // requis
}

interface AffecterClasseDto {
  inscriptionId: string;
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
}

interface CreatePeriodeInscriptionDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  type: TypeInscription;
  dateOuverture: string;
  dateCloture: string;
  capaciteMax?: number;
}

interface InscriptionFilters {
  search?: string;                    // sur numero, nom apprenant
  anneeAcademiqueId?: string;
  etablissementId?: string;
  statut?: StatutInscription;
  type?: TypeInscription;
  classeId?: string;
  promotionId?: string;
  fraisPayes?: boolean;
  listAttente?: boolean;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Inscriptions

### GET /inscriptions

Liste paginée des inscriptions.

**Source frontend** : `InscriptionApiService.getInscriptions()` ([inscription-api.service.ts:21](../../src/app/core/services/inscription-api.service.ts#L21))

**Query parameters** : tous les champs de `InscriptionFilters`.

**Response 200** — `PaginatedResponse<Inscription>`

---

### GET /inscriptions/{id}

Détail d'une inscription.

**Source frontend** : `InscriptionApiService.getInscription()` ([inscription-api.service.ts:31](../../src/app/core/services/inscription-api.service.ts#L31))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Inscription>`

---

### GET /apprenants/{apprenantId}/inscriptions

Historique des inscriptions d'un apprenant.

**Source frontend** : `InscriptionApiService.getInscriptionsByApprenant()` ([inscription-api.service.ts:35](../../src/app/core/services/inscription-api.service.ts#L35))

**Path parameters** : `apprenantId: UUID`

**Response 200** — `ApiResponse<Inscription[]>`

---

### POST /inscriptions

Crée une inscription (statut initial `brouillon`).

**Source frontend** : `InscriptionApiService.createInscription()` ([inscription-api.service.ts:41](../../src/app/core/services/inscription-api.service.ts#L41))

**Request body** : `CreateInscriptionDto`

**Response 201** — `ApiResponse<Inscription>`

**Erreurs**
- `409` apprenant déjà inscrit sur cette année académique
- `422` apprenant inéligible

---

### PATCH /inscriptions/{id}

Met à jour une inscription brouillon (classe, groupes, UE).

**Source frontend** : `InscriptionApiService.updateInscription()` ([inscription-api.service.ts:45](../../src/app/core/services/inscription-api.service.ts#L45))

**Path parameters** : `id: UUID`

**Request body** : `UpdateInscriptionDto`

**Response 200** — `ApiResponse<Inscription>`

**Erreurs**
- `409` inscription dans un statut non modifiable (déjà validée par exemple)

---

### PATCH /inscriptions/{id}/soumettre

Soumet une inscription pour validation. **Transition** : `brouillon`/`complete` → `en_validation`.

**Source frontend** : `InscriptionApiService.soumettre()` ([inscription-api.service.ts:49](../../src/app/core/services/inscription-api.service.ts#L49))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Inscription>`

**Erreurs**
- `409` statut courant ne permet pas la soumission
- `422` documents manquants ou inscription incomplète

---

### PATCH /inscriptions/{id}/valider

Valide une inscription. **Transition** : `en_validation` → `validee`.

**Source frontend** : `InscriptionApiService.valider()` ([inscription-api.service.ts:53](../../src/app/core/services/inscription-api.service.ts#L53))

**Path parameters** : `id: UUID`

**Request body** : `ValiderInscriptionDto`

**Response 200** — `ApiResponse<Inscription>` (avec `dateValidation`, `validePar` renseignés)

**Erreurs**
- `403` rôle insuffisant (`validate` sur module `inscriptions`)
- `409` statut courant ne permet pas la validation

---

### PATCH /inscriptions/{id}/rejeter

Rejette une inscription. **Transition** : `en_validation` → `rejetee`.

**Source frontend** : `InscriptionApiService.rejeter()` ([inscription-api.service.ts:57](../../src/app/core/services/inscription-api.service.ts#L57))

**Path parameters** : `id: UUID`

**Request body** : `RejeterInscriptionDto`

**Response 200** — `ApiResponse<Inscription>` (avec `motifRejet` renseigné)

---

### PATCH /inscriptions/{id}/annuler

Annule une inscription validée. **Transition** : `validee` → `annulee`.

**Source frontend** : `InscriptionApiService.annuler()` ([inscription-api.service.ts:61](../../src/app/core/services/inscription-api.service.ts#L61))

**Path parameters** : `id: UUID`

**Request body**

```ts
{ motif: string }
```

**Response 200** — `ApiResponse<Inscription>`

---

### PATCH /inscriptions/{id}/affecter

Affecte une inscription à une classe / promotion / groupes.

**Source frontend** : `InscriptionApiService.affecterClasse()` ([inscription-api.service.ts:65](../../src/app/core/services/inscription-api.service.ts#L65))

**Path parameters** : `id: UUID`

**Request body** : `AffecterClasseDto`

**Response 200** — `ApiResponse<Inscription>`

**Erreurs**
- `409` capacité de la classe ou du groupe atteinte → placement en liste d'attente

---

### GET /inscriptions/{id}/historique

Historique complet des transitions de statut.

**Source frontend** : `InscriptionApiService.getHistorique()` ([inscription-api.service.ts:71](../../src/app/core/services/inscription-api.service.ts#L71))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<HistoriqueStatut[]>` (ordonné chronologiquement)

---

### GET /inscriptions/stats

Statistiques inscriptions (optionnellement filtrées).

**Source frontend** : `InscriptionApiService.getStats()` ([inscription-api.service.ts:75](../../src/app/core/services/inscription-api.service.ts#L75))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | non | |
| `anneeAcademiqueId` | UUID | non | |

**Response 200** — `ApiResponse<InscriptionStats>`

---

## Endpoints — Réinscription

### POST /inscriptions/reinscription

Initie une réinscription (clone l'inscription précédente en brouillon).

**Source frontend** : `InscriptionApiService.initierReinscription()` ([inscription-api.service.ts:84](../../src/app/core/services/inscription-api.service.ts#L84))

**Request body**

```ts
{
  apprenantId: string;
  anneeAcademiqueId: string;
}
```

**Response 201** — `ApiResponse<Inscription>` (statut `brouillon`, `type: 'reinscription'`)

**Erreurs**
- `409` apprenant inéligible à la réinscription (cf. `/eligibilite-reinscription`)

---

### GET /inscriptions/eligibilite-reinscription

Vérifie si un apprenant peut se réinscrire.

**Source frontend** : `InscriptionApiService.verifierEligibiliteReinscription()` ([inscription-api.service.ts:94](../../src/app/core/services/inscription-api.service.ts#L94))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `apprenantId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | oui | |

**Response 200** — `ApiResponse<{ eligible: boolean; blocages: string[] }>`

`blocages` : liste de codes/libellés explicatifs si `eligible: false` (ex. `["FRAIS_ANNEE_PRECEDENTE_IMPAYES", "DOCUMENT_MANQUANT"]`).

---

## Endpoints — Périodes d'inscription

### GET /periodes-inscription

Liste les périodes d'inscription d'un établissement.

**Source frontend** : `InscriptionApiService.getPeriodes()` ([inscription-api.service.ts:108](../../src/app/core/services/inscription-api.service.ts#L108))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<PeriodeInscription[]>`

---

### POST /periodes-inscription

Crée une période.

**Source frontend** : `InscriptionApiService.createPeriode()` ([inscription-api.service.ts:115](../../src/app/core/services/inscription-api.service.ts#L115))

**Request body** : `CreatePeriodeInscriptionDto`

**Response 201** — `ApiResponse<PeriodeInscription>` (statut `ouverte: false`)

---

### PATCH /periodes-inscription/{id}/ouvrir

Ouvre une période d'inscription.

**Source frontend** : `InscriptionApiService.ouvrirPeriode()` ([inscription-api.service.ts:121](../../src/app/core/services/inscription-api.service.ts#L121))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<PeriodeInscription>`

---

### PATCH /periodes-inscription/{id}/fermer

Ferme une période d'inscription.

**Source frontend** : `InscriptionApiService.fermerPeriode()` ([inscription-api.service.ts:127](../../src/app/core/services/inscription-api.service.ts#L127))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<PeriodeInscription>`

---

### DELETE /periodes-inscription/{id}

Supprime une période d'inscription.

**Source frontend** : `InscriptionApiService.deletePeriode()` ([inscription-api.service.ts:133](../../src/app/core/services/inscription-api.service.ts#L133))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` période contient déjà des inscriptions
