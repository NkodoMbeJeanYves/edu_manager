import { Etablissement, AnneeAcademique } from './etablissement.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type TypeCycle = 'primaire' | 'secondaire' | 'superieur';
export type TypeEtablissementFormation = 'scolaire' | 'universitaire';
export type TypeGroupe = 'td' | 'tp' | 'langue' | 'option' | 'sport';
export type StatutClasse = 'active' | 'archivee' | 'fermee';
export type SystemeLMD = 'licence' | 'master' | 'doctorat' | 'bts' | 'dut' | 'autre';

export interface Cycle {
  id: string;
  etablissementId: string;
  etablissement?: Etablissement;
  libelle: string;
  code: string;
  type: TypeCycle;
  typeFormation: TypeEtablissementFormation;
  description?: string;
  actif: boolean;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

export interface Filiere {
  id: string;
  cycleId: string;
  cycle?: Cycle;
  etablissementId: string;
  libelle: string;
  code: string;
  description?: string;
  systemeLMD?: SystemeLMD;
  dureeAnnees?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Niveau {
  id: string;
  filiereId: string;
  filiere?: Filiere;
  libelle: string;
  code: string;
  ordre: number;
  typeFormation: TypeEtablissementFormation;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Classe {
  id: string;
  niveauId: string;
  niveau?: Niveau;
  filiereId: string;
  filiere?: Filiere;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;
  code: string;
  capaciteMax: number;
  effectifActuel: number;
  professeurPrincipalId?: string;
  professeurPrincipalNom?: string;
  statut: StatutClasse;
  salle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  niveauId: string;
  niveau?: Niveau;
  filiereId: string;
  filiere?: Filiere;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;
  code: string;
  capaciteMax: number;
  effectifActuel: number;
  responsableId?: string;
  responsableNom?: string;
  statut: StatutClasse;
  groupes?: Groupe[];
  createdAt: string;
  updatedAt: string;
}

export interface Groupe {
  id: string;
  promotionId: string;
  promotion?: Promotion;
  libelle: string;
  code: string;
  type: TypeGroupe;
  capaciteMax: number;
  effectifActuel: number;
  enseignantId?: string;
  enseignantNom?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatsStructure {
  totalCycles: number;
  totalFilieres: number;
  totalNiveaux: number;
  totalClasses: number;
  totalPromotions: number;
  totalGroupes: number;
  effectifTotal: number;
  effectifScolaire: number;
  effectifUniversitaire: number;
  tauxRemplissage: number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCycleDto {
  etablissementId: string;
  libelle: string;
  code: string;
  type: TypeCycle;
  typeFormation: TypeEtablissementFormation;
  description?: string;
  ordre?: number;
}

export interface UpdateCycleDto extends Partial<CreateCycleDto> {
  actif?: boolean;
}

export interface CreateFiliereDto {
  cycleId: string;
  etablissementId: string;
  libelle: string;
  code: string;
  description?: string;
  systemeLMD?: SystemeLMD;
  dureeAnnees?: number;
}

export interface UpdateFiliereDto extends Partial<CreateFiliereDto> {
  actif?: boolean;
}

export interface CreateNiveauDto {
  filiereId: string;
  libelle: string;
  code: string;
  ordre: number;
  typeFormation: TypeEtablissementFormation;
}

export interface UpdateNiveauDto extends Partial<CreateNiveauDto> {
  actif?: boolean;
}

export interface CreateClasseDto {
  niveauId: string;
  filiereId: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  code: string;
  capaciteMax: number;
  professeurPrincipalId?: string;
  salle?: string;
}

export interface UpdateClasseDto extends Partial<CreateClasseDto> {
  statut?: StatutClasse;
}

export interface CreatePromotionDto {
  niveauId: string;
  filiereId: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  code: string;
  capaciteMax: number;
  responsableId?: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  statut?: StatutClasse;
}

export interface CreateGroupeDto {
  promotionId: string;
  libelle: string;
  code: string;
  type: TypeGroupe;
  capaciteMax: number;
  enseignantId?: string;
}

export interface UpdateGroupeDto extends Partial<CreateGroupeDto> {
  actif?: boolean;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface ClasseFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  filiereId?: string;
  niveauId?: string;
  statut?: StatutClasse;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PromotionFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  filiereId?: string;
  niveauId?: string;
  statut?: StatutClasse;
  search?: string;
  page?: number;
  limit?: number;
}
