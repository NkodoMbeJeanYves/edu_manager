import { Apprenant } from './apprenant.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type StatutAbsence =
  | 'non_justifiee'       // enregistrée, pas encore de justificatif
  | 'en_attente'          // justificatif soumis, en attente validation
  | 'justifiee'           // justificatif accepté par la scolarité
  | 'rejetee';            // justificatif refusé

export type TypeJustificatif =
  | 'medical'
  | 'familial'
  | 'administratif'
  | 'transport'
  | 'autre';

export type StatutPresence =
  | 'present'
  | 'absent'
  | 'retard'
  | 'dispense';

export type TypeAbsenceEnseignant =
  | 'maladie'
  | 'conge'
  | 'formation'
  | 'mission'
  | 'autre';

// ── Présence (ligne dans la feuille d'appel) ─────────────────────────────────

export interface Presence {
  id: string;
  seanceId: string;
  apprenantId: string;
  apprenant?: Apprenant;
  statut: StatutPresence;
  minutesRetard?: number;     // si retard
  remarque?: string;
  saisieParId?: string;
  saisieParNom?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Absence (entité de suivi) ────────────────────────────────────────────────

export interface Absence {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  seanceId: string;
  matiereId?: string;
  matiereLibelle?: string;
  enseignantId?: string;
  classeId?: string;
  promotionId?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  statut: StatutAbsence;
  estExamen: boolean;         // absence lors d'un examen
  impactNote: boolean;        // note 0 appliquée (si examen + non justifiée)
  notifieeParent: boolean;
  dateNotification?: string;
  justificatif?: Justificatif;
  createdAt: string;
  updatedAt: string;
}

// ── Justificatif ─────────────────────────────────────────────────────────────

export interface Justificatif {
  id: string;
  absenceId: string;
  type: TypeJustificatif;
  description: string;
  fichierUrl?: string;
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

// ── Feuille de présence (appel complet d'une séance) ─────────────────────────

export interface FeuillePresence {
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

// ── Absence enseignant ───────────────────────────────────────────────────────

export interface AbsenceEnseignant {
  id: string;
  enseignantId: string;
  enseignantNom?: string;
  type: TypeAbsenceEnseignant;
  dateDebut: string;
  dateFin: string;
  motif: string;
  seancesImpactees?: string[];  // ids des séances concernées
  remplacementPrevu: boolean;
  enseignantRemplacantId?: string;
  enseignantRemplacantNom?: string;
  createdAt: string;
}

// ── Statistiques d'absentéisme ───────────────────────────────────────────────

export interface StatsAbsenteisme {
  apprenantId: string;
  apprenantNom?: string;
  totalHeures: number;
  heuresJustifiees: number;
  heuresInjustifiees: number;
  heuresRetard: number;
  tauxAbsenteisme: number;           // %
  tauxInjustifie: number;            // %
  nombreAbsences: number;
  absencesExamen: number;
  alerteDepassee: boolean;           // seuil dépassé
  parMatiere?: AbsenteismeMatiere[];
}

export interface AbsenteismeMatiere {
  matiereId: string;
  matiereLibelle: string;
  totalHeures: number;
  heuresAbsence: number;
  taux: number;
}

export interface StatsAbsenteismeClasse {
  classeId?: string;
  promotionId?: string;
  libelle: string;
  totalApprenants: number;
  tauxMoyenAbsenteisme: number;
  apprenantsDessusSeui: number;     // nb d'apprenants dépassant le seuil
  topAbsents: { apprenantId: string; nom: string; heures: number }[];
  parJour: { date: string; nbAbsents: number }[];
}

export interface ParametresAbsenteisme {
  etablissementId: string;
  seuilAlerte: number;              // nb heures injustifiées avant alerte
  delaiSaisieHeures: number;        // délai max pour saisir les présences
  absenceExamenNote0: boolean;      // absence examen = note 0
  notificationParent: boolean;
  notificationDelaiHeures: number;  // délai notification < 24h
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface SaisirPresencesDto {
  seanceId: string;
  presences: {
    apprenantId: string;
    statut: StatutPresence;
    minutesRetard?: number;
    remarque?: string;
  }[];
}

export interface UpdatePresenceDto {
  statut?: StatutPresence;
  minutesRetard?: number;
  remarque?: string;
}

export interface SoumettreJustificatifDto {
  absenceId: string;
  type: TypeJustificatif;
  description: string;
  fichier?: File;
}

export interface ValiderJustificatifDto {
  justificatifId: string;
  statut: 'accepte' | 'rejete';
  commentaire?: string;
}

export interface CreateAbsenceEnseignantDto {
  enseignantId: string;
  type: TypeAbsenceEnseignant;
  dateDebut: string;
  dateFin: string;
  motif: string;
  enseignantRemplacantId?: string;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface AbsenceFilters {
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

export interface PresenceFilters {
  seanceId?: string;
  apprenantId?: string;
  statut?: StatutPresence;
  dateDebut?: string;
  dateFin?: string;
}
