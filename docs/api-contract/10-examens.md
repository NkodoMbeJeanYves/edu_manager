# Module Examens

Sessions d'examen, épreuves, convocations, procès-verbaux et cas de fraude.

**Source frontend** : [`examen-api.service.ts`](../../src/app/core/services/examen-api.service.ts) (`ExamenApiService`)

**15 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeSession       = 'normale' | 'rattrapage' | 'speciale';
type StatutSession     = 'planifiee' | 'en_cours' | 'cloturee' | 'annulee';
type StatutConvocation = 'generee' | 'envoyee' | 'confirmee' | 'absente';
type TypeFraude        = 'triche' | 'plagiat' | 'comportement' | 'autre';
```

### `SessionExamen`

```ts
interface SessionExamen {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  libelle: string;
  type: TypeSession;
  statut: StatutSession;
  dateDebut: string;
  dateFin: string;
  epreuves?: Epreuve[];               // hydratation
  createdAt: string;
  updatedAt: string;
}
```

### `Epreuve`

```ts
interface Epreuve {
  id: string;
  sessionId: string;
  matiereId: string;
  matiereLibelle?: string;
  matiereCode?: string;
  classeId?: string;
  promotionId?: string;
  salleId: string;
  salleLibelle?: string;
  enseignantSurveillantId?: string;
  enseignantSurveillantNom?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  coefficient?: number;
  noteMax?: number;
  convocationsGenerees: boolean;
  createdAt: string;
}
```

### `Convocation`

```ts
interface Convocation {
  id: string;
  epreuveId: string;
  apprenantId: string;
  apprenantNom?: string;
  apprenantPrenom?: string;
  numeroInscription?: string;
  numeroPlace?: string;
  salle?: string;
  statut: StatutConvocation;
  dateEnvoi?: string;
  eligible: boolean;
  motifIneligibilite?: string;        // ex. "dette financière", "dossier incomplet"
  createdAt: string;
}
```

### `PVExamen` & `CasFraude`

```ts
interface PVExamen {
  id: string;
  epreuveId: string;
  dateRedaction: string;
  observations: string;
  cas: CasFraude[];
  signePar: string;
  dateSigne?: string;
  statut: 'brouillon' | 'signe' | 'archive';
}

interface CasFraude {
  apprenantId: string;
  apprenantNom: string;
  type: TypeFraude;
  description: string;
  sanction?: string;
}
```

### DTOs

```ts
interface CreateSessionDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  libelle: string;
  type: TypeSession;
  dateDebut: string;
  dateFin: string;
}

interface CreateEpreuveDto {
  sessionId: string;
  matiereId: string;
  classeId?: string;
  promotionId?: string;
  salleId: string;
  enseignantSurveillantId?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  coefficient?: number;
  noteMax?: number;
}

interface GenererConvocationsDto {
  epreuveId: string;
  verifierEligibilite?: boolean;      // si true, calcule éligibilité par apprenant (dette, dossier)
}

interface SessionFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  type?: TypeSession;
  statut?: StatutSession;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Sessions

### GET /sessions-examen

Liste paginée des sessions d'examen.

