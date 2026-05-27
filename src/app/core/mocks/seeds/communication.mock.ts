import { HttpErrorResponse } from '@angular/common/http';
import {
  Notification, Message, Annonce, ModeleMessage, StatsNotifications,
  CanalNotification, TypeNotification,
  EnvoyerNotificationDto, EnvoyerMessageDto, CreateAnnonceDto,
} from '../../models/communication.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedNotifications = (): Notification[] => [
  {
    id: 'notif-1', etablissementId: 'et-1',
    type: 'note_publiee', canal: 'email',
    titre: 'Nouvelle note publiée — Mathématiques',
    message: 'Votre note de Composition n°1 (Algèbre linéaire) est disponible.',
    destinataireId: 'app-1', destinataireRole: 'apprenant',
    lien: '/notes/eval-1',
    statut: 'lue',
    dateEnvoi: '2025-02-20T14:00:00Z', dateLecture: '2025-02-20T18:30:00Z',
    createdAt: '2025-02-20T14:00:00Z',
  },
  {
    id: 'notif-2', etablissementId: 'et-1',
    type: 'absence_enregistree', canal: 'sms',
    titre: 'Absence enregistrée — Marcus Lee',
    message: 'Absence de 2h en Sciences physiques le 26/05/2025.',
    destinataireId: 'parent-2', destinataireRole: 'parent',
    statut: 'envoyee',
    dateEnvoi: '2025-05-26T10:02:00Z',
    createdAt: '2025-05-26T10:02:00Z',
  },
  {
    id: 'notif-3', etablissementId: 'et-1',
    type: 'paiement_recu', canal: 'email',
    titre: 'Paiement reçu — INV-2025-0033',
    message: 'Paiement de 1500 € reçu pour la facture INV-2025-0033.',
    destinataireId: 'parent-1', destinataireRole: 'parent',
    statut: 'lue',
    dateEnvoi: '2025-05-25T17:32:00Z', dateLecture: '2025-05-25T19:12:00Z',
    createdAt: '2025-05-25T17:32:00Z',
  },
  {
    id: 'notif-4', etablissementId: 'et-1',
    type: 'convocation_examen', canal: 'email',
    titre: 'Convocations envoyées — Session normale Trim. 2',
    message: '142 convocations ont été générées et envoyées.',
    destinataireId: 'ens-1', destinataireRole: 'enseignant',
    statut: 'lue',
    dateEnvoi: '2025-05-15T14:18:00Z', dateLecture: '2025-05-15T15:30:00Z',
    createdAt: '2025-05-15T14:18:00Z',
  },
  {
    id: 'notif-5', etablissementId: 'et-1',
    type: 'alerte_absenteisme', canal: 'interne',
    titre: 'Alerte absentéisme — 3 apprenants dépassent le seuil',
    message: 'Voir le tableau de bord absentéisme.',
    destinataireId: 'staff-1', destinataireRole: 'direction',
    lien: '/absences/alertes',
    statut: 'en_attente',
    createdAt: '2025-05-26T08:00:00Z',
  },
];

const seedMessages = (): Message[] => [
  {
    id: 'msg-1', etablissementId: 'et-1',
    expediteurId: 'ens-1', expediteurNom: 'Camille Dupont', expediteurRole: 'enseignant',
    destinataireId: 'staff-1', destinataireNom: 'Direction', destinataireRole: 'direction',
    sujet: 'Demande de salle supplémentaire — Examens',
    contenu: 'Bonjour, pourriez-vous prévoir une salle supplémentaire pour la session du 19 mai ?',
    lu: false,
    createdAt: '2025-05-26T09:14:00Z',
  },
  {
    id: 'msg-2', etablissementId: 'et-1',
    expediteurId: 'parent-3', expediteurNom: 'Patrick Morel', expediteurRole: 'parent',
    destinataireId: 'staff-1', destinataireNom: 'Scolarité', destinataireRole: 'scolarite',
    sujet: 'Justificatif absence de mon fils',
    contenu: 'Veuillez trouver ci-joint le certificat médical pour l\'absence du 24/05.',
    pieceJointeUrl: '/mock/messages/cert-medical.pdf',
    lu: false,
    createdAt: '2025-05-25T16:42:00Z',
  },
  {
    id: 'msg-3', etablissementId: 'et-1',
    expediteurId: 'ens-3', expediteurNom: 'Léa Moreau', expediteurRole: 'enseignant',
    destinataireId: 'staff-1', destinataireNom: 'Direction pédagogique', destinataireRole: 'direction',
    sujet: 'Programme révisé — Anglais Première L',
    contenu: 'Voici la version révisée du programme d\'anglais.',
    lu: true, dateLecture: '2025-05-21T08:30:00Z',
    createdAt: '2025-05-20T11:30:00Z',
  },
];

