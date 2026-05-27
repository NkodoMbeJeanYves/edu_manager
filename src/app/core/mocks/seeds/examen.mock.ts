import { HttpErrorResponse } from '@angular/common/http';
import {
  SessionExamen, Epreuve, Convocation, PVExamen, CasFraude,
  CreateSessionDto, CreateEpreuveDto, GenererConvocationsDto,
} from '../../models/examen.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedSessions = (): SessionExamen[] => [
  {
    id: 'sess-1', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-1',
    libelle: 'Session normale — Trimestre 1 2024-2025',
    type: 'normale', statut: 'cloturee',
    dateDebut: '2024-12-09', dateFin: '2024-12-20',
    createdAt: '2024-11-01T00:00:00Z', updatedAt: '2024-12-21T00:00:00Z',
  },
  {
    id: 'sess-2', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-1',
    libelle: 'Session de rattrapage — Trimestre 1',
    type: 'rattrapage', statut: 'cloturee',
    dateDebut: '2025-01-13', dateFin: '2025-01-17',
    createdAt: '2024-12-22T00:00:00Z', updatedAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'sess-3', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-2',
    libelle: 'Session normale — Trimestre 2 2024-2025',
    type: 'normale', statut: 'en_cours',
    dateDebut: '2025-05-19', dateFin: '2025-05-30',
    createdAt: '2025-04-08T00:00:00Z', updatedAt: '2025-05-19T08:00:00Z',
  },
  {
    id: 'sess-4', etablissementId: 'et-2', anneeAcademiqueId: 'an-3', periodeId: 'per-4',
    libelle: 'Session universitaire — Semestre 1',
    type: 'normale', statut: 'cloturee',
    dateDebut: '2025-01-13', dateFin: '2025-01-24',
    createdAt: '2024-11-15T00:00:00Z', updatedAt: '2025-01-25T00:00:00Z',
  },
];

const seedEpreuves = (): Epreuve[] => [
  {
    id: 'ep-1', sessionId: 'sess-3',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire', matiereCode: 'MATH101',
    classeId: 'cl-1',
    salleId: 'sal-3', salleLibelle: 'Salle B-201',
    enseignantSurveillantId: 'ens-1', enseignantSurveillantNom: 'Camille Dupont',
    date: '2025-05-19', heureDebut: '08:00', heureFin: '11:00', dureeMinutes: 180,
    coefficient: 4, noteMax: 20,
    convocationsGenerees: true,
    createdAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'ep-2', sessionId: 'sess-3',
    matiereId: 'mat-3', matiereLibelle: 'Mécanique du point', matiereCode: 'PHY101',
    classeId: 'cl-1',
    salleId: 'sal-4', salleLibelle: 'Laboratoire de physique',
    enseignantSurveillantId: 'ens-2', enseignantSurveillantNom: 'Idrissa Diallo',
    date: '2025-05-20', heureDebut: '14:00', heureFin: '17:00', dureeMinutes: 180,
    coefficient: 3, noteMax: 20,
    convocationsGenerees: true,
    createdAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'ep-3', sessionId: 'sess-3',
    matiereId: 'mat-6', matiereLibelle: 'Anglais technique', matiereCode: 'ENG101',
    classeId: 'cl-4',
    salleId: 'sal-2', salleLibelle: 'Salle A-105',
    enseignantSurveillantId: 'ens-3', enseignantSurveillantNom: 'Léa Moreau',
    date: '2025-05-21', heureDebut: '09:00', heureFin: '11:00', dureeMinutes: 120,
    coefficient: 2, noteMax: 20,
    convocationsGenerees: false,
    createdAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'ep-4', sessionId: 'sess-4',
    matiereId: 'mat-5', matiereLibelle: 'Introduction à la programmation', matiereCode: 'INFO101',
    promotionId: 'pr-1',
    salleId: 'sal-5', salleLibelle: 'Salle informatique D-302',
    enseignantSurveillantId: 'ens-5', enseignantSurveillantNom: 'Jean Martin',
    date: '2025-01-20', heureDebut: '08:00', heureFin: '11:00', dureeMinutes: 180,
    coefficient: 3, noteMax: 20,
    convocationsGenerees: true,
    createdAt: '2024-12-10T00:00:00Z',
  },
];