**Source frontend** : `ExamenApiService.getSessions()` ([examen-api.service.ts:19](../../src/app/core/services/examen-api.service.ts#L19))

**Query parameters** : tous les champs de `SessionFilters`.

**Response 200** — `PaginatedResponse<SessionExamen>`

---

### GET /sessions-examen/{id}

Détail d'une session (avec épreuves hydratées).

**Source frontend** : `ExamenApiService.getSession()` ([examen-api.service.ts:29](../../src/app/core/services/examen-api.service.ts#L29))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<SessionExamen>`

---

### POST /sessions-examen

Crée une session.

**Source frontend** : `ExamenApiService.createSession()` ([examen-api.service.ts:35](../../src/app/core/services/examen-api.service.ts#L35))

**Request body** : `CreateSessionDto`

**Response 201** — `ApiResponse<SessionExamen>` (statut `planifiee`)

---

### PATCH /sessions-examen/{id}

Modifie une session.

**Source frontend** : `ExamenApiService.updateSession()` ([examen-api.service.ts:41](../../src/app/core/services/examen-api.service.ts#L41))

**Path parameters** : `id: UUID`

**Request body** : `Partial<CreateSessionDto>`

**Response 200** — `ApiResponse<SessionExamen>`

---

### PATCH /sessions-examen/{id}/cloturer

Clôture une session. **Transition** : `en_cours` → `cloturee`.

**Source frontend** : `ExamenApiService.cloturerSession()` ([examen-api.service.ts:47](../../src/app/core/services/examen-api.service.ts#L47))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<SessionExamen>`

---

## Endpoints — Épreuves

### GET /sessions-examen/{sessionId}/epreuves

Liste les épreuves d'une session.

**Source frontend** : `ExamenApiService.getEpreuves()` ([examen-api.service.ts:55](../../src/app/core/services/examen-api.service.ts#L55))

**Path parameters** : `sessionId: UUID`

**Response 200** — `ApiResponse<Epreuve[]>`

---

### POST /epreuves

Crée une épreuve.

**Source frontend** : `ExamenApiService.createEpreuve()` ([examen-api.service.ts:61](../../src/app/core/services/examen-api.service.ts#L61))

**Request body** : `CreateEpreuveDto`

**Response 201** — `ApiResponse<Epreuve>`

**Erreurs**
- `409` créneau salle/surveillant déjà occupé

---

### PATCH /epreuves/{id}

Modifie une épreuve.

**Source frontend** : `ExamenApiService.updateEpreuve()` ([examen-api.service.ts:67](../../src/app/core/services/examen-api.service.ts#L67))

**Path parameters** : `id: UUID`

**Request body** : `Partial<CreateEpreuveDto>`

**Response 200** — `ApiResponse<Epreuve>`

---

### DELETE /epreuves/{id}

Supprime une épreuve. **Cascade** : convocations associées supprimées.

**Source frontend** : `ExamenApiService.deleteEpreuve()` ([examen-api.service.ts:73](../../src/app/core/services/examen-api.service.ts#L73))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Convocations

### POST /convocations/generer

Génère les convocations pour une épreuve. Si `verifierEligibilite: true`, calcule l'éligibilité de chaque apprenant.

**Source frontend** : `ExamenApiService.genererConvocations()` ([examen-api.service.ts:79](../../src/app/core/services/examen-api.service.ts#L79))

**Request body** : `GenererConvocationsDto`

**Response 201** — `ApiResponse<{ count: number; convocations: Convocation[] }>`

---

### POST /convocations/envoyer

Envoie les convocations générées (notifie apprenants/parents via module Communication).

**Source frontend** : `ExamenApiService.envoyerConvocations()` ([examen-api.service.ts:85](../../src/app/core/services/examen-api.service.ts#L85))

**Request body**

```ts
{ epreuveId: string }
```

**Response 200** — `ApiResponse<{ sent: number }>` — nombre de convocations envoyées

---

### GET /epreuves/{epreuveId}/convocations

Liste les convocations d'une épreuve.

**Source frontend** : `ExamenApiService.getConvocationsEpreuve()` ([examen-api.service.ts:91](../../src/app/core/services/examen-api.service.ts#L91))

**Path parameters** : `epreuveId: UUID`

**Response 200** — `ApiResponse<Convocation[]>`

---

### GET /convocations/{id}/pdf

Télécharge le PDF d'une convocation.

**Source frontend** : `ExamenApiService.telechargerConvocation()` ([examen-api.service.ts:97](../../src/app/core/services/examen-api.service.ts#L97))

**Path parameters** : `id: UUID`

**Response 200** — Blob `application/pdf`

---

## Endpoints — Procès-verbaux

### POST /pv-examen

Crée un PV d'examen.

**Source frontend** : `ExamenApiService.createPV()` ([examen-api.service.ts:103](../../src/app/core/services/examen-api.service.ts#L103))

**Request body**

```ts
{
  epreuveId: string;
  observations: string;
  cas: CasFraude[];
}
```

**Response 201** — `ApiResponse<PVExamen>` (statut `brouillon`)

---

### PATCH /pv-examen/{id}/signer

Signe un PV. **Transition** : `brouillon` → `signe`.

**Source frontend** : `ExamenApiService.signerPV()` ([examen-api.service.ts:107](../../src/app/core/services/examen-api.service.ts#L107))

**Path parameters** : `id: UUID`

**Request body**

```ts
{ signePar: string }                  // nom du signataire
```

**Response 200** — `ApiResponse<PVExamen>`

**Erreurs**
- `403` rôle insuffisant (`sign` sur `examens`)
