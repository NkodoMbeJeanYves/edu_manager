import { HttpErrorResponse } from '@angular/common/http';
import {
  Etablissement, Campus, AnneeAcademique, Periode, Salle, EvenementCalendrier,
  CreateEtablissementDto, UpdateEtablissementDto,
  CreateCampusDto, UpdateCampusDto,
  CreateAnneeAcademiqueDto, UpdateAnneeAcademiqueDto,
  CreatePeriodeDto, CreateSalleDto, UpdateSalleDto,
} from '../../models/etablissement.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, search, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedEtablissements = (): Etablissement[] => [
  {
    id: 'et-1', nom: 'Lycée Victor Hugo', code: 'LVH',
    type: 'scolaire', adresse: '12 rue de la Paix', ville: 'Paris', pays: 'France',
    telephone: '+33 1 23 45 67 89', email: 'contact@lvh.edu', siteWeb: 'https://lvh.edu',
    actif: true, createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'et-2', nom: 'Université de Lyon', code: 'UDL',
    type: 'universitaire', adresse: '50 boulevard de la Croix-Rousse', ville: 'Lyon', pays: 'France',
    telephone: '+33 4 78 12 34 56', email: 'admin@udl.fr', siteWeb: 'https://udl.fr',
    actif: true, createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'et-3', nom: 'Institut Polytechnique de Yaoundé', code: 'IPY',
    type: 'universitaire', adresse: 'Quartier Bastos', ville: 'Yaoundé', pays: 'Cameroun',
    telephone: '+237 6 99 88 77 66', email: 'info@ipy.cm',
    actif: true, createdAt: '2021-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedCampus = (): Campus[] => [
  {
    id: 'camp-1', etablissementId: 'et-1', nom: 'Campus principal', code: 'PRIN',
    adresse: '12 rue de la Paix', ville: 'Paris',
    principal: true, actif: true,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'camp-2', etablissementId: 'et-2', nom: 'Campus Doua', code: 'DOUA',
    adresse: '43 boulevard du 11 Novembre', ville: 'Villeurbanne',
    telephoneDirecteur: '+33 4 72 11 22 33', principal: true, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'camp-3', etablissementId: 'et-2', nom: 'Campus Bron', code: 'BRON',
    adresse: '5 avenue Pierre Mendès France', ville: 'Bron',
    principal: false, actif: true,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'camp-4', etablissementId: 'et-3', nom: 'Campus Bastos', code: 'BAST',
    adresse: 'Quartier Bastos', ville: 'Yaoundé',
    principal: true, actif: true,
    createdAt: '2021-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedAnnees = (): AnneeAcademique[] => [
  {
    id: 'an-1', etablissementId: 'et-1', libelle: '2024-2025',
    dateDebut: '2024-09-02', dateFin: '2025-07-04',
    statut: 'en_cours', typePeriode: 'trimestre', active: true,
    createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'an-2', etablissementId: 'et-1', libelle: '2023-2024',
    dateDebut: '2023-09-04', dateFin: '2024-07-05',
    statut: 'cloturee', typePeriode: 'trimestre', active: false,
    createdAt: '2023-06-15T00:00:00Z', updatedAt: '2024-07-10T00:00:00Z',
  },
  {
    id: 'an-3', etablissementId: 'et-2', libelle: '2024-2025',
    dateDebut: '2024-09-09', dateFin: '2025-06-27',
    statut: 'en_cours', typePeriode: 'semestre', active: true,
    createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'an-4', etablissementId: 'et-2', libelle: '2025-2026',
    dateDebut: '2025-09-01', dateFin: '2026-06-26',
    statut: 'planifiee', typePeriode: 'semestre', active: false,
    createdAt: '2025-03-10T00:00:00Z', updatedAt: '2025-03-10T00:00:00Z',
  },
];

const seedPeriodes = (): Periode[] => [
  {
    id: 'per-1', anneeAcademiqueId: 'an-1', libelle: 'Trimestre 1', numero: 1,
    type: 'trimestre', dateDebut: '2024-09-02', dateFin: '2024-12-20',
    active: false, createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-12-20T00:00:00Z',
  },
  {
    id: 'per-2', anneeAcademiqueId: 'an-1', libelle: 'Trimestre 2', numero: 2,
    type: 'trimestre', dateDebut: '2025-01-06', dateFin: '2025-03-28',
    active: true, createdAt: '2024-06-15T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z',
  },
  {
    id: 'per-3', anneeAcademiqueId: 'an-1', libelle: 'Trimestre 3', numero: 3,
    type: 'trimestre', dateDebut: '2025-04-14', dateFin: '2025-07-04',
    active: false, createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z',
  },
  {
    id: 'per-4', anneeAcademiqueId: 'an-3', libelle: 'Semestre 1', numero: 1,
    type: 'semestre', dateDebut: '2024-09-09', dateFin: '2025-01-24',
    active: true, createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-09-09T00:00:00Z',
  },
  {
    id: 'per-5', anneeAcademiqueId: 'an-3', libelle: 'Semestre 2', numero: 2,
    type: 'semestre', dateDebut: '2025-02-03', dateFin: '2025-06-27',
    active: false, createdAt: '2024-05-20T00:00:00Z', updatedAt: '2024-05-20T00:00:00Z',
  },
];

const seedSalles = (): Salle[] => [
  {
    id: 'sal-1', campusId: 'camp-1', code: 'A-101', nom: 'Salle A-101',
    type: 'cours', capacite: 35, statut: 'disponible',
    equipements: [{ id: 'eq-1', nom: 'Vidéoprojecteur' }, { id: 'eq-2', nom: 'Tableau interactif' }],
    batiment: 'A', etage: 1,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'sal-2', campusId: 'camp-1', code: 'A-105', nom: 'Salle A-105',
    type: 'cours', capacite: 35, statut: 'disponible',
    equipements: [{ id: 'eq-1', nom: 'Vidéoprojecteur' }],
    batiment: 'A', etage: 1,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'sal-3', campusId: 'camp-1', code: 'B-201', nom: 'Salle B-201',
    type: 'amphi', capacite: 120, statut: 'disponible',
    equipements: [{ id: 'eq-1', nom: 'Vidéoprojecteur' }, { id: 'eq-3', nom: 'Sonorisation' }],
    batiment: 'B', etage: 2,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'sal-4', campusId: 'camp-1', code: 'Labo-3', nom: 'Laboratoire de physique',
    type: 'laboratoire', capacite: 24, statut: 'disponible',
    equipements: [{ id: 'eq-4', nom: 'Paillasses' }, { id: 'eq-5', nom: 'Hottes' }],
    batiment: 'C', etage: 0,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'sal-5', campusId: 'camp-2', code: 'D-302', nom: 'Salle informatique D-302',
    type: 'informatique', capacite: 30, statut: 'maintenance',
    equipements: [{ id: 'eq-6', nom: '30 postes PC' }, { id: 'eq-1', nom: 'Vidéoprojecteur' }],
    batiment: 'D', etage: 3,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z',
  },
  {
    id: 'sal-6', campusId: 'camp-2', code: 'Gymnase', nom: 'Gymnase principal',
    type: 'sport', capacite: 80, statut: 'disponible',
    equipements: [], batiment: 'E', etage: 0,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedEvenements = (): EvenementCalendrier[] => [
  {
    id: 'ev-1', etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    titre: 'Vacances de Noël', dateDebut: '2024-12-21', dateFin: '2025-01-05',
    type: 'vacances',
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ev-2', etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    titre: 'Vacances de février', dateDebut: '2025-02-15', dateFin: '2025-03-02',
    type: 'vacances',
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ev-3', etablissementId: 'et-1', anneeAcademiqueId: 'an-1',
    titre: 'Conseil de classe trimestre 2', dateDebut: '2025-04-03', dateFin: '2025-04-04',
    type: 'evenement',
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ev-4', etablissementId: 'et-1',
    titre: 'Jour férié — Fête du travail', dateDebut: '2025-05-01', dateFin: '2025-05-01',
    type: 'ferie',
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const etablissements = mockStorage<Etablissement>('etablissement.etablissements', seedEtablissements);
const campusStore = mockStorage<Campus>('etablissement.campus', seedCampus);
const annees = mockStorage<AnneeAcademique>('etablissement.annees', seedAnnees);
const periodes = mockStorage<Periode>('etablissement.periodes', seedPeriodes);
const salles = mockStorage<Salle>('etablissement.salles', seedSalles);
const evenements = mockStorage<EvenementCalendrier>('etablissement.evenements', seedEvenements);

// ── Routes ───────────────────────────────────────────────────────────────────

export const ETABLISSEMENT_ROUTES: MockRoute[] = [
  // Établissements
  {
    method: 'GET', path: '/etablissements',
    handler: (req) => {
      const q = readQuery(req.params);
      let result = etablissements.list();
      if (q['type'])  result = result.filter((e) => e.type === q['type']);
      if (q['actif']) result = result.filter((e) => String(e.actif) === q['actif']);
      result = search(result, q['search'], ['nom', 'code', 'ville', 'email']);
      return paginate(result, q);
    },
  },
  // (Specific subpaths under /etablissements/:id must be declared BEFORE the
  //  bare ":id" detail so the matcher hits them. matchPath uses segment
  //  count so they don't actually overlap, but ordering keeps semantics clear.)
  {
    method: 'GET', path: '/etablissements/:id/campus',
    handler: (_req, { id }) => ok(campusStore.list().filter((c) => c.etablissementId === id)),
  },
  {
    method: 'GET', path: '/etablissements/:id/annees-academiques',
    handler: (_req, { id }) => ok(annees.list().filter((a) => a.etablissementId === id)),
  },
  {
    method: 'GET', path: '/etablissements/:id/calendrier',
    handler: (req, { id }) => {
      const q = readQuery(req.params);
      let result = evenements.list().filter((e) => e.etablissementId === id);
      if (q['anneeAcademiqueId']) result = result.filter((e) => e.anneeAcademiqueId === q['anneeAcademiqueId']);
      return ok(result);
    },
  },
  {
    method: 'GET', path: '/etablissements/:id',
    handler: (_req, { id }) => {
      const e = etablissements.find(id);
      if (!e) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(e);
    },
  },
  {
    method: 'POST', path: '/etablissements',
    handler: (req) => {
      const dto = req.body as CreateEtablissementDto;
      const created: Etablissement = {
        ...dto, id: crypto.randomUUID(), actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(etablissements.create(created));
    },
  },
  {
    method: 'PATCH', path: '/etablissements/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateEtablissementDto;
      const updated = etablissements.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/etablissements/:id',
    handler: (_req, { id }) => {
      if (!etablissements.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Campus
  {
    method: 'GET', path: '/campus/:id',
    handler: (_req, { id }) => {
      const c = campusStore.find(id);
      if (!c) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(c);
    },
  },
  {
    method: 'POST', path: '/campus',
    handler: (req) => {
      const dto = req.body as CreateCampusDto;
      const created: Campus = {
        ...dto, id: crypto.randomUUID(),
        principal: dto.principal ?? false, actif: true,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(campusStore.create(created));
    },
  },
  {
    method: 'PATCH', path: '/campus/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateCampusDto;
      const updated = campusStore.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/campus/:id',
    handler: (_req, { id }) => {
      if (!campusStore.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Années académiques
  {
    method: 'GET', path: '/annees-academiques/:id',
    handler: (_req, { id }) => {
      const a = annees.find(id);
      if (!a) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(a);
    },
  },
  {
    method: 'GET', path: '/annees-academiques/:id/periodes',
    handler: (_req, { id }) => ok(periodes.list().filter((p) => p.anneeAcademiqueId === id)),
  },
  {
    method: 'POST', path: '/annees-academiques',
    handler: (req) => {
      const dto = req.body as CreateAnneeAcademiqueDto;
      const created: AnneeAcademique = {
        ...dto, id: crypto.randomUUID(),
        statut: 'planifiee', active: false,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(annees.create(created));
    },
  },
  {
    method: 'PATCH', path: '/annees-academiques/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateAnneeAcademiqueDto;
      const updated = annees.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/annees-academiques/:id/activer',
    handler: (_req, { id }) => {
      // Deactivate other years in the same establishment
      const target = annees.find(id);
      if (!target) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      annees.list()
        .filter((a) => a.etablissementId === target.etablissementId && a.id !== id)
        .forEach((a) => annees.update(a.id, { active: false }));
      const updated = annees.update(id, { active: true, statut: 'en_cours', updatedAt: nowIso() });
      return ok(updated!);
    },
  },
  {
    method: 'PATCH', path: '/annees-academiques/:id/cloturer',
    handler: (_req, { id }) => {
      const updated = annees.update(id, { active: false, statut: 'cloturee', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },

  // Périodes
  {
    method: 'POST', path: '/periodes',
    handler: (req) => {
      const dto = req.body as CreatePeriodeDto;
      const created: Periode = {
        ...dto, id: crypto.randomUUID(), active: false,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(periodes.create(created));
    },
  },
  {
    method: 'PATCH', path: '/periodes/:id',
    handler: (req, { id }) => {
      const dto = req.body as Partial<CreatePeriodeDto>;
      const updated = periodes.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/periodes/:id',
    handler: (_req, { id }) => {
      if (!periodes.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Salles
  {
    method: 'GET', path: '/salles',
    handler: (req) => {
      const q = readQuery(req.params);
      let result = salles.list();
      if (q['campusId']) result = result.filter((s) => s.campusId === q['campusId']);
      if (q['type'])     result = result.filter((s) => s.type === q['type']);
      if (q['statut'])   result = result.filter((s) => s.statut === q['statut']);
      if (q['capaciteMin']) {
        const min = Number(q['capaciteMin']);
        result = result.filter((s) => s.capacite >= min);
      }
      return paginate(result, q);
    },
  },
  {
    method: 'GET', path: '/salles/:id',
    handler: (_req, { id }) => {
      const s = salles.find(id);
      if (!s) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(s);
    },
  },
  {
    method: 'POST', path: '/salles',
    handler: (req) => {
      const dto = req.body as CreateSalleDto;
      const created: Salle = {
        ...dto, id: crypto.randomUUID(),
        statut: 'disponible', equipements: dto.equipements ?? [],
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(salles.create(created));
    },
  },
  {
    method: 'PATCH', path: '/salles/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateSalleDto;
      const updated = salles.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/salles/:id',
    handler: (_req, { id }) => {
      if (!salles.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Calendrier (création / suppression — la lecture est sur /etablissements/:id/calendrier)
  {
    method: 'POST', path: '/calendrier',
    handler: (req) => {
      const dto = req.body as Partial<EvenementCalendrier>;
      const created: EvenementCalendrier = {
        id: crypto.randomUUID(),
        etablissementId: dto.etablissementId ?? 'et-1',
        anneeAcademiqueId: dto.anneeAcademiqueId,
        titre: dto.titre ?? '',
        description: dto.description,
        dateDebut: dto.dateDebut ?? nowIso(),
        dateFin: dto.dateFin ?? nowIso(),
        type: dto.type ?? 'evenement',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(evenements.create(created));
    },
  },
  {
    method: 'DELETE', path: '/calendrier/:id',
    handler: (_req, { id }) => {
      if (!evenements.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
];
