import { HttpErrorResponse } from '@angular/common/http';
import {
  Evaluation, Note, MoyenneMatiere, MoyenneUE, MoyenneGenerale,
  StatutEvaluation, StatistiquesEvaluation,
  CreateEvaluationDto, UpdateEvaluationDto,
  CreateNoteDto, UpdateNoteDto,
  SaisieNoteMasse, ValiderNotesDto, PublierNotesDto,
  ApprecierMatiereDto,
} from '../../models/note.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedEvaluations = (): Evaluation[] => [
  {
    id: 'eval-1',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    periodeId: 'per-2', periodeLibelle: 'Trimestre 2',
    anneeAcademiqueId: 'an-1',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    intitule: 'Composition n°1 — Espaces vectoriels',
    type: 'partiel', ponderation: 40, coefficient: 4, noteMax: 20,
    dateEvaluation: '2025-02-12', statut: 'cloturee',
    noteSaisieCount: 32, totalApprenants: 32,
    createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-02-20T14:00:00Z',
  },
  {
    id: 'eval-2',
    matiereId: 'mat-2', matiereLibelle: 'Analyse',
    periodeId: 'per-2', periodeLibelle: 'Trimestre 2',
    anneeAcademiqueId: 'an-1',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    intitule: 'Devoir maison — Limites et continuité',
    type: 'devoir_maison', ponderation: 20, coefficient: 4, noteMax: 20,
    dateEvaluation: '2025-03-05', statut: 'en_cours',
    noteSaisieCount: 18, totalApprenants: 32,
    createdAt: '2025-02-20T08:00:00Z', updatedAt: '2025-03-10T12:00:00Z',
  },
  {
    id: 'eval-3',
    matiereId: 'mat-3', matiereLibelle: 'Mécanique du point',
    periodeId: 'per-2', periodeLibelle: 'Trimestre 2',
    anneeAcademiqueId: 'an-1',
    classeId: 'cl-1', classeLibelle: 'Terminale S — A',
    enseignantId: 'ens-2', enseignantNom: 'Idrissa Diallo',
    intitule: 'TP n°2 — Pendule simple',
    type: 'tp', ponderation: 30, coefficient: 3, noteMax: 20,
    dateEvaluation: '2025-02-26', statut: 'cloturee',
    noteSaisieCount: 32, totalApprenants: 32,
    createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-03-05T15:00:00Z',
  },
  {
    id: 'eval-4',
    matiereId: 'mat-6', matiereLibelle: 'Anglais technique',
    periodeId: 'per-2', periodeLibelle: 'Trimestre 2',
    anneeAcademiqueId: 'an-1',
    classeId: 'cl-4', classeLibelle: 'Première L',
    enseignantId: 'ens-3', enseignantNom: 'Léa Moreau',
    intitule: 'Oral n°1 — Présentation thématique',
    type: 'oral', ponderation: 50, coefficient: 2, noteMax: 20,
    dateEvaluation: '2025-03-12', statut: 'en_cours',
    noteSaisieCount: 12, totalApprenants: 22,
    createdAt: '2025-02-10T11:00:00Z', updatedAt: '2025-03-12T16:00:00Z',
  },
  {
    id: 'eval-5',
    matiereId: 'mat-5', matiereLibelle: 'Introduction à la programmation',
    periodeId: 'per-4', periodeLibelle: 'Semestre 1',
    anneeAcademiqueId: 'an-3',
    promotionId: 'pr-1', promotionLibelle: 'L1 Informatique — Promotion 2024-2025',
    enseignantId: 'ens-5', enseignantNom: 'Jean Martin',
    intitule: 'Examen final — Algorithmique de base',
    type: 'examen_final', ponderation: 60, coefficient: 3, noteMax: 20,
    dateEvaluation: '2025-01-20', statut: 'cloturee',
    noteSaisieCount: 72, totalApprenants: 72,
    createdAt: '2024-12-10T10:00:00Z', updatedAt: '2025-01-28T17:00:00Z',
  },
  {
    id: 'eval-6',
    matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    periodeId: 'per-2', periodeLibelle: 'Trimestre 2',
    anneeAcademiqueId: 'an-1',
    classeId: 'cl-2', classeLibelle: 'Terminale S — B',
    enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    intitule: 'Composition n°1 — Espaces vectoriels',
    type: 'partiel', ponderation: 40, coefficient: 4, noteMax: 20,
    dateEvaluation: '2025-02-12', statut: 'planifiee',
    noteSaisieCount: 0, totalApprenants: 30,
    createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z',
  },
];

