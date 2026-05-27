# Module Bulletins & Délibérations

Bulletins scolaires, relevés universitaires (ECTS), délibérations de jury, PV signés.

**Source frontend** : [`bulletin-api.service.ts`](../../src/app/core/services/bulletin-api.service.ts) (`BulletinApiService`)

**28 endpoints**.

---

## Schémas du module

### Enums

```ts
type TypeDocument = 'bulletin' | 'releve';

type StatutDocument = 'brouillon' | 'genere' | 'valide' | 'signe' | 'publie' | 'archive';

type DecisionBulletin = 'passage' | 'redoublement' | 'passage_conditionnel'
                      | 'exclusion' | 'felicitations' | 'encouragements'
                      | 'mise_en_garde' | 'tableau_honneur' | 'admis';

type MentionGenerale = 'tres_bien' | 'bien' | 'assez_bien' | 'passable' | 'insuffisant';

type StatutDeliberation = 'preparation' | 'en_cours' | 'terminee' | 'signee' | 'publiee';

type DecisionJury = 'admis' | 'admis_rattrapage' | 'ajourne' | 'redoublant'
                  | 'exclu' | 'dispense' | 'en_attente';
```

> **Workflow document** : `brouillon → genere → valide → signe → publie → archive`. Une fois `signe`, le PDF est définitif.

### `LigneBulletin`

```ts
interface LigneBulletin {
  matiereId: string;
  matiereCode: string;
  matiereLibelle: string;
  coefficient: number;
  noteCC?: number | null;
  notePartiel?: number | null;
  noteExamen?: number | null;
  moyenne: number | null;
  moyenneClasse?: number | null;
  appreciation?: string;
  enseignantNom?: string;
  rang?: number;
  eliminatoire: boolean;
}
```

### `BilanAbsences`

```ts
interface BilanAbsences {
  totalHeures: number;
  heuresJustifiees: number;
  heuresInjustifiees: number;
  nombreAbsences: number;
}
```

### `Bulletin`

```ts
interface Bulletin {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  periodeId: string;
  periode?: Periode;
  type: 'bulletin';
  statut: StatutDocument;
  lignes: LigneBulletin[];
  moyenneGenerale: number | null;
  moyenneClasse?: number | null;
  rang?: number;
  totalApprenants?: number;
  mention?: MentionGenerale;
  decision?: DecisionBulletin;
  appreciationGenerale?: string;
  appreciationProfPrincipal?: string;
  bilanAbsences?: BilanAbsences;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `ReleverNotes` (universitaire)

```ts
interface LigneReleveUE {
  ueId: string;
  ueCode: string;
  ueLibelle: string;
  credits: number;
  creditsAcquis: number;
  matieresNotes: {
    matiereId: string;
    matiereLibelle: string;
    noteCC?: number | null;
    notePartiel?: number | null;
    moyenne: number | null;
    coefficient: number;
  }[];
  moyenneUE: number | null;
  validee: boolean;
  mention?: MentionGenerale;
  session: 'S1' | 'S2';
}

interface ReleverNotes {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  periodeId?: string;
  type: 'releve';
  statut: StatutDocument;
  lignesUE: LigneReleveUE[];
  ectsAcquisPeriode: number;
  ectsTotalPeriode: number;
  ectsAcquisCumul: number;
  ectsTotalCumul: number;
  moyenneSemestre: number | null;
  mention?: MentionGenerale;
  decision?: DecisionJury;
  semestreValide: boolean;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `Deliberation`

```ts
interface LigneDeliberation {
  apprenantId: string;
  apprenantNom: string;
  apprenantPrenom: string;
  numeroInscription: string;
  moyenneGenerale: number | null;
  ectsAcquis?: number;
  semestreValide?: boolean;
  uesNonValidees?: string[];
  decision: DecisionJury | DecisionBulletin | null;
  mention?: MentionGenerale;
  commentaire?: string;
  casSpecial?: 'fraude' | 'dispense' | 'vae' | 'eliminatoire' | null;
  modifieeManuel: boolean;
}

interface Deliberation {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId: string;
  classeOuPromotionId: string;
  classeOuPromotionLibelle: string;
  type: 'conseil_classe' | 'jury_universitaire';
  statut: StatutDeliberation;
  session?: 'S1' | 'S2';
  dateDeliberation?: string;
  president?: string;
  membres?: string[];
  lignes: LigneDeliberation[];
  compensationActivee: boolean;
  pvUrl?: string;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `PVDeliberation`

```ts
interface PVDeliberation {
  deliberationId: string;
  numero: string;                     // ex. "PV-2026-LIC-001"
  dateEmission: string;
  contenu: string;                    // narratif structuré
  signataires: { nom: string; fonction: string; dateSigne?: string }[];
  statut: 'brouillon' | 'signe' | 'archive';
}
```

### Stats

```ts
interface StatsBulletins {
  total: number;
  generes: number;
  publies: number;
  enAttente: number;
  tauxGeneration: number;             // %
}

interface StatsDeliberation {
  total: number;
  admis: number;
  admisRattrapage: number;
  ajournes: number;
  redoublants: number;
  exclus: number;
  tauxReussite: number;
  moyennePromotion: number | null;
}
```

### DTOs

```ts
interface GenererBulletinsDto {
  etablissementId: string;
  periodeId: string;
  classeId?: string;                  // si absent : tous les classes du tenant
  regenerer?: boolean;                // si true : re-génère même les bulletins existants
}

interface GenererReleveDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  promotionId?: string;
  apprenantId?: string;
  regenerer?: boolean;
}