const seedConvocations = (): Convocation[] => {
  const apprenants = ['app-1', 'app-2', 'app-3'];
  const out: Convocation[] = [];
  apprenants.forEach((aid, idx) => {
    // For ep-1 — Algèbre linéaire Terminale S-A
    out.push({
      id: `conv-1-${idx + 1}`, epreuveId: 'ep-1',
      apprenantId: aid,
      apprenantNom: ['Johnson', 'Lee', 'Martinez'][idx],
      apprenantPrenom: ['Alice', 'Marcus', 'Sofia'][idx],
      numeroInscription: ['STU-2024-001', 'STU-2023-014', 'STU-2022-009'][idx],
      numeroPlace: `${idx + 1}`,
      salle: 'B-201',
      statut: idx === 0 ? 'confirmee' : 'envoyee',
      dateEnvoi: '2025-05-10T09:00:00Z',
      eligible: true,
      createdAt: '2025-05-10T09:00:00Z',
    });
  });
  // For ep-1 — one ineligible apprenant (dette financière)
  out.push({
    id: 'conv-1-4', epreuveId: 'ep-1',
    apprenantId: 'app-6',
    apprenantNom: 'Garcia', apprenantPrenom: 'Sophie',
    numeroInscription: 'STU-2023-022',
    statut: 'generee',
    eligible: false,
    motifIneligibilite: 'Dette financière non régularisée — facture INV-2025-0033.',
    createdAt: '2025-05-10T09:00:00Z',
  });
  return out;
};

