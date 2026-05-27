// ── Enums & types ────────────────────────────────────────────────────────────

export type TypeCours =
  | 'cm'
  | 'td'
  | 'tp'
  | 'projet'
  | 'examen'
  | 'rattrapage'
  | 'autre';

export type TypeRecurrence =
  | 'aucune'
  | 'hebdomadaire'
  | 'bihebdomadaire'
  | 'mensuel';

export type StatutSeance =
  | 'planifiee'
  | 'en_cours'
  | 'realisee'
  | 'annulee'
  | 'reportee'
  | 'suspendue';

export type StatutEDT =
  | 'brouillon'
  | 'publie'
  | 'archive';

export type TypeConflitEDT =
  | 'enseignant_double'
  | 'salle_double'
  | 'groupe_double'
  | 'hors_periode';

export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';

export interface CreneauHoraire {
  id: string;
  etablissementId: string;
  libelle: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  ordre: number;
  actif: boolean;
}

export interface CoursPlanifie {
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
  couleur?: string;
  note?: string;
  statut: StatutEDT;
  seances?: Seance[];
  createdAt: string;
  updatedAt: string;
}

export interface Seance {
  id: string;
  coursPlanifieId?: string;
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
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  statut: StatutSeance;
  contenuEnseignant?: string;
  travauxDemandes?: string;
  ressources?: string[];
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

export interface ConflitEDT {
  type: TypeConflitEDT;
  message: string;
  seance1?: Partial<Seance>;
  seance2?: Partial<Seance>;
  sallesAlternatives?: { id: string; code: string; libelle: string; capacite: number }[];
}

export interface Indisponibilite {
  id: string;
  enseignantId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;
  heureFin?: string;
  motif: string;
  type: 'conge' | 'absence_planifiee' | 'formation' | 'autre';
  createdAt: string;
}

export interface EventCalendrier {
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

export interface StatsEDT {
  totalSeances: number;
  seancesRealisees: number;
  seancesAnnulees: number;
  tauxRealisation: number;
  volumeHorairePlanifie: number;
  volumeHoraireRealise: number;
  tauxCouverture: number;
  seancesParJour: { jour: string; count: number }[];
}

export interface CouvertureMatiere {
  matiereId: string;
  matiereLibelle: string;
  volumePlanifie: number;
  volumeRealise: number;
  taux: number;
  seancesRestantes: number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCoursPlanifieDto {
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

export interface UpdateCoursPlanifieDto extends Partial<CreateCoursPlanifieDto> {
  statut?: StatutEDT;
}

export interface CreateSeanceDto {
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

export interface UpdateSeanceDto {
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

export interface SaisirCahierTexteDto {
  seanceId: string;
  contenuEnseignant: string;
  travauxDemandes?: string;
  ressources?: string[];
}

export interface GenererSeancesDto {
  coursPlanifieId: string;
  dateDebut: string;
  dateFin: string;
}

export interface PublierEDTDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  classeId?: string;
  promotionId?: string;
}

export interface CreateIndisponibiliteDto {
  enseignantId: string;
  dateDebut: string;
  dateFin: string;
  heureDebut?: string;
  heureFin?: string;
  motif: string;
  type: 'conge' | 'absence_planifiee' | 'formation' | 'autre';
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface SeanceFilters {
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
  semaine?: string;
  page?: number;
  limit?: number;
}

export interface EdtViewFilters {
  vue: 'classe' | 'enseignant' | 'salle' | 'promotion';
  entityId: string;
  semaine: string;
  anneeAcademiqueId: string;
}