interface ValiderDocumentDto {
  commentaire?: string;
}

interface SignerDocumentDto {
  signataire: string;                 // nom complet
  fonction: string;                   // ex. "Directeur", "Proviseur"
}

interface PublierDocumentsDto {
  periodeId: string;
  classeOuPromotionId?: string;
}

interface CreateDeliberationDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId: string;
  classeOuPromotionId: string;
  type: 'conseil_classe' | 'jury_universitaire';
  session?: 'S1' | 'S2';
  dateDeliberation?: string;
  president?: string;
  membres?: string[];
  compensationActivee?: boolean;
}

interface UpdateDecisionDto {
  apprenantId: string;
  decision: DecisionJury | DecisionBulletin;
  mention?: MentionGenerale;
  commentaire?: string;
  casSpecial?: string;
}

interface ApprecierBulletinDto {
  apprenantId: string;
  periodeId: string;
  appreciationGenerale?: string;
  appreciationProfPrincipal?: string;
  decision?: DecisionBulletin;
}

interface BulletinFilters {
  apprenantId?: string;
  periodeId?: string;
  anneeAcademiqueId?: string;
  classeId?: string;
  statut?: StatutDocument;
  type?: TypeDocument;
  page?: number;
  limit?: number;
}

interface DeliberationFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  periodeId?: string;
  type?: string;
  statut?: StatutDeliberation;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Bulletins scolaires

### GET /bulletins

Liste paginée des bulletins.

