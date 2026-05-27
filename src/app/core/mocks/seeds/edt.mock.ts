import { HttpErrorResponse } from '@angular/common/http';
import {
  CoursPlanifie, Seance, ConflitEDT, CreneauHoraire,
  Indisponibilite, EventCalendrier, StatsEDT, CouvertureMatiere,
  CreateCoursPlanifieDto, UpdateCoursPlanifieDto,
  CreateSeanceDto, UpdateSeanceDto,
  SaisirCahierTexteDto, GenererSeancesDto,
  PublierEDTDto, CreateIndisponibiliteDto,
} from '../../models/edt.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedCreneaux = (): CreneauHoraire[] => [
  { id: 'cr-1', etablissementId: 'et-1', libelle: 'H1 — 08:00 - 10:00', heureDebut: '08:00', heureFin: '10:00', dureeMinutes: 120, ordre: 1, actif: true },
  { id: 'cr-2', etablissementId: 'et-1', libelle: 'H2 — 10:15 - 12:15', heureDebut: '10:15', heureFin: '12:15', dureeMinutes: 120, ordre: 2, actif: true },
  { id: 'cr-3', etablissementId: 'et-1', libelle: 'H3 — 14:00 - 16:00', heureDebut: '14:00', heureFin: '16:00', dureeMinutes: 120, ordre: 3, actif: true },
  { id: 'cr-4', etablissementId: 'et-1', libelle: 'H4 — 16:15 - 18:15', heureDebut: '16:15', heureFin: '18:15', dureeMinutes: 120, ordre: 4, actif: true },
];

const seedCours = (): CoursPlanifie[] => [
  {
    id: 'cp-1', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-2',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire', matiereCode: 'MATH101',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-3', salleCode: 'B-201', salleLibelle: 'Salle B-201',
    typeCours: 'cm', typeRecurrence: 'hebdomadaire',
    jourSemaine: 'lundi', creneauId: 'cr-1',
    heureDebut: '08:00', heureFin: '10:00',
    dateDebutValidite: '2025-01-06', dateFinValidite: '2025-03-28',
    couleur: '#3b82f6', statut: 'publie',
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z',
  },
  {
    id: 'cp-2', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-2',
    matiereId: 'mat-3', matiereLibelle: 'Mécanique du point', matiereCode: 'PHY101',
    enseignantId: 'ens-2', enseignantNom: 'Idrissa Diallo',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-4', salleCode: 'Labo-3', salleLibelle: 'Laboratoire de physique',
    typeCours: 'td', typeRecurrence: 'hebdomadaire',
    jourSemaine: 'mardi', creneauId: 'cr-2',
    heureDebut: '10:15', heureFin: '12:15',
    dateDebutValidite: '2025-01-06', dateFinValidite: '2025-03-28',
    couleur: '#ec4899', statut: 'publie',
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z',
  },
  {
    id: 'cp-3', etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-2',
    matiereId: 'mat-6', matiereLibelle: 'Anglais technique', matiereCode: 'ENG101',
    enseignantId: 'ens-3', enseignantNom: 'Léa Moreau',
    classeId: 'cl-4', classeLibelle: 'Première L',
    salleId: 'sal-2', salleCode: 'A-105', salleLibelle: 'Salle A-105',
    typeCours: 'td', typeRecurrence: 'hebdomadaire',
    jourSemaine: 'mercredi', creneauId: 'cr-3',
    heureDebut: '14:00', heureFin: '16:00',
    dateDebutValidite: '2025-01-06', dateFinValidite: '2025-03-28',
    couleur: '#10b981', statut: 'publie',
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z',
  },
];

