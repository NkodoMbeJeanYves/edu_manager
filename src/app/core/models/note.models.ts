import { Apprenant } from './apprenant.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type TypeEvaluation =
  | 'cc'
  | 'partiel'
  | 'examen_final'
  | 'tp'
  | 'oral'
  | 'projet'
  | 'devoir_maison'
  | 'rattrapage';

export type StatutNote =
  | 'brouillon'
  | 'soumise'
  | 'validee'
  | 'publiee';

export type StatutMoyenne =
  | 'en_cours'
  | 'calculee'
  | 'validee';

export type StatutEvaluation =
  | 'planifiee'
  | 'en_cours'
  | 'cloturee'
  | 'annulee';

// ── Entités principales ──────────────────────────────────────────────────────

export interface Evaluation {
  id: string;
  matiereId: string;
  matiereLibelle?: string;
  periodeId: string;
  periodeLibelle?: string;
  anneeAcademiqueId: string;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  enseignantId: string;
  enseignantNom?: string;
  intitule: string;
  type: TypeEvaluation;
  ponderation: number;
  coefficient: number;
  noteMax: number;
  dateEvaluation: string;
  statut: StatutEvaluation;
  noteSaisieCount?: number;
  totalApprenants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  evaluationId: string;
  evaluation?: Evaluation;
  apprenantId: string;
  apprenant?: Apprenant;
  valeur: number | null;
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

export interface HistoriqueNote {
  ancienneValeur: number | null;
  nouvelleValeur: number | null;
  modifiePar: string;
  motif: string;
  date: string;
}

export interface MoyenneMatiere {
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

export interface MoyenneUE {
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

export interface MoyenneGenerale {
  apprenantId: string;
  apprenant?: Apprenant;
  periodeId?: string;
  anneeAcademiqueId: string;
  moyenne: number | null;
  rang?: number;
  totalApprenants?: number;
  mention?: string;
  ectsAcquis?: number;
  ectsTotal?: number;
  validee: boolean;
  moyennesMatiere?: MoyenneMatiere[];
  moyennesUE?: MoyenneUE[];
  statut: StatutMoyenne;
}

// ── Saisie de masse ──────────────────────────────────────────────────────────

export interface SaisieNoteMasse {
  evaluationId: string;
  notes: {
    apprenantId: string;
    valeur: number | null;
    absent?: boolean;
    dispense?: boolean;
    commentaire?: string;
  }[];
}

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateEvaluationDto {
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
  noteMax?: number;
  dateEvaluation: string;
}

export interface UpdateEvaluationDto extends Partial<CreateEvaluationDto> {
  statut?: StatutEvaluation;
}

export interface CreateNoteDto {
  evaluationId: string;
  apprenantId: string;
  valeur: number | null;
  absent?: boolean;
  dispense?: boolean;
  commentaire?: string;
}

export interface UpdateNoteDto {
  valeur?: number | null;
  absent?: boolean;
  dispense?: boolean;
  commentaire?: string;
  motifModification?: string;
}

export interface ValiderNotesDto {
  evaluationId: string;
  commentaire?: string;
}

export interface PublierNotesDto {
  evaluationId: string;
}

export interface ApprecierMatiereDto {
  matiereId: string;
  apprenantId: string;
  periodeId: string;
  appreciation: string;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface EvaluationFilters {
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

export interface NoteFilters {
  evaluationId?: string;
  apprenantId?: string;
  matiereId?: string;
  periodeId?: string;
  statut?: StatutNote;
  page?: number;
  limit?: number;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface StatistiquesEvaluation {
  evaluationId: string;
  total: number;
  notesSaisies: number;
  absents: number;
  dispenses: number;
  moyenne: number;
  noteMin: number;
  noteMax: number;
  tauxReussite: number;
  distribution: { tranche: string; count: number }[];
}
