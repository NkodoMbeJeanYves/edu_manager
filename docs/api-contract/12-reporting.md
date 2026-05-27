# Module Reporting

Tableaux de bord, indicateurs temps réel, rapports pédagogique / absentéisme / financier, et export.

**Source frontend** : [`reporting-api.service.ts`](../../src/app/core/services/reporting-api.service.ts) (`ReportingApiService`)

**Préfixe** : `/reporting`

**6 endpoints + 1 export blob = 7 routes**.

---

## Schémas du module

### Enums

```ts
type PeriodeRapport = 'semaine' | 'mois' | 'trimestre' | 'semestre' | 'annee';
type FormatExport   = 'pdf' | 'xlsx' | 'csv';
type NiveauAlerte   = 'info' | 'warning' | 'critical';
```

### `FiltresRapport`

Type de query commun à la quasi-totalité des endpoints reporting.

```ts
interface FiltresRapport {
  etablissementId: string;        // requis
  anneeAcademiqueId: string;      // requis
  periodeId?: string;
  filiereId?: string;
  classeId?: string;
  promotionId?: string;
  matiereId?: string;
  enseignantId?: string;
  dateDebut?: string;             // YYYY-MM-DD
  dateFin?: string;               // YYYY-MM-DD
  periode?: PeriodeRapport;
}
```

### Entités de réponse

```ts
interface AlerteIndicateur {
  niveau: NiveauAlerte;
  module: string;                 // ex. "bulletins", "absences"
  message: string;
  valeur: number;
  seuil: number;
  lien?: string;
}

interface TableauBordDirection {
  periode: string;
  effectifs: {
    total: number;
    actifs: number;
    scolaires: number;
    universitaires: number;
    nouveauxInscrits: number;
    evolution: number;            // % vs période précédente
  };
  pedagogique: {
    tauxReussite: number;
    moyenneGenerale: number;
    tauxAbsenteisme: number;
    seancesRealisees: number;
    tauxCouvertureEDT: number;
    bulletinsPublies: number;
  };
  financier: {
    totalAttendu: number;
    totalRecouvre: number;
    tauxRecouvrement: number;
    encours: number;
    dossiersEnRetard: number;
  };
  alertes: AlerteIndicateur[];
}

interface RapportPedagogique {
  type: 'classe' | 'filiere' | 'matiere' | 'enseignant';
  entityId: string;
  entityLibelle: string;
  periode: string;
  moyenneGenerale: number | null;
  tauxReussite: number;
  nombreApprenants: number;
  absenteisme: number;
  topPerformeurs: { apprenantId: string; nom: string; moyenne: number }[];
  enDifficulte:   { apprenantId: string; nom: string; moyenne: number }[];
  evolutionParMois: { mois: string; moyenne: number }[];
  parMatiere?:    { matiereLibelle: string; moyenne: number; tauxReussite: number }[];
}

interface RapportAbsenteisme {
  periode: string;
  classeId?: string;
  classeLibelle?: string;
  tauxMoyen: number;
  topAbsents:      { apprenantId: string; nom: string; heures: number; taux: number }[];
  evolutionHebdo:  { semaine: string; taux: number }[];
  parJourSemaine:  { jour: string; taux: number }[];
  matieresImpactees: { matiereLibelle: string; taux: number }[];
}

interface RapportFinancier {
  periode: string;
  totalAttendu: number;
  totalRecouvre: number;
  encours: number;
  tauxRecouvrement: number;
  evolutionMensuelle: { mois: string; recouvre: number; attendu: number }[];
  parFiliere:         { filiereLibelle: string; attendu: number; recouvre: number; taux: number }[];
  parModePaiement:    { mode: string; montant: number; pourcentage: number }[];
  topDebiteurs:       { apprenantId: string; nom: string; montantRestant: number }[];
}

interface IndicateursTempsReel {
  absencesAujourdHui: number;
  seancesAujourdHui: number;
  paiementsAujourdHui: number;
  montantAujourdHui: number;
  notificationsEnAttente: number;
  justificatifsEnAttente: number;
  boursesEnAttente: number;
}
```

