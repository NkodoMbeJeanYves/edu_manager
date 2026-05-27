import { Filiere, Niveau } from './structure.models';
import { AnneeAcademique } from './etablissement.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type TypeMatiere =
  | 'cours_magistral'
  | 'td'
  | 'tp'
  | 'projet'
  | 'stage'
  | 'memoire'
  | 'seminaire'
  | 'sport'
  | 'langue';

export type TypeUE =
  | 'fondamentale'
  | 'complementaire'
  | 'optionnelle'
  | 'libre';

export type NatureEvaluation =
  | 'cc_uniquement'
  | 'examen_uniquement'
  | 'cc_et_examen'
  | 'tp_et_examen'
  | 'projet_soutenance';

export interface Matiere {
  id: string;
  etablissementId: string;
  filiereId?: string;
  filiere?: Filiere;
  niveauId?: string;
  niveau?: Niveau;
  ueId?: string;
  anneeAcademiqueId?: string;
  anneeAcademique?: AnneeAcademique;
  code: string;
  libelle: string;
  type: TypeMatiere;
  coefficient: number;
  volumeHoraireCM: number;
  volumeHoraireTD: number;
  volumeHoraireTP: number;
  volumeHoraireTotal: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire: boolean;
  seuilEliminatoire?: number;
  noteMax: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UE {
  id: string;
  etablissementId: string;
  filiereId: string;
  filiere?: Filiere;
  niveauId: string;
  niveau?: Niveau;
  anneeAcademiqueId?: string;
  semestre: number;
  code: string;
  libelle: string;
  type: TypeUE;
  credits: number;
  coefficient: number;
  volumeHoraireTotal: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire: boolean;
  seuilValidation: number;
  compensable: boolean;
  matieres?: Matiere[];
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Programme {
  id: string;
  etablissementId: string;
  filiereId: string;
  niveauId: string;
  anneeAcademiqueId: string;
  libelle: string;
  typeFormation: 'scolaire' | 'universitaire';
  ues?: UE[];
  matieres?: Matiere[];
  totalCredits?: number;
  totalVolumeHoraire?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatsReferentiel {
  totalMatieres: number;
  totalUE: number;
  totalProgrammes: number;
  matieresScolaires: number;
  matieresUniversitaires: number;
  matieresEliminatoires: number;
  totalCreditsParNiveau: { niveauId: string; niveauLibelle: string; credits: number }[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateMatiereDto {
  etablissementId: string;
  filiereId?: string;
  niveauId?: string;
  ueId?: string;
  anneeAcademiqueId?: string;
  code: string;
  libelle: string;
  type: TypeMatiere;
  coefficient: number;
  volumeHoraireCM?: number;
  volumeHoraireTD?: number;
  volumeHoraireTP?: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire?: boolean;
  seuilEliminatoire?: number;
  noteMax?: number;
}

export interface UpdateMatiereDto extends Partial<CreateMatiereDto> {
  actif?: boolean;
}

export interface CreateUEDto {
  etablissementId: string;
  filiereId: string;
  niveauId: string;
  anneeAcademiqueId?: string;
  semestre: number;
  code: string;
  libelle: string;
  type: TypeUE;
  credits: number;
  coefficient: number;
  volumeHoraireTotal?: number;
  natureEvaluation: NatureEvaluation;
  ponderationCC: number;
  ponderationExamen: number;
  eliminatoire?: boolean;
  seuilValidation?: number;
  compensable?: boolean;
}

export interface UpdateUEDto extends Partial<CreateUEDto> {
  actif?: boolean;
}

export interface RattacherMatiereUEDto {
  matiereId: string;
  ueId: string;
  coefficient?: number;
}

export interface DupliquerReferentielDto {
  sourceAnneeId: string;
  targetAnneeId: string;
  filiereId?: string;
  niveauId?: string;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface MatiereFilters {
  etablissementId?: string;
  filiereId?: string;
  niveauId?: string;
  ueId?: string;
  anneeAcademiqueId?: string;
  type?: TypeMatiere;
  eliminatoire?: boolean;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UEFilters {
  etablissementId?: string;
  filiereId?: string;
  niveauId?: string;
  anneeAcademiqueId?: string;
  semestre?: number;
  type?: TypeUE;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