const seedPVs = (): (PVExamen & { id: string })[] => [
  {
    id: 'pvex-1', epreuveId: 'ep-1',
    dateRedaction: '2025-05-19T12:00:00Z',
    observations: 'Épreuve s\'est déroulée dans le calme. Salle remplie à 100%.',
    cas: [],
    signePar: 'Camille Dupont',
    dateSigne: '2025-05-19T12:30:00Z',
    statut: 'signe',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const sessions = mockStorage<SessionExamen>('examen.sessions', seedSessions);
const epreuves = mockStorage<Epreuve>('examen.epreuves', seedEpreuves);
const convocations = mockStorage<Convocation>('examen.convocations', seedConvocations);
const pvs = mockStorage<PVExamen & { id: string }>('examen.pvs', seedPVs);

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyBlob(): Blob { return new Blob(['mock convocation'], { type: 'application/pdf' }); }

// ── Routes ───────────────────────────────────────────────────────────────────

export const EXAMEN_ROUTES: MockRoute[] = [
  // Sessions
  {
    method: 'GET', path: '/sessions-examen',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = sessions.list();
      if (q['etablissementId'])   list = list.filter((s) => s.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((s) => s.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['type'])              list = list.filter((s) => s.type === q['type']);
      if (q['statut'])            list = list.filter((s) => s.statut === q['statut']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/sessions-examen/:id',
    handler: (_req, { id }) => {
      const s = sessions.find(id);
      if (!s) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      // Embed épreuves
      const eps = epreuves.list().filter((e) => e.sessionId === id);
      return ok({ ...s, epreuves: eps });
    },
  },
  {
    method: 'GET', path: '/sessions-examen/:id/epreuves',
    handler: (_req, { id }) => ok(epreuves.list().filter((e) => e.sessionId === id)),
  },
  {
    method: 'POST', path: '/sessions-examen',
    handler: (req) => {
      const dto = req.body as CreateSessionDto;
      const created: SessionExamen = {
        ...dto, id: crypto.randomUUID(),
        statut: 'planifiee',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(sessions.create(created));
    },
  },
  {
    method: 'PATCH', path: '/sessions-examen/:id',
    handler: (req, { id }) => {
      const dto = req.body as Partial<CreateSessionDto>;
      const updated = sessions.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/sessions-examen/:id/cloturer',
    handler: (_req, { id }) => {
      const updated = sessions.update(id, { statut: 'cloturee', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },

  // Épreuves
  {
    method: 'POST', path: '/epreuves',
    handler: (req) => {
      const dto = req.body as CreateEpreuveDto;
      const created: Epreuve = {
        ...dto, id: crypto.randomUUID(),
        convocationsGenerees: false,
        createdAt: nowIso(),
      };
      return ok(epreuves.create(created));
    },
  },
  {
    method: 'PATCH', path: '/epreuves/:id',
    handler: (req, { id }) => {
      const dto = req.body as Partial<CreateEpreuveDto>;
      const updated = epreuves.update(id, dto);
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/epreuves/:id',
    handler: (_req, { id }) => {
      if (!epreuves.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      // Cascade delete convocations
      convocations.list().filter((c) => c.epreuveId === id).forEach((c) => convocations.remove(c.id));
      return ok(undefined);
    },
  },
  {
    method: 'GET', path: '/epreuves/:id/convocations',
    handler: (_req, { id }) => ok(convocations.list().filter((c) => c.epreuveId === id)),
  },

  // Convocations
  {
    method: 'POST', path: '/convocations/generer',
    handler: (req) => {
      const dto = req.body as GenererConvocationsDto;
      const existing = convocations.list().filter((c) => c.epreuveId === dto.epreuveId);
      if (existing.length > 0) {
        // Already generated — return them
        epreuves.update(dto.epreuveId, { convocationsGenerees: true });
        return ok({ count: existing.length, convocations: existing });
      }
      // Generate 5 mock convocations for the épreuve.
      const apprenants = [
        { id: 'app-1', nom: 'Johnson', prenom: 'Alice', reg: 'STU-2024-001' },
        { id: 'app-2', nom: 'Lee', prenom: 'Marcus', reg: 'STU-2023-014' },
        { id: 'app-3', nom: 'Martinez', prenom: 'Sofia', reg: 'STU-2022-009' },
        { id: 'app-7', nom: 'Petit', prenom: 'Thomas', reg: 'STU-2024-018' },
        { id: 'app-8', nom: 'Bernard', prenom: 'Léo', reg: 'STU-2024-021' },
      ];
      const ep = epreuves.find(dto.epreuveId);
      const created: Convocation[] = apprenants.map((a, idx) => ({
        id: crypto.randomUUID(),
        epreuveId: dto.epreuveId,
        apprenantId: a.id,
        apprenantNom: a.nom, apprenantPrenom: a.prenom, numeroInscription: a.reg,
        numeroPlace: String(idx + 1),
        salle: ep?.salleLibelle,
        statut: 'generee',
        eligible: dto.verifierEligibilite ? a.id !== 'app-3' : true,
        motifIneligibilite: dto.verifierEligibilite && a.id === 'app-3'
          ? 'Dette financière non régularisée.' : undefined,
        createdAt: nowIso(),
      }));
      created.forEach((c) => convocations.create(c));
      epreuves.update(dto.epreuveId, { convocationsGenerees: true });
      return ok({ count: created.length, convocations: created });
    },
  },
  {
    method: 'POST', path: '/convocations/envoyer',
    handler: (req) => {
      const body = req.body as { epreuveId: string };
      const list = convocations.list().filter((c) => c.epreuveId === body.epreuveId && c.eligible);
      list.forEach((c) => convocations.update(c.id, { statut: 'envoyee', dateEnvoi: nowIso() }));
      return ok({ sent: list.length });
    },
  },
  {
    method: 'GET', path: '/convocations/:id/pdf',
    handler: () => emptyBlob(),
  },

  // PV
  {
    method: 'POST', path: '/pv-examen',
    handler: (req) => {
      const body = req.body as { epreuveId: string; observations: string; cas: CasFraude[] };
      const created: PVExamen & { id: string } = {
        id: crypto.randomUUID(),
        epreuveId: body.epreuveId,
        dateRedaction: nowIso(),
        observations: body.observations,
        cas: body.cas ?? [],
        signePar: '',
        statut: 'brouillon',
      };
      pvs.create(created);
      const { id: _id, ...rest } = created;
      return ok(rest);
    },
  },
  {
    method: 'PATCH', path: '/pv-examen/:id/signer',
    handler: (req, { id }) => {
      const body = req.body as { signePar: string };
      const updated = pvs.update(id, {
        signePar: body.signePar,
        dateSigne: nowIso(),
        statut: 'signe',
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const { id: _id, ...rest } = updated;
      return ok(rest);
    },
  },
];
