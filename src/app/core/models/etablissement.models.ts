export type TypeEtablissement = 'scolaire' | 'universitaire';
export type StatutAnnee = 'en_cours' | 'cloturee' | 'archivee' | 'planifiee';
export type TypePeriode = 'trimestre' | 'semestre';
export type TypeSalle = 'cours' | 'amphi' | 'laboratoire' | 'informatique' | 'sport';
export type StatutSalle = 'disponible' | 'maintenance' | 'indisponible';

export interface Etablissement {
  id: string;
  nom: string;
  code: string;
  type: TypeEtablissement;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb?: string;
  logo?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  etablissementId: string;
  etablissement?: Etablissement;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  telephoneDirecteur?: string;
  principal: boolean;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnneeAcademique {
  id: string;
  etablissementId: string;
  etablissement?: Etablissement;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAnnee;
  typePeriode: TypePeriode;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Periode {
  id: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  libelle: string;
  numero: number;
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvenementCalendrier {
  id: string;
  etablissementId: string;
  anneeAcademiqueId?: string;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  type: 'vacances' | 'ferie' | 'examen' | 'evenement';
  createdAt: string;
  updatedAt: string;
}

export interface Equipement {
  id: string;
  nom: string;
  description?: string;
}

export interface Salle {
  id: string;
  campusId: string;
  campus?: Campus;
  code: string;
  nom: string;
  type: TypeSalle;
  capacite: number;
  statut: StatutSalle;
  equipements: Equipement[];
  batiment?: string;
  etage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEtablissementDto {
  nom: string;
  code: string;
  type: TypeEtablissement;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb?: string;
}

export interface UpdateEtablissementDto extends Partial<CreateEtablissementDto> {
  actif?: boolean;
}

export interface CreateCampusDto {
  etablissementId: string;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  telephoneDirecteur?: string;
  principal?: boolean;
}

export interface UpdateCampusDto extends Partial<CreateCampusDto> {
  actif?: boolean;
}

export interface CreateAnneeAcademiqueDto {
  etablissementId: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  typePeriode: TypePeriode;
}

export interface UpdateAnneeAcademiqueDto extends Partial<CreateAnneeAcademiqueDto> {
  statut?: StatutAnnee;
  active?: boolean;
}

export interface CreatePeriodeDto {
  anneeAcademiqueId: string;
  libelle: string;
  numero: number;
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
}

export interface CreateSalleDto {
  campusId: string;
  code: string;
  nom: string;
  type: TypeSalle;
  capacite: number;
  equipements?: Equipement[];
  batiment?: string;
  etage?: number;
}

export interface UpdateSalleDto extends Partial<CreateSalleDto> {
  statut?: StatutSalle;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