### DTO d'export

```ts
interface ExporterRapportDto extends FiltresRapport {
  type: 'tableau_bord' | 'pedagogique' | 'absenteisme' | 'financier';
  format: FormatExport;
}
```

---

## Endpoints

### GET /reporting/tableau-bord

Tableau de bord direction (effectifs, pédagogique, financier, alertes).

**Source frontend** : `ReportingApiService.getTableauBord()` ([reporting-api.service.ts:26](../../src/app/core/services/reporting-api.service.ts#L26))

**Query parameters** : tous les champs de `FiltresRapport`.

**Response 200** — `ApiResponse<TableauBordDirection>`

---

### GET /reporting/temps-reel

Indicateurs temps réel pour la journée (compteurs).

**Source frontend** : `ReportingApiService.getIndicateursTempsReel()` ([reporting-api.service.ts:34](../../src/app/core/services/reporting-api.service.ts#L34))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | Tenant scope |

**Response 200** — `ApiResponse<IndicateursTempsReel>`

---

### GET /reporting/pedagogique

Rapport pédagogique sur le périmètre filtré (classe, filière, matière).

**Source frontend** : `ReportingApiService.getRapportClasse()` ([reporting-api.service.ts:42](../../src/app/core/services/reporting-api.service.ts#L42))

**Query parameters** : tous les champs de `FiltresRapport`.

**Response 200** — `ApiResponse<RapportPedagogique>`

---

### GET /reporting/enseignant/{enseignantId}

Rapport spécifique d'un enseignant (matières enseignées, classes, perfs).

**Source frontend** : `ReportingApiService.getRapportEnseignant()` ([reporting-api.service.ts:49](../../src/app/core/services/reporting-api.service.ts#L49))

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `enseignantId` | UUID | ID enseignant |

**Query parameters** : tous les champs de `FiltresRapport`.

**Response 200** — `ApiResponse<RapportPedagogique>` (avec `type: 'enseignant'`)

**Erreurs**
- `404` enseignant introuvable dans le tenant

---

### GET /reporting/absenteisme

Rapport absentéisme sur le périmètre filtré.

**Source frontend** : `ReportingApiService.getRapportAbsenteisme()` ([reporting-api.service.ts:57](../../src/app/core/services/reporting-api.service.ts#L57))

**Query parameters** : tous les champs de `FiltresRapport`.

**Response 200** — `ApiResponse<RapportAbsenteisme>`

---

### GET /reporting/financier

Rapport financier (recouvrement, top débiteurs, modes paiement).

**Source frontend** : `ReportingApiService.getRapportFinancier()` ([reporting-api.service.ts:65](../../src/app/core/services/reporting-api.service.ts#L65))

**Query parameters** : tous les champs de `FiltresRapport`.

**Response 200** — `ApiResponse<RapportFinancier>`

---

### GET /reporting/export

Exporte un rapport au format demandé (PDF, XLSX, CSV).

**Source frontend** : `ReportingApiService.exporterRapport()` ([reporting-api.service.ts:73](../../src/app/core/services/reporting-api.service.ts#L73))

**Query parameters** : tous les champs de `ExporterRapportDto` (FiltresRapport + `type` + `format`).

| Champ | Type | Requis | Description |
|---|---|---|---|
| `type` | `'tableau_bord' \| 'pedagogique' \| 'absenteisme' \| 'financier'` | oui | Type de rapport à exporter |
| `format` | `'pdf' \| 'xlsx' \| 'csv'` | oui | Format de fichier |

**Response 200** — Blob

- `Content-Type` :
  - `application/pdf` si `format=pdf`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` si `format=xlsx`
  - `text/csv` si `format=csv`
- `Content-Disposition: attachment; filename="..."`

**Erreurs**
- `400` combinaison `type` × `format` invalide
- `422` filtres insuffisants pour générer le rapport
