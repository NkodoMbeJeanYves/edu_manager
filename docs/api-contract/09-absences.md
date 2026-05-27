# Module Absences & Présences

Feuilles de présence par séance, absences apprenants, justificatifs, absences enseignants, paramètres et alertes.

**Source frontend** : [`absence-api.service.ts`](../../src/app/core/services/absence-api.service.ts) (`AbsenceApiService`)

**18 endpoints**.

---

## Schémas du module

### Enums

```ts
type StatutAbsence    = 'non_justifiee' | 'en_attente' | 'justifiee' | 'rejetee';
type TypeJustificatif = 'medical' | 'familial' | 'administratif' | 'transport' | 'autre';
type StatutPresence   = 'present' | 'absent' | 'retard' | 'dispense';
type TypeAbsenceEnseignant = 'maladie' | 'conge' | 'formation' | 'mission' | 'autre';
```

> **Workflow justificatif** : absence créée auto en `non_justifiee` lors d'une saisie de présence avec `statut: 'absent'`. Soumission justificatif → statut `en_attente`. Validation scolarité → `justifiee` ou `rejetee`.

### `Presence`

Une ligne de la feuille d'appel d'une séance.

```ts
interface Presence {
  id: string;
  seanceId: string;
  apprenantId: string;
  apprenant?: Apprenant;              // hydratation
  statut: StatutPresence;
  minutesRetard?: number;             // si statut === 'retard'
  remarque?: string;
  saisieParId?: string;               // userId
  saisieParNom?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `Absence`

Entité de suivi (créée automatiquement à partir d'une `Presence: absent`).

```ts
interface Absence {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  seanceId: string;
  matiereId?: string;
  matiereLibelle?: string;
  enseignantId?: string;
  classeId?: string;
  promotionId?: string;
  date: string;                       // YYYY-MM-DD
  heureDebut: string;                 // HH:mm
  heureFin: string;
  dureeHeures: number;
  statut: StatutAbsence;
  estExamen: boolean;                 // absence pendant un examen
  impactNote: boolean;                // note 0 appliquée (examen + non justifiée)
  notifieeParent: boolean;
  dateNotification?: string;
  justificatif?: Justificatif;
  createdAt: string;
  updatedAt: string;
}
```

### `Justificatif`

```ts
interface Justificatif {
  id: string;
  absenceId: string;
  type: TypeJustificatif;
  description: string;
  fichierUrl?: string;                // URL du document uploadé
  fichierNom?: string;
  soumisParId: string;
  soumisParNom?: string;
  dateSoumission: string;
  validateParId?: string;
  validatedParNom?: string;
  dateValidation?: string;
  commentaireValidation?: string;
  statut: 'en_attente' | 'accepte' | 'rejete';
}
```

### `FeuillePresence`

Appel complet d'une séance (présences + agrégats).

```ts
interface FeuillePresence {
  seanceId: string;
  matiereLibelle?: string;
  enseignantNom?: string;
  classeOuGroupeLibelle?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  presences: Presence[];
  totalPresents: number;
  totalAbsents: number;
  totalRetards: number;
  totalDispenses: number;
  saisieComplete: boolean;
  dateSaisie?: string;
}
```

### `AbsenceEnseignant`

```ts
interface AbsenceEnseignant {
  id: string;
  enseignantId: string;
  enseignantNom?: string;
  type: TypeAbsenceEnseignant;
  dateDebut: string;
  dateFin: string;
  motif: string;
  seancesImpactees?: string[];        // ids des séances concernées
  remplacementPrevu: boolean;
  enseignantRemplacantId?: string;
  enseignantRemplacantNom?: string;
  createdAt: string;
}
```

### Stats

```ts
interface StatsAbsenteisme {
  apprenantId: string;
  apprenantNom?: string;
  totalHeures: number;
  heuresJustifiees: number;
  heuresInjustifiees: number;
  heuresRetard: number;
  tauxAbsenteisme: number;            // %
  tauxInjustifie: number;             // %
  nombreAbsences: number;
  absencesExamen: number;
  alerteDepassee: boolean;            // seuil dépassé
  parMatiere?: AbsenteismeMatiere[];
}

interface AbsenteismeMatiere {
  matiereId: string;
  matiereLibelle: string;
  totalHeures: number;
  heuresAbsence: number;
  taux: number;
}

