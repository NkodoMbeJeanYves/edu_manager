# Module Emploi du temps (EDT)

Cours planifiés (templates récurrents), séances (instances), créneaux horaires, indisponibilités, détection de conflits, cahier de texte.

**Source frontend** : [`edt-api.service.ts`](../../src/app/core/services/edt-api.service.ts) (`EdtApiService`)

**28 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeCours       = 'cm' | 'td' | 'tp' | 'projet' | 'examen' | 'rattrapage' | 'autre';
type TypeRecurrence  = 'aucune' | 'hebdomadaire' | 'bihebdomadaire' | 'mensuel';
type StatutSeance    = 'planifiee' | 'en_cours' | 'realisee' | 'annulee' | 'reportee' | 'suspendue';
type StatutEDT       = 'brouillon' | 'publie' | 'archive';
type TypeConflitEDT  = 'enseignant_double' | 'salle_double' | 'groupe_double' | 'hors_periode';
type JourSemaine     = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';
```

### `CreneauHoraire`

Créneau horaire standard d'un établissement (template réutilisable).

```ts
interface CreneauHoraire {
  id: string;
  etablissementId: string;
  libelle: string;                    // ex. "M1", "Après-midi 1"
  heureDebut: string;                 // HH:mm
  heureFin: string;
  dureeMinutes: number;
  ordre: number;
  actif: boolean;
}
```

### `CoursPlanifie`

Template récurrent (« CM Math, classe 6A, mardi 10h-12h chaque semaine »). Génère des séances.

```ts
interface CoursPlanifie {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  matiereId: string;
  matiereLibelle?: string;
  matiereCode?: string;
  enseignantId: string;
  enseignantNom?: string;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  groupeId?: string;
  groupeLibelle?: string;
  salleId: string;
  salleCode?: string;
  salleLibelle?: string;
  typeCours: TypeCours;
  typeRecurrence: TypeRecurrence;
  jourSemaine?: JourSemaine;
  creneauId?: string;
  creneau?: CreneauHoraire;
  heureDebut: string;
  heureFin: string;
  dateDebutValidite: string;
  dateFinValidite?: string;
  couleur?: string;                   // hex pour affichage UI
  note?: string;
  statut: StatutEDT;
  seances?: Seance[];                 // hydratation
  createdAt: string;
  updatedAt: string;
}
```

### `Seance`

Instance ponctuelle (« le 15 mars, salle 101, prof X »). Peut être créée auto via `genererSeances` ou manuellement.

```ts
interface Seance {
  id: string;
  coursPlanifieId?: string;           // null si séance ponctuelle
  coursPlanifie?: CoursPlanifie;
  etablissementId: string;
  matiereId: string;
  matiereLibelle?: string;
  enseignantId: string;
  enseignantNom?: string;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  groupeId?: string;
  groupeLibelle?: string;
  salleId: string;
  salleCode?: string;
  salleLibelle?: string;
  typeCours: TypeCours;
  date: string;                       // YYYY-MM-DD
  heureDebut: string;                 // HH:mm
  heureFin: string;
  dureeMinutes: number;
  statut: StatutSeance;
  contenuEnseignant?: string;         // cahier de texte
  travauxDemandes?: string;
  ressources?: string[];              // URLs
  presencesSaisies: boolean;
  nombrePresents?: number;
  nombreAbsents?: number;
  estRemplacement: boolean;
  enseignantRemplacantId?: string;
  enseignantRemplacantNom?: string;
  motifAnnulation?: string;
  motifReport?: string;
  dateReport?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `ConflitEDT`

```ts
interface ConflitEDT {
  type: TypeConflitEDT;
  message: string;
  seance1?: Partial<Seance>;
  seance2?: Partial<Seance>;
  sallesAlternatives?: {
    id: string;
    code: string;
    libelle: string;
    capacite: number;
  }[];
}
```

### `Indisponibilite`

```ts
interface Indisponibilite {
  id: string;
  enseignantId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;                // si journée partielle
  heureFin?: string;
  motif: string;
  type: 'conge' | 'absence_planifiee' | 'formation' | 'autre';
  createdAt: string;
}
```

### `EventCalendrier`

Événement formaté pour le rendu calendrier (vue agrégée).

```ts
interface EventCalendrier {
  id: string;
  titre: string;
  sous_titre?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  couleur: string;
  typeCours: TypeCours;
  statut: StatutSeance;
  salle?: string;
  enseignant?: string;
  seanceId: string;
  modifiable: boolean;
}
```

### Stats

```ts
interface StatsEDT {
  totalSeances: number;
  seancesRealisees: number;
  seancesAnnulees: number;
  tauxRealisation: number;            // %
  volumeHorairePlanifie: number;
  volumeHoraireRealise: number;
  tauxCouverture: number;
  seancesParJour: { jour: string; count: number }[];
}

interface CouvertureMatiere {
  matiereId: string;
  matiereLibelle: string;
  volumePlanifie: number;
  volumeRealise: number;
  taux: number;
  seancesRestantes: number;
}
```

### DTOs

```ts
interface CreateCoursPlanifieDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  matiereId: string;
  enseignantId: string;
  classeId?: string;
  promotionId?: string;
  groupeId?: string;
  salleId: string;
  typeCours: TypeCours;
  typeRecurrence: TypeRecurrence;
  jourSemaine?: JourSemaine;
  heureDebut: string;
  heureFin: string;
  dateDebutValidite: string;
  dateFinValidite?: string;
  couleur?: string;
  note?: string;
}

interface UpdateCoursPlanifieDto extends Partial<CreateCoursPlanifieDto> {
  statut?: StatutEDT;
}

interface CreateSeanceDto {
  coursPlanifieId?: string;
  etablissementId: string;
  matiereId: string;
  enseignantId: string;
  classeId?: string;
  promotionId?: string;
  groupeId?: string;
  salleId: string;
  typeCours: TypeCours;
  date: string;
  heureDebut: string;
  heureFin: string;
}

interface UpdateSeanceDto {
  salleId?: string;
  enseignantId?: string;
  date?: string;
  heureDebut?: string;
  heureFin?: string;
  statut?: StatutSeance;
  motifAnnulation?: string;
  motifReport?: string;
  dateReport?: string;
  enseignantRemplacantId?: string;
}

interface SaisirCahierTexteDto {
  seanceId: string;
  contenuEnseignant: string;
  travauxDemandes?: string;
  ressources?: string[];
}

interface GenererSeancesDto {
  coursPlanifieId: string;
  dateDebut: string;
  dateFin: string;
}

interface PublierEDTDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  classeId?: string;
  promotionId?: string;
}

interface CreateIndisponibiliteDto {
  enseignantId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;
  heureFin?: string;
  motif: string;
  type: 'conge' | 'absence_planifiee' | 'formation' | 'autre';
}

interface SeanceFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  periodeId?: string;
  enseignantId?: string;
  classeId?: string;
  promotionId?: string;
  groupeId?: string;
  salleId?: string;
  matiereId?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutSeance;
  semaine?: string;                   // ex. "2026-W22"
  page?: number;
  limit?: number;
}

interface EdtViewFilters {
  vue: 'classe' | 'enseignant' | 'salle' | 'promotion';
  entityId: string;                   // ID selon la vue
  semaine: string;                    // ISO week
  anneeAcademiqueId: string;
}
```

---

## Endpoints — Cours planifiés

### GET /cours-planifies

Liste des cours planifiés.

**Source frontend** : `EdtApiService.getCoursPlanifies()` ([edt-api.service.ts:23](../../src/app/core/services/edt-api.service.ts#L23))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | oui | |
| `classeId` | UUID | non | |
| `promotionId` | UUID | non | |

**Response 200** — `ApiResponse<CoursPlanifie[]>`

---

### GET /cours-planifies/{id}

Détail d'un cours planifié.

**Source frontend** : `EdtApiService.getCoursPlanifie()` ([edt-api.service.ts:39](../../src/app/core/services/edt-api.service.ts#L39))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<CoursPlanifie>`

---

### POST /cours-planifies

Crée un cours planifié (template).

**Source frontend** : `EdtApiService.createCoursPlanifie()` ([edt-api.service.ts:45](../../src/app/core/services/edt-api.service.ts#L45))

**Request body** : `CreateCoursPlanifieDto`

**Response 201** — `ApiResponse<CoursPlanifie>` (statut `brouillon`)

**Erreurs**
- `409` conflit immédiat détecté (salle, enseignant, groupe) — utiliser `/edt/conflits` avant pour confirmation

---

### PATCH /cours-planifies/{id}

Modifie un cours planifié.

**Source frontend** : `EdtApiService.updateCoursPlanifie()` ([edt-api.service.ts:51](../../src/app/core/services/edt-api.service.ts#L51))

**Path parameters** : `id: UUID`

**Request body** : `UpdateCoursPlanifieDto`

**Response 200** — `ApiResponse<CoursPlanifie>`

---

### DELETE /cours-planifies/{id}

Supprime un cours planifié. **Cascade** : ses séances `planifiee` sont supprimées (les `realisee` restent en historique).

**Source frontend** : `EdtApiService.deleteCoursPlanifie()` ([edt-api.service.ts:57](../../src/app/core/services/edt-api.service.ts#L57))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

### POST /cours-planifies/{coursPlanifieId}/generer

Génère les séances à partir du template (récurrence appliquée entre `dateDebut` et `dateFin`).

**Source frontend** : `EdtApiService.genererSeances()` ([edt-api.service.ts:63](../../src/app/core/services/edt-api.service.ts#L63))

**Path parameters** : `coursPlanifieId: UUID`

**Request body** : `GenererSeancesDto`

**Response 201** — `ApiResponse<{ count: number; seances: Seance[] }>`

**Erreurs**
- `409` plage chevauche des séances déjà générées (utiliser `regenerer` optionnel à valider côté back)

---

### PATCH /edt/publier

Publie l'EDT (passe les cours planifiés `brouillon` → `publie`).

**Source frontend** : `EdtApiService.publierEDT()` ([edt-api.service.ts:69](../../src/app/core/services/edt-api.service.ts#L69))

**Request body** : `PublierEDTDto`

**Response 200** — `ApiResponse<{ count: number }>`

---

## Endpoints — Séances

### GET /seances

Liste paginée des séances.

**Source frontend** : `EdtApiService.getSeances()` ([edt-api.service.ts:77](../../src/app/core/services/edt-api.service.ts#L77))

**Query parameters** : tous les champs de `SeanceFilters`.

**Response 200** — `PaginatedResponse<Seance>`

---

### GET /seances/{id}

Détail d'une séance.

**Source frontend** : `EdtApiService.getSeance()` ([edt-api.service.ts:87](../../src/app/core/services/edt-api.service.ts#L87))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Seance>`

---

### POST /seances

Crée une séance ponctuelle (sans template).

**Source frontend** : `EdtApiService.createSeance()` ([edt-api.service.ts:91](../../src/app/core/services/edt-api.service.ts#L91))

**Request body** : `CreateSeanceDto`

**Response 201** — `ApiResponse<Seance>`

---

### PATCH /seances/{id}

Modifie une séance (date, heure, salle, enseignant).

**Source frontend** : `EdtApiService.updateSeance()` ([edt-api.service.ts:95](../../src/app/core/services/edt-api.service.ts#L95))

**Path parameters** : `id: UUID`

**Request body** : `UpdateSeanceDto`

**Response 200** — `ApiResponse<Seance>`

---

### DELETE /seances/{id}

Supprime une séance (uniquement si `statut: 'planifiee'`).

**Source frontend** : `EdtApiService.deleteSeance()` ([edt-api.service.ts:101](../../src/app/core/services/edt-api.service.ts#L101))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` séance déjà réalisée (présences saisies)

---

### PATCH /seances/{id}/annuler

Annule une séance. **Transition** : `planifiee` → `annulee`.

**Source frontend** : `EdtApiService.annulerSeance()` ([edt-api.service.ts:105](../../src/app/core/services/edt-api.service.ts#L105))

**Path parameters** : `id: UUID`

**Request body**

```ts
{ motif: string }
```

**Response 200** — `ApiResponse<Seance>`

---

### PATCH /seances/{id}/reporter

Reporte une séance à une autre date. **Transition** : `planifiee` → `reportee`.

**Source frontend** : `EdtApiService.reporterSeance()` ([edt-api.service.ts:111](../../src/app/core/services/edt-api.service.ts#L111))

**Path parameters** : `id: UUID`

**Request body**

```ts
{ dateReport: string; motif: string }
```

**Response 200** — `ApiResponse<Seance>`

---

### PATCH /seances/{id}/realiser

Marque une séance comme réalisée. **Transition** : `planifiee` → `realisee`.

**Source frontend** : `EdtApiService.marquerRealisee()` ([edt-api.service.ts:117](../../src/app/core/services/edt-api.service.ts#L117))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Seance>`

---

### PATCH /seances/{seanceId}/cahier-texte

Saisit le cahier de texte d'une séance (contenu enseigné + travaux + ressources).

**Source frontend** : `EdtApiService.saisirCahierTexte()` ([edt-api.service.ts:123](../../src/app/core/services/edt-api.service.ts#L123))

**Path parameters** : `seanceId: UUID`

**Request body** : `SaisirCahierTexteDto`

**Response 200** — `ApiResponse<Seance>`

---

### PATCH /seances/{id}/remplacer

Affecte un enseignant remplaçant.

**Source frontend** : `EdtApiService.remplacerEnseignant()` ([edt-api.service.ts:129](../../src/app/core/services/edt-api.service.ts#L129))

**Path parameters** : `id: UUID`

**Request body**

```ts
{ enseignantRemplacantId: string }
```

**Response 200** — `ApiResponse<Seance>` (avec `estRemplacement: true`)

---

## Endpoints — Vue calendrier & conflits

### GET /edt/vue

Vue calendrier formatée (par classe, enseignant, salle ou promotion) pour une semaine donnée.

**Source frontend** : `EdtApiService.getEdtView()` ([edt-api.service.ts:140](../../src/app/core/services/edt-api.service.ts#L140))

**Query parameters** : tous les champs de `EdtViewFilters` (tous requis).

**Response 200** — `ApiResponse<EventCalendrier[]>`

---

### POST /edt/conflits

Vérifie les conflits avant création ou modification d'une séance.

**Source frontend** : `EdtApiService.verifierConflits()` ([edt-api.service.ts:153](../../src/app/core/services/edt-api.service.ts#L153))

**Request body** : `CreateSeanceDto | (UpdateSeanceDto & { seanceId?: string })`

**Response 200** — `ApiResponse<ConflitEDT[]>` (vide si aucun conflit)

---

## Endpoints — Créneaux horaires

### GET /creneaux

Liste des créneaux d'un établissement.

**Source frontend** : `EdtApiService.getCreneaux()` ([edt-api.service.ts:161](../../src/app/core/services/edt-api.service.ts#L161))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<CreneauHoraire[]>`

---

### POST /creneaux

Crée un créneau.

**Source frontend** : `EdtApiService.createCreneau()` ([edt-api.service.ts:168](../../src/app/core/services/edt-api.service.ts#L168))

**Request body** : `Partial<CreneauHoraire>` (au minimum : `etablissementId`, `libelle`, `heureDebut`, `heureFin`, `dureeMinutes`, `ordre`)

**Response 201** — `ApiResponse<CreneauHoraire>`

---

### PATCH /creneaux/{id}

Modifie un créneau.

**Source frontend** : `EdtApiService.updateCreneau()` ([edt-api.service.ts:174](../../src/app/core/services/edt-api.service.ts#L174))

**Path parameters** : `id: UUID`

**Request body** : `Partial<CreneauHoraire>`

**Response 200** — `ApiResponse<CreneauHoraire>`

---

### DELETE /creneaux/{id}

Supprime un créneau.

**Source frontend** : `EdtApiService.deleteCreneau()` ([edt-api.service.ts:180](../../src/app/core/services/edt-api.service.ts#L180))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Indisponibilités

### GET /indisponibilites

Liste des indisponibilités d'un enseignant.

**Source frontend** : `EdtApiService.getIndisponibilites()` ([edt-api.service.ts:186](../../src/app/core/services/edt-api.service.ts#L186))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `enseignantId` | UUID | oui | |

**Response 200** — `ApiResponse<Indisponibilite[]>`

---

### POST /indisponibilites

Déclare une indisponibilité.

**Source frontend** : `EdtApiService.createIndisponibilite()` ([edt-api.service.ts:193](../../src/app/core/services/edt-api.service.ts#L193))

**Request body** : `CreateIndisponibiliteDto`

**Response 201** — `ApiResponse<Indisponibilite>`

---

### DELETE /indisponibilites/{id}

Supprime une indisponibilité.

**Source frontend** : `EdtApiService.deleteIndisponibilite()` ([edt-api.service.ts:199](../../src/app/core/services/edt-api.service.ts#L199))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Stats & couverture

### GET /edt/stats

Statistiques EDT.

**Source frontend** : `EdtApiService.getStats()` ([edt-api.service.ts:207](../../src/app/core/services/edt-api.service.ts#L207))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | oui | |
| `classeId` | UUID | non | |

**Response 200** — `ApiResponse<StatsEDT>`

---

### GET /edt/couverture

Taux de couverture des matières pour une classe/promotion.

**Source frontend** : `EdtApiService.getCouvertureParMatiere()` ([edt-api.service.ts:221](../../src/app/core/services/edt-api.service.ts#L221))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `classeOuPromotionId` | UUID | oui | |
| `periodeId` | UUID | non | |

**Response 200** — `ApiResponse<CouvertureMatiere[]>`