const seedAnnonces = (): Annonce[] => [
  {
    id: 'ann-1', etablissementId: 'et-1',
    auteurId: 'staff-1', auteurNom: 'Aïcha Bernard',
    titre: 'Fermeture exceptionnelle — 30 mai',
    contenu: 'L\'établissement sera fermé le vendredi 30 mai pour journée pédagogique.',
    rolesDestinataires: ['apprenant', 'parent', 'enseignant'],
    datePublication: '2025-05-20T10:00:00Z',
    epinglee: true,
    createdAt: '2025-05-20T10:00:00Z',
  },
  {
    id: 'ann-2', etablissementId: 'et-1',
    auteurId: 'staff-2', auteurNom: 'Direction pédagogique',
    titre: 'Session d\'examens — calendrier 2025',
    contenu: 'Le calendrier des sessions d\'examens 2025 est disponible.',
    rolesDestinataires: ['apprenant', 'enseignant'],
    datePublication: '2025-04-08T09:00:00Z',
    epinglee: true,
    createdAt: '2025-04-08T09:00:00Z',
  },
  {
    id: 'ann-3', etablissementId: 'et-1',
    auteurId: 'staff-1', auteurNom: 'Aïcha Bernard',
    titre: 'Conseil pédagogique 5 juin',
    contenu: 'Le prochain conseil pédagogique aura lieu mercredi 5 juin à 17h en salle B-201.',
    rolesDestinataires: ['enseignant'],
    datePublication: '2025-05-22T08:00:00Z',
    epinglee: false,
    createdAt: '2025-05-22T08:00:00Z',
  },
];

