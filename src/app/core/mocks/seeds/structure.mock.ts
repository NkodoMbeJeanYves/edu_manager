import { HttpErrorResponse } from '@angular/common/http';
import {
  Cycle, Filiere, Niveau, Classe, Promotion, Groupe, StatsStructure,
  CreateCycleDto, UpdateCycleDto,
  CreateFiliereDto, UpdateFiliereDto,
  CreateNiveauDto, UpdateNiveauDto,
  CreateClasseDto, UpdateClasseDto,
  CreatePromotionDto, UpdatePromotionDto,
  CreateGroupeDto, UpdateGroupeDto,
} from '../../models/structure.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, search, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedCycles = (): Cycle[] => [
  {
    id: 'cyc-1', etablissementId: 'et-1', libelle: 'Secondaire', code: 'SEC',
    type: 'secondaire', typeFormation: 'scolaire',
    description: 'Cycle secondaire général', ordre: 1, actif: true,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cyc-2', etablissementId: 'et-2', libelle: 'Licence (LMD)', code: 'LIC',
    type: 'superieur', typeFormation: 'universitaire',
    description: 'Cycle Licence — 3 ans (180 crédits ECTS)', ordre: 1, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cyc-3', etablissementId: 'et-2', libelle: 'Master', code: 'MAS',
    type: 'superieur', typeFormation: 'universitaire',
    description: 'Cycle Master — 2 ans (120 crédits ECTS)', ordre: 2, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedFilieres = (): Filiere[] => [
  {
    id: 'fil-1', cycleId: 'cyc-1', etablissementId: 'et-1',
    libelle: 'Série Scientifique (S)', code: 'BAC-S',
    description: 'Baccalauréat série S — sciences', dureeAnnees: 3, actif: true,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'fil-2', cycleId: 'cyc-1', etablissementId: 'et-1',
    libelle: 'Série Littéraire (L)', code: 'BAC-L',
    description: 'Baccalauréat série L — lettres', dureeAnnees: 3, actif: true,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'fil-3', cycleId: 'cyc-1', etablissementId: 'et-1',
    libelle: 'Série Économique et Sociale (ES)', code: 'BAC-ES',
    description: 'Baccalauréat série ES — économique et social', dureeAnnees: 3, actif: true,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'fil-4', cycleId: 'cyc-2', etablissementId: 'et-2',
    libelle: 'Licence Informatique', code: 'LIC-INFO',
    systemeLMD: 'licence', dureeAnnees: 3, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'fil-5', cycleId: 'cyc-2', etablissementId: 'et-2',
    libelle: 'Licence Mathématiques', code: 'LIC-MATH',
    systemeLMD: 'licence', dureeAnnees: 3, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'fil-6', cycleId: 'cyc-3', etablissementId: 'et-2',
    libelle: 'Master Management', code: 'MAS-MGT',
    systemeLMD: 'master', dureeAnnees: 2, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedNiveaux = (): Niveau[] => [
  // Bac S
  { id: 'niv-1', filiereId: 'fil-1', libelle: 'Seconde S',   code: '2S',  ordre: 1, typeFormation: 'scolaire', actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'niv-2', filiereId: 'fil-1', libelle: 'Première S',  code: '1S',  ordre: 2, typeFormation: 'scolaire', actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'niv-3', filiereId: 'fil-1', libelle: 'Terminale S', code: 'TS',  ordre: 3, typeFormation: 'scolaire', actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  // Bac L
  { id: 'niv-4', filiereId: 'fil-2', libelle: 'Première L',  code: '1L',  ordre: 2, typeFormation: 'scolaire', actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'niv-5', filiereId: 'fil-2', libelle: 'Terminale L', code: 'TL',  ordre: 3, typeFormation: 'scolaire', actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  // Licence Info
  { id: 'niv-6', filiereId: 'fil-4', libelle: 'L1 Informatique', code: 'L1-INFO', ordre: 1, typeFormation: 'universitaire', actif: true, createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'niv-7', filiereId: 'fil-4', libelle: 'L2 Informatique', code: 'L2-INFO', ordre: 2, typeFormation: 'universitaire', actif: true, createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
  { id: 'niv-8', filiereId: 'fil-4', libelle: 'L3 Informatique', code: 'L3-INFO', ordre: 3, typeFormation: 'universitaire', actif: true, createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z' },
];

const seedClasses = (): Classe[] => [
  {
    id: 'cl-1', niveauId: 'niv-3', filiereId: 'fil-1',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Terminale S — A', code: 'TS-A',
    capaciteMax: 35, effectifActuel: 32,
    professeurPrincipalId: 't-1', professeurPrincipalNom: 'Camille Dupont',
    statut: 'active', salle: 'B-201',
    createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cl-2', niveauId: 'niv-3', filiereId: 'fil-1',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Terminale S — B', code: 'TS-B',
    capaciteMax: 35, effectifActuel: 30,
    professeurPrincipalId: 't-2', professeurPrincipalNom: 'Idrissa Diallo',
    statut: 'active', salle: 'B-202',
    createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cl-3', niveauId: 'niv-2', filiereId: 'fil-1',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Première S', code: '1S',
    capaciteMax: 35, effectifActuel: 28,
    statut: 'active', salle: 'A-105',
    createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cl-4', niveauId: 'niv-4', filiereId: 'fil-2',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Première L', code: '1L',
    capaciteMax: 30, effectifActuel: 22,
    professeurPrincipalId: 't-3', professeurPrincipalNom: 'Léa Moreau',
    statut: 'active', salle: 'A-301',
    createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'cl-5', niveauId: 'niv-5', filiereId: 'fil-2',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    libelle: 'Terminale L', code: 'TL',
    capaciteMax: 30, effectifActuel: 24,
    professeurPrincipalId: 't-4', professeurPrincipalNom: 'Robert Tremblay',
    statut: 'active', salle: 'A-302',
    createdAt: '2024-08-25T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedPromotions = (): Promotion[] => [
  {
    id: 'pr-1', niveauId: 'niv-6', filiereId: 'fil-4',
    etablissementId: 'et-2', anneeAcademiqueId: 'an-3',
    libelle: 'L1 Informatique — Promotion 2024-2025', code: 'L1-INFO-2024',
    capaciteMax: 80, effectifActuel: 72,
    responsableId: 't-5', responsableNom: 'Jean Martin',
    statut: 'active',
    createdAt: '2024-08-15T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'pr-2', niveauId: 'niv-7', filiereId: 'fil-4',
    etablissementId: 'et-2', anneeAcademiqueId: 'an-3',
    libelle: 'L2 Informatique — Promotion 2024-2025', code: 'L2-INFO-2024',
    capaciteMax: 60, effectifActuel: 54,
    statut: 'active',
    createdAt: '2024-08-15T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'pr-3', niveauId: 'niv-8', filiereId: 'fil-4',
    etablissementId: 'et-2', anneeAcademiqueId: 'an-3',
    libelle: 'L3 Informatique — Promotion 2024-2025', code: 'L3-INFO-2024',
    capaciteMax: 50, effectifActuel: 41,
    statut: 'active',
    createdAt: '2024-08-15T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
];

const seedGroupes = (): Groupe[] => [
  {
    id: 'gr-1', promotionId: 'pr-1', libelle: 'Groupe TD-1', code: 'TD-1',
    type: 'td', capaciteMax: 24, effectifActuel: 24,
    enseignantId: 't-1', enseignantNom: 'Camille Dupont',
    actif: true, createdAt: '2024-09-09T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'gr-2', promotionId: 'pr-1', libelle: 'Groupe TD-2', code: 'TD-2',
    type: 'td', capaciteMax: 24, effectifActuel: 23,
    actif: true, createdAt: '2024-09-09T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'gr-3', promotionId: 'pr-1', libelle: 'Groupe TD-3', code: 'TD-3',
    type: 'td', capaciteMax: 24, effectifActuel: 25,
    actif: true, createdAt: '2024-09-09T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'gr-4', promotionId: 'pr-1', libelle: 'Groupe TP Salle 1', code: 'TP-1',
    type: 'tp', capaciteMax: 16, effectifActuel: 16,
    enseignantId: 't-2', enseignantNom: 'Idrissa Diallo',
    actif: true, createdAt: '2024-09-09T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const cycles = mockStorage<Cycle>('structure.cycles', seedCycles);
const filieres = mockStorage<Filiere>('structure.filieres', seedFilieres);
const niveaux = mockStorage<Niveau>('structure.niveaux', seedNiveaux);
const classes = mockStorage<Classe>('structure.classes', seedClasses);
const promotions = mockStorage<Promotion>('structure.promotions', seedPromotions);
const groupes = mockStorage<Groupe>('structure.groupes', seedGroupes);

// ── Routes ───────────────────────────────────────────────────────────────────

export const STRUCTURE_ROUTES: MockRoute[] = [
  // Cycles
  {
    method: 'GET', path: '/cycles',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['etablissementId']
        ? cycles.list().filter((c) => c.etablissementId === q['etablissementId'])
        : cycles.list();
      return ok(list);
    },
  },
  {
    method: 'GET', path: '/cycles/:id',
    handler: (_req, { id }) => {
      const c = cycles.find(id);
      if (!c) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(c);
    },
  },
  {
    method: 'POST', path: '/cycles',
    handler: (req) => {
      const dto = req.body as CreateCycleDto;
      const created: Cycle = {
        ...dto, id: crypto.randomUUID(),
        ordre: dto.ordre ?? cycles.list().length + 1,
        actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(cycles.create(created));
    },
  },
  {
    method: 'PATCH', path: '/cycles/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateCycleDto;
      const updated = cycles.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/cycles/:id',
    handler: (_req, { id }) => {
      if (!cycles.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Filières
  {
    method: 'GET', path: '/filieres',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = filieres.list();
      if (q['etablissementId']) list = list.filter((f) => f.etablissementId === q['etablissementId']);
      if (q['cycleId'])         list = list.filter((f) => f.cycleId === q['cycleId']);
      return ok(list);
    },
  },
  {
    method: 'GET', path: '/filieres/:id',
    handler: (_req, { id }) => {
      const f = filieres.find(id);
      if (!f) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(f);
    },
  },
  {
    method: 'POST', path: '/filieres',
    handler: (req) => {
      const dto = req.body as CreateFiliereDto;
      const created: Filiere = {
        ...dto, id: crypto.randomUUID(), actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(filieres.create(created));
    },
  },
  {
    method: 'PATCH', path: '/filieres/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateFiliereDto;
      const updated = filieres.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/filieres/:id',
    handler: (_req, { id }) => {
      if (!filieres.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Niveaux
  {
    method: 'GET', path: '/niveaux',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['filiereId']
        ? niveaux.list().filter((n) => n.filiereId === q['filiereId'])
        : niveaux.list();
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/niveaux',
    handler: (req) => {
      const dto = req.body as CreateNiveauDto;
      const created: Niveau = {
        ...dto, id: crypto.randomUUID(), actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(niveaux.create(created));
    },
  },
  {
    method: 'PATCH', path: '/niveaux/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateNiveauDto;
      const updated = niveaux.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/niveaux/:id',
    handler: (_req, { id }) => {
      if (!niveaux.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Classes
  {
    method: 'GET', path: '/classes',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = classes.list();
      if (q['etablissementId'])   list = list.filter((c) => c.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((c) => c.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['filiereId'])         list = list.filter((c) => c.filiereId === q['filiereId']);
      if (q['niveauId'])          list = list.filter((c) => c.niveauId === q['niveauId']);
      if (q['statut'])            list = list.filter((c) => c.statut === q['statut']);
      list = search(list, q['search'], ['libelle', 'code']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/classes/:id',
    handler: (_req, { id }) => {
      const c = classes.find(id);
      if (!c) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(c);
    },
  },
  {
    method: 'GET', path: '/classes/:id/apprenants',
    // Apprenants belong to the inscription/apprenants module; stub here returns an empty list.
    handler: () => ok([]),
  },
  {
    method: 'POST', path: '/classes',
    handler: (req) => {
      const dto = req.body as CreateClasseDto;
      const created: Classe = {
        ...dto, id: crypto.randomUUID(),
        effectifActuel: 0, statut: 'active',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(classes.create(created));
    },
  },
  {
    method: 'PATCH', path: '/classes/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateClasseDto;
      const updated = classes.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/classes/:id',
    handler: (_req, { id }) => {
      if (!classes.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Promotions
  {
    method: 'GET', path: '/promotions',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = promotions.list();
      if (q['etablissementId'])   list = list.filter((p) => p.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((p) => p.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['filiereId'])         list = list.filter((p) => p.filiereId === q['filiereId']);
      if (q['niveauId'])          list = list.filter((p) => p.niveauId === q['niveauId']);
      if (q['statut'])            list = list.filter((p) => p.statut === q['statut']);
      list = search(list, q['search'], ['libelle', 'code']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/promotions/:id',
    handler: (_req, { id }) => {
      const p = promotions.find(id);
      if (!p) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok({ ...p, groupes: groupes.list().filter((g) => g.promotionId === id) });
    },
  },
  {
    method: 'GET', path: '/promotions/:id/groupes',
    handler: (_req, { id }) => ok(groupes.list().filter((g) => g.promotionId === id)),
  },
  {
    method: 'GET', path: '/promotions/:id/etudiants',
    handler: () => ok([]),
  },
  {
    method: 'POST', path: '/promotions',
    handler: (req) => {
      const dto = req.body as CreatePromotionDto;
      const created: Promotion = {
        ...dto, id: crypto.randomUUID(),
        effectifActuel: 0, statut: 'active',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(promotions.create(created));
    },
  },
  {
    method: 'PATCH', path: '/promotions/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdatePromotionDto;
      const updated = promotions.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/promotions/:id',
    handler: (_req, { id }) => {
      if (!promotions.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Groupes
  {
    method: 'POST', path: '/groupes',
    handler: (req) => {
      const dto = req.body as CreateGroupeDto;
      const created: Groupe = {
        ...dto, id: crypto.randomUUID(),
        effectifActuel: 0, actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(groupes.create(created));
    },
  },
  {
    method: 'PATCH', path: '/groupes/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateGroupeDto;
      const updated = groupes.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/groupes/:id',
    handler: (_req, { id }) => {
      if (!groupes.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Stats
  {
    method: 'GET', path: '/structure/stats',
    handler: () => {
      const cls = classes.list();
      const prs = promotions.list();
      const scolaireEffectif = cls.reduce((s, c) => s + c.effectifActuel, 0);
      const univEffectif = prs.reduce((s, p) => s + p.effectifActuel, 0);
      const capacite = cls.reduce((s, c) => s + c.capaciteMax, 0) + prs.reduce((s, p) => s + p.capaciteMax, 0);
      const effectif = scolaireEffectif + univEffectif;
      const stats: StatsStructure = {
        totalCycles: cycles.list().length,
        totalFilieres: filieres.list().length,
        totalNiveaux: niveaux.list().length,
        totalClasses: cls.length,
        totalPromotions: prs.length,
        totalGroupes: groupes.list().length,
        effectifTotal: effectif,
        effectifScolaire: scolaireEffectif,
        effectifUniversitaire: univEffectif,
        tauxRemplissage: capacite > 0 ? Math.round((effectif / capacite) * 1000) / 10 : 0,
      };
      return ok(stats);
    },
  },
];