// 5 apprenants pour la Terminale S A (cl-1)
const tsApprenantIds = ['app-1', 'app-2', 'app-3', 'app-4', 'app-5'];

const seedNotes = (): Note[] => {
  const notes: Note[] = [];
  // eval-1: notes saisies + validées
  const eval1Scores = [16, 14.5, 12, 8, 17];
  tsApprenantIds.forEach((aid, i) => {
    notes.push({
      id: `n-1-${i + 1}`, evaluationId: 'eval-1', apprenantId: aid,
      valeur: eval1Scores[i], absent: false, dispense: false,
      statut: 'publiee', saisieParId: 'ens-1', saisieParNom: 'Camille Dupont',
      valideParId: 'ens-1', valideParNom: 'Camille Dupont',
      createdAt: '2025-02-20T14:00:00Z', updatedAt: '2025-02-20T14:00:00Z',
    });
  });
  // eval-3: TP physique
  const eval3Scores = [14, 13, 11, 9, 15];
  tsApprenantIds.forEach((aid, i) => {
    notes.push({
      id: `n-3-${i + 1}`, evaluationId: 'eval-3', apprenantId: aid,
      valeur: eval3Scores[i], absent: false, dispense: false,
      statut: 'publiee', saisieParId: 'ens-2', saisieParNom: 'Idrissa Diallo',
      valideParId: 'ens-2', valideParNom: 'Idrissa Diallo',
      createdAt: '2025-03-05T15:00:00Z', updatedAt: '2025-03-05T15:00:00Z',
    });
  });
  // eval-2: notes en cours (saisies partielles)
  const eval2Scores: (number | null)[] = [15, 13, null, 7, 16];
  tsApprenantIds.forEach((aid, i) => {
    notes.push({
      id: `n-2-${i + 1}`, evaluationId: 'eval-2', apprenantId: aid,
      valeur: eval2Scores[i],
      absent: false, dispense: false,
      statut: eval2Scores[i] === null ? 'brouillon' : 'soumise',
      saisieParId: 'ens-1', saisieParNom: 'Camille Dupont',
      createdAt: '2025-03-10T12:00:00Z', updatedAt: '2025-03-10T12:00:00Z',
    });
  });
  return notes;
};

// ── Stores ───────────────────────────────────────────────────────────────────

const evaluations = mockStorage<Evaluation>('note.evaluations', seedEvaluations);
const notes = mockStorage<Note>('note.notes', seedNotes);
const appreciations = mockStorage<MoyenneMatiere & { id: string }>(
  'note.appreciations',
  () => [],
);

// ── Stats ────────────────────────────────────────────────────────────────────