const seedModeles = (): ModeleMessage[] => [
  {
    id: 'tmpl-1', etablissementId: 'et-1',
    type: 'absence_enregistree', canal: 'email',
    sujet: 'Absence de {{apprenant_nom}} — {{date}}',
    contenu: 'Bonjour {{parent_nom}},\n\nNous vous informons que {{apprenant_nom}} a été absent(e) le {{date}} en cours de {{matiere}}.\n\nCordialement,\n{{etablissement}}',
    actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'tmpl-2', etablissementId: 'et-1',
    type: 'note_publiee', canal: 'sms',
    sujet: '',
    contenu: '{{etablissement}} : note {{matiere}} disponible : {{note}}/{{max}}.',
    actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'tmpl-3', etablissementId: 'et-1',
    type: 'paiement_recu', canal: 'email',
    sujet: 'Reçu de paiement — {{numero_recu}}',
    contenu: 'Nous accusons réception de votre paiement de {{montant}} pour {{numero_facture}}.',
    actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const notifications = mockStorage<Notification>('communication.notifications', seedNotifications);
const messages = mockStorage<Message>('communication.messages', seedMessages);
const annonces = mockStorage<Annonce>('communication.annonces', seedAnnonces);
const modeles = mockStorage<ModeleMessage>('communication.modeles', seedModeles);

// ── Routes ───────────────────────────────────────────────────────────────────

export const COMMUNICATION_API_ROUTES: MockRoute[] = [
  // Notifications — specific paths BEFORE :id
  {
    method: 'GET', path: '/notifications/stats',
    handler: () => {
      const list = notifications.list();
      const envoyees = list.filter((n) => n.statut !== 'en_attente');
      const lues = list.filter((n) => n.statut === 'lue');
      const echec = list.filter((n) => n.statut === 'echec');
      const parCanal: { canal: CanalNotification; count: number }[] = (['email','sms','push','interne'] as CanalNotification[])
        .map((c) => ({ canal: c, count: list.filter((n) => n.canal === c).length }));
      const parType: { type: TypeNotification; count: number }[] = (['note_publiee','absence_enregistree','bulletin_disponible','convocation_examen','paiement_recu','alerte_absenteisme','alerte_risque_echec','modification_edt','annonce','autre'] as TypeNotification[])
        .map((t) => ({ type: t, count: list.filter((n) => n.type === t).length }));
      const stats: StatsNotifications = {
        totalEnvoyees: envoyees.length,
        tauxOuverture: envoyees.length > 0
          ? Math.round((lues.length / envoyees.length) * 1000) / 10
          : 0,
        tauxEchec: envoyees.length > 0
          ? Math.round((echec.length / envoyees.length) * 1000) / 10
          : 0,
        parCanal,
        parType,
      };
      return ok(stats);
    },
  },
  {
    method: 'GET', path: '/notifications/non-lues',
    handler: (req) => {
      const q = readQuery(req.params);
      const count = notifications.list().filter(
        (n) => n.destinataireId === q['userId'] && n.statut !== 'lue',
      ).length;
      return ok({ count });
    },
  },
  {
    method: 'PATCH', path: '/notifications/lire-tout',
    handler: (req) => {
      const body = req.body as { userId: string };
      const list = notifications.list().filter(
        (n) => n.destinataireId === body.userId && n.statut !== 'lue',
      );
      list.forEach((n) => notifications.update(n.id, { statut: 'lue', dateLecture: nowIso() }));
      return ok({ count: list.length });
    },
  },
  {
    method: 'GET', path: '/notifications',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = notifications.list();
      if (q['destinataireId']) list = list.filter((n) => n.destinataireId === q['destinataireId']);
      if (q['statut'])         list = list.filter((n) => n.statut === q['statut']);
      if (q['type'])           list = list.filter((n) => n.type === q['type']);
      if (q['canal'])          list = list.filter((n) => n.canal === q['canal']);
      if (q['dateDebut'])      list = list.filter((n) => n.createdAt >= q['dateDebut']);
      if (q['dateFin'])        list = list.filter((n) => n.createdAt <= q['dateFin']);
      return paginate(list, q);
    },
  },
  {
    method: 'POST', path: '/notifications',
    handler: (req) => {
      const dto = req.body as EnvoyerNotificationDto;
      const created = dto.destinataires.map((d) => notifications.create({
        id: crypto.randomUUID(),
        etablissementId: dto.etablissementId,
        type: dto.type, canal: dto.canal,
        titre: dto.titre, message: dto.message,
        destinataireId: d.id, destinataireRole: d.role,
        lien: dto.lien,
        statut: 'envoyee',
        dateEnvoi: nowIso(),
        createdAt: nowIso(),
      }));
      return ok({ count: created.length });
    },
  },
  {
    method: 'PATCH', path: '/notifications/:id/lire',
    handler: (_req, { id }) => {
      const updated = notifications.update(id, { statut: 'lue', dateLecture: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },

  // Messages
  {
    method: 'GET', path: '/messages',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = messages.list();
      if (q['userId']) {
        // boite "recus" → destinataire, "envoyes" → expediteur
        if (q['boite'] === 'recus') {
          list = list.filter((m) => m.destinataireId === q['userId']);
        } else if (q['boite'] === 'envoyes') {
          list = list.filter((m) => m.expediteurId === q['userId']);
        }
      }
      if (q['lu']) list = list.filter((m) => String(m.lu) === q['lu']);
      return paginate(list, q);
    },
  },
  {
    method: 'POST', path: '/messages',
    handler: (req) => {
      const dto = req.body as EnvoyerMessageDto;
      const created: Message = {
        ...dto,
        id: crypto.randomUUID(),
        etablissementId: 'et-1',
        lu: false,
        createdAt: nowIso(),
      };
      return ok(messages.create(created));
    },
  },
  {
    method: 'PATCH', path: '/messages/:id/lire',
    handler: (_req, { id }) => {
      const updated = messages.update(id, { lu: true, dateLecture: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/messages/:id',
    handler: (_req, { id }) => {
      if (!messages.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Annonces
  {
    method: 'GET', path: '/annonces',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = annonces.list().filter((a) => a.etablissementId === q['etablissementId']);
      // Pinned first
      const sorted = [...list].sort((x, y) => Number(y.epinglee) - Number(x.epinglee));
      return ok(sorted);
    },
  },
  {
    method: 'POST', path: '/annonces',
    handler: (req) => {
      const dto = req.body as CreateAnnonceDto;
      const created: Annonce = {
        ...dto,
        id: crypto.randomUUID(),
        datePublication: nowIso(),
        epinglee: dto.epinglee ?? false,
        createdAt: nowIso(),
      };
      return ok(annonces.create(created));
    },
  },
  {
    method: 'DELETE', path: '/annonces/:id',
    handler: (_req, { id }) => {
      if (!annonces.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Modèles
  {
    method: 'GET', path: '/modeles-messages',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = modeles.list().filter((m) => m.etablissementId === q['etablissementId']);
      return ok(list);
    },
  },
  {
    method: 'PATCH', path: '/modeles-messages/:id',
    handler: (req, { id }) => {
      const dto = req.body as Partial<ModeleMessage>;
      const updated = modeles.update(id, dto);
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
];