const seedSeances = (): Seance[] => [
  {
    id: 'se-1', coursPlanifieId: 'cp-1', etablissementId: 'et-1',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-3', salleCode: 'B-201', salleLibelle: 'Salle B-201',
    typeCours: 'cm', date: '2025-05-19', heureDebut: '08:00', heureFin: '10:00', dureeMinutes: 120,
    statut: 'realisee',
    contenuEnseignant: 'Espaces vectoriels — exercices d\'application.',
    presencesSaisies: true, nombrePresents: 30, nombreAbsents: 2,
    estRemplacement: false,
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-05-19T10:30:00Z',
  },
  {
    id: 'se-2', coursPlanifieId: 'cp-2', etablissementId: 'et-1',
    matiereId: 'mat-3', matiereLibelle: 'Mécanique du point',
    enseignantId: 'ens-2', enseignantNom: 'Idrissa Diallo',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-4', salleCode: 'Labo-3', salleLibelle: 'Laboratoire de physique',
    typeCours: 'td', date: '2025-05-20', heureDebut: '10:15', heureFin: '12:15', dureeMinutes: 120,
    statut: 'realisee',
    contenuEnseignant: 'Pendule simple — TP n°3.',
    presencesSaisies: true, nombrePresents: 31, nombreAbsents: 1,
    estRemplacement: false,
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-05-20T12:30:00Z',
  },
  {
    id: 'se-3', coursPlanifieId: 'cp-1', etablissementId: 'et-1',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-3', salleCode: 'B-201', salleLibelle: 'Salle B-201',
    typeCours: 'cm', date: '2025-05-26', heureDebut: '08:00', heureFin: '10:00', dureeMinutes: 120,
    statut: 'planifiee',
    presencesSaisies: false, estRemplacement: false,
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2024-12-15T00:00:00Z',
  },
  {
    id: 'se-4', coursPlanifieId: 'cp-3', etablissementId: 'et-1',
    matiereId: 'mat-6', matiereLibelle: 'Anglais technique',
    enseignantId: 'ens-3', enseignantNom: 'Léa Moreau',
    classeId: 'cl-4', classeLibelle: 'Première L',
    salleId: 'sal-2', salleCode: 'A-105', salleLibelle: 'Salle A-105',
    typeCours: 'td', date: '2025-05-21', heureDebut: '14:00', heureFin: '16:00', dureeMinutes: 120,
    statut: 'annulee',
    motifAnnulation: 'Enseignante en formation.',
    presencesSaisies: false, estRemplacement: false,
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2025-05-18T09:00:00Z',
  },
  {
    id: 'se-5', coursPlanifieId: 'cp-2', etablissementId: 'et-1',
    matiereId: 'mat-3', matiereLibelle: 'Mécanique du point',
    enseignantId: 'ens-2', enseignantNom: 'Idrissa Diallo',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    salleId: 'sal-4', salleCode: 'Labo-3', salleLibelle: 'Laboratoire de physique',
    typeCours: 'td', date: '2025-05-27', heureDebut: '10:15', heureFin: '12:15', dureeMinutes: 120,
    statut: 'planifiee',
    presencesSaisies: false, estRemplacement: false,
    createdAt: '2024-12-15T00:00:00Z', updatedAt: '2024-12-15T00:00:00Z',
  },
];

