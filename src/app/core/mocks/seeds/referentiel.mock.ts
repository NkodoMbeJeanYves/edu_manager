import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import {
  Matiere, UE, Programme, StatsReferentiel,
  CreateMatiereDto, UpdateMatiereDto,
  CreateUEDto, UpdateUEDto,
  RattacherMatiereUEDto, DupliquerReferentielDto,
} from '../../models/referentiel.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { matchPath, readQuery, search, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedMatieres = (): Matiere[] => [
  {
    id: 'mat-1', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-1', anneeAcademiqueId: 'an-1',
    code: 'MATH101', libelle: 'Algèbre linéaire',
    type: 'cours_magistral', coefficient: 4,
    volumeHoraireCM: 36, volumeHoraireTD: 24, volumeHoraireTP: 0, volumeHoraireTotal: 60,
    natureEvaluation: 'cc_et_examen', ponderationCC: 40, ponderationExamen: 60,
    eliminatoire: true, seuilEliminatoire: 5, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-2', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-1', anneeAcademiqueId: 'an-1',
    code: 'MATH102', libelle: 'Analyse',
    type: 'cours_magistral', coefficient: 4,
    volumeHoraireCM: 36, volumeHoraireTD: 24, volumeHoraireTP: 0, volumeHoraireTotal: 60,
    natureEvaluation: 'cc_et_examen', ponderationCC: 40, ponderationExamen: 60,
    eliminatoire: true, seuilEliminatoire: 5, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-3', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-2', anneeAcademiqueId: 'an-1',
    code: 'PHY101', libelle: 'Mécanique du point',
    type: 'cours_magistral', coefficient: 3,
    volumeHoraireCM: 24, volumeHoraireTD: 18, volumeHoraireTP: 12, volumeHoraireTotal: 54,
    natureEvaluation: 'tp_et_examen', ponderationCC: 30, ponderationExamen: 70,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-4', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-2', anneeAcademiqueId: 'an-1',
    code: 'PHY102', libelle: 'Thermodynamique',
    type: 'cours_magistral', coefficient: 3,
    volumeHoraireCM: 24, volumeHoraireTD: 18, volumeHoraireTP: 12, volumeHoraireTotal: 54,
    natureEvaluation: 'tp_et_examen', ponderationCC: 30, ponderationExamen: 70,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-5', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-3', anneeAcademiqueId: 'an-1',
    code: 'INFO101', libelle: 'Introduction à la programmation',
    type: 'tp', coefficient: 3,
    volumeHoraireCM: 12, volumeHoraireTD: 0, volumeHoraireTP: 36, volumeHoraireTotal: 48,
    natureEvaluation: 'projet_soutenance', ponderationCC: 60, ponderationExamen: 40,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-6', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    ueId: 'ue-4', anneeAcademiqueId: 'an-1',
    code: 'ENG101', libelle: 'Anglais technique',
    type: 'langue', coefficient: 2,
    volumeHoraireCM: 0, volumeHoraireTD: 30, volumeHoraireTP: 0, volumeHoraireTotal: 30,
    natureEvaluation: 'cc_uniquement', ponderationCC: 100, ponderationExamen: 0,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-7', etablissementId: 'et-1', filiereId: 'fil-2', niveauId: 'niv-2',
    ueId: 'ue-5', anneeAcademiqueId: 'an-1',
    code: 'PHIL201', libelle: 'Philosophie générale',
    type: 'cours_magistral', coefficient: 4,
    volumeHoraireCM: 36, volumeHoraireTD: 12, volumeHoraireTP: 0, volumeHoraireTotal: 48,
    natureEvaluation: 'cc_et_examen', ponderationCC: 30, ponderationExamen: 70,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-8', etablissementId: 'et-1', filiereId: 'fil-2', niveauId: 'niv-2',
    ueId: 'ue-5', anneeAcademiqueId: 'an-1',
    code: 'HIST201', libelle: 'Histoire contemporaine',
    type: 'cours_magistral', coefficient: 3,
    volumeHoraireCM: 30, volumeHoraireTD: 12, volumeHoraireTP: 0, volumeHoraireTotal: 42,
    natureEvaluation: 'cc_et_examen', ponderationCC: 40, ponderationExamen: 60,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'mat-9', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    anneeAcademiqueId: 'an-1',
    code: 'SPORT', libelle: 'Éducation physique',
    type: 'sport', coefficient: 1,
    volumeHoraireCM: 0, volumeHoraireTD: 0, volumeHoraireTP: 24, volumeHoraireTotal: 24,
    natureEvaluation: 'cc_uniquement', ponderationCC: 100, ponderationExamen: 0,
    eliminatoire: false, noteMax: 20, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

const seedUEs = (): UE[] => [
  {
    id: 'ue-1', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    anneeAcademiqueId: 'an-1', semestre: 1,
    code: 'UE-MATH', libelle: 'Mathématiques fondamentales',
    type: 'fondamentale', credits: 8, coefficient: 4, volumeHoraireTotal: 120,
    natureEvaluation: 'cc_et_examen', ponderationCC: 40, ponderationExamen: 60,
    eliminatoire: true, seuilValidation: 10, compensable: false, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ue-2', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    anneeAcademiqueId: 'an-1', semestre: 1,
    code: 'UE-PHY', libelle: 'Physique fondamentale',
    type: 'fondamentale', credits: 6, coefficient: 3, volumeHoraireTotal: 108,
    natureEvaluation: 'tp_et_examen', ponderationCC: 30, ponderationExamen: 70,
    eliminatoire: false, seuilValidation: 10, compensable: true, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ue-3', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    anneeAcademiqueId: 'an-1', semestre: 1,
    code: 'UE-INFO', libelle: 'Informatique de base',
    type: 'complementaire', credits: 4, coefficient: 2, volumeHoraireTotal: 48,
    natureEvaluation: 'projet_soutenance', ponderationCC: 60, ponderationExamen: 40,
    eliminatoire: false, seuilValidation: 10, compensable: true, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ue-4', etablissementId: 'et-1', filiereId: 'fil-1', niveauId: 'niv-1',
    anneeAcademiqueId: 'an-1', semestre: 2,
    code: 'UE-LANG', libelle: 'Langues',
    type: 'complementaire', credits: 3, coefficient: 1, volumeHoraireTotal: 30,
    natureEvaluation: 'cc_uniquement', ponderationCC: 100, ponderationExamen: 0,
    eliminatoire: false, seuilValidation: 10, compensable: true, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ue-5', etablissementId: 'et-1', filiereId: 'fil-2', niveauId: 'niv-2',
    anneeAcademiqueId: 'an-1', semestre: 1,
    code: 'UE-SHS', libelle: 'Sciences humaines et sociales',
    type: 'fondamentale', credits: 7, coefficient: 3, volumeHoraireTotal: 90,
    natureEvaluation: 'cc_et_examen', ponderationCC: 35, ponderationExamen: 65,
    eliminatoire: false, seuilValidation: 10, compensable: true, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'ue-6', etablissementId: 'et-1', filiereId: 'fil-2', niveauId: 'niv-2',
    anneeAcademiqueId: 'an-1', semestre: 2,
    code: 'UE-LIT', libelle: 'Littérature et expression',
    type: 'optionnelle', credits: 4, coefficient: 2, volumeHoraireTotal: 48,
    natureEvaluation: 'cc_uniquement', ponderationCC: 100, ponderationExamen: 0,
    eliminatoire: false, seuilValidation: 10, compensable: true, actif: true,
    createdAt: '2024-09-01T00:00:00Z', updatedAt: '2024-09-01T00:00:00Z',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const matieres = mockStorage<Matiere>('referentiel.matieres', seedMatieres);
const ues = mockStorage<UE>('referentiel.ues', seedUEs);

// ── Helper: filter matieres ──────────────────────────────────────────────────

function filterMatieres(q: Record<string, string>): Matiere[] {
  let result = matieres.list();
  if (q['etablissementId'])    result = result.filter((m) => m.etablissementId    === q['etablissementId']);
  if (q['filiereId'])          result = result.filter((m) => m.filiereId          === q['filiereId']);
  if (q['niveauId'])           result = result.filter((m) => m.niveauId           === q['niveauId']);
  if (q['ueId'])               result = result.filter((m) => m.ueId               === q['ueId']);
  if (q['anneeAcademiqueId'])  result = result.filter((m) => m.anneeAcademiqueId  === q['anneeAcademiqueId']);
  if (q['type'])               result = result.filter((m) => m.type               === q['type']);
  if (q['eliminatoire'])       result = result.filter((m) => String(m.eliminatoire) === q['eliminatoire']);
  if (q['actif'])              result = result.filter((m) => String(m.actif)        === q['actif']);
  return search(result, q['search'], ['code', 'libelle']);
}

function filterUEs(q: Record<string, string>): UE[] {
  let result = ues.list();
  if (q['etablissementId'])    result = result.filter((u) => u.etablissementId    === q['etablissementId']);
  if (q['filiereId'])          result = result.filter((u) => u.filiereId          === q['filiereId']);
  if (q['niveauId'])           result = result.filter((u) => u.niveauId           === q['niveauId']);
  if (q['anneeAcademiqueId'])  result = result.filter((u) => u.anneeAcademiqueId  === q['anneeAcademiqueId']);
  if (q['semestre'])           result = result.filter((u) => String(u.semestre)   === q['semestre']);
  if (q['type'])               result = result.filter((u) => u.type               === q['type']);
  if (q['actif'])              result = result.filter((u) => String(u.actif)      === q['actif']);
  return search(result, q['search'], ['code', 'libelle']);
}

function expandUEWithMatieres(u: UE): UE {
  return { ...u, matieres: matieres.list().filter((m) => m.ueId === u.id) };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const REFERENTIEL_ROUTES: MockRoute[] = [
  // Matières list
  {
    method: 'GET', path: '/matieres',
    handler: (req) => paginate(filterMatieres(readQuery(req.params)), readQuery(req.params)),
  },
  // Matière detail
  {
    method: 'GET', path: '/matieres/:id',
    handler: (_req, { id }) => {
      const m = matieres.find(id);
      if (!m) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(m);
    },
  },
  // Matières by niveau (custom endpoint)
  {
    method: 'GET', path: '/matieres/by-niveau',
    handler: (req) => {
      const q = readQuery(req.params);
      let result = matieres.list().filter((m) => m.niveauId === q['niveauId']);
      if (q['anneeAcademiqueId']) {
        result = result.filter((m) => m.anneeAcademiqueId === q['anneeAcademiqueId']);
      }
      return ok(result);
    },
  },
  // Create matière
  {
    method: 'POST', path: '/matieres',
    handler: (req) => {
      const dto = req.body as CreateMatiereDto;
      const cm = dto.volumeHoraireCM ?? 0;
      const td = dto.volumeHoraireTD ?? 0;
      const tp = dto.volumeHoraireTP ?? 0;
      const created: Matiere = {
        id: crypto.randomUUID(),
        etablissementId: dto.etablissementId,
        filiereId: dto.filiereId,
        niveauId: dto.niveauId,
        ueId: dto.ueId,
        anneeAcademiqueId: dto.anneeAcademiqueId,
        code: dto.code,
        libelle: dto.libelle,
        type: dto.type,
        coefficient: dto.coefficient,
        volumeHoraireCM: cm,
        volumeHoraireTD: td,
        volumeHoraireTP: tp,
        volumeHoraireTotal: cm + td + tp,
        natureEvaluation: dto.natureEvaluation,
        ponderationCC: dto.ponderationCC,
        ponderationExamen: dto.ponderationExamen,
        eliminatoire: dto.eliminatoire ?? false,
        seuilEliminatoire: dto.seuilEliminatoire,
        noteMax: dto.noteMax ?? 20,
        actif: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return ok(matieres.create(created));
    },
  },
  // Update matière
  {
    method: 'PATCH', path: '/matieres/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateMatiereDto;
      const existing = matieres.find(id);
      if (!existing) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const cm = dto.volumeHoraireCM ?? existing.volumeHoraireCM;
      const td = dto.volumeHoraireTD ?? existing.volumeHoraireTD;
      const tp = dto.volumeHoraireTP ?? existing.volumeHoraireTP;
      const updated = matieres.update(id, {
        ...dto,
        volumeHoraireTotal: cm + td + tp,
        updatedAt: nowIso(),
      });
      return ok(updated!);
    },
  },
  // Delete matière
  {
    method: 'DELETE', path: '/matieres/:id',
    handler: (_req, { id }) => {
      if (!matieres.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
  // Rattacher matière à une UE
  {
    method: 'PATCH', path: '/matieres/:id/rattacher-ue',
    handler: (req, { id }) => {
      const dto = req.body as RattacherMatiereUEDto;
      const updated = matieres.update(id, {
        ueId: dto.ueId,
        ...(dto.coefficient !== undefined ? { coefficient: dto.coefficient } : {}),
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  // Détacher matière d'une UE
  {
    method: 'PATCH', path: '/matieres/:id/detacher-ue',
    handler: (_req, { id }) => {
      const updated = matieres.update(id, { ueId: undefined, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },

  // UE list
  {
    method: 'GET', path: '/ue',
    handler: (req) => paginate(filterUEs(readQuery(req.params)), readQuery(req.params)),
  },
  // UE by niveau (custom endpoint, must come BEFORE /ue/:id matcher with same depth)
  {
    method: 'GET', path: '/ue/by-niveau',
    handler: (req) => {
      const q = readQuery(req.params);
      let result = ues.list().filter((u) => u.niveauId === q['niveauId']);
      if (q['semestre'])          result = result.filter((u) => String(u.semestre) === q['semestre']);
      if (q['anneeAcademiqueId']) result = result.filter((u) => u.anneeAcademiqueId === q['anneeAcademiqueId']);
      return ok(result.map(expandUEWithMatieres));
    },
  },
  // UE detail
  {
    method: 'GET', path: '/ue/:id',
    handler: (_req, { id }) => {
      const u = ues.find(id);
      if (!u) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(expandUEWithMatieres(u));
    },
  },
  // Matières d'une UE
  {
    method: 'GET', path: '/ue/:id/matieres',
    handler: (_req, { id }) => ok(matieres.list().filter((m) => m.ueId === id)),
  },
  // Create UE
  {
    method: 'POST', path: '/ue',
    handler: (req) => {
      const dto = req.body as CreateUEDto;
      const created: UE = {
        id: crypto.randomUUID(),
        etablissementId: dto.etablissementId,
        filiereId: dto.filiereId,
        niveauId: dto.niveauId,
        anneeAcademiqueId: dto.anneeAcademiqueId,
        semestre: dto.semestre,
        code: dto.code,
        libelle: dto.libelle,
        type: dto.type,
        credits: dto.credits,
        coefficient: dto.coefficient,
        volumeHoraireTotal: dto.volumeHoraireTotal ?? 0,
        natureEvaluation: dto.natureEvaluation,
        ponderationCC: dto.ponderationCC,
        ponderationExamen: dto.ponderationExamen,
        eliminatoire: dto.eliminatoire ?? false,
        seuilValidation: dto.seuilValidation ?? 10,
        compensable: dto.compensable ?? true,
        actif: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return ok(ues.create(created));
    },
  },
  // Update UE
  {
    method: 'PATCH', path: '/ue/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdateUEDto;
      const updated = ues.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  // Delete UE
  {
    method: 'DELETE', path: '/ue/:id',
    handler: (_req, { id }) => {
      if (!ues.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      // Detach matieres from this UE
      matieres.list().filter((m) => m.ueId === id).forEach((m) => {
        matieres.update(m.id, { ueId: undefined });
      });
      return ok(undefined);
    },
  },

  // Programme par niveau+année
  {
    method: 'GET', path: '/programmes',
    handler: (req) => {
      const q = readQuery(req.params);
      const matchingUEs = ues.list().filter(
        (u) => u.niveauId === q['niveauId'] && u.anneeAcademiqueId === q['anneeAcademiqueId']
      ).map(expandUEWithMatieres);
      const matchingMatieres = matieres.list().filter(
        (m) => m.niveauId === q['niveauId'] && m.anneeAcademiqueId === q['anneeAcademiqueId']
      );
      const totalCredits = matchingUEs.reduce((sum, u) => sum + u.credits, 0);
      const totalVolumeHoraire = matchingUEs.reduce((sum, u) => sum + u.volumeHoraireTotal, 0);
      const programme: Programme = {
        id: `prog-${q['niveauId']}-${q['anneeAcademiqueId']}`,
        etablissementId: 'et-1',
        filiereId: matchingUEs[0]?.filiereId ?? 'fil-1',
        niveauId: q['niveauId'],
        anneeAcademiqueId: q['anneeAcademiqueId'],
        libelle: `Programme ${q['niveauId']} - ${q['anneeAcademiqueId']}`,
        typeFormation: 'universitaire',
        ues: matchingUEs,
        matieres: matchingMatieres,
        totalCredits,
        totalVolumeHoraire,
        actif: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return ok(programme);
    },
  },
  // Duplication referentiel N → N+1
  {
    method: 'POST', path: '/referentiel/dupliquer',
    handler: (req) => {
      const dto = req.body as DupliquerReferentielDto;
      const ueClones = ues.list()
        .filter((u) =>
          u.anneeAcademiqueId === dto.sourceAnneeId
          && (!dto.filiereId || u.filiereId === dto.filiereId)
          && (!dto.niveauId  || u.niveauId  === dto.niveauId),
        )
        .map((u) => ({ ...u, id: crypto.randomUUID(), anneeAcademiqueId: dto.targetAnneeId, createdAt: nowIso(), updatedAt: nowIso() }));

      const matClones = matieres.list()
        .filter((m) =>
          m.anneeAcademiqueId === dto.sourceAnneeId
          && (!dto.filiereId || m.filiereId === dto.filiereId)
          && (!dto.niveauId  || m.niveauId  === dto.niveauId),
        )
        .map((m) => ({ ...m, id: crypto.randomUUID(), anneeAcademiqueId: dto.targetAnneeId, createdAt: nowIso(), updatedAt: nowIso() }));

      ueClones.forEach((u) => ues.create(u));
      matClones.forEach((m) => matieres.create(m));

      return ok({ count: ueClones.length + matClones.length });
    },
  },
  // Stats
  {
    method: 'GET', path: '/referentiel/stats',
    handler: () => {
      const allMatieres = matieres.list();
      const allUEs = ues.list();
      const universitaires = allMatieres.filter((m) => !!m.ueId).length;
      const stats: StatsReferentiel = {
        totalMatieres: allMatieres.length,
        totalUE: allUEs.length,
        totalProgrammes: 1,
        matieresScolaires: allMatieres.length - universitaires,
        matieresUniversitaires: universitaires,
        matieresEliminatoires: allMatieres.filter((m) => m.eliminatoire).length,
        totalCreditsParNiveau: [
          { niveauId: 'niv-1', niveauLibelle: 'L1', credits: allUEs.filter((u) => u.niveauId === 'niv-1').reduce((s, u) => s + u.credits, 0) },
          { niveauId: 'niv-2', niveauLibelle: 'L2', credits: allUEs.filter((u) => u.niveauId === 'niv-2').reduce((s, u) => s + u.credits, 0) },
        ],
      };
      return ok(stats);
    },
  },
];

// Helper signature for matchPath usage inside handlers if needed in the future.
export { matchPath };

// Type assertions to please tree-shakers (avoid unused warnings for the imported request type).
export type _MockHttpRequest = HttpRequest<unknown>;
