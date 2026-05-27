import { Etablissement } from './etablissement.models';

export type TypeApprenant = 'eleve' | 'etudiant';
export type StatutApprenant =
  | 'actif'
  | 'inactif'
  | 'suspendu'
  | 'diplome'
  | 'abandonne'
  | 'transfere';
export type Genre = 'masculin' | 'feminin';
export type TypePiece =
  | 'cni'
  | 'passeport'
  | 'acte_naissance'
  | 'certificat_scolarite'
  | 'photo'
  | 'autre';
export type StatutPiece = 'en_attente' | 'valide' | 'rejete';
export type LienParente =
  | 'pere'
  | 'mere'
  | 'tuteur'
  | 'grand_parent'
  | 'autre';

export interface Apprenant {
  id: string;
  numeroInscription: string;
  type: TypeApprenant;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  genre: Genre;
  nationalite: string;
  photo?: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone?: string;
  email?: string;
  statut: StatutApprenant;
  etablissementId: string;
  etablissement?: Etablissement;
  anneesInscription?: InscriptionResume[];
  tuteurs?: Tuteur[];
  piecesJustificatives?: PieceJustificative[];
  createdAt: string;
  updatedAt: string;
}

export interface InscriptionResume {
  id: string;
  anneeAcademiqueId: string;
  anneeLibelle: string;
  classeOuPromotion: string;
  statut: string;
  active: boolean;
}

export interface Tuteur {
  id: string;
  apprenantId: string;
  nom: string;
  prenom: string;
  lienParente: LienParente;
  telephone: string;
  telephoneSecondaire?: string;
  email?: string;
  adresse?: string;
  profession?: string;
  contactPrincipal: boolean;
  accesPortail: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PieceJustificative {
  id: string;
  apprenantId: string;
  type: TypePiece;
  nom: string;
  fichierUrl: string;
  statut: StatutPiece;
  commentaire?: string;
  uploadedAt: string;
  validatedAt?: string;
}

export interface CreateApprenantDto {
  type: TypeApprenant;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  genre: Genre;
  nationalite: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone?: string;
  email?: string;
  etablissementId: string;
}

export interface UpdateApprenantDto extends Partial<CreateApprenantDto> {
  statut?: StatutApprenant;
  photo?: string;
}

export interface CreateTuteurDto {
  apprenantId: string;
  nom: string;
  prenom: string;
  lienParente: LienParente;
  telephone: string;
  telephoneSecondaire?: string;
  email?: string;
  adresse?: string;
  profession?: string;
  contactPrincipal?: boolean;
  accesPortail?: boolean;
}

export interface UpdateTuteurDto extends Partial<CreateTuteurDto> {}

export interface ApprenantFilters {
  search?: string;
  type?: TypeApprenant;
  statut?: StatutApprenant;
  etablissementId?: string;
  anneeAcademiqueId?: string;
  classeId?: string;
  page?: number;
  limit?: number;
}

export interface ApprenantStats {
  total: number;
  actifs: number;
  eleves: number;
  etudiants: number;
  parStatut: Record<StatutApprenant, number>;
  parGenre: { masculin: number; feminin: number };
}