const seedIndispos = (): Indisponibilite[] => [
  {
    id: 'ind-1', enseignantId: 'ens-3',
    dateDebut: '2025-05-21', dateFin: '2025-05-21',
    heureDebut: '08:00', heureFin: '18:00',
    motif: 'Formation continue — pédagogie',
    type: 'formation',
    createdAt: '2025-05-10T00:00:00Z',
  },
  {
    id: 'ind-2', enseignantId: 'ens-1',
    dateDebut: '2025-06-02', dateFin: '2025-06-06',
    motif: 'Congé d\'été',
    type: 'conge',
    createdAt: '2025-05-15T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const creneaux = mockStorage<CreneauHoraire>('edt.creneaux', seedCreneaux);
const cours = mockStorage<CoursPlanifie>('edt.cours', seedCours);
const seances = mockStorage<Seance>('edt.seances', seedSeances);
const indispos = mockStorage<Indisponibilite>('edt.indispos', seedIndispos);

// ── Helpers ──────────────────────────────────────────────────────────────────

// Returns ISO week number from a yyyy-mm-dd date. Used to filter seances by `semaine` (e.g. "2025-W21").
function isoWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const target = new Date(d.valueOf());
  const dayNumber = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = (target.getTime() - firstThursday.getTime()) / 86_400_000;
  const week = 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function detectConflicts(
  candidate: { enseignantId: string; salleId: string; classeId?: string; promotionId?: string; date: string; heureDebut: string; heureFin: string },
  excludeSeanceId?: string,
): ConflitEDT[] {
  const conflicts: ConflitEDT[] = [];
  const sameDay = seances.list().filter(
    (s) => s.id !== excludeSeanceId && s.date === candidate.date && s.statut !== 'annulee',
  );
  const overlap = (s: Seance) =>
    !(s.heureFin <= candidate.heureDebut || s.heureDebut >= candidate.heureFin);

  sameDay.forEach((s) => {
    if (!overlap(s)) return;
    if (s.enseignantId === candidate.enseignantId) {
      conflicts.push({
        type: 'enseignant_double',
        message: `Enseignant déjà occupé sur ${s.matiereLibelle} (${s.heureDebut}-${s.heureFin})`,
        seance2: s,
      });
    }
    if (s.salleId === candidate.salleId) {
      conflicts.push({
        type: 'salle_double',
        message: `Salle ${s.salleCode} déjà occupée (${s.heureDebut}-${s.heureFin})`,
        seance2: s,
      });
    }
    if (candidate.classeId && s.classeId === candidate.classeId) {
      conflicts.push({
        type: 'groupe_double',
        message: `Classe déjà en cours sur ${s.matiereLibelle}`,
        seance2: s,
      });
    }
    if (candidate.promotionId && s.promotionId === candidate.promotionId) {
      conflicts.push({
        type: 'groupe_double',
        message: `Promotion déjà en cours sur ${s.matiereLibelle}`,
        seance2: s,
      });
    }
  });
  return conflicts;
}

function toEvent(s: Seance): EventCalendrier {
  return {
    id: s.id,
    titre: s.matiereLibelle ?? 'Cours',
    sous_titre: s.classeLibelle ?? s.promotionLibelle ?? s.groupeLibelle,
    date: s.date,
    heureDebut: s.heureDebut,
    heureFin: s.heureFin,
    couleur: s.statut === 'annulee' ? '#9ca3af'
      : s.statut === 'realisee' ? '#10b981'
      : '#3b82f6',
    typeCours: s.typeCours,
    statut: s.statut,
    salle: s.salleCode,
    enseignant: s.enseignantNom,
    seanceId: s.id,
    modifiable: s.statut === 'planifiee',
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const EDT_ROUTES: MockRoute[] = [
  // Cours planifiés
  {
    method: 'GET', path: '/cours-planifies',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = cours.list();
      if (q['etablissementId'])   list = list.filter((c) => c.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((c) => c.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['classeId'])          list = list.filter((c) => c.classeId === q['classeId']);
      if (q['promotionId'])       list = list.filter((c) => c.promotionId === q['promotionId']);
      return ok(list);
    },
  },
  {
    method: 'GET', path: '/cours-planifies/:id',
    handler: (_req, { id }) => {
      const c = cours.find(id);
      if (!c) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(c);
    },
  },
  {
    method: 'POST', path: '/cours-planifies',
    handler: (req) => {
      const dto = req.body as CreateCoursPlanifieDto;
      const created: CoursPlanifie = {
        ...dto, id: crypto.randomUUID(),
        statut: 'brouillon',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(cours.create(created));
    },
  },
  {
    method: 'PATCH', path: '/cours-planifies/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateCoursPlanifieDto;
      const updated = cours.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/cours-planifies/:id',
    handler: (_req, { id }) => {
      if (!cours.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
  {
    method: 'POST', path: '/cours-planifies/:id/generer',
    handler: (req, { id }) => {
      const dto = req.body as GenererSeancesDto;
      const cp = cours.find(id);
      if (!cp) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

      // Generate weekly seances between dateDebut and dateFin matching the jourSemaine.
      const created: Seance[] = [];
      const jourIdx: Record<string, number> = {
        lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6,
      };
      const target = jourIdx[cp.jourSemaine ?? 'lundi'];
      const start = new Date(dto.dateDebut + 'T00:00:00Z');
      const end = new Date(dto.dateFin + 'T00:00:00Z');
      for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        if (d.getUTCDay() !== target) continue;
        const date = d.toISOString().slice(0, 10);
        const seance: Seance = {
          id: crypto.randomUUID(),
          coursPlanifieId: cp.id,
          etablissementId: cp.etablissementId,
          matiereId: cp.matiereId,
          matiereLibelle: cp.matiereLibelle,
          enseignantId: cp.enseignantId,
          enseignantNom: cp.enseignantNom,
          classeId: cp.classeId,
          classeLibelle: cp.classeLibelle,
          promotionId: cp.promotionId,
          promotionLibelle: cp.promotionLibelle,
          groupeId: cp.groupeId,
          groupeLibelle: cp.groupeLibelle,
          salleId: cp.salleId,
          salleCode: cp.salleCode,
          salleLibelle: cp.salleLibelle,
          typeCours: cp.typeCours,
          date,
          heureDebut: cp.heureDebut, heureFin: cp.heureFin,
          dureeMinutes: 120,
          statut: 'planifiee',
          presencesSaisies: false,
          estRemplacement: false,
          createdAt: nowIso(), updatedAt: nowIso(),
        };
        seances.create(seance);
        created.push(seance);
      }
      return ok({ count: created.length, seances: created });
    },
  },
  {
    method: 'PATCH', path: '/edt/publier',
    handler: (req) => {
      const dto = req.body as PublierEDTDto;
      let list = cours.list().filter(
        (c) => c.etablissementId === dto.etablissementId
          && c.anneeAcademiqueId === dto.anneeAcademiqueId,
      );
      if (dto.classeId)    list = list.filter((c) => c.classeId === dto.classeId);
      if (dto.promotionId) list = list.filter((c) => c.promotionId === dto.promotionId);
      list.forEach((c) => cours.update(c.id, { statut: 'publie', updatedAt: nowIso() }));
      return ok({ count: list.length });
    },
  },

  // Séances
  {
    method: 'GET', path: '/seances',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = seances.list();
      if (q['etablissementId'])   list = list.filter((s) => s.etablissementId === q['etablissementId']);
      if (q['enseignantId'])      list = list.filter((s) => s.enseignantId === q['enseignantId']);
      if (q['classeId'])          list = list.filter((s) => s.classeId === q['classeId']);
      if (q['promotionId'])       list = list.filter((s) => s.promotionId === q['promotionId']);
      if (q['groupeId'])          list = list.filter((s) => s.groupeId === q['groupeId']);
      if (q['salleId'])           list = list.filter((s) => s.salleId === q['salleId']);
      if (q['matiereId'])         list = list.filter((s) => s.matiereId === q['matiereId']);
      if (q['statut'])            list = list.filter((s) => s.statut === q['statut']);
      if (q['dateDebut'])         list = list.filter((s) => s.date >= q['dateDebut']);
      if (q['dateFin'])           list = list.filter((s) => s.date <= q['dateFin']);
      if (q['semaine'])           list = list.filter((s) => isoWeek(s.date) === q['semaine']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/seances/:id',
    handler: (_req, { id }) => {
      const s = seances.find(id);
      if (!s) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(s);
    },
  },
  {
    method: 'POST', path: '/seances',
    handler: (req) => {
      const dto = req.body as CreateSeanceDto;
      const created: Seance = {
        ...dto, id: crypto.randomUUID(),
        dureeMinutes: 120,
        statut: 'planifiee',
        presencesSaisies: false,
        estRemplacement: false,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(seances.create(created));
    },
  },
  {
    method: 'PATCH', path: '/seances/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateSeanceDto;
      const updated = seances.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/seances/:id',
    handler: (_req, { id }) => {
      if (!seances.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
  {
    method: 'PATCH', path: '/seances/:id/annuler',
    handler: (req, { id }) => {
      const body = req.body as { motif: string };
      const updated = seances.update(id, {
        statut: 'annulee', motifAnnulation: body.motif, updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/seances/:id/reporter',
    handler: (req, { id }) => {
      const body = req.body as { dateReport: string; motif: string };
      const updated = seances.update(id, {
        statut: 'reportee',
        dateReport: body.dateReport,
        motifReport: body.motif,
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/seances/:id/realiser',
    handler: (_req, { id }) => {
      const updated = seances.update(id, { statut: 'realisee', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/seances/:id/cahier-texte',
    handler: (req, { id }) => {
      const dto = req.body as SaisirCahierTexteDto;
      const updated = seances.update(id, {
        contenuEnseignant: dto.contenuEnseignant,
        travauxDemandes: dto.travauxDemandes,
        ressources: dto.ressources,
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/seances/:id/remplacer',
    handler: (req, { id }) => {
      const body = req.body as { enseignantRemplacantId: string };
      const updated = seances.update(id, {
        estRemplacement: true,
        enseignantRemplacantId: body.enseignantRemplacantId,
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },

  // Vue calendrier
  {
    method: 'GET', path: '/edt/vue',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = seances.list();
      if (q['anneeAcademiqueId']) {
        // Filter seances whose cours-planifié belongs to that année (best-effort).
        list = list.filter((s) => {
          if (!s.coursPlanifieId) return true;
          const cp = cours.find(s.coursPlanifieId);
          return !cp || cp.anneeAcademiqueId === q['anneeAcademiqueId'];
        });
      }
      switch (q['vue']) {
        case 'enseignant': list = list.filter((s) => s.enseignantId === q['entityId']); break;
        case 'classe':     list = list.filter((s) => s.classeId === q['entityId']);     break;
        case 'promotion':  list = list.filter((s) => s.promotionId === q['entityId']);  break;
        case 'salle':      list = list.filter((s) => s.salleId === q['entityId']);      break;
      }
      if (q['semaine']) list = list.filter((s) => isoWeek(s.date) === q['semaine']);
      return ok(list.map(toEvent));
    },
  },

  // Conflits
  {
    method: 'POST', path: '/edt/conflits',
    handler: (req) => {
      const dto = req.body as CreateSeanceDto & UpdateSeanceDto & { seanceId?: string };
      const candidate = {
        enseignantId: dto.enseignantId ?? '',
        salleId: dto.salleId ?? '',
        classeId: dto.classeId,
        promotionId: dto.promotionId,
        date: dto.date ?? '',
        heureDebut: dto.heureDebut ?? '',
        heureFin: dto.heureFin ?? '',
      };
      return ok(detectConflicts(candidate, dto.seanceId));
    },
  },

  // Créneaux horaires
  {
    method: 'GET', path: '/creneaux',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['etablissementId']
        ? creneaux.list().filter((c) => c.etablissementId === q['etablissementId'])
        : creneaux.list();
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/creneaux',
    handler: (req) => {
      const dto = req.body as Partial<CreneauHoraire>;
      const created: CreneauHoraire = {
        id: crypto.randomUUID(),
        etablissementId: dto.etablissementId ?? 'et-1',
        libelle: dto.libelle ?? '',
        heureDebut: dto.heureDebut ?? '08:00',
        heureFin: dto.heureFin ?? '10:00',
        dureeMinutes: dto.dureeMinutes ?? 120,
        ordre: dto.ordre ?? creneaux.list().length + 1,
        actif: dto.actif ?? true,
      };
      return ok(creneaux.create(created));
    },
  },
  {
    method: 'PATCH', path: '/creneaux/:id',
    handler: (req, { id }) => {
      const updated = creneaux.update(id, req.body as Partial<CreneauHoraire>);
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'DELETE', path: '/creneaux/:id',
    handler: (_req, { id }) => {
      if (!creneaux.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Indisponibilités
  {
    method: 'GET', path: '/indisponibilites',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['enseignantId']
        ? indispos.list().filter((i) => i.enseignantId === q['enseignantId'])
        : indispos.list();
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/indisponibilites',
    handler: (req) => {
      const dto = req.body as CreateIndisponibiliteDto;
      const created: Indisponibilite = {
        ...dto, id: crypto.randomUUID(),
        createdAt: nowIso(),
      };
      return ok(indispos.create(created));
    },
  },
  {
    method: 'DELETE', path: '/indisponibilites/:id',
    handler: (_req, { id }) => {
      if (!indispos.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },

  // Stats & couverture
  {
    method: 'GET', path: '/edt/stats',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = seances.list();
      if (q['etablissementId']) list = list.filter((s) => s.etablissementId === q['etablissementId']);
      if (q['classeId'])        list = list.filter((s) => s.classeId === q['classeId']);

      const realisees = list.filter((s) => s.statut === 'realisee');
      const annulees = list.filter((s) => s.statut === 'annulee');
      const minutesRealisees = realisees.reduce((sum, s) => sum + s.dureeMinutes, 0);
      const minutesPlanifiees = list.reduce((sum, s) => sum + s.dureeMinutes, 0);

      const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const seancesParJour = jours.map((jour) => ({
        jour,
        count: list.filter((s) => {
          const d = new Date(s.date + 'T00:00:00Z');
          return jours[(d.getUTCDay() + 6) % 7] === jour;
        }).length,
      }));

      const stats: StatsEDT = {
        totalSeances: list.length,
        seancesRealisees: realisees.length,
        seancesAnnulees: annulees.length,
        tauxRealisation: list.length > 0 ? Math.round((realisees.length / list.length) * 1000) / 10 : 0,
        volumeHorairePlanifie: Math.round(minutesPlanifiees / 60),
        volumeHoraireRealise: Math.round(minutesRealisees / 60),
        tauxCouverture: minutesPlanifiees > 0
          ? Math.round((minutesRealisees / minutesPlanifiees) * 1000) / 10
          : 0,
        seancesParJour,
      };
      return ok(stats);
    },
  },
  {
    method: 'GET', path: '/edt/couverture',
    handler: (req) => {
      const q = readQuery(req.params);
      const target = q['classeOuPromotionId'];
      const list = seances.list().filter(
        (s) => s.classeId === target || s.promotionId === target,
      );
      const byMatiere = new Map<string, { libelle: string; planif: number; realise: number; restantes: number }>();
      list.forEach((s) => {
        const entry = byMatiere.get(s.matiereId) ?? {
          libelle: s.matiereLibelle ?? '',
          planif: 0, realise: 0, restantes: 0,
        };
        entry.planif += s.dureeMinutes / 60;
        if (s.statut === 'realisee') entry.realise += s.dureeMinutes / 60;
        if (s.statut === 'planifiee') entry.restantes += 1;
        byMatiere.set(s.matiereId, entry);
      });
      const out: CouvertureMatiere[] = Array.from(byMatiere.entries()).map(([matiereId, agg]) => ({
        matiereId,
        matiereLibelle: agg.libelle,
        volumePlanifie: Math.round(agg.planif * 10) / 10,
        volumeRealise: Math.round(agg.realise * 10) / 10,
        taux: agg.planif > 0 ? Math.round((agg.realise / agg.planif) * 1000) / 10 : 0,
        seancesRestantes: agg.restantes,
      }));
      return ok(out);
    },
  },
];