interface StatsAbsenteismeClasse {
  classeId?: string;
  promotionId?: string;
  libelle: string;
  totalApprenants: number;
  tauxMoyenAbsenteisme: number;
  apprenantsDessusSeui: number;       // nb apprenants dépassant le seuil
  topAbsents: { apprenantId: string; nom: string; heures: number }[];
  parJour: { date: string; nbAbsents: number }[];
}
```

### `ParametresAbsenteisme`

```ts
interface ParametresAbsenteisme {
  etablissementId: string;
  seuilAlerte: number;                // heures injustifiées avant alerte
  delaiSaisieHeures: number;          // délai max saisie présences (depuis fin séance)
  absenceExamenNote0: boolean;        // absence examen = note 0
  notificationParent: boolean;
  notificationDelaiHeures: number;    // délai notification parent
}
```

### DTOs

```ts
interface SaisirPresencesDto {
  seanceId: string;
  presences: {
    apprenantId: string;
    statut: StatutPresence;
    minutesRetard?: number;
    remarque?: string;
  }[];
}

interface UpdatePresenceDto {
  statut?: StatutPresence;
  minutesRetard?: number;
  remarque?: string;
}

interface SoumettreJustificatifDto {
  absenceId: string;
  type: TypeJustificatif;
  description: string;
  fichier?: File;                     // multipart
}

interface ValiderJustificatifDto {
  justificatifId: string;
  statut: 'accepte' | 'rejete';
  commentaire?: string;
}

interface CreateAbsenceEnseignantDto {
  enseignantId: string;
  type: TypeAbsenceEnseignant;
  dateDebut: string;
  dateFin: string;
  motif: string;
  enseignantRemplacantId?: string;
}

interface AbsenceFilters {
  apprenantId?: string;
  classeId?: string;
  promotionId?: string;
  matiereId?: string;
  statut?: StatutAbsence;
  dateDebut?: string;
  dateFin?: string;
  estExamen?: boolean;
  etablissementId?: string;
  anneeAcademiqueId?: string;
  page?: number;
  limit?: number;
}

interface PresenceFilters {
  seanceId?: string;
  apprenantId?: string;
  statut?: StatutPresence;
  dateDebut?: string;
  dateFin?: string;
}
```

---

## Endpoints — Feuilles de présence

### GET /seances/{seanceId}/presences

Récupère la feuille de présence d'une séance.

**Source frontend** : `AbsenceApiService.getFeuillePresence()` ([absence-api.service.ts:23](../../src/app/core/services/absence-api.service.ts#L23))

**Path parameters** : `seanceId: UUID`

**Response 200** — `ApiResponse<FeuillePresence>`

---

### POST /seances/{seanceId}/presences

Saisit/met à jour les présences d'une séance. **Crée automatiquement les absences** pour les apprenants `statut: 'absent'`.

**Source frontend** : `AbsenceApiService.saisirPresences()` ([absence-api.service.ts:29](../../src/app/core/services/absence-api.service.ts#L29))

**Path parameters** : `seanceId: UUID`

**Request body** : `SaisirPresencesDto`

**Response 200** — `ApiResponse<FeuillePresence>`

**Erreurs**
- `409` séance déjà clôturée pour saisie (au-delà de `delaiSaisieHeures`)

---

### PATCH /presences/{id}

Modifie une présence individuelle.

**Source frontend** : `AbsenceApiService.updatePresence()` ([absence-api.service.ts:35](../../src/app/core/services/absence-api.service.ts#L35))

**Path parameters** : `id: UUID`

**Request body** : `UpdatePresenceDto`

**Response 200** — `ApiResponse<Presence>`

---

### GET /presences

Liste les présences d'un apprenant (filtrable).

**Source frontend** : `AbsenceApiService.getPresencesApprenant()` ([absence-api.service.ts:41](../../src/app/core/services/absence-api.service.ts#L41))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `apprenantId` | UUID | oui | |
| (autres) | divers | non | Tous les champs de `PresenceFilters` |

**Response 200** — `ApiResponse<Presence[]>`

---

## Endpoints — Absences

### GET /absences

Liste paginée des absences.

**Source frontend** : `AbsenceApiService.getAbsences()` ([absence-api.service.ts:58](../../src/app/core/services/absence-api.service.ts#L58))

**Query parameters** : tous les champs de `AbsenceFilters`.

**Response 200** — `PaginatedResponse<Absence>`

---

### GET /absences/{id}

Détail d'une absence (avec justificatif si présent).

**Source frontend** : `AbsenceApiService.getAbsence()` ([absence-api.service.ts:70](../../src/app/core/services/absence-api.service.ts#L70))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Absence>`

---

### GET /absences/apprenant

Liste les absences d'un apprenant.

