// ── Enums ────────────────────────────────────────────────────────────────────

export type CanalNotification = 'email' | 'sms' | 'push' | 'interne';
export type TypeNotification =
  | 'note_publiee' | 'absence_enregistree' | 'bulletin_disponible'
  | 'convocation_examen' | 'paiement_recu' | 'alerte_absenteisme'
  | 'alerte_risque_echec' | 'modification_edt' | 'annonce' | 'autre';
export type StatutNotification = 'en_attente' | 'envoyee' | 'lue' | 'echec';
export type RoleDestinataire = 'apprenant' | 'parent' | 'enseignant' | 'direction' | 'scolarite';

// ── Notification ──────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  titre: string;
  message: string;
  destinataireId: string;
  destinataireRole: RoleDestinataire;
  lien?: string;           // lien profond vers la ressource concernée
  statut: StatutNotification;
  dateEnvoi?: string;
  dateLecture?: string;
  createdAt: string;
}

// ── Message interne ───────────────────────────────────────────────────────────

export interface Message {
  id: string;
  etablissementId: string;
  expediteurId: string;
  expediteurNom?: string;
  expediteurRole: RoleDestinataire;
  destinataireId: string;
  destinataireNom?: string;
  destinataireRole: RoleDestinataire;
  sujet: string;
  contenu: string;
  lu: boolean;
  dateLecture?: string;
  pieceJointeUrl?: string;
  createdAt: string;
}

// ── Annonce ───────────────────────────────────────────────────────────────────

export interface Annonce {
  id: string;
  etablissementId: string;
  auteurId: string;
  auteurNom?: string;
  titre: string;
  contenu: string;
  rolesDestinataires: RoleDestinataire[];
  datePublication: string;
  dateExpiration?: string;
  epinglee: boolean;
  createdAt: string;
}

// ── Modèle de message ─────────────────────────────────────────────────────────

export interface ModeleMessage {
  id: string;
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  sujet: string;
  contenu: string;  // avec variables ex: {{apprenant_nom}}, {{matiere}}, {{date}}
  actif: boolean;
  createdAt: string;
}

// ── Statistiques ──────────────────────────────────────────────────────────────

export interface StatsNotifications {
  totalEnvoyees: number;
  tauxOuverture: number;
  tauxEchec: number;
  parCanal: { canal: CanalNotification; count: number }[];
  parType: { type: TypeNotification; count: number }[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface EnvoyerNotificationDto {
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  titre: string;
  message: string;
  destinataires: { id: string; role: RoleDestinataire }[];
  lien?: string;
}

export interface EnvoyerMessageDto {
  expediteurId: string;
  expediteurRole: RoleDestinataire;
  destinataireId: string;
  destinataireRole: RoleDestinataire;
  sujet: string;
  contenu: string;
  pieceJointeUrl?: string;
}

export interface CreateAnnonceDto {
  etablissementId: string;
  auteurId: string;
  titre: string;
  contenu: string;
  rolesDestinataires: RoleDestinataire[];
  dateExpiration?: string;
  epinglee?: boolean;
}

// ── Filtres ───────────────────────────────────────────────────────────────────

export interface NotificationFilters {
  destinataireId?: string;
  statut?: StatutNotification;
  type?: TypeNotification;
  canal?: CanalNotification;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export interface MessageFilters {
  userId?: string;
  boite: 'recus' | 'envoyes';
  lu?: boolean;
  page?: number;
  limit?: number;
}
