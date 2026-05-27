import { Apprenant } from './apprenant.models';
import { AnneeAcademique, Periode } from './etablissement.models';

// ── Enums & types ────────────────────────────────────────────────────────────

export type TypeDocument = 'bulletin' | 'releve';

export type StatutDocument =
  | 'brouillon'
  | 'genere'
  | 'valide'
  | 'signe'
  | 'publie'
  | 'archive';

export type DecisionBulletin =
  | 'passage'
  | 'redoublement'
  | 'passage_conditionnel'
  | 'exclusion'
  | 'felicitations'
  | 'encouragements'
  | 'mise_en_garde'
  | 'tableau_honneur'
  | 'admis';

export type MentionGenerale =
  | 'tres_bien'
  | 'bien'
  | 'assez_bien'
  | 'passable'
  | 'insuffisant';

export type StatutDeliberation =
  | 'preparation'
  | 'en_cours'
  | 'terminee'
  | 'signee'
  | 'publiee';

export type DecisionJury =
  | 'admis'
  | 'admis_rattrapage'
  | 'ajourne'
  | 'redoublant'
  | 'exclu'
  | 'dispense'
  | 'en_attente';

// ── Bulletin scolaire ────────────────────────────────────────────────────────

export interface LigneBulletin {
  matiereId: string;
  matiereCode: string;
  matiereLibelle: string;
  coefficient: number;
  noteCC?: number | null;
  notePartiel?: number | null;
  noteExamen?: number | null;
  moyenne: number | null;
  moyenneClasse?: number | null;
  appreciation?: string;
  enseignantNom?: string;
  rang?: number;
  eliminatoire: boolean;
}

export interface BilanAbsences {
  totalHeures: number;
  heuresJustifiees: number;
  heuresInjustifiees: number;
  nombreAbsences: number;
}

export interface Bulletin {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  periodeId: string;
  periode?: Periode;
  type: 'bulletin';
  statut: StatutDocument;
  lignes: LigneBulletin[];
  moyenneGenerale: number | null;
  moyenneClasse?: number | null;
  rang?: number;
  totalApprenants?: number;
  mention?: MentionGenerale;
  decision?: DecisionBulletin;
  appreciationGenerale?: string;
  appreciationProfPrincipal?: string;
  bilanAbsences?: BilanAbsences;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Relevé de notes universitaire ────────────────────────────────────────────

export interface LigneReleveUE {
  ueId: string;
  ueCode: string;
  ueLibelle: string;
  credits: number;
  creditsAcquis: number;
  matieresNotes: {
    matiereId: string;
    matiereLibelle: string;
    noteCC?: number | null;
    notePartiel?: number | null;
    moyenne: number | null;
    coefficient: number;
  }[];
  moyenneUE: number | null;
  validee: boolean;
  mention?: MentionGenerale;
  session: 'S1' | 'S2';
}

export interface ReleverNotes {
  id: string;
  apprenantId: string;
  apprenant?: Apprenant;
  etablissementId: string;
  anneeAcademiqueId: string;
  anneeAcademique?: AnneeAcademique;
  periodeId?: string;
  type: 'releve';
  statut: StatutDocument;
  lignesUE: LigneReleveUE[];
  ectsAcquisPeriode: number;
  ectsTotalPeriode: number;
  ectsAcquisCumul: number;
  ectsTotalCumul: number;
  moyenneSemestre: number | null;
  mention?: MentionGenerale;
  decision?: DecisionJury;
  semestreValide: boolean;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Délibération ─────────────────────────────────────────────────────────────

export interface LigneDeliberation {
  apprenantId: string;
  apprenantNom: string;
  apprenantPrenom: string;
  numeroInscription: string;
  moyenneGenerale: number | null;
  ectsAcquis?: number;
  semestreValide?: boolean;
  uesNonValidees?: string[];
  decision: DecisionJury | DecisionBulletin | null;
  mention?: MentionGenerale;
  commentaire?: string;
  casSpecial?: 'fraude' | 'dispense' | 'vae' | 'eliminatoire' | null;
  modifieeManuel: boolean;
}

export interface Deliberation {
  id: string;
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId: string;
  classeOuPromotionId: string;
  classeOuPromotionLibelle: string;
  type: 'conseil_classe' | 'jury_universitaire';
  statut: StatutDeliberation;
  session?: 'S1' | 'S2';
  dateDeliberation?: string;
  president?: string;
  membres?: string[];
  lignes: LigneDeliberation[];
  compensationActivee: boolean;
  pvUrl?: string;
  signePar?: string;
  dateSigne?: string;
  datePublication?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PVDeliberation {
  deliberationId: string;
  numero: string;
  dateEmission: string;
  contenu: string;
  signataires: { nom: string; fonction: string; dateSigne?: string }[];
  statut: 'brouillon' | 'signe' | 'archive';
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface GenererBulletinsDto {
  etablissementId: string;
  periodeId: string;
  classeId?: string;
  regenerer?: boolean;
}

export interface GenererReleveDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId?: string;
  promotionId?: string;
  apprenantId?: string;
  regenerer?: boolean;
}

export interface ValiderDocumentDto {
  commentaire?: string;
}

export interface SignerDocumentDto {
  signataire: string;
  fonction: string;
}

export interface PublierDocumentsDto {
  periodeId: string;
  classeOuPromotionId?: string;
}

export interface CreateDeliberationDto {
  etablissementId: string;
  anneeAcademiqueId: string;
  periodeId: string;
  classeOuPromotionId: string;
  type: 'conseil_classe' | 'jury_universitaire';
  session?: 'S1' | 'S2';
  dateDeliberation?: string;
  president?: string;
  membres?: string[];
  compensationActivee?: boolean;
}

export interface UpdateDecisionDto {
  apprenantId: string;
  decision: DecisionJury | DecisionBulletin;
  mention?: MentionGenerale;
  commentaire?: string;
  casSpecial?: string;
}

export interface ApprecierBulletinDto {
  apprenantId: string;
  periodeId: string;
  appreciationGenerale?: string;
  appreciationProfPrincipal?: string;
  decision?: DecisionBulletin;
}

// ── Filtres ──────────────────────────────────────────────────────────────────

export interface BulletinFilters {
  apprenantId?: string;
  periodeId?: string;
  anneeAcademiqueId?: string;
  classeId?: string;
  statut?: StatutDocument;
  type?: TypeDocument;
  page?: number;
  limit?: number;
}

export interface DeliberationFilters {
  etablissementId?: string;
  anneeAcademiqueId?: string;
  periodeId?: string;
  type?: string;
  statut?: StatutDeliberation;
  page?: number;
  limit?: number;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface StatsBulletins {
  total: number;
  generes: number;
  publies: number;
  enAttente: number;
  tauxGeneration: number;
}

export interface StatsDeliberation {
  total: number;
  admis: number;
  admisRattrapage: number;
  ajournes: number;
  redoublants: number;
  exclus: number;
  tauxReussite: number;
  moyennePromotion: number | null;
}
