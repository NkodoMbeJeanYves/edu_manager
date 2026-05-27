import { HttpErrorResponse } from '@angular/common/http';
import {
  Enseignant, AffectationMatiere, ChargeHoraire, StatsEnseignant,
  CreateEnseignantDto, UpdateEnseignantDto,
  AffecterMatiereDto, UpdateAffectationDto,
} from '../../models/enseignant.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, search, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedEnseignants = (): Enseignant[] => [
  {
    id: 'ens-1', etablissementId: 'et-1', matricule: 'ENS-2021-007',
    prenom: 'Camille', nom: 'Dupont',
    email: 'camille.dupont@school.edu', telephone: '+33 6 12 34 56 78',
    genre: 'F', dateNaissance: '1985-03-12',
    statut: 'actif', typeContrat: 'titulaire',
    dateEntree: '2021-09-01',
    niveauDiplome: 'master', specialites: ['Algèbre', 'Analyse'],
    chargeHoraireMax: 18, chargeHoraireReelle: 16,
    createdAt: '2021-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ens-2', etablissementId: 'et-1', matricule: 'ENS-2019-002',
    prenom: 'Idrissa', nom: 'Diallo',
    email: 'idrissa.diallo@school.edu', telephone: '+33 6 98 76 54 32',
    genre: 'M', dateNaissance: '1979-07-22',
    statut: 'actif', typeContrat: 'titulaire',
    dateEntree: '2019-09-01',
    niveauDiplome: 'doctorat', specialites: ['Mécanique', 'Thermodynamique'],
    chargeHoraireMax: 18, chargeHoraireReelle: 18,
    createdAt: '2019-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ens-3', etablissementId: 'et-1', matricule: 'ENS-2023-014',
    prenom: 'Léa', nom: 'Moreau',
    email: 'lea.moreau@school.edu',
    genre: 'F', dateNaissance: '1992-11-08',
    statut: 'actif', typeContrat: 'vacataire',
    dateEntree: '2023-09-15',
    niveauDiplome: 'master', specialites: ['Anglais commercial'],
    chargeHoraireMax: 12, chargeHoraireReelle: 10, tauxHoraire: 45,
    createdAt: '2023-09-15T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ens-4', etablissementId: 'et-1', matricule: 'ENS-1998-001',
    prenom: 'Robert', nom: 'Tremblay',
    email: 'robert.tremblay@school.edu',
    genre: 'M', dateNaissance: '1962-04-30',
    statut: 'retraite', typeContrat: 'titulaire',
    dateEntree: '1998-09-01', dateSortie: '2024-06-30',
    niveauDiplome: 'agregation', specialites: ['Histoire moderne', 'Géographie politique'],
    createdAt: '1998-09-01T00:00:00Z', updatedAt: '2024-06-30T00:00:00Z',
  },
  {
    id: 'ens-5', etablissementId: 'et-2', matricule: 'ENS-2020-018',
    prenom: 'Jean', nom: 'Martin',
    email: 'jean.martin@udl.fr', telephone: '+33 6 11 22 33 44',
    genre: 'M', dateNaissance: '1975-09-14',
    statut: 'actif', typeContrat: 'titulaire',
    dateEntree: '2020-09-01',
    niveauDiplome: 'hdr', specialites: ['Programmation', 'Algorithmique'],
    chargeHoraireMax: 16, chargeHoraireReelle: 14,
    createdAt: '2020-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedAffectations = (): AffectationMatiere[] => [
  {
    id: 'af-1', enseignantId: 'ens-1', matiereId: 'mat-1',
    matiereLibelle: 'Algèbre linéaire', matiereCode: 'MATH101',
    classeId: 'cl-3', classeLibelle: 'Première S',
    anneeAcademiqueId: 'an-1',
    heuresPrevues: 60, heuresRealisees: 42, actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'af-2', enseignantId: 'ens-1', matiereId: 'mat-2',
    matiereLibelle: 'Analyse', matiereCode: 'MATH102',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    anneeAcademiqueId: 'an-1',
    heuresPrevues: 60, heuresRealisees: 38, actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'af-3', enseignantId: 'ens-2', matiereId: 'mat-3',
    matiereLibelle: 'Mécanique du point', matiereCode: 'PHY101',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    anneeAcademiqueId: 'an-1',
    heuresPrevues: 54, heuresRealisees: 40, actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'af-4', enseignantId: 'ens-2', matiereId: 'mat-4',
    matiereLibelle: 'Thermodynamique', matiereCode: 'PHY102',
    classeId: 'cl-2', classeLibelle: 'Terminale S — B',
    anneeAcademiqueId: 'an-1',
    heuresPrevues: 54, heuresRealisees: 38, actif: true,
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'af-5', enseignantId: 'ens-3', matiereId: 'mat-6',
    matiereLibelle: 'Anglais technique', matiereCode: 'ENG101',
    classeId: 'cl-4', classeLibelle: 'Première L',
    anneeAcademiqueId: 'an-1',
    heuresPrevues: 30, heuresRealisees: 22, actif: true,
    createdAt: '2024-09-15T00:00:00Z',
  },
  {
    id: 'af-6', enseignantId: 'ens-5', matiereId: 'mat-5',
    matiereLibelle: 'Introduction à la programmation', matiereCode: 'INFO101',
    promotionId: 'pr-1', promotionLibelle: 'L1 Informatique — Promotion 2024-2025',
    anneeAcademiqueId: 'an-3',
    heuresPrevues: 48, heuresRealisees: 36, actif: true,
    createdAt: '2024-09-09T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const enseignants = mockStorage<Enseignant>('enseignant.enseignants', seedEnseignants);
const affectations = mockStorage<AffectationMatiere>('enseignant.affectations', seedAffectations);

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeCharge(enseignantId: string, anneeId: string): ChargeHoraire {
  const items = affectations.list().filter((a) => a.enseignantId === enseignantId && a.anneeAcademiqueId === anneeId);
  const totalPrevues = items.reduce((s, a) => s + a.heuresPrevues, 0);
  const totalRealisees = items.reduce((s, a) => s + (a.heuresRealisees ?? 0), 0);
  return {
    enseignantId, anneeAcademiqueId: anneeId,
    totalPrevues, totalRealisees,
    totalRestantes: Math.max(0, totalPrevues - totalRealisees),
    tauxRealisation: totalPrevues > 0 ? Math.round((totalRealisees / totalPrevues) * 1000) / 10 : 0,
    parMatiere: items.map((a) => ({
      matiereId: a.matiereId,
      matiereLibelle: a.matiereLibelle ?? '',
      heuresPrevues: a.heuresPrevues,
      heuresRealisees: a.heuresRealisees ?? 0,
    })),
    parSemaine: [
      { semaine: '2024-W38', heures: 6 },
      { semaine: '2024-W39', heures: 8 },
      { semaine: '2024-W40', heures: 6 },
      { semaine: '2024-W41', heures: 4 },
    ],
    alerteDepassement: false,
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const ENSEIGNANT_ROUTES: MockRoute[] = [
  // List
  {
    method: 'GET', path: '/enseignants',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = enseignants.list();
      if (q['etablissementId']) list = list.filter((e) => e.etablissementId === q['etablissementId']);
      if (q['statut'])          list = list.filter((e) => e.statut === q['statut']);
      if (q['typeContrat'])     list = list.filter((e) => e.typeContrat === q['typeContrat']);
      if (q['matiereId']) {
        const ids = new Set(affectations.list().filter((a) => a.matiereId === q['matiereId']).map((a) => a.enseignantId));
        list = list.filter((e) => ids.has(e.id));
      }
      list = search(list, q['search'], ['prenom', 'nom', 'email', 'matricule']);
      return paginate(list, q);
    },
  },
  // Stats (specific path BEFORE :id)
  {
    method: 'GET', path: '/enseignants/stats',
    handler: () => {
      const list = enseignants.list();
      const stats: StatsEnseignant = {
        totalEnseignants: list.length,
        actifs: list.filter((e) => e.statut === 'actif').length,
        vacataires: list.filter((e) => e.typeContrat === 'vacataire').length,
        titulaires: list.filter((e) => e.typeContrat === 'titulaire').length,
        tauxPresence: 96,
        chargeHoraireMoyenne: Math.round(
          (list.filter((e) => e.chargeHoraireReelle).reduce((s, e) => s + (e.chargeHoraireReelle ?? 0), 0)
            / Math.max(1, list.filter((e) => e.chargeHoraireReelle).length)) * 10
        ) / 10,
        enseignantsEnSurcharge: list.filter(
          (e) => e.chargeHoraireMax && e.chargeHoraireReelle && e.chargeHoraireReelle > e.chargeHoraireMax,
        ).length,
      };
      return ok(stats);
    },
  },
  {
    method: 'GET', path: '/enseignants/search',
    handler: (req) => {
      const q = readQuery(req.params);
      const query = (q['q'] ?? '').toLowerCase();
      let list = enseignants.list();
      if (q['etablissementId']) list = list.filter((e) => e.etablissementId === q['etablissementId']);
      const matches = list
        .filter((e) =>
          `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(query),
        )
        .slice(0, 10)
        .map(({ id, prenom, nom, matricule }) => ({ id, prenom, nom, matricule }));
      return ok(matches);
    },
  },
  // Detail
  {
    method: 'GET', path: '/enseignants/:id',
    handler: (_req, { id }) => {
      const e = enseignants.find(id);
      if (!e) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(e);
    },
  },
  // Sub-resources
  {
    method: 'GET', path: '/enseignants/:id/charge-horaire',
    handler: (req, { id }) => {
      const q = readQuery(req.params);
      return ok(computeCharge(id, q['anneeAcademiqueId'] ?? 'an-1'));
    },
  },
  {
    method: 'POST', path: '/enseignants/:id/photo',
    handler: (_req, { id }) => {
      // FormData upload — return the existing record unchanged (mock can't store the blob).
      const e = enseignants.find(id);
      if (!e) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(enseignants.update(id, { photoUrl: `https://placehold.co/120x120?text=${id}`, updatedAt: nowIso() })!);
    },
  },
  // Create
  {
    method: 'POST', path: '/enseignants',
    handler: (req) => {
      const dto = req.body as CreateEnseignantDto;
      const created: Enseignant = {
        ...dto,
        id: crypto.randomUUID(),
        matricule: `ENS-${new Date().getFullYear()}-${String(enseignants.list().length + 1).padStart(3, '0')}`,
        statut: 'actif',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return ok(enseignants.create(created));
    },
  },
  // Update
  {
    method: 'PATCH', path: '/enseignants/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateEnseignantDto;
      const updated = enseignants.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  // Delete
  {
    method: 'DELETE', path: '/enseignants/:id',
    handler: (_req, { id }) => {
      if (!enseignants.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      // Cascade: remove affectations
      affectations.list().filter((a) => a.enseignantId === id).forEach((a) => affectations.remove(a.id));
      return ok(undefined);
    },
  },

  // Affectations matières
  {
    method: 'GET', path: '/affectations-matieres',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = affectations.list();
      if (q['enseignantId'])      list = list.filter((a) => a.enseignantId === q['enseignantId']);
      if (q['anneeAcademiqueId']) list = list.filter((a) => a.anneeAcademiqueId === q['anneeAcademiqueId']);
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/affectations-matieres',
    handler: (req) => {
      const dto = req.body as AffecterMatiereDto;
      const created: AffectationMatiere = {
        ...dto,
        id: crypto.randomUUID(),
        actif: true,
        createdAt: nowIso(),
      };
      return ok(affectations.create(created));
    },
  },
  {
    method: 'PATCH', path: '/affectations-matieres/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateAffectationDto;
      const updated = affectations.update(id, dto);
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/affectations-matieres/:id',
    handler: (_req, { id }) => {
      if (!affectations.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
];
