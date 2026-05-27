import { HttpErrorResponse } from '@angular/common/http';
import {
  Bulletin, ReleverNotes, Deliberation, PVDeliberation,
  GenererBulletinsDto, GenererReleveDto,
  ValiderDocumentDto, SignerDocumentDto, PublierDocumentsDto,
  CreateDeliberationDto, UpdateDecisionDto, ApprecierBulletinDto,
  StatsBulletins, StatsDeliberation,
} from '../../models/bulletin.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedBulletins = (): Bulletin[] => [
  {
    id: 'bul-1', apprenantId: 'app-1', etablissementId: 'et-1',
    anneeAcademiqueId: 'an-1', periodeId: 'per-1',
    type: 'bulletin', statut: 'publie',
    lignes: [
      { matiereId: 'mat-1', matiereCode: 'MATH101', matiereLibelle: 'Algèbre linéaire',
        coefficient: 4, noteCC: 14, notePartiel: 16, noteExamen: 15.5,
        moyenne: 15.4, moyenneClasse: 12.8, appreciation: 'Très bonne maîtrise',
        enseignantNom: 'Camille Dupont', rang: 3, eliminatoire: false },
      { matiereId: 'mat-3', matiereCode: 'PHY101', matiereLibelle: 'Mécanique du point',
        coefficient: 3, noteCC: 13, notePartiel: 12, noteExamen: 14,
        moyenne: 13.2, moyenneClasse: 11.5, appreciation: 'Sérieuse',
        enseignantNom: 'Idrissa Diallo', rang: 5, eliminatoire: false },
      { matiereId: 'mat-6', matiereCode: 'ENG101', matiereLibelle: 'Anglais technique',
        coefficient: 2, noteCC: 17, moyenne: 17, moyenneClasse: 13.4,
        appreciation: 'Excellent niveau', enseignantNom: 'Léa Moreau', rang: 1, eliminatoire: false },
    ],
    moyenneGenerale: 14.8, moyenneClasse: 12.2,
    rang: 4, totalApprenants: 32,
    mention: 'bien', decision: 'tableau_honneur',
    appreciationGenerale: 'Bon travail, continuez ainsi.',
    appreciationProfPrincipal: 'Élève sérieuse et impliquée. Encouragements.',
    bilanAbsences: { totalHeures: 4, heuresJustifiees: 4, heuresInjustifiees: 0, nombreAbsences: 2 },
    signePar: 'Aïcha Bernard', dateSigne: '2024-12-22T17:00:00Z',
    datePublication: '2025-01-08T09:00:00Z',
    pdfUrl: '/mock/bulletins/bul-1.pdf',
    createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-08T09:00:00Z',
  },
  {
    id: 'bul-2', apprenantId: 'app-2', etablissementId: 'et-1',
    anneeAcademiqueId: 'an-1', periodeId: 'per-1',
    type: 'bulletin', statut: 'publie',
    lignes: [
      { matiereId: 'mat-1', matiereCode: 'MATH101', matiereLibelle: 'Algèbre linéaire',
        coefficient: 4, noteCC: 11, notePartiel: 12, noteExamen: 13,
        moyenne: 12.2, moyenneClasse: 12.8, enseignantNom: 'Camille Dupont',
        rang: 12, eliminatoire: false },
      { matiereId: 'mat-3', matiereCode: 'PHY101', matiereLibelle: 'Mécanique du point',
        coefficient: 3, noteCC: 9, notePartiel: 10, noteExamen: 11,
        moyenne: 10.1, moyenneClasse: 11.5, appreciation: 'Doit fournir plus d\'efforts',
        enseignantNom: 'Idrissa Diallo', rang: 18, eliminatoire: false },
    ],
    moyenneGenerale: 11.6, moyenneClasse: 12.2,
    rang: 16, totalApprenants: 32,
    mention: 'assez_bien', decision: 'passage',
    appreciationGenerale: 'Trimestre satisfaisant mais peut mieux faire en sciences.',
    bilanAbsences: { totalHeures: 8, heuresJustifiees: 4, heuresInjustifiees: 4, nombreAbsences: 4 },
    signePar: 'Aïcha Bernard', dateSigne: '2024-12-22T17:00:00Z',
    datePublication: '2025-01-08T09:00:00Z',
    createdAt: '2024-12-20T10:00:00Z', updatedAt: '2025-01-08T09:00:00Z',
  },
  {
    id: 'bul-3', apprenantId: 'app-1', etablissementId: 'et-1',
    anneeAcademiqueId: 'an-1', periodeId: 'per-2',
    type: 'bulletin', statut: 'valide',
    lignes: [
      { matiereId: 'mat-1', matiereCode: 'MATH101', matiereLibelle: 'Algèbre linéaire',
        coefficient: 4, noteCC: 15, notePartiel: 16, moyenne: 15.7,
        moyenneClasse: 12.4, enseignantNom: 'Camille Dupont', eliminatoire: false },
    ],
    moyenneGenerale: 15.4, moyenneClasse: 12.5,
    rang: 2, totalApprenants: 32,
    mention: 'bien',
    bilanAbsences: { totalHeures: 2, heuresJustifiees: 2, heuresInjustifiees: 0, nombreAbsences: 1 },
    createdAt: '2025-04-01T10:00:00Z', updatedAt: '2025-04-05T15:00:00Z',
  },
];

