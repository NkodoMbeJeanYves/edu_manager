import { Matiere } from './referentiel.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type StatutEnseignant =
  | 'actif'
  | 'inactif'
  | 'suspendu'
  | 'retraite';

export type TypeContrat =
  | 'titulaire'
  | 'vacataire'
  | 'contractuel'
  | 'fonctionnaire'
  | 'detache';

export type Genre = 'M' | 'F' | 'autre';

export type NiveauDiplome =
  | 'licence'
  | 'master'
  | 'doctorat'
  | 'bts'
  | 'hdr'         // Habilitation à diriger des recherches
  | 'agregation'
  | 'autre';

// ── Enseignant ────────────────────────────────────────────────────────────────

export interface Enseignant {
  id: string;
  etablissementId: string;
  matricule: string;              // identifiant unique ex: "ENS-2024-001"
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  genre: Genre;
  dateNaissance?: string;
  adresse?: string;
  photoUrl?: string;
  statut: StatutEnseignant;
  typeContrat: TypeContrat;
  dateEntree: string;             // date d'arrivée dans l'établissement
  dateSortie?: string;
  niveauDiplome?: NiveauDiplome;
  specialites?: string[];         // libellés libres ex: ["Algèbre", "Analyse"]
  matieres?: Matiere[];           // matières affectées
  chargeHoraireMax?: number;      // heures max/semaine selon contrat
  chargeHoraireReelle?: number;   // calculée depuis EDT
  tauxHoraire?: number;           // pour vacataires
  createdAt: string;
  updatedAt: string;
}

// ── Affectation matière ───────────────────────────────────────────────────────

export interface AffectationMatiere {
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

// ── Charge horaire ────────────────────────────────────────────────────────────

export interface ChargeHoraire {
  enseignantId: string;
  anneeAcademiqueId: string;
  totalPrevues: number;
  totalRealisees: number;
  totalRestantes: number;
  tauxRealisation: number;        // %
  parMatiere: {
    matiereId: string;
    matiereLibelle: string;
    heuresPrevues: number;
    heuresRealisees: number;
  }[];
  parSemaine: {
    semaine: string;              // "2024-W38"
    heures: number;
  }[];
  alerteDepassement: boolean;
}

// ── Statistiques enseignant ───────────────────────────────────────────────────

export interface StatsEnseignant {
  totalEnseignants: number;
  actifs: number;
  vacataires: number;
  titulaires: number;
  tauxPresence: number;
  chargeHoraireMoyenne: number;
  enseignantsEnSurcharge: number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateEnseignantDto {
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

export interface UpdateEnseignantDto extends Partial<CreateEnseignantDto> {
  statut?: StatutEnseignant;
  dateSortie?: string;
}

export interface AffecterMatiereDto {
  enseignantId: string;
  matiereId: string;
  classeId?: string;
  promotionId?: string;
  anneeAcademiqueId: string;
  heuresPrevues: number;
}

export interface UpdateAffectationDto {
  heuresPrevues?: number;
  actif?: boolean;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface EnseignantFilters {
  etablissementId?: string;
  statut?: StatutEnseignant;
  typeContrat?: TypeContrat;
  matiereId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