function computeStats(evalId: string): StatistiquesEvaluation {
  const items = notes.list().filter((n) => n.evaluationId === evalId);
  const ev = evaluations.find(evalId);
  const valides = items.filter((n) => !n.absent && !n.dispense && n.valeur !== null);
  const valeurs = valides.map((n) => n.valeur as number);
  const total = ev?.totalApprenants ?? items.length;
  const moy = valeurs.length > 0
    ? Math.round((valeurs.reduce((s, v) => s + v, 0) / valeurs.length) * 100) / 100
    : 0;
  const noteMin = valeurs.length > 0 ? Math.min(...valeurs) : 0;
  const noteMax = valeurs.length > 0 ? Math.max(...valeurs) : 0;
  const seuil = (ev?.noteMax ?? 20) / 2;
  const reussites = valeurs.filter((v) => v >= seuil).length;
  // Distribution simple par tranches de 5
  const max = ev?.noteMax ?? 20;
  const ranges: { tranche: string; count: number }[] = [];
  for (let i = 0; i < max; i += 5) {
    const lower = i, upper = Math.min(i + 5, max);
    ranges.push({
      tranche: `[${lower}-${upper}${upper === max ? ']' : '['}`,
      count: valeurs.filter((v) => v >= lower && (upper === max ? v <= upper : v < upper)).length,
    });
  }
  return {
    evaluationId: evalId,
    total,
    notesSaisies: items.length,
    absents: items.filter((n) => n.absent).length,
    dispenses: items.filter((n) => n.dispense).length,
    moyenne: moy,
    noteMin,
    noteMax,
    tauxReussite: valeurs.length > 0 ? Math.round((reussites / valeurs.length) * 1000) / 10 : 0,
    distribution: ranges,
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const NOTE_ROUTES: MockRoute[] = [
  // Évaluations
  {
    method: 'GET', path: '/evaluations',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = evaluations.list();
      if (q['matiereId'])         list = list.filter((e) => e.matiereId === q['matiereId']);
      if (q['periodeId'])         list = list.filter((e) => e.periodeId === q['periodeId']);
      if (q['anneeAcademiqueId']) list = list.filter((e) => e.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['classeId'])          list = list.filter((e) => e.classeId === q['classeId']);
      if (q['promotionId'])       list = list.filter((e) => e.promotionId === q['promotionId']);
      if (q['enseignantId'])      list = list.filter((e) => e.enseignantId === q['enseignantId']);
      if (q['type'])              list = list.filter((e) => e.type === q['type']);
      if (q['statut'])            list = list.filter((e) => e.statut === q['statut']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/evaluations/:id',
    handler: (_req, { id }) => {
      const e = evaluations.find(id);
      if (!e) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(e);
    },
  },
  {
    method: 'GET', path: '/evaluations/:id/statistiques',
    handler: (_req, { id }) => ok(computeStats(id)),
  },
  {
    method: 'GET', path: '/evaluations/:id/notes',
    handler: (_req, { id }) => ok(notes.list().filter((n) => n.evaluationId === id)),
  },
  {
    method: 'POST', path: '/evaluations',
    handler: (req) => {
      const dto = req.body as CreateEvaluationDto;
      const created: Evaluation = {
        ...dto, id: crypto.randomUUID(),
        noteMax: dto.noteMax ?? 20,
        statut: 'planifiee',
        noteSaisieCount: 0,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(evaluations.create(created));
    },
  },
  {
    method: 'PATCH', path: '/evaluations/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateEvaluationDto;
      const updated = evaluations.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/evaluations/:id/cloturer',
    handler: (_req, { id }) => {
      const updated = evaluations.update(id, { statut: 'cloturee' as StatutEvaluation, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/evaluations/:id/soumettre',
    handler: (_req, { id }) => {
      // Promote all the evaluation's notes from brouillon to soumise
      notes.list().filter((n) => n.evaluationId === id && n.statut === 'brouillon').forEach((n) => {
        notes.update(n.id, { statut: 'soumise', updatedAt: nowIso() });
      });
      const updated = evaluations.update(id, { updatedAt: nowIso() });
      return ok(updated!);
    },
  },
  {
    method: 'PATCH', path: '/evaluations/:id/valider',
    handler: (req, { id }) => {
      const _dto = req.body as ValiderNotesDto;
      notes.list().filter((n) => n.evaluationId === id).forEach((n) => {
        notes.update(n.id, { statut: 'validee', valideParId: 'admin', valideParNom: 'Direction péd.', updatedAt: nowIso() });
      });
      const updated = evaluations.update(id, { statut: 'cloturee' as StatutEvaluation, updatedAt: nowIso() });
      return ok(updated!);
    },
  },
  {
    method: 'PATCH', path: '/evaluations/:id/publier',
    handler: (req, { id }) => {
      const _dto = req.body as PublierNotesDto;
      notes.list().filter((n) => n.evaluationId === id).forEach((n) => {
        notes.update(n.id, { statut: 'publiee', updatedAt: nowIso() });
      });
      const updated = evaluations.update(id, { updatedAt: nowIso() });
      return ok(updated!);
    },
  },
  {
    method: 'DELETE', path: '/evaluations/:id',
    handler: (_req, { id }) => {
      if (!evaluations.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      // Cascade delete notes
      notes.list().filter((n) => n.evaluationId === id).forEach((n) => notes.remove(n.id));
      return ok(undefined);
    },
  },

  // Notes
  {
    method: 'GET', path: '/notes',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = notes.list();
      if (q['evaluationId']) list = list.filter((n) => n.evaluationId === q['evaluationId']);
      if (q['apprenantId'])  list = list.filter((n) => n.apprenantId === q['apprenantId']);
      if (q['statut'])       list = list.filter((n) => n.statut === q['statut']);
      // matiereId / periodeId need join through evaluation
      if (q['matiereId'] || q['periodeId']) {
        list = list.filter((n) => {
          const ev = evaluations.find(n.evaluationId);
          if (!ev) return false;
          if (q['matiereId'] && ev.matiereId !== q['matiereId']) return false;
          if (q['periodeId'] && ev.periodeId !== q['periodeId']) return false;
          return true;
        });
      }
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/apprenants/:apprenantId/notes',
    handler: (req, { apprenantId }) => {
      const q = readQuery(req.params);
      let list = notes.list().filter((n) => n.apprenantId === apprenantId);
      if (q['periodeId'] || q['anneeAcademiqueId']) {
        list = list.filter((n) => {
          const ev = evaluations.find(n.evaluationId);
          if (!ev) return false;
          if (q['periodeId'] && ev.periodeId !== q['periodeId']) return false;
          if (q['anneeAcademiqueId'] && ev.anneeAcademiqueId !== q['anneeAcademiqueId']) return false;
          return true;
        });
      }
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/notes',
    handler: (req) => {
      const dto = req.body as CreateNoteDto;
      const created: Note = {
        ...dto,
        id: crypto.randomUUID(),
        absent: dto.absent ?? false,
        dispense: dto.dispense ?? false,
        statut: 'brouillon',
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(notes.create(created));
    },
  },
  {
    method: 'PATCH', path: '/notes/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateNoteDto;
      const existing = notes.find(id);
      if (!existing) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const patch: Partial<Note> = { ...dto, updatedAt: nowIso() };
      // Track history if value changed
      if (dto.valeur !== undefined && dto.valeur !== existing.valeur) {
        const history = existing.historiqueModifications ?? [];
        patch.historiqueModifications = [
          ...history,
          {
            ancienneValeur: existing.valeur,
            nouvelleValeur: dto.valeur ?? null,
            modifiePar: 'Mock user',
            motif: dto.motifModification ?? 'Modification',
            date: nowIso(),
          },
        ];
      }
      const updated = notes.update(id, patch);
      return ok(updated!);
    },
  },
  {
    method: 'POST', path: '/notes/masse',
    handler: (req) => {
      const dto = req.body as SaisieNoteMasse;
      const result: Note[] = [];
      dto.notes.forEach((item) => {
        const existing = notes.list().find(
          (n) => n.evaluationId === dto.evaluationId && n.apprenantId === item.apprenantId,
        );
        if (existing) {
          result.push(notes.update(existing.id, {
            valeur: item.valeur,
            absent: item.absent ?? false,
            dispense: item.dispense ?? false,
            commentaire: item.commentaire,
            statut: 'brouillon',
            updatedAt: nowIso(),
          })!);
        } else {
          result.push(notes.create({
            id: crypto.randomUUID(),
            evaluationId: dto.evaluationId,
            apprenantId: item.apprenantId,
            valeur: item.valeur,
            absent: item.absent ?? false,
            dispense: item.dispense ?? false,
            commentaire: item.commentaire,
            statut: 'brouillon',
            createdAt: nowIso(), updatedAt: nowIso(),
          }));
        }
      });
      // Update evaluation count
      const total = notes.list().filter((n) => n.evaluationId === dto.evaluationId).length;
      evaluations.update(dto.evaluationId, { noteSaisieCount: total, updatedAt: nowIso() });
      return ok(result);
    },
  },

  // Moyennes
  {
    method: 'GET', path: '/moyennes/:id',
    handler: (req, { id: classeOuPromoId }) => {
      const q = readQuery(req.params);
      const periodeId = q['periodeId'];
      const type = q['type'] ?? 'classe';
      // For each apprenant in the class/promotion, compute their average using existing notes.
      // We don't have a real list of apprenants per class — derive from notes.
      const evalsForClass = evaluations.list().filter(
        (ev) => type === 'classe' ? ev.classeId === classeOuPromoId : ev.promotionId === classeOuPromoId,
      ).filter((ev) => !periodeId || ev.periodeId === periodeId);
      const evIds = new Set(evalsForClass.map((ev) => ev.id));
      const apprenantIds = Array.from(new Set(
        notes.list().filter((n) => evIds.has(n.evaluationId)).map((n) => n.apprenantId),
      ));

      const result: MoyenneGenerale[] = apprenantIds.map((aid) => {
        const apprenantNotes = notes.list().filter((n) => n.apprenantId === aid && evIds.has(n.evaluationId) && n.valeur !== null && !n.absent && !n.dispense);
        const totalCoef = apprenantNotes.reduce((s, n) => {
          const ev = evaluations.find(n.evaluationId);
          return s + (ev?.coefficient ?? 1);
        }, 0);
        const sumWeighted = apprenantNotes.reduce((s, n) => {
          const ev = evaluations.find(n.evaluationId);
          return s + (n.valeur as number) * (ev?.coefficient ?? 1);
        }, 0);
        const moyenne = totalCoef > 0 ? Math.round((sumWeighted / totalCoef) * 100) / 100 : null;
        return {
          apprenantId: aid,
          periodeId,
          anneeAcademiqueId: evalsForClass[0]?.anneeAcademiqueId ?? 'an-1',
          moyenne,
          validee: false,
          statut: 'calculee',
        };
      });
      // Rank
      const ranked = [...result]
        .filter((r) => r.moyenne !== null)
        .sort((a, b) => (b.moyenne as number) - (a.moyenne as number));
      ranked.forEach((r, i) => { r.rang = i + 1; r.totalApprenants = ranked.length; });
      return ok(result);
    },
  },
  {
    method: 'GET', path: '/apprenants/:apprenantId/moyennes',
    handler: (req, { apprenantId }) => {
      const q = readQuery(req.params);
      const anneeId = q['anneeAcademiqueId'] ?? 'an-1';
      const myNotes = notes.list().filter(
        (n) => n.apprenantId === apprenantId && n.valeur !== null && !n.absent && !n.dispense,
      );
      // Group by matiere via evaluation
      const byMatiere = new Map<string, { matiereLibelle: string; matiereCode: string; coefficient: number; notes: number[]; coeffNotes: number[] }>();
      myNotes.forEach((n) => {
        const ev = evaluations.find(n.evaluationId);
        if (!ev || ev.anneeAcademiqueId !== anneeId) return;
        const key = ev.matiereId;
        if (!byMatiere.has(key)) {
          byMatiere.set(key, {
            matiereLibelle: ev.matiereLibelle ?? '',
            matiereCode: '',
            coefficient: ev.coefficient,
            notes: [],
            coeffNotes: [],
          });
        }
        const entry = byMatiere.get(key)!;
        entry.notes.push(n.valeur as number);
        entry.coeffNotes.push((n.valeur as number) * (ev.ponderation ?? 1));
      });
      const moyennesMatiere: MoyenneMatiere[] = Array.from(byMatiere.entries()).map(([matiereId, agg]) => ({
        matiereId,
        matiereLibelle: agg.matiereLibelle,
        matiereCode: agg.matiereCode,
        coefficient: agg.coefficient,
        apprenantId, periodeId: '',
        moyenne: agg.notes.length > 0
          ? Math.round((agg.notes.reduce((s, v) => s + v, 0) / agg.notes.length) * 100) / 100
          : null,
        elimitatoire: false,
        statut: 'calculee',
      }));
      const totalCoef = moyennesMatiere.reduce((s, m) => s + m.coefficient, 0);
      const sumWeighted = moyennesMatiere.reduce((s, m) => s + ((m.moyenne ?? 0) * m.coefficient), 0);
      const result: MoyenneGenerale = {
        apprenantId,
        anneeAcademiqueId: anneeId,
        moyenne: totalCoef > 0 ? Math.round((sumWeighted / totalCoef) * 100) / 100 : null,
        validee: false,
        statut: 'calculee',
        moyennesMatiere,
      };
      return ok(result);
    },
  },
  {
    method: 'POST', path: '/moyennes/calculer',
    handler: () => ok(undefined),
  },
  {
    method: 'GET', path: '/apprenants/:apprenantId/moyennes-ue',
    handler: (_req, { apprenantId }) => {
      // Stub: returns empty array. Real impl would aggregate by UE.
      const out: MoyenneUE[] = [];
      return ok(out.map((u) => ({ ...u, apprenantId })));
    },
  },

  // Appréciations
  {
    method: 'PATCH', path: '/appreciations',
    handler: (req) => {
      const dto = req.body as ApprecierMatiereDto;
      const existing = appreciations.list().find(
        (a) => a.matiereId === dto.matiereId && a.apprenantId === dto.apprenantId && a.periodeId === dto.periodeId,
      );
      const record: MoyenneMatiere & { id: string } = {
        id: existing?.id ?? crypto.randomUUID(),
        matiereId: dto.matiereId,
        matiereLibelle: '',
        matiereCode: '',
        coefficient: 1,
        apprenantId: dto.apprenantId,
        periodeId: dto.periodeId,
        moyenne: null,
        appreciationEnseignant: dto.appreciation,
        elimitatoire: false,
        statut: 'calculee',
      };
      if (existing) {
        appreciations.update(existing.id, record);
      } else {
        appreciations.create(record);
      }
      // Return without internal id
      const { id: _id, ...rest } = record;
      return ok(rest);
    },
  },
];
