// ── Enums ────────────────────────────────────────────────────────────────────

export type TypeSession = 'normale' | 'rattrapage' | 'speciale';
export type StatutSession = 'planifiee' | 'en_cours' | 'cloturee' | 'annulee';
export type StatutConvocation = 'generee' | 'envoyee' | 'confirmee' | 'absente';
export type TypeFraude = 'triche' | 'plagiat' | 'comportement' | 'autre';

// ── Session d'examen ──────────────────────────────────────────────────────────

export interface SessionExamen {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  libelle: string;
  type: TypeSession;
  statut: StatutSession;
  dateDebut: string;
  dateFin: string;
  epreuves?: Epreuve[];
  createdAt: string;
  updatedAt: string;
}

export interface Epreuve {
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

export interface Convocation {
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
  motifIneligibilite?: string;   // ex: "dette financière", "dossier incomplet"
  createdAt: string;
}

export interface PVExamen {
  id: string;
  epreuveId: string;
  dateRedaction: string;
  observations: string;
  cas: CasFraude[];
  signePar: string;
  dateSigne?: string;
  statut: 'brouillon' | 'signe' | 'archive';
}

export interface CasFraude {
  apprenantId: string;
  apprenantNom: string;
  type: TypeFraude;
  description: string;
  sanction?: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateSessionDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  libelle: string;
  type: TypeSession;
  dateDebut: string;
  dateFin: string;
}

export interface CreateEpreuveDto {
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

export interface GenererConvocationsDto {
  epreuveId: string;
  verifierEligibilite?: boolean;
}

// ── Filtres ───────────────────────────────────────────────────────────────────

export interface SessionFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  type?: TypeSession;
  statut?: StatutSession;
  page?: number;
  limit?: number;
}
