# Module Enseignants

Gestion RH des enseignants : profil, affectations matières/classes, charge horaire, statistiques.

**Source frontend** : [`enseignant-api.service.ts`](../../src/app/core/services/enseignant-api.service.ts) (`EnseignantApiService`)

**13 endpoints**.

---

## Schémas du module

### Enums

```ts
type StatutEnseignant = 'actif' | 'inactif' | 'suspendu' | 'retraite';

type TypeContrat = 'titulaire' | 'vacataire' | 'contractuel' | 'fonctionnaire' | 'detache';

type NiveauDiplome = 'licence' | 'master' | 'doctorat' | 'bts' | 'hdr' | 'agregation' | 'autre';
```

Voir [`Genre`](./99-shared-schemas.md#genres-et-personne) dans les schémas partagés.

### `Enseignant`

```ts
interface Enseignant {
  id: string;
  etablissementId: string;
  matricule: string;                  // ex. "ENS-2024-001"
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  genre: Genre;
  dateNaissance?: string;             // YYYY-MM-DD
  adresse?: string;
  photoUrl?: string;
  statut: StatutEnseignant;
  typeContrat: TypeContrat;
  dateEntree: string;                 // YYYY-MM-DD
  dateSortie?: string;
  niveauDiplome?: NiveauDiplome;
  specialites?: string[];
  matieres?: Matiere[];               // cf. 01-referentiel
  chargeHoraireMax?: number;          // heures/semaine
  chargeHoraireReelle?: number;
  tauxHoraire?: number;               // pour vacataires
  createdAt: string;
  updatedAt: string;
}
```

### `AffectationMatiere`

```ts
interface AffectationMatiere {
  id: string;
  enseignantId: string;
  matiereId: string;
  matiereLibelle?: string;
  matiereCode?: string;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  anneeAcademiqueId: string;
  heuresPrevues: number;
  heuresRealisees?: number;
  actif: boolean;
  createdAt: string;
}
```

### `ChargeHoraire`

```ts
interface ChargeHoraire {
  enseignantId: string;
  anneeAcademiqueId: string;
  totalPrevues: number;
  totalRealisees: number;
  totalRestantes: number;
  tauxRealisation: number;            // %
  parMatiere: {
    matiereId: string;
    matiereLibelle: string;
    heuresPrevues: number;
    heuresRealisees: number;
  }[];
  parSemaine: {
    semaine: string;                  // ISO week ex. "2024-W38"
    heures: number;
  }[];
  alerteDepassement: boolean;
}
```

### `StatsEnseignant`

```ts
interface StatsEnseignant {
  totalEnseignants: number;
  actifs: number;
  vacataires: number;
  titulaires: number;
  tauxPresence: number;               // %
  chargeHoraireMoyenne: number;
  enseignantsEnSurcharge: number;
}
```

### DTOs

```ts
interface CreateEnseignantDto {
  etablissementId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  genre: Genre;
  dateNaissance?: string;
  adresse?: string;
  typeContrat: TypeContrat;
  dateEntree: string;
  niveauDiplome?: NiveauDiplome;
  specialites?: string[];
  chargeHoraireMax?: number;
  tauxHoraire?: number;
}

interface UpdateEnseignantDto extends Partial<CreateEnseignantDto> {
  statut?: StatutEnseignant;
  dateSortie?: string;
}

interface AffecterMatiereDto {
  enseignantId: string;
  matiereId: string;
  classeId?: string;
  promotionId?: string;
  anneeAcademiqueId: string;
  heuresPrevues: number;
}

interface UpdateAffectationDto {
  heuresPrevues?: number;
  actif?: boolean;
}

interface EnseignantFilters {
  etablissementId?: string;
  statut?: StatutEnseignant;
  typeContrat?: TypeContrat;
  matiereId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Enseignants

### GET /enseignants

Liste paginée des enseignants.

**Source frontend** : `EnseignantApiService.getEnseignants()` ([enseignant-api.service.ts:20](../../src/app/core/services/enseignant-api.service.ts#L20))

**Query parameters** : tous les champs de `EnseignantFilters`.

**Response 200** — `PaginatedResponse<Enseignant>`

---

### GET /enseignants/{id}

Détail d'un enseignant.

**Source frontend** : `EnseignantApiService.getEnseignant()` ([enseignant-api.service.ts:32](../../src/app/core/services/enseignant-api.service.ts#L32))

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | UUID | ID enseignant |

**Response 200** — `ApiResponse<Enseignant>`

**Erreurs**
- `404` non trouvé

---

### POST /enseignants

Crée un enseignant.

**Source frontend** : `EnseignantApiService.createEnseignant()` ([enseignant-api.service.ts:38](../../src/app/core/services/enseignant-api.service.ts#L38))

**Request body** : `CreateEnseignantDto`

**Response 201** — `ApiResponse<Enseignant>`

**Erreurs**
- `409` matricule ou email déjà utilisé dans le tenant

---

### PATCH /enseignants/{id}

Met à jour un enseignant.

**Source frontend** : `EnseignantApiService.updateEnseignant()` ([enseignant-api.service.ts:44](../../src/app/core/services/enseignant-api.service.ts#L44))

**Path parameters** : `id: UUID`

**Request body** : `UpdateEnseignantDto`

**Response 200** — `ApiResponse<Enseignant>`

---

### DELETE /enseignants/{id}

Supprime un enseignant. **Cascade** : ses `AffectationMatiere` sont supprimées.

**Source frontend** : `EnseignantApiService.deleteEnseignant()` ([enseignant-api.service.ts:50](../../src/app/core/services/enseignant-api.service.ts#L50))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` enseignant rattaché à des séances réalisées non historisables

---

### POST /enseignants/{id}/photo

Upload de la photo de profil.

**Source frontend** : `EnseignantApiService.uploadPhoto()` ([enseignant-api.service.ts:56](../../src/app/core/services/enseignant-api.service.ts#L56))

**Path parameters** : `id: UUID`

**Content-Type** : `multipart/form-data`

**Form fields**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `photo` | binary | oui | Fichier image (JPEG/PNG, max ~5MB recommandé) |

**Response 200** — `ApiResponse<Enseignant>` (avec `photoUrl` mis à jour)

**Erreurs**
- `400` format non supporté ou fichier trop volumineux

---

### GET /enseignants/search

Recherche rapide d'enseignants pour sélecteurs UI (autocomplete).

**Source frontend** : `EnseignantApiService.searchEnseignants()` ([enseignant-api.service.ts:121](../../src/app/core/services/enseignant-api.service.ts#L121))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `q` | string | oui | Texte de recherche (matricule, nom, prénom) |
| `etablissementId` | UUID | oui | Scope tenant |

**Response 200** — `ApiResponse<Pick<Enseignant, 'id' \| 'prenom' \| 'nom' \| 'matricule'>[]>` (max 10 résultats)

---

### GET /enseignants/stats

Statistiques enseignants à l'échelle d'un établissement.

**Source frontend** : `EnseignantApiService.getStats()` ([enseignant-api.service.ts:112](../../src/app/core/services/enseignant-api.service.ts#L112))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<StatsEnseignant>`

---

### GET /enseignants/{enseignantId}/charge-horaire

Charge horaire détaillée d'un enseignant sur une année.

**Source frontend** : `EnseignantApiService.getChargeHoraire()` ([enseignant-api.service.ts:100](../../src/app/core/services/enseignant-api.service.ts#L100))

**Path parameters** : `enseignantId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `anneeAcademiqueId` | UUID | oui | |

**Response 200** — `ApiResponse<ChargeHoraire>`

---

## Endpoints — Affectations matières

### GET /affectations-matieres

Liste les affectations matières d'un enseignant.

**Source frontend** : `EnseignantApiService.getAffectations()` ([enseignant-api.service.ts:66](../../src/app/core/services/enseignant-api.service.ts#L66))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `enseignantId` | UUID | oui | |
| `anneeAcademiqueId` | UUID | non | Filtre année |

**Response 200** — `ApiResponse<AffectationMatiere[]>`

---

### POST /affectations-matieres

Crée une affectation.

**Source frontend** : `EnseignantApiService.affecterMatiere()` ([enseignant-api.service.ts:77](../../src/app/core/services/enseignant-api.service.ts#L77))

**Request body** : `AffecterMatiereDto`

**Response 201** — `ApiResponse<AffectationMatiere>`

**Erreurs**
- `409` affectation identique déjà existante (même enseignant × matière × classe × année)

---

### PATCH /affectations-matieres/{id}

Modifie une affectation (heures prévues, actif).

**Source frontend** : `EnseignantApiService.updateAffectation()` ([enseignant-api.service.ts:83](../../src/app/core/services/enseignant-api.service.ts#L83))

**Path parameters** : `id: UUID`

**Request body** : `UpdateAffectationDto`

**Response 200** — `ApiResponse<AffectationMatiere>`

---

### DELETE /affectations-matieres/{id}

Supprime une affectation.

**Source frontend** : `EnseignantApiService.supprimerAffectation()` ([enseignant-api.service.ts:92](../../src/app/core/services/enseignant-api.service.ts#L92))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

**Erreurs**
- `409` séances déjà réalisées rattachées à cette affectation
