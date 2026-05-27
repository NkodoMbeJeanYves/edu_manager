import { HttpErrorResponse } from '@angular/common/http';
import {
  Inscription, PeriodeInscription, HistoriqueStatut, StatutInscription,
  CreateInscriptionDto, UpdateInscriptionDto,
  ValiderInscriptionDto, RejeterInscriptionDto,
  AffecterClasseDto, CreatePeriodeInscriptionDto,
  InscriptionStats,
} from '../../models/inscription.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, search, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedInscriptions = (): Inscription[] => [
  {
    id: 'ins-1', apprenantId: 'app-1', anneeAcademiqueId: 'an-1', etablissementId: 'et-1',
    type: 'reinscription', statut: 'validee',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    numeroInscription: 'INS-2024-001',
    dateInscription: '2024-07-15', dateValidation: '2024-08-12',
    validePar: 'Marie Lefebvre',
    fraisInscription: 350, fraisPayes: true,
    reinscriptionDepuis: 'ins-prev-1',
    createdAt: '2024-07-15T10:14:00Z', updatedAt: '2024-08-12T15:30:00Z',
  },
  {
    id: 'ins-2', apprenantId: 'app-2', anneeAcademiqueId: 'an-1', etablissementId: 'et-1',
    type: 'reinscription', statut: 'validee',
    classeId: 'cl-2', classeLibelle: 'Terminale S — B',
    numeroInscription: 'INS-2024-002',
    dateInscription: '2024-07-18', dateValidation: '2024-08-13',
    validePar: 'Marie Lefebvre',
    fraisInscription: 350, fraisPayes: true,
    createdAt: '2024-07-18T11:30:00Z', updatedAt: '2024-08-13T14:00:00Z',
  },
  {
    id: 'ins-3', apprenantId: 'app-3', anneeAcademiqueId: 'an-1', etablissementId: 'et-1',
    type: 'nouvelle', statut: 'en_validation',
    classeId: 'cl-4', classeLibelle: 'Première L',
    numeroInscription: 'INS-2024-003',
    dateInscription: '2024-08-22',
    dateLimiteValidation: '2024-09-15',
    fraisInscription: 450, fraisPayes: false,
    documentsManquants: ['Certificat médical', 'Photo d\'identité'],
    createdAt: '2024-08-22T09:45:00Z', updatedAt: '2024-08-22T09:45:00Z',
  },
  {
    id: 'ins-4', apprenantId: 'app-4', anneeAcademiqueId: 'an-3', etablissementId: 'et-2',
    type: 'nouvelle', statut: 'validee',
    promotionId: 'pr-1', promotionLibelle: 'L1 Informatique — Promotion 2024-2025',
    groupes: [
      { groupeId: 'gr-1', groupeCode: 'TD-1', groupeLibelle: 'Groupe TD-1', type: 'td' },
      { groupeId: 'gr-4', groupeCode: 'TP-1', groupeLibelle: 'Groupe TP Salle 1', type: 'tp' },
    ],
    numeroInscription: 'UDL-2024-014',
    dateInscription: '2024-07-30', dateValidation: '2024-08-25',
    validePar: 'Aïcha Bernard',
    fraisInscription: 1850, fraisPayes: true,
    createdAt: '2024-07-30T14:00:00Z', updatedAt: '2024-08-25T10:00:00Z',
  },
  {
    id: 'ins-5', apprenantId: 'app-5', anneeAcademiqueId: 'an-3', etablissementId: 'et-2',
    type: 'nouvelle', statut: 'en_attente',
    promotionId: 'pr-2', promotionLibelle: 'L2 Informatique — Promotion 2024-2025',
    numeroInscription: 'UDL-2024-027',
    dateInscription: '2024-09-05',
    fraisInscription: 1850, fraisPayes: false,
    listAttente: true, positionListeAttente: 3,
    createdAt: '2024-09-05T16:20:00Z', updatedAt: '2024-09-05T16:20:00Z',
  },
  {
    id: 'ins-6', apprenantId: 'app-6', anneeAcademiqueId: 'an-1', etablissementId: 'et-1',
    type: 'nouvelle', statut: 'rejetee',
    classeId: 'cl-3', classeLibelle: 'Première S',
    numeroInscription: 'INS-2024-008',
    dateInscription: '2024-08-10',
    fraisInscription: 450, fraisPayes: false,
    motifRejet: 'Dossier incomplet — pièces manquantes non fournies dans les délais.',
    createdAt: '2024-08-10T11:00:00Z', updatedAt: '2024-09-20T09:15:00Z',
  },
  {
    id: 'ins-7', apprenantId: 'app-7', anneeAcademiqueId: 'an-1', etablissementId: 'et-1',
    type: 'reinscription', statut: 'brouillon',
    numeroInscription: 'INS-2024-DRAFT-12',
    dateInscription: '2024-08-30',
    fraisInscription: 350, fraisPayes: false,
    commentaire: 'Brouillon en attente — apprenant doit confirmer le choix de classe.',
    createdAt: '2024-08-30T17:00:00Z', updatedAt: '2024-08-30T17:00:00Z',
  },
];