**Source frontend** : `BulletinApiService.getBulletins()` ([bulletin-api.service.ts:22](../../src/app/core/services/bulletin-api.service.ts#L22))

**Query parameters** : tous les champs de `BulletinFilters`.

**Response 200** — `PaginatedResponse<Bulletin>`

---

### GET /bulletins/{id}

Détail d'un bulletin.

**Source frontend** : `BulletinApiService.getBulletin()` ([bulletin-api.service.ts:34](../../src/app/core/services/bulletin-api.service.ts#L34))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Bulletin>`

---

### GET /apprenants/{apprenantId}/bulletins/{periodeId}

Récupère le bulletin d'un apprenant pour une période.

**Source frontend** : `BulletinApiService.getBulletinApprenant()` ([bulletin-api.service.ts:38](../../src/app/core/services/bulletin-api.service.ts#L38))

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `apprenantId` | UUID | |
| `periodeId` | UUID | |

**Response 200** — `ApiResponse<Bulletin>`

**Erreurs**
- `404` aucun bulletin pour ce couple

---

### POST /bulletins/generer

Génère (ou régénère) les bulletins d'une période. Opération potentiellement lourde — peut être asynchrone côté back.

**Source frontend** : `BulletinApiService.genererBulletins()` ([bulletin-api.service.ts:47](../../src/app/core/services/bulletin-api.service.ts#L47))

**Request body** : `GenererBulletinsDto`

**Response 201** — `ApiResponse<{ count: number; bulletins: Bulletin[] }>` (statut initial `genere`)

**Erreurs**
- `409` notes manquantes pour la période (taux complétion < seuil)

---

### PATCH /bulletins/{id}/valider

Valide un bulletin. **Transition** : `genere` → `valide`.

**Source frontend** : `BulletinApiService.validerBulletin()` ([bulletin-api.service.ts:53](../../src/app/core/services/bulletin-api.service.ts#L53))

**Path parameters** : `id: UUID`

**Request body** : `ValiderDocumentDto`

**Response 200** — `ApiResponse<Bulletin>`

---

### PATCH /bulletins/{id}/signer

Signe un bulletin (signature électronique). **Transition** : `valide` → `signe`. Génère le PDF définitif (`pdfUrl`).

**Source frontend** : `BulletinApiService.signerBulletin()` ([bulletin-api.service.ts:59](../../src/app/core/services/bulletin-api.service.ts#L59))

**Path parameters** : `id: UUID`

**Request body** : `SignerDocumentDto`

**Response 200** — `ApiResponse<Bulletin>` (avec `pdfUrl`, `signePar`, `dateSigne` renseignés)

**Erreurs**
- `403` rôle insuffisant (`sign` sur `bulletins`)
- `409` bulletin pas encore validé

---

### PATCH /bulletins/publier

Publie en masse les bulletins d'une période/classe (rend visibles aux apprenants/parents).

**Source frontend** : `BulletinApiService.publierBulletins()` ([bulletin-api.service.ts:65](../../src/app/core/services/bulletin-api.service.ts#L65))

**Request body** : `PublierDocumentsDto`

**Response 200** — `ApiResponse<{ count: number }>` — nombre de bulletins publiés

---

### GET /bulletins/{id}/pdf

Télécharge le PDF d'un bulletin.

**Source frontend** : `BulletinApiService.telechargerBulletin()` ([bulletin-api.service.ts:71](../../src/app/core/services/bulletin-api.service.ts#L71))

**Path parameters** : `id: UUID`

**Response 200** — Blob `application/pdf`

**Erreurs**
- `404` bulletin pas encore signé (donc pas de PDF)

---

### PATCH /bulletins/appreciations

Saisit/met à jour les appréciations générales et la décision sur un bulletin (par l'équipe pédagogique).

**Source frontend** : `BulletinApiService.apprecerBulletin()` ([bulletin-api.service.ts:77](../../src/app/core/services/bulletin-api.service.ts#L77))

**Request body** : `ApprecierBulletinDto`

**Response 200** — `ApiResponse<Bulletin>`

---

### GET /bulletins/stats

Stats de génération/publication des bulletins.

**Source frontend** : `BulletinApiService.getStatsBulletins()` ([bulletin-api.service.ts:83](../../src/app/core/services/bulletin-api.service.ts#L83))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | non | |
| `periodeId` | UUID | non | |

**Response 200** — `ApiResponse<StatsBulletins>`

---

## Endpoints — Relevés universitaires

### GET /apprenants/{apprenantId}/releves

Liste les relevés d'un apprenant.

**Source frontend** : `BulletinApiService.getReleveApprenant()` ([bulletin-api.service.ts:97](../../src/app/core/services/bulletin-api.service.ts#L97))

**Path parameters** : `apprenantId: UUID`

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `anneeAcademiqueId` | UUID | non | |
| `periodeId` | UUID | non | |

**Response 200** — `ApiResponse<ReleverNotes[]>`

---

### POST /releves/generer

Génère des relevés universitaires (par promotion ou apprenant unique).

**Source frontend** : `BulletinApiService.genererReleve()` ([bulletin-api.service.ts:110](../../src/app/core/services/bulletin-api.service.ts#L110))

**Request body** : `GenererReleveDto`

**Response 201** — `ApiResponse<ReleverNotes[]>`

---

### PATCH /releves/{id}/valider

Valide un relevé.

**Source frontend** : `BulletinApiService.validerReleve()` ([bulletin-api.service.ts:116](../../src/app/core/services/bulletin-api.service.ts#L116))

**Path parameters** : `id: UUID`

**Request body** : `ValiderDocumentDto`

**Response 200** — `ApiResponse<ReleverNotes>`

---

### PATCH /releves/{id}/signer

Signe un relevé.

**Source frontend** : `BulletinApiService.signerReleve()` ([bulletin-api.service.ts:122](../../src/app/core/services/bulletin-api.service.ts#L122))

**Path parameters** : `id: UUID`

**Request body** : `SignerDocumentDto`

**Response 200** — `ApiResponse<ReleverNotes>` (avec `pdfUrl`)

---

### PATCH /releves/{id}/publier

Publie un relevé.

**Source frontend** : `BulletinApiService.publierReleve()` ([bulletin-api.service.ts:128](../../src/app/core/services/bulletin-api.service.ts#L128))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<ReleverNotes>`

---

### GET /releves/{id}/pdf

Télécharge le PDF d'un relevé.

**Source frontend** : `BulletinApiService.telechargerReleve()` ([bulletin-api.service.ts:134](../../src/app/core/services/bulletin-api.service.ts#L134))

**Path parameters** : `id: UUID`

**Response 200** — Blob `application/pdf`

---

## Endpoints — Délibérations

### GET /deliberations

Liste paginée des délibérations.

**Source frontend** : `BulletinApiService.getDeliberations()` ([bulletin-api.service.ts:142](../../src/app/core/services/bulletin-api.service.ts#L142))

**Query parameters** : tous les champs de `DeliberationFilters`.

**Response 200** — `PaginatedResponse<Deliberation>`

---

### GET /deliberations/{id}

Détail d'une délibération (avec lignes hydratées).

**Source frontend** : `BulletinApiService.getDeliberation()` ([bulletin-api.service.ts:154](../../src/app/core/services/bulletin-api.service.ts#L154))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<Deliberation>`

---

### POST /deliberations

Crée une délibération (statut initial `preparation`).

**Source frontend** : `BulletinApiService.createDeliberation()` ([bulletin-api.service.ts:158](../../src/app/core/services/bulletin-api.service.ts#L158))

**Request body** : `CreateDeliberationDto`

**Response 201** — `ApiResponse<Deliberation>`

---

### PATCH /deliberations/{id}/preparer

Démarre la préparation des données (calcul auto des décisions provisoires). **Transition** : `preparation` → `en_cours`.

**Source frontend** : `BulletinApiService.preparerDeliberation()` ([bulletin-api.service.ts:164](../../src/app/core/services/bulletin-api.service.ts#L164))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Deliberation>` (avec `lignes` calculées)

---

### PATCH /deliberations/{id}/compenser

Applique la compensation entre UE compensables (mode universitaire). Met à jour les décisions provisoires.

**Source frontend** : `BulletinApiService.appliquerCompensation()` ([bulletin-api.service.ts:170](../../src/app/core/services/bulletin-api.service.ts#L170))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Deliberation>` (avec `compensationActivee: true`)

---

### PATCH /deliberations/{id}/decision

Modifie manuellement la décision pour un apprenant.

**Source frontend** : `BulletinApiService.updateDecision()` ([bulletin-api.service.ts:176](../../src/app/core/services/bulletin-api.service.ts#L176))

**Path parameters** : `id: UUID`

**Request body** : `UpdateDecisionDto`

**Response 200** — `ApiResponse<Deliberation>` (ligne mise à jour avec `modifieeManuel: true`)

---

### PATCH /deliberations/{id}/cloturer

Clôture la délibération. **Transition** : `en_cours` → `terminee`.

**Source frontend** : `BulletinApiService.cloturerDeliberation()` ([bulletin-api.service.ts:182](../../src/app/core/services/bulletin-api.service.ts#L182))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Deliberation>`

---

### PATCH /deliberations/{id}/signer

Signe la délibération. **Transition** : `terminee` → `signee`.

**Source frontend** : `BulletinApiService.signerDeliberation()` ([bulletin-api.service.ts:188](../../src/app/core/services/bulletin-api.service.ts#L188))

**Path parameters** : `id: UUID`

**Request body** : `SignerDocumentDto`

**Response 200** — `ApiResponse<Deliberation>`

---

### PATCH /deliberations/{id}/publier

Publie la délibération. **Transition** : `signee` → `publiee`.

**Source frontend** : `BulletinApiService.publierDeliberation()` ([bulletin-api.service.ts:194](../../src/app/core/services/bulletin-api.service.ts#L194))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Deliberation>`

---

### POST /deliberations/{id}/pv

Génère ou récupère le procès-verbal de délibération.

**Source frontend** : `BulletinApiService.genererPV()` ([bulletin-api.service.ts:200](../../src/app/core/services/bulletin-api.service.ts#L200))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200/201** — `ApiResponse<PVDeliberation>`

---

### GET /deliberations/{id}/pv/pdf

Télécharge le PDF du PV.

**Source frontend** : `BulletinApiService.telechargerPV()` ([bulletin-api.service.ts:206](../../src/app/core/services/bulletin-api.service.ts#L206))

**Path parameters** : `id: UUID`

**Response 200** — Blob `application/pdf`

---

### GET /deliberations/{id}/stats

Stats agrégées d'une délibération (admis, ajournés, taux réussite).

**Source frontend** : `BulletinApiService.getStatsDeliberation()` ([bulletin-api.service.ts:212](../../src/app/core/services/bulletin-api.service.ts#L212))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<StatsDeliberation>`
