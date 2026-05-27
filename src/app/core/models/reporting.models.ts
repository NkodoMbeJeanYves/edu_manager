// ── Types indicateurs ─────────────────────────────────────────────────────────

export type PeriodeRapport = 'semaine' | 'mois' | 'trimestre' | 'semestre' | 'annee';
export type FormatExport = 'pdf' | 'xlsx' | 'csv';

// ── Tableau de bord direction ─────────────────────────────────────────────────

export interface TableauBordDirection {
  periode: string;
  effectifs: {
    total: number;
    actifs: number;
    scolaires: number;
    universitaires: number;
    nouveauxInscrits: number;
    evolution: number;         // % vs période précédente
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

export interface AlerteIndicateur {
  niveau: 'info' | 'warning' | 'critical';
  module: string;
  message: string;
  valeur: number;
  seuil: number;
  lien?: string;
}

// ── Rapport pédagogique ───────────────────────────────────────────────────────

export interface RapportPedagogique {
  type: 'classe' | 'filiere' | 'matiere' | 'enseignant';
  entityId: string;
  entityLibelle: string;
  periode: string;
  moyenneGenerale: number | null;
  tauxReussite: number;
  nombreApprenants: number;
  absenteisme: number;
  topPerformeurs: { apprenantId: string; nom: string; moyenne: number }[];
  enDifficulte: { apprenantId: string; nom: string; moyenne: number }[];
  evolutionParMois: { mois: string; moyenne: number }[];
  parMatiere?: { matiereLibelle: string; moyenne: number; tauxReussite: number }[];
}

// ── Rapport absentéisme ───────────────────────────────────────────────────────

export interface RapportAbsenteisme {
  periode: string;
  classeId?: string;
  classeLibelle?: string;
  tauxMoyen: number;
  topAbsents: { apprenantId: string; nom: string; heures: number; taux: number }[];
  evolutionHebdo: { semaine: string; taux: number }[];
  parJourSemaine: { jour: string; taux: number }[];
  matieresImpactees: { matiereLibelle: string; taux: number }[];
}

// ── Rapport financier ─────────────────────────────────────────────────────────

export interface RapportFinancier {
  periode: string;
  totalAttendu: number;
  totalRecouvre: number;
  encours: number;
  tauxRecouvrement: number;
  evolutionMensuelle: { mois: string; recouvre: number; attendu: number }[];
  parFiliere: { filiereLibelle: string; attendu: number; recouvre: number; taux: number }[];
  parModePaiement: { mode: string; montant: number; pourcentage: number }[];
  topDebiteurs: { apprenantId: string; nom: string; montantRestant: number }[];
}

// ── Indicateurs temps réel ────────────────────────────────────────────────────

export interface IndicateursTempsReel {
  absencesAujourdHui: number;
  seancesAujourdHui: number;
  paiementsAujourdHui: number;
  montantAujourdHui: number;
  notificationsEnAttente: number;
  justificatifsEnAttente: number;
  boursesEnAttente: number;
}

// ── DTOs filtres rapports ─────────────────────────────────────────────────────

export interface FiltresRapport {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  filiereId?: string;
  classeId?: string;
  promotionId?: string;
  matiereId?: string;
  enseignantId?: string;
  dateDebut?: string;
  dateFin?: string;
  periode?: PeriodeRapport;
}

export interface ExporterRapportDto extends FiltresRapport {
  type: 'tableau_bord' | 'pedagogique' | 'absenteisme' | 'financier';
  format: FormatExport;
}
