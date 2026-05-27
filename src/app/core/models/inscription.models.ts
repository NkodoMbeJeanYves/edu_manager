import { Apprenant } from './apprenant.models';
import { AnneeAcademique, Periode } from './etablissement.models';

export type StatutInscription =
  | 'brouillon'
  | 'incomplete'
  | 'complete'
  | 'en_validation'
  | 'validee'
  | 'rejetee'
  | 'annulee'
  | 'en_attente';

export type TypeInscription = 'nouvelle' | 'reinscription';
export type TypeAffectation = 'classe' | 'promotion' | 'groupe';

export interface Inscription {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  etablissementId: string;
  type: TypeInscription;
  statut: StatutInscription;
  classeId?: string;
  classeLibelle?: string;
  promotionId?: string;
  promotionLibelle?: string;
  groupes?: GroupeInscription[];
  ueInscrites?: UeInscription[];
  numeroInscription: string;
  dateInscription: string;
  dateLimiteValidation?: string;
  dateValidation?: string;
  validePar?: string;
  motifRejet?: string;
  fraisInscription?: number;
  fraisPayes?: boolean;
  listAttente?: boolean;
  positionListeAttente?: number;
  documentsManquants?: string[];
  commentaire?: string;
  reinscriptionDepuis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupeInscription {
  groupeId: string;
  groupeCode: string;
  groupeLibelle: string;
  type: 'td' | 'tp' | 'langue' | 'option';
}

export interface UeInscription {
  ueId: string;
  ueCode: string;
  ueLibelle: string;
  credits: number;
  obligatoire: boolean;
  statut: 'inscrite' | 'validee' | 'echec';
}

export interface PeriodeInscription {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  type: TypeInscription;
  dateOuverture: string;
  dateCloture: string;
  ouverte: boolean;
  capaciteMax?: number;
  inscritsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListeAttente {
  id: string;
  inscriptionId: string;
  classeOuPromotionId: string;
  position: number;
  dateAjout: string;
  notifieE: boolean;
}

export interface HistoriqueStatut {
  statut: StatutInscription;
  date: string;
  par: string;
  commentaire?: string;
}

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateInscriptionDto {
  apprenantId: string;
  anneeAcademiqueId: string;
  etablissementId: string;
  type: TypeInscription;
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
  ueInscrites?: { ueId: string }[];
  commentaire?: string;
}

export interface UpdateInscriptionDto {
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
  ueInscrites?: { ueId: string }[];
  commentaire?: string;
  dateLimiteValidation?: string;
}

export interface ValiderInscriptionDto {
  commentaire?: string;
}

export interface RejeterInscriptionDto {
  motifRejet: string;
}

export interface AffecterClasseDto {
  inscriptionId: string;
  classeId?: string;
  promotionId?: string;
  groupes?: { groupeId: string }[];
}

export interface CreatePeriodeInscriptionDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  libelle: string;
  type: TypeInscription;
  dateOuverture: string;
  dateCloture: string;
  capaciteMax?: number;
}

export interface InscriptionFilters {
  search?: string;
  anneeAcademiqueId?: string;
  etablissementId?: string;
  statut?: StatutInscription;
  type?: TypeInscription;
  classeId?: string;
  promotionId?: string;
  fraisPayes?: boolean;
  listAttente?: boolean;
  page?: number;
  limit?: number;
}

export interface InscriptionStats {
  total: number;
  parStatut: Record<StatutInscription, number>;
  nouvelles: number;
  reinscriptions: number;
  enAttente: number;
  validees: number;
  tauxCompletion: number;
}