**Source frontend** : `AbsenceApiService.getAbsencesApprenant()` ([absence-api.service.ts:74](../../src/app/core/services/absence-api.service.ts#L74))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `apprenantId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | non | |

**Response 200** — `ApiResponse<Absence[]>`

---

### POST /absences/{absenceId}/notifier

Envoie une notification aux parents (cf. module Communication).

**Source frontend** : `AbsenceApiService.notifierParent()` ([absence-api.service.ts:85](../../src/app/core/services/absence-api.service.ts#L85))

**Path parameters** : `absenceId: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<{ sent: boolean }>`

---

## Endpoints — Justificatifs

### POST /justificatifs

Soumet un justificatif (avec ou sans fichier).

**Source frontend** : `AbsenceApiService.soumettreJustificatif()` ([absence-api.service.ts:93](../../src/app/core/services/absence-api.service.ts#L93))

**Content-Type** : `multipart/form-data`

**Form fields**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `absenceId` | UUID | oui | |
| `type` | TypeJustificatif | oui | |
| `description` | string | oui | |
| `fichier` | binary | non | Document (PDF, JPG, PNG, max ~10MB) |

**Response 201** — `ApiResponse<Justificatif>` (statut initial `en_attente`)

---

### PATCH /justificatifs/{justificatifId}/valider

Accepte ou rejette un justificatif. Met à jour le statut de l'absence associée.

**Source frontend** : `AbsenceApiService.validerJustificatif()` ([absence-api.service.ts:104](../../src/app/core/services/absence-api.service.ts#L104))

**Path parameters** : `justificatifId: UUID`

**Request body** : `ValiderJustificatifDto`

**Response 200** — `ApiResponse<Justificatif>`

**Erreurs**
- `403` rôle insuffisant (`validate` sur module `absences`)
- `409` justificatif déjà validé

---

### GET /justificatifs/en-attente

Liste les justificatifs en attente de validation (vue scolarité).

**Source frontend** : `AbsenceApiService.getJustificatifsEnAttente()` ([absence-api.service.ts:110](../../src/app/core/services/absence-api.service.ts#L110))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<Justificatif[]>`

---

## Endpoints — Statistiques d'absentéisme

### GET /absences/stats/apprenant

Stats absentéisme d'un apprenant.

**Source frontend** : `AbsenceApiService.getStatsApprenant()` ([absence-api.service.ts:121](../../src/app/core/services/absence-api.service.ts#L121))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `apprenantId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | non | |
| `periodeId` | UUID | non | |

**Response 200** — `ApiResponse<StatsAbsenteisme>`

---

### GET /absences/stats/classe

Stats absentéisme d'une classe ou promotion.

**Source frontend** : `AbsenceApiService.getStatsClasse()` ([absence-api.service.ts:134](../../src/app/core/services/absence-api.service.ts#L134))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `classeOuPromotionId` | UUID | oui | classeId OU promotionId |
| `periodeId` | UUID | non | |

**Response 200** — `ApiResponse<StatsAbsenteismeClasse>`

---

### GET /absences/alertes

Liste les apprenants dépassant le seuil d'absentéisme défini en paramètres.

**Source frontend** : `AbsenceApiService.getApprenantsDessusSeui()` ([absence-api.service.ts:145](../../src/app/core/services/absence-api.service.ts#L145))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | oui | |

**Response 200** — `ApiResponse<StatsAbsenteisme[]>`

---

## Endpoints — Absences enseignants

### GET /absences-enseignants

Liste des absences d'un enseignant.

**Source frontend** : `AbsenceApiService.getAbsencesEnseignant()` ([absence-api.service.ts:159](../../src/app/core/services/absence-api.service.ts#L159))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `enseignantId` | UUID | oui | |

**Response 200** — `ApiResponse<AbsenceEnseignant[]>`

---

### POST /absences-enseignants

Enregistre une absence enseignant (déclenche la mise à jour des séances impactées).

**Source frontend** : `AbsenceApiService.createAbsenceEnseignant()` ([absence-api.service.ts:166](../../src/app/core/services/absence-api.service.ts#L166))

**Request body** : `CreateAbsenceEnseignantDto`

**Response 201** — `ApiResponse<AbsenceEnseignant>` (avec `seancesImpactees` calculé serveur)

---

### DELETE /absences-enseignants/{id}

Supprime une absence enseignant.

**Source frontend** : `AbsenceApiService.deleteAbsenceEnseignant()` ([absence-api.service.ts:174](../../src/app/core/services/absence-api.service.ts#L174))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Paramètres

### GET /absences/parametres

Récupère les paramètres d'absentéisme d'un établissement.

**Source frontend** : `AbsenceApiService.getParametres()` ([absence-api.service.ts:182](../../src/app/core/services/absence-api.service.ts#L182))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<ParametresAbsenteisme>`

---

### PATCH /absences/parametres

Met à jour les paramètres d'absentéisme.

**Source frontend** : `AbsenceApiService.updateParametres()` ([absence-api.service.ts:189](../../src/app/core/services/absence-api.service.ts#L189))

**Request body**

```ts
{ etablissementId: string } & Partial<ParametresAbsenteisme>
```

**Response 200** — `ApiResponse<ParametresAbsenteisme>`