const seedReleves = (): ReleverNotes[] => [
  {
    id: 'rel-1', apprenantId: 'app-4', etablissementId: 'et-2',
    anneeAcademiqueId: 'an-3', periodeId: 'per-4',
    type: 'releve', statut: 'publie',
    lignesUE: [
      {
        ueId: 'ue-1', ueCode: 'UE-MATH', ueLibelle: 'Mathématiques fondamentales',
        credits: 8, creditsAcquis: 8,
        matieresNotes: [
          { matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire', noteCC: 14, notePartiel: 13, moyenne: 13.4, coefficient: 4 },
          { matiereId: 'mat-2', matiereLibelle: 'Analyse', noteCC: 12, notePartiel: 14, moyenne: 13.1, coefficient: 4 },
        ],
        moyenneUE: 13.25, validee: true, mention: 'assez_bien', session: 'S1',
      },
      {
        ueId: 'ue-3', ueCode: 'UE-INFO', ueLibelle: 'Informatique de base',
        credits: 4, creditsAcquis: 4,
        matieresNotes: [
          { matiereId: 'mat-5', matiereLibelle: 'Introduction à la programmation', noteCC: 16, moyenne: 16, coefficient: 3 },
        ],
        moyenneUE: 16, validee: true, mention: 'bien', session: 'S1',
      },
    ],
    ectsAcquisPeriode: 12, ectsTotalPeriode: 12,
    ectsAcquisCumul: 12, ectsTotalCumul: 30,
    moyenneSemestre: 14.1, mention: 'bien',
    decision: 'admis', semestreValide: true,
    signePar: 'Jean Martin', dateSigne: '2025-02-05T14:00:00Z',
    datePublication: '2025-02-12T09:00:00Z',
    pdfUrl: '/mock/releves/rel-1.pdf',
    createdAt: '2025-01-30T10:00:00Z', updatedAt: '2025-02-12T09:00:00Z',
  },
];

const seedDeliberations = (): Deliberation[] => [
  {
    id: 'del-1',
    etablissementId: 'et-1', anneeAcademiqueId: 'an-1', periodeId: 'per-1',
    classeOuPromotionId: 'cl-1', classeOuPromotionLibelle: 'Terminale S — A',
    type: 'conseil_classe', statut: 'publiee',
    dateDeliberation: '2024-12-21',
    president: 'Aïcha Bernard',
    membres: ['Camille Dupont', 'Idrissa Diallo', 'Léa Moreau'],
    lignes: [
      { apprenantId: 'app-1', apprenantNom: 'Johnson', apprenantPrenom: 'Alice', numeroInscription: 'STU-2024-001',
        moyenneGenerale: 14.8, decision: 'tableau_honneur', mention: 'bien', modifieeManuel: false },
      { apprenantId: 'app-2', apprenantNom: 'Lee', apprenantPrenom: 'Marcus', numeroInscription: 'STU-2023-014',
        moyenneGenerale: 11.6, decision: 'encouragements', mention: 'assez_bien', modifieeManuel: false },
      { apprenantId: 'app-3', apprenantNom: 'Martinez', apprenantPrenom: 'Sofia', numeroInscription: 'STU-2022-009',
        moyenneGenerale: 8.4, decision: 'mise_en_garde', mention: 'insuffisant',
        commentaire: 'Investissement insuffisant en mathématiques.', modifieeManuel: true },
    ],
    compensationActivee: false,
    signePar: 'Aïcha Bernard', dateSigne: '2024-12-22T17:00:00Z',
    datePublication: '2025-01-08T09:00:00Z',
    pvUrl: '/mock/deliberations/del-1-pv.pdf',
    createdAt: '2024-12-10T10:00:00Z', updatedAt: '2025-01-08T09:00:00Z',
  },
  {
    id: 'del-2',
    etablissementId: 'et-2', anneeAcademiqueId: 'an-3', periodeId: 'per-4',
    classeOuPromotionId: 'pr-1', classeOuPromotionLibelle: 'L1 Informatique — Promotion 2024-2025',
    type: 'jury_universitaire', statut: 'terminee',
    session: 'S1',
    dateDeliberation: '2025-02-03',
    president: 'Jean Martin',
    membres: ['Pierre Lefèvre', 'Caroline Roy', 'Karim Bouchard'],
    lignes: [
      { apprenantId: 'app-4', apprenantNom: 'Kévin', apprenantPrenom: 'Lambert', numeroInscription: 'UDL-2024-014',
        moyenneGenerale: 14.1, ectsAcquis: 30, semestreValide: true, uesNonValidees: [],
        decision: 'admis', mention: 'bien', modifieeManuel: false },
      { apprenantId: 'app-5', apprenantNom: 'Nathalie', apprenantPrenom: 'Roy', numeroInscription: 'UDL-2024-027',
        moyenneGenerale: 9.8, ectsAcquis: 18, semestreValide: false,
        uesNonValidees: ['UE-MATH'], decision: 'admis_rattrapage',
        commentaire: 'À rattraper en session 2.', modifieeManuel: false },
    ],
    compensationActivee: true,
    createdAt: '2025-01-25T10:00:00Z', updatedAt: '2025-02-03T18:00:00Z',
  },
];

const seedPVs = (): (PVDeliberation & { id: string })[] => [
  {
    id: 'pv-1',
    deliberationId: 'del-1',
    numero: 'PV-CC-2024-12-21-001',
    dateEmission: '2024-12-22T10:00:00Z',
    contenu: 'Procès-verbal du conseil de classe — Terminale S — A — Trimestre 1.\nDécisions arrêtées : 18 passages, 8 encouragements, 4 mises en garde, 2 tableaux d\'honneur.',
    signataires: [
      { nom: 'Aïcha Bernard', fonction: 'Proviseure', dateSigne: '2024-12-22T17:00:00Z' },
      { nom: 'Camille Dupont', fonction: 'Professeur principal', dateSigne: '2024-12-22T16:30:00Z' },
    ],
    statut: 'signe',
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const bulletins = mockStorage<Bulletin>('bulletin.bulletins', seedBulletins);
const releves = mockStorage<ReleverNotes>('bulletin.releves', seedReleves);
const deliberations = mockStorage<Deliberation>('bulletin.deliberations', seedDeliberations);
const pvs = mockStorage<PVDeliberation & { id: string }>('bulletin.pvs', seedPVs);

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyBlob(): Blob { return new Blob(['mock pdf'], { type: 'application/pdf' }); }

// ── Routes ───────────────────────────────────────────────────────────────────

export const BULLETIN_ROUTES: MockRoute[] = [
  // ── Bulletins ─────────────────────────────────────────────────────────────
  {
    method: 'GET', path: '/bulletins/stats',
    handler: () => {
      const list = bulletins.list();
      const stats: StatsBulletins = {
        total: list.length,
        generes: list.filter((b) => b.statut === 'genere' || b.statut === 'valide' || b.statut === 'signe' || b.statut === 'publie').length,
        publies: list.filter((b) => b.statut === 'publie').length,
        enAttente: list.filter((b) => b.statut === 'brouillon' || b.statut === 'genere').length,
        tauxGeneration: list.length > 0
          ? Math.round((list.filter((b) => b.statut !== 'brouillon').length / list.length) * 1000) / 10
          : 0,
      };
      return ok(stats);
    },
  },
  {
    method: 'POST', path: '/bulletins/generer',
    handler: (req) => {
      const dto = req.body as GenererBulletinsDto;
      // Mock: re-emit existing bulletins of the period (or create a stub one).
      const matching = bulletins.list().filter(
        (b) => b.etablissementId === dto.etablissementId && b.periodeId === dto.periodeId,
      );
      return ok({ count: matching.length, bulletins: matching });
    },
  },
  {
    method: 'PATCH', path: '/bulletins/publier',
    handler: (req) => {
      const dto = req.body as PublierDocumentsDto;
      const updated = bulletins.list().filter(
        (b) => b.periodeId === dto.periodeId && b.statut !== 'publie',
      );
      updated.forEach((b) => bulletins.update(b.id, { statut: 'publie', datePublication: nowIso(), updatedAt: nowIso() }));
      return ok({ count: updated.length });
    },
  },
  {
    method: 'PATCH', path: '/bulletins/appreciations',
    handler: (req) => {
      const dto = req.body as ApprecierBulletinDto;
      const existing = bulletins.list().find(
        (b) => b.apprenantId === dto.apprenantId && b.periodeId === dto.periodeId,
      );
      if (!existing) throw new HttpErrorResponse({ status: 404, statusText: 'Bulletin Not Found' });
      const updated = bulletins.update(existing.id, {
        appreciationGenerale: dto.appreciationGenerale,
        appreciationProfPrincipal: dto.appreciationProfPrincipal,
        decision: dto.decision,
        updatedAt: nowIso(),
      });
      return ok(updated!);
    },
  },
  {
    method: 'GET', path: '/bulletins',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = bulletins.list();
      if (q['apprenantId'])       list = list.filter((b) => b.apprenantId === q['apprenantId']);
      if (q['periodeId'])         list = list.filter((b) => b.periodeId === q['periodeId']);
      if (q['anneeAcademiqueId']) list = list.filter((b) => b.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['statut'])            list = list.filter((b) => b.statut === q['statut']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/bulletins/:id',
    handler: (_req, { id }) => {
      const b = bulletins.find(id);
      if (!b) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(b);
    },
  },
  {
    method: 'GET', path: '/bulletins/:id/pdf',
    handler: () => emptyBlob(),
  },
  {
    method: 'PATCH', path: '/bulletins/:id/valider',
    handler: (req, { id }) => {
      const _dto = req.body as ValiderDocumentDto;
      const updated = bulletins.update(id, { statut: 'valide', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/bulletins/:id/signer',
    handler: (req, { id }) => {
      const dto = req.body as SignerDocumentDto;
      const updated = bulletins.update(id, {
        statut: 'signe', signePar: dto.signataire,
        dateSigne: nowIso(), updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'GET', path: '/apprenants/:apprenantId/bulletins/:periodeId',
    handler: (_req, { apprenantId, periodeId }) => {
      const b = bulletins.list().find((x) => x.apprenantId === apprenantId && x.periodeId === periodeId);
      if (!b) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(b);
    },
  },

  // ── Relevés universitaires ────────────────────────────────────────────────
  {
    method: 'POST', path: '/releves/generer',
    handler: (req) => {
      const dto = req.body as GenererReleveDto;
      let matching = releves.list();
      if (dto.apprenantId) matching = matching.filter((r) => r.apprenantId === dto.apprenantId);
      if (dto.periodeId)   matching = matching.filter((r) => r.periodeId === dto.periodeId);
      return ok(matching);
    },
  },
  {
    method: 'GET', path: '/apprenants/:apprenantId/releves',
    handler: (req, { apprenantId }) => {
      const q = readQuery(req.params);
      let list = releves.list().filter((r) => r.apprenantId === apprenantId);
      if (q['anneeAcademiqueId']) list = list.filter((r) => r.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['periodeId'])         list = list.filter((r) => r.periodeId === q['periodeId']);
      return ok(list);
    },
  },
  {
    method: 'PATCH', path: '/releves/:id/valider',
    handler: (req, { id }) => {
      const _dto = req.body as ValiderDocumentDto;
      const updated = releves.update(id, { statut: 'valide', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/releves/:id/signer',
    handler: (req, { id }) => {
      const dto = req.body as SignerDocumentDto;
      const updated = releves.update(id, {
        statut: 'signe', signePar: dto.signataire,
        dateSigne: nowIso(), updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/releves/:id/publier',
    handler: (_req, { id }) => {
      const updated = releves.update(id, {
        statut: 'publie', datePublication: nowIso(), updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'GET', path: '/releves/:id/pdf',
    handler: () => emptyBlob(),
  },

  // ── Délibérations ─────────────────────────────────────────────────────────
  {
    method: 'GET', path: '/deliberations',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = deliberations.list();
      if (q['etablissementId'])   list = list.filter((d) => d.etablissementId === q['etablissementId']);
      if (q['anneeAcademiqueId']) list = list.filter((d) => d.anneeAcademiqueId === q['anneeAcademiqueId']);
      if (q['periodeId'])         list = list.filter((d) => d.periodeId === q['periodeId']);
      if (q['type'])              list = list.filter((d) => d.type === q['type']);
      if (q['statut'])            list = list.filter((d) => d.statut === q['statut']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/deliberations/:id',
    handler: (_req, { id }) => {
      const d = deliberations.find(id);
      if (!d) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(d);
    },
  },
  {
    method: 'GET', path: '/deliberations/:id/stats',
    handler: (_req, { id }) => {
      const d = deliberations.find(id);
      if (!d) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const decisions = d.lignes.map((l) => l.decision);
      const moyennes = d.lignes.map((l) => l.moyenneGenerale).filter((m): m is number => m !== null);
      const admis = decisions.filter((dc) => dc === 'admis' || dc === 'passage' || dc === 'tableau_honneur').length;
      const admisRattrapage = decisions.filter((dc) => dc === 'admis_rattrapage').length;
      const ajournes = decisions.filter((dc) => dc === 'ajourne' || dc === 'mise_en_garde').length;
      const redoublants = decisions.filter((dc) => dc === 'redoublement' || dc === 'redoublant').length;
      const exclus = decisions.filter((dc) => dc === 'exclusion' || dc === 'exclu').length;
      const stats: StatsDeliberation = {
        total: d.lignes.length,
        admis, admisRattrapage, ajournes, redoublants, exclus,
        tauxReussite: d.lignes.length > 0
          ? Math.round(((admis + admisRattrapage) / d.lignes.length) * 1000) / 10
          : 0,
        moyennePromotion: moyennes.length > 0
          ? Math.round((moyennes.reduce((s, m) => s + m, 0) / moyennes.length) * 100) / 100
          : null,
      };
      return ok(stats);
    },
  },
  {
    method: 'POST', path: '/deliberations',
    handler: (req) => {
      const dto = req.body as CreateDeliberationDto;
      const created: Deliberation = {
        ...dto,
        id: crypto.randomUUID(),
        classeOuPromotionLibelle: `Class ${dto.classeOuPromotionId}`,
        statut: 'preparation',
        lignes: [],
        compensationActivee: dto.compensationActivee ?? false,
        createdAt: nowIso(), updatedAt: nowIso(),
      };
      return ok(deliberations.create(created));
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/preparer',
    handler: (_req, { id }) => {
      const updated = deliberations.update(id, { statut: 'en_cours', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/compenser',
    handler: (_req, { id }) => {
      const updated = deliberations.update(id, { compensationActivee: true, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/decision',
    handler: (req, { id }) => {
      const dto = req.body as UpdateDecisionDto;
      const d = deliberations.find(id);
      if (!d) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const lignes = d.lignes.map((l) =>
        l.apprenantId === dto.apprenantId
          ? {
              ...l,
              decision: dto.decision,
              mention: dto.mention ?? l.mention,
              commentaire: dto.commentaire ?? l.commentaire,
              casSpecial: (dto.casSpecial as typeof l.casSpecial) ?? l.casSpecial,
              modifieeManuel: true,
            }
          : l,
      );
      const updated = deliberations.update(id, { lignes, updatedAt: nowIso() });
      return ok(updated!);
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/cloturer',
    handler: (_req, { id }) => {
      const updated = deliberations.update(id, { statut: 'terminee', updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/signer',
    handler: (req, { id }) => {
      const dto = req.body as SignerDocumentDto;
      const updated = deliberations.update(id, {
        statut: 'signee', signePar: dto.signataire,
        dateSigne: nowIso(), updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'PATCH', path: '/deliberations/:id/publier',
    handler: (_req, { id }) => {
      const updated = deliberations.update(id, {
        statut: 'publiee', datePublication: nowIso(), updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'POST', path: '/deliberations/:id/pv',
    handler: (_req, { id }) => {
      const existing = pvs.list().find((p) => p.deliberationId === id);
      if (existing) {
        const { id: _id, ...rest } = existing;
        return ok(rest);
      }
      const pv: PVDeliberation & { id: string } = {
        id: crypto.randomUUID(),
        deliberationId: id,
        numero: `PV-${id}-${Date.now()}`,
        dateEmission: nowIso(),
        contenu: 'Procès-verbal généré automatiquement (mock).',
        signataires: [],
        statut: 'brouillon',
      };
      pvs.create(pv);
      const { id: _id, ...rest } = pv;
      return ok(rest);
    },
  },
  {
    method: 'GET', path: '/deliberations/:id/pv/pdf',
    handler: () => emptyBlob(),
  },
];