const seedPeriodes = (): PeriodeInscription[] => [
  {
    id: 'pi-1', etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Réinscriptions 2024-2025',
    type: 'reinscription',
    dateOuverture: '2024-06-15', dateCloture: '2024-07-31',
    ouverte: false, capaciteMax: 1200, inscritsCount: 1148,
    createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'pi-2', etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Nouvelles inscriptions 2024-2025',
    type: 'nouvelle',
    dateOuverture: '2024-07-01', dateCloture: '2024-09-30',
    ouverte: true, capaciteMax: 300, inscritsCount: 248,
    createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-07-01T00:00:00Z',
  },
  {
    id: 'pi-3', etablissementId: 'et-2', anneeAcademiqueId: 'an-3',
    libelle: 'Inscriptions universitaires 2024-2025',
    type: 'nouvelle',
    dateOuverture: '2024-07-15', dateCloture: '2024-09-15',
    ouverte: false, capaciteMax: 500, inscritsCount: 467,
    createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-09-16T00:00:00Z',
  },
];

const seedHistorique = (): (HistoriqueStatut & { id: string; inscriptionId: string })[] => [
  { id: 'h-1', inscriptionId: 'ins-1', statut: 'brouillon', date: '2024-07-15T10:14:00Z', par: 'app-1' },
  { id: 'h-2', inscriptionId: 'ins-1', statut: 'complete', date: '2024-07-20T11:00:00Z', par: 'app-1' },
  { id: 'h-3', inscriptionId: 'ins-1', statut: 'en_validation', date: '2024-07-25T09:00:00Z', par: 'app-1' },
  { id: 'h-4', inscriptionId: 'ins-1', statut: 'validee', date: '2024-08-12T15:30:00Z', par: 'Marie Lefebvre', commentaire: 'Dossier complet, validation finale.' },

  { id: 'h-5', inscriptionId: 'ins-3', statut: 'brouillon', date: '2024-08-22T09:45:00Z', par: 'app-3' },
  { id: 'h-6', inscriptionId: 'ins-3', statut: 'incomplete', date: '2024-08-25T14:00:00Z', par: 'system', commentaire: 'Documents manquants détectés.' },
  { id: 'h-7', inscriptionId: 'ins-3', statut: 'en_validation', date: '2024-08-30T10:30:00Z', par: 'app-3' },

  { id: 'h-8', inscriptionId: 'ins-6', statut: 'en_validation', date: '2024-08-10T11:00:00Z', par: 'app-6' },
  { id: 'h-9', inscriptionId: 'ins-6', statut: 'rejetee', date: '2024-09-20T09:15:00Z', par: 'Marie Lefebvre', commentaire: 'Dossier incomplet — délai dépassé.' },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const inscriptions = mockStorage<Inscription>('inscription.inscriptions', seedInscriptions);
const periodes = mockStorage<PeriodeInscription>('inscription.periodes', seedPeriodes);
const historique = mockStorage<HistoriqueStatut & { id: string; inscriptionId: string }>(
  'inscription.historique', seedHistorique,
);

// ── Helper: push history entry ──────────────────────────────────────────────

function appendHistory(inscriptionId: string, statut: StatutInscription, par: string, commentaire?: string): void {
  historique.create({
    id: crypto.randomUUID(),
    inscriptionId,
    statut,
    date: nowIso(),
    par,
    commentaire,
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const INSCRIPTION_ROUTES: MockRoute[] = [
  // Stats (specific path BEFORE :id detail)
  {
    method: 'GET', path: '/inscriptions/stats',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = inscriptions.list();
      if (q['etablissementId'])   list = list.filter((i) => i.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((i) => i.anneeAcademiqueId === q['anneeAcademiqueId']);
      const parStatut = {} as Record<StatutInscription, number>;
      (['brouillon','incomplete','complete','en_validation','validee','rejetee','annulee','en_attente'] as StatutInscription[])
        .forEach((s) => { parStatut[s] = list.filter((i) => i.statut === s).length; });
      const stats: InscriptionStats = {
        total: list.length,
        parStatut,
        nouvelles: list.filter((i) => i.type === 'nouvelle').length,
        reinscriptions: list.filter((i) => i.type === 'reinscription').length,
        enAttente: list.filter((i) => i.statut === 'en_attente').length,
        validees: parStatut['validee'] ?? 0,
        tauxCompletion: list.length > 0
          ? Math.round(((parStatut['validee'] ?? 0) / list.length) * 1000) / 10
          : 0,
      };
      return ok(stats);
    },
  },
  // Réinscription endpoints (specific paths)
  {
    method: 'GET', path: '/inscriptions/eligibilite-reinscription',
    handler: (req) => {
      const q = readQuery(req.params);
      // Mock: eligible if apprenant id starts with "app-" and is not "app-6" (rejected case).
      const eligible = q['apprenantId']?.startsWith('app-') && q['apprenantId'] !== 'app-6';
      return ok({
        eligible: !!eligible,
        blocages: eligible ? [] : ['Dossier financier non régularisé', 'Année précédente non validée'],
      });
    },
  },
  {
    method: 'POST', path: '/inscriptions/reinscription',
    handler: (req) => {
      const body = req.body as { apprenantId: string; anneeAcademiqueId: string };
      const created: Inscription = {
        id: crypto.randomUUID(),
        apprenantId: body.apprenantId,
        anneeAcademiqueId: body.anneeAcademiqueId,
        etablissementId: 'et-1',
        type: 'reinscription',
        statut: 'brouillon',
        numeroInscription: `RE-${new Date().getFullYear()}-${String(inscriptions.list().length + 1).padStart(3, '0')}`,
        dateInscription: nowIso().split('T')[0],
        fraisInscription: 350,
        fraisPayes: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      inscriptions.create(created);
      appendHistory(created.id, 'brouillon', body.apprenantId);
      return ok(created);
    },
  },

  // Liste (paginated)
  {
    method: 'GET', path: '/inscriptions',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = inscriptions.list();
      if (q['etablissementId'])   list = list.filter((i) => i.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((i) => i.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['statut'])            list = list.filter((i) => i.statut === q['statut']);
      if (q['type'])              list = list.filter((i) => i.type === q['type']);
      if (q['classeId'])          list = list.filter((i) => i.classeId === q['classeId']);
      if (q['promotionId'])       list = list.filter((i) => i.promotionId === q['promotionId']);
      if (q['fraisPayes'])        list = list.filter((i) => String(i.fraisPayes ?? false) === q['fraisPayes']);
      if (q['listAttente'])       list = list.filter((i) => String(i.listAttente ?? false) === q['listAttente']);
      list = search(list, q['search'], ['numeroInscription', 'classeLibelle', 'promotionLibelle']);
      return paginate(list, q);
    },
  },
  // Detail
  {
    method: 'GET', path: '/inscriptions/:id',
    handler: (_req, { id }) => {
      const i = inscriptions.find(id);
      if (!i) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(i);
    },
  },
  // Historique
  {
    method: 'GET', path: '/inscriptions/:id/historique',
    handler: (_req, { id }) => ok(
      historique.list()
        .filter((h) => h.inscriptionId === id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(({ id: _hid, inscriptionId: _iid, ...rest }) => rest),
    ),
  },
  // Inscriptions d'un apprenant (different prefix)
  {
    method: 'GET', path: '/apprenants/:apprenantId/inscriptions',
    handler: (_req, { apprenantId }) => ok(inscriptions.list().filter((i) => i.apprenantId === apprenantId)),
  },
  // Workflow transitions
  {
    method: 'PATCH', path: '/inscriptions/:id/soumettre',
    handler: (_req, { id }) => {
      const updated = inscriptions.update(id, { statut: 'en_validation', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      appendHistory(id, 'en_validation', updated.apprenantId);
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/inscriptions/:id/valider',
    handler: (req, { id }) => {
      const dto = req.body as ValiderInscriptionDto;
      const updated = inscriptions.update(id, {
        statut: 'validee',
        dateValidation: nowIso(),
        validePar: 'Mock validator',
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      appendHistory(id, 'validee', 'Mock validator', dto.commentaire);
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/inscriptions/:id/rejeter',
    handler: (req, { id }) => {
      const dto = req.body as RejeterInscriptionDto;
      const updated = inscriptions.update(id, {
        statut: 'rejetee',
        motifRejet: dto.motifRejet,
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      appendHistory(id, 'rejetee', 'Mock validator', dto.motifRejet);
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/inscriptions/:id/annuler',
    handler: (req, { id }) => {
      const body = req.body as { motif: string };
      const updated = inscriptions.update(id, { statut: 'annulee', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      appendHistory(id, 'annulee', 'Mock', body.motif);
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/inscriptions/:id/affecter',
    handler: (req, { id }) => {
      const dto = req.body as AffecterClasseDto;
      const updated = inscriptions.update(id, {
        classeId: dto.classeId,
        promotionId: dto.promotionId,
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  // Update générique
  {
    method: 'PATCH', path: '/inscriptions/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateInscriptionDto;
      // Strip DTO sub-objects that have a different shape than the entity
      // (groupes/ueInscrites use {id}-only DTOs that don't include the resolved labels).
      const { groupes: _g, ueInscrites: _u, ...rest } = dto;
      const updated = inscriptions.update(id, { ...rest, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  // Create
  {
    method: 'POST', path: '/inscriptions',
    handler: (req) => {
      const dto = req.body as CreateInscriptionDto;
      const created: Inscription = {
        id: crypto.randomUUID(),
        apprenantId: dto.apprenantId,
        anneeAcademiqueId: dto.anneeAcademiqueId,
        etablissementId: dto.etablissementId,
        type: dto.type,
        statut: 'brouillon',
        classeId: dto.classeId,
        promotionId: dto.promotionId,
        numeroInscription: `INS-${new Date().getFullYear()}-${String(inscriptions.list().length + 1).padStart(3, '0')}`,
        dateInscription: nowIso().split('T')[0],
        commentaire: dto.commentaire,
        fraisPayes: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      inscriptions.create(created);
      appendHistory(created.id, 'brouillon', dto.apprenantId);
      return ok(created);
    },
  },

  // Périodes
  {
    method: 'GET', path: '/periodes-inscription',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['etablissementId']
        ? periodes.list().filter((p) => p.etablissementId === q['etablissementId'])
        : periodes.list();
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/periodes-inscription',
    handler: (req) => {
      const dto = req.body as CreatePeriodeInscriptionDto;
      const created: PeriodeInscription = {
        ...dto, id: crypto.randomUUID(),
        ouverte: false, inscritsCount: 0,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(periodes.create(created));
    },
  },
  {
    method: 'PATCH', path: '/periodes-inscription/:id/ouvrir',
    handler: (_req, { id }) => {
      const updated = periodes.update(id, { ouverte: true, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/periodes-inscription/:id/fermer',
    handler: (_req, { id }) => {
      const updated = periodes.update(id, { ouverte: false, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/periodes-inscription/:id',
    handler: (_req, { id }) => {
      if (!periodes.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
];
