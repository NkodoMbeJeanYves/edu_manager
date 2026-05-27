import { HttpErrorResponse } from '@angular/common/http';
import {
  Absence, Presence, FeuillePresence, Justificatif,
  AbsenceEnseignant, StatsAbsenteisme, StatsAbsenteismeClasse,
  ParametresAbsenteisme, AbsenteismeMatiere,
  SaisirPresencesDto, UpdatePresenceDto,
  SoumettreJustificatifDto, ValiderJustificatifDto,
  CreateAbsenceEnseignantDto,
} from '../../models/absence.models';
import { MockRoute } from '../mock-types';
import { mockStorage } from '../mock-storage';
import { readQuery, paginate, ok, nowIso } from '../mock-helpers';

// ── Seeds ────────────────────────────────────────────────────────────────────

const seedAbsences = (): Absence[] => [
  {
    id: 'abs-1', apprenantId: 'app-2',
    seanceId: 'se-2', matiereId: 'mat-3', matiereLibelle: 'Mécanique du point',
    enseignantId: 'ens-2', classeId: 'cl-1',
    date: '2025-05-20', heureDebut: '10:15', heureFin: '12:15', dureeHeures: 2,
    statut: 'justifiee', estExamen: false, impactNote: false,
    notifieeParent: true, dateNotification: '2025-05-20T11:00:00Z',
    justificatif: {
      id: 'jst-1', absenceId: 'abs-1',
      type: 'medical', description: 'Certificat médical — grippe saisonnière (2 jours).',
      fichierUrl: '/mock/justificatifs/jst-1.pdf', fichierNom: 'certificat-medical.pdf',
      soumisParId: 'app-2', soumisParNom: 'Marcus Lee',
      dateSoumission: '2025-05-22T10:00:00Z',
      validateParId: 'staff-1', validatedParNom: 'Marie Lefebvre',
      dateValidation: '2025-05-23T09:30:00Z',
      statut: 'accepte',
    },
    createdAt: '2025-05-20T10:30:00Z', updatedAt: '2025-05-23T09:30:00Z',
  },
  {
    id: 'abs-2', apprenantId: 'app-3',
    seanceId: 'se-1', matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    enseignantId: 'ens-1', classeId: 'cl-1',
    date: '2025-05-19', heureDebut: '08:00', heureFin: '10:00', dureeHeures: 2,
    statut: 'non_justifiee', estExamen: false, impactNote: false,
    notifieeParent: false,
    createdAt: '2025-05-19T08:15:00Z', updatedAt: '2025-05-19T08:15:00Z',
  },
  {
    id: 'abs-3', apprenantId: 'app-2',
    seanceId: 'se-1', matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    enseignantId: 'ens-1', classeId: 'cl-1',
    date: '2025-05-19', heureDebut: '08:00', heureFin: '10:00', dureeHeures: 2,
    statut: 'non_justifiee', estExamen: false, impactNote: false,
    notifieeParent: true, dateNotification: '2025-05-19T09:30:00Z',
    createdAt: '2025-05-19T08:15:00Z', updatedAt: '2025-05-19T09:30:00Z',
  },
  {
    id: 'abs-4', apprenantId: 'app-3',
    seanceId: 'se-2', matiereId: 'mat-3', matiereLibelle: 'Mécanique du point',
    enseignantId: 'ens-2', classeId: 'cl-1',
    date: '2025-05-20', heureDebut: '10:15', heureFin: '12:15', dureeHeures: 2,
    statut: 'en_attente', estExamen: false, impactNote: false,
    notifieeParent: true, dateNotification: '2025-05-20T11:30:00Z',
    justificatif: {
      id: 'jst-2', absenceId: 'abs-4',
      type: 'familial', description: 'Décès dans la famille proche.',
      soumisParId: 'parent-3', soumisParNom: 'Patrick Martinez',
      dateSoumission: '2025-05-22T17:00:00Z',
      statut: 'en_attente',
    },
    createdAt: '2025-05-20T10:30:00Z', updatedAt: '2025-05-22T17:00:00Z',
  },
  {
    id: 'abs-5', apprenantId: 'app-3',
    seanceId: 'eval-1', matiereId: 'mat-1', matiereLibelle: 'Algèbre linéaire',
    enseignantId: 'ens-1', classeId: 'cl-1',
    date: '2025-02-12', heureDebut: '08:00', heureFin: '11:00', dureeHeures: 3,
    statut: 'non_justifiee', estExamen: true, impactNote: true,
    notifieeParent: true, dateNotification: '2025-02-12T11:30:00Z',
    createdAt: '2025-02-12T08:15:00Z', updatedAt: '2025-02-15T10:00:00Z',
  },
  {
    id: 'abs-6', apprenantId: 'app-4',
    seanceId: 'eval-5', matiereId: 'mat-5', matiereLibelle: 'Introduction à la programmation',
    enseignantId: 'ens-5', promotionId: 'pr-1',
    date: '2025-01-20', heureDebut: '08:00', heureFin: '10:00', dureeHeures: 2,
    statut: 'rejetee', estExamen: true, impactNote: true,
    notifieeParent: true,
    justificatif: {
      id: 'jst-3', absenceId: 'abs-6',
      type: 'transport', description: 'Retard de transport en commun.',
      soumisParId: 'app-4', soumisParNom: 'Kévin Lambert',
      dateSoumission: '2025-01-21T08:00:00Z',
      validateParId: 'staff-1', validatedParNom: 'Aïcha Bernard',
      dateValidation: '2025-01-22T11:00:00Z',
      commentaireValidation: 'Motif non recevable pour un examen — autres apprenants étaient présents.',
      statut: 'rejete',
    },
    createdAt: '2025-01-20T08:30:00Z', updatedAt: '2025-01-22T11:00:00Z',
  },
];

const seedPresences = (): Presence[] => {
  // Build a sample feuille for seance 'se-3' (Lundi 26/05, Algèbre)
  const seance = 'se-3';
  const all: Presence[] = [
    { id: 'pres-1', seanceId: seance, apprenantId: 'app-1', statut: 'present',
      createdAt: '2025-05-26T08:05:00Z', updatedAt: '2025-05-26T08:05:00Z' },
    { id: 'pres-2', seanceId: seance, apprenantId: 'app-2', statut: 'retard', minutesRetard: 12,
      remarque: 'Arrivé en retard sans excuse.',
      createdAt: '2025-05-26T08:12:00Z', updatedAt: '2025-05-26T08:12:00Z' },
    { id: 'pres-3', seanceId: seance, apprenantId: 'app-3', statut: 'absent',
      createdAt: '2025-05-26T08:05:00Z', updatedAt: '2025-05-26T08:05:00Z' },
    { id: 'pres-4', seanceId: seance, apprenantId: 'app-5', statut: 'dispense',
      remarque: 'Dispense pour stage en entreprise.',
      createdAt: '2025-05-26T08:05:00Z', updatedAt: '2025-05-26T08:05:00Z' },
  ];
  return all;
};

const seedAbsencesEnseignant = (): AbsenceEnseignant[] => [
  {
    id: 'aens-1', enseignantId: 'ens-3', enseignantNom: 'Léa Moreau',
    type: 'formation',
    dateDebut: '2025-05-21', dateFin: '2025-05-21',
    motif: 'Formation continue — pédagogie',
    seancesImpactees: ['se-4'],
    remplacementPrevu: false,
    createdAt: '2025-05-10T00:00:00Z',
  },
  {
    id: 'aens-2', enseignantId: 'ens-1', enseignantNom: 'Camille Dupont',
    type: 'maladie',
    dateDebut: '2025-04-15', dateFin: '2025-04-17',
    motif: 'Arrêt maladie — grippe',
    remplacementPrevu: true,
    enseignantRemplacantId: 'ens-2', enseignantRemplacantNom: 'Idrissa Diallo',
    createdAt: '2025-04-15T07:30:00Z',
  },
];

const seedParametres = (): (ParametresAbsenteisme & { id: string })[] => [
  {
    id: 'param-et-1',
    etablissementId: 'et-1',
    seuilAlerte: 16,
    delaiSaisieHeures: 48,
    absenceExamenNote0: true,
    notificationParent: true,
    notificationDelaiHeures: 24,
  },
];

// ── Stores ───────────────────────────────────────────────────────────────────

const absences = mockStorage<Absence>('absence.absences', seedAbsences);
const presences = mockStorage<Presence>('absence.presences', seedPresences);
const absEnseignants = mockStorage<AbsenceEnseignant>('absence.enseignants', seedAbsencesEnseignant);
const parametres = mockStorage<ParametresAbsenteisme & { id: string }>('absence.parametres', seedParametres);

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFeuille(seanceId: string): FeuillePresence {
  const lines = presences.list().filter((p) => p.seanceId === seanceId);
  return {
    seanceId,
    matiereLibelle: 'Algèbre linéaire',
    enseignantNom: 'Camille Dupont',
    classeOuGroupeLibelle: 'Terminale S — A',
    date: '2025-05-26',
    heureDebut: '08:00', heureFin: '10:00',
    presences: lines,
    totalPresents:  lines.filter((p) => p.statut === 'present').length,
    totalAbsents:   lines.filter((p) => p.statut === 'absent').length,
    totalRetards:   lines.filter((p) => p.statut === 'retard').length,
    totalDispenses: lines.filter((p) => p.statut === 'dispense').length,
    saisieComplete: lines.length > 0,
    dateSaisie: lines[0]?.createdAt,
  };
}

function computeApprenantStats(apprenantId: string): StatsAbsenteisme {
  const myAbs = absences.list().filter((a) => a.apprenantId === apprenantId);
  const totalHeures = myAbs.reduce((s, a) => s + a.dureeHeures, 0);
  const heuresJustifiees = myAbs.filter((a) => a.statut === 'justifiee').reduce((s, a) => s + a.dureeHeures, 0);
  const heuresInjustifiees = myAbs.filter((a) => a.statut === 'non_justifiee' || a.statut === 'rejetee').reduce((s, a) => s + a.dureeHeures, 0);

  // Group absences by matière
  const byMat = new Map<string, AbsenteismeMatiere>();
  myAbs.forEach((a) => {
    if (!a.matiereId) return;
    const entry = byMat.get(a.matiereId) ?? {
      matiereId: a.matiereId,
      matiereLibelle: a.matiereLibelle ?? '',
      totalHeures: 60, heuresAbsence: 0, taux: 0,
    };
    entry.heuresAbsence += a.dureeHeures;
    entry.taux = Math.round((entry.heuresAbsence / entry.totalHeures) * 1000) / 10;
    byMat.set(a.matiereId, entry);
  });

  const seuil = parametres.list()[0]?.seuilAlerte ?? 16;
  // Volume horaire de référence (~ 30h / sem * 12 sem)
  const volumeReference = 360;
  return {
    apprenantId,
    totalHeures,
    heuresJustifiees,
    heuresInjustifiees,
    heuresRetard: 0,
    tauxAbsenteisme: Math.round((totalHeures / volumeReference) * 1000) / 10,
    tauxInjustifie: totalHeures > 0 ? Math.round((heuresInjustifiees / totalHeures) * 1000) / 10 : 0,
    nombreAbsences: myAbs.length,
    absencesExamen: myAbs.filter((a) => a.estExamen).length,
    alerteDepassee: heuresInjustifiees >= seuil,
    parMatiere: Array.from(byMat.values()),
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const ABSENCE_ROUTES: MockRoute[] = [
  // Feuilles de présence
  {
    method: 'GET', path: '/seances/:id/presences',
    handler: (_req, { id }) => ok(buildFeuille(id)),
  },
  {
    method: 'POST', path: '/seances/:id/presences',
    handler: (req, { id }) => {
      const dto = req.body as SaisirPresencesDto;
      // Upsert each line
      dto.presences.forEach((line) => {
        const existing = presences.list().find(
          (p) => p.seanceId === id && p.apprenantId === line.apprenantId,
        );
        if (existing) {
          presences.update(existing.id, {
            statut: line.statut,
            minutesRetard: line.minutesRetard,
            remarque: line.remarque,
            updatedAt: nowIso(),
          });
        } else {
          presences.create({
            id: crypto.randomUUID(),
            seanceId: id,
            apprenantId: line.apprenantId,
            statut: line.statut,
            minutesRetard: line.minutesRetard,
            remarque: line.remarque,
            createdAt: nowIso(), updatedAt: nowIso(),
          });
        }
      });
      // Auto-create Absence for each absent line (idempotent)
      dto.presences.filter((p) => p.statut === 'absent').forEach((line) => {
        const exists = absences.list().some(
          (a) => a.seanceId === id && a.apprenantId === line.apprenantId,
        );
        if (!exists) {
          absences.create({
            id: crypto.randomUUID(),
            apprenantId: line.apprenantId,
            seanceId: id,
            date: nowIso().split('T')[0],
            heureDebut: '00:00', heureFin: '00:00',
            dureeHeures: 2,
            statut: 'non_justifiee',
            estExamen: false, impactNote: false,
            notifieeParent: false,
            createdAt: nowIso(), updatedAt: nowIso(),
          });
        }
      });
      return ok(buildFeuille(id));
    },
  },
  {
    method: 'PATCH', path: '/presences/:id',
    handler: (req, { id }) => {
      const dto = req.body as UpdatePresenceDto;
      const updated = presences.update(id, { ...dto, updatedAt: nowIso() });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(updated);
    },
  },
  {
    method: 'GET', path: '/presences',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = presences.list();
      if (q['apprenantId']) list = list.filter((p) => p.apprenantId === q['apprenantId']);
      if (q['seanceId'])    list = list.filter((p) => p.seanceId === q['seanceId']);
      if (q['statut'])      list = list.filter((p) => p.statut === q['statut']);
      return ok(list);
    },
  },

  // Absences (specific paths BEFORE :id)
  {
    method: 'GET', path: '/absences/alertes',
    handler: (req) => {
      const q = readQuery(req.params);
      const seuil = parametres.list()[0]?.seuilAlerte ?? 16;
      // Find apprenants with injustified hours >= seuil
      const byApp = new Map<string, number>();
      absences.list()
        .filter((a) => a.statut === 'non_justifiee' || a.statut === 'rejetee')
        .forEach((a) => byApp.set(a.apprenantId, (byApp.get(a.apprenantId) ?? 0) + a.dureeHeures));
      const result: StatsAbsenteisme[] = Array.from(byApp.entries())
        .filter(([, h]) => h >= seuil)
        .map(([apprenantId]) => computeApprenantStats(apprenantId));
      return ok(result);
    },
  },
  {
    method: 'GET', path: '/absences/apprenant',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = absences.list().filter((a) => a.apprenantId === q['apprenantId']);
      if (q['anneeAcademiqueId']) {
        // Best-effort: filter by date prefix matching annéeId if it carries a year hint.
      }
      return ok(list);
    },
  },
  {
    method: 'GET', path: '/absences/stats/apprenant',
    handler: (req) => {
      const q = readQuery(req.params);
      return ok(computeApprenantStats(q['apprenantId']));
    },
  },
  {
    method: 'GET', path: '/absences/stats/classe',
    handler: (req) => {
      const q = readQuery(req.params);
      const target = q['classeOuPromotionId'];
      const list = absences.list().filter((a) => a.classeId === target || a.promotionId === target);
      const byApp = new Map<string, number>();
      list.forEach((a) => byApp.set(a.apprenantId, (byApp.get(a.apprenantId) ?? 0) + a.dureeHeures));
      const seuil = parametres.list()[0]?.seuilAlerte ?? 16;
      const topAbsents = Array.from(byApp.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([apprenantId, heures]) => ({ apprenantId, nom: apprenantId, heures }));

      // Distribution par jour de la semaine (last 7 entries)
      const byDay = new Map<string, number>();
      list.forEach((a) => {
        byDay.set(a.date, (byDay.get(a.date) ?? 0) + 1);
      });
      const parJour = Array.from(byDay.entries())
        .sort()
        .slice(-7)
        .map(([date, nbAbsents]) => ({ date, nbAbsents }));

      const totalAppr = byApp.size;
      const moyHeures = totalAppr > 0
        ? Array.from(byApp.values()).reduce((s, h) => s + h, 0) / totalAppr
        : 0;
      const stats: StatsAbsenteismeClasse = {
        classeId: target,
        libelle: target,
        totalApprenants: totalAppr,
        tauxMoyenAbsenteisme: Math.round((moyHeures / 360) * 1000) / 10,
        apprenantsDessusSeui: Array.from(byApp.values()).filter((h) => h >= seuil).length,
        topAbsents,
        parJour,
      };
      return ok(stats);
    },
  },
  {
    method: 'GET', path: '/absences/parametres',
    handler: (req) => {
      const q = readQuery(req.params);
      const found = parametres.list().find((p) => p.etablissementId === q['etablissementId']);
      if (!found) {
        // Lazy create a default
        const created = {
          id: `param-${q['etablissementId']}`,
          etablissementId: q['etablissementId'],
          seuilAlerte: 16, delaiSaisieHeures: 48,
          absenceExamenNote0: true, notificationParent: true, notificationDelaiHeures: 24,
        };
        parametres.create(created);
        const { id: _id, ...rest } = created;
        return ok(rest);
      }
      const { id: _id, ...rest } = found;
      return ok(rest);
    },
  },
  {
    method: 'PATCH', path: '/absences/parametres',
    handler: (req) => {
      const body = req.body as Partial<ParametresAbsenteisme> & { etablissementId: string };
      const found = parametres.list().find((p) => p.etablissementId === body.etablissementId);
      let updated;
      if (found) {
        updated = parametres.update(found.id, body)!;
      } else {
        const created = {
          id: `param-${body.etablissementId}`,
          etablissementId: body.etablissementId,
          seuilAlerte: body.seuilAlerte ?? 16,
          delaiSaisieHeures: body.delaiSaisieHeures ?? 48,
          absenceExamenNote0: body.absenceExamenNote0 ?? true,
          notificationParent: body.notificationParent ?? true,
          notificationDelaiHeures: body.notificationDelaiHeures ?? 24,
        };
        parametres.create(created);
        updated = created;
      }
      const { id: _id, ...rest } = updated;
      return ok(rest);
    },
  },
  {
    method: 'GET', path: '/absences',
    handler: (req) => {
      const q = readQuery(req.params);
      let list = absences.list();
      if (q['apprenantId'])       list = list.filter((a) => a.apprenantId === q['apprenantId']);
      if (q['classeId'])          list = list.filter((a) => a.classeId === q['classeId']);
      if (q['promotionId'])       list = list.filter((a) => a.promotionId === q['promotionId']);
      if (q['matiereId'])         list = list.filter((a) => a.matiereId === q['matiereId']);
      if (q['statut'])            list = list.filter((a) => a.statut === q['statut']);
      if (q['estExamen'])         list = list.filter((a) => String(a.estExamen) === q['estExamen']);
      if (q['dateDebut'])         list = list.filter((a) => a.date >= q['dateDebut']);
      if (q['dateFin'])           list = list.filter((a) => a.date <= q['dateFin']);
      return paginate(list, q);
    },
  },
  {
    method: 'GET', path: '/absences/:id',
    handler: (_req, { id }) => {
      const a = absences.find(id);
      if (!a) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(a);
    },
  },
  {
    method: 'POST', path: '/absences/:id/notifier',
    handler: (_req, { id }) => {
      const updated = absences.update(id, {
        notifieeParent: true,
        dateNotification: nowIso(),
        updatedAt: nowIso(),
      });
      if (!updated) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok({ sent: true });
    },
  },

  // Justificatifs
  {
    method: 'GET', path: '/justificatifs/en-attente',
    handler: () => {
      const enAttente = absences.list()
        .map((a) => a.justificatif)
        .filter((j): j is Justificatif => !!j && j.statut === 'en_attente');
      return ok(enAttente);
    },
  },
  {
    method: 'POST', path: '/justificatifs',
    handler: (req) => {
      // The real service uses FormData; in the mock interceptor we receive body=FormData.
      // Convert to a regular DTO by reading expected fields if it's FormData; otherwise treat as JSON.
      const body = req.body as FormData | SoumettreJustificatifDto;
      let dto: SoumettreJustificatifDto;
      if (body instanceof FormData) {
        dto = {
          absenceId: body.get('absenceId') as string,
          type: body.get('type') as SoumettreJustificatifDto['type'],
          description: body.get('description') as string,
        };
      } else {
        dto = body;
      }
      const absence = absences.find(dto.absenceId);
      if (!absence) throw new HttpErrorResponse({ status: 404, statusText: 'Absence Not Found' });
      const just: Justificatif = {
        id: crypto.randomUUID(),
        absenceId: dto.absenceId,
        type: dto.type,
        description: dto.description,
        fichierUrl: `/mock/justificatifs/${crypto.randomUUID()}.pdf`,
        fichierNom: 'justificatif.pdf',
        soumisParId: 'app-mock',
        soumisParNom: 'Apprenant mock',
        dateSoumission: nowIso(),
        statut: 'en_attente',
      };
      absences.update(absence.id, { justificatif: just, statut: 'en_attente', updatedAt: nowIso() });
      return ok(just);
    },
  },
  {
    method: 'PATCH', path: '/justificatifs/:id/valider',
    handler: (req, { id }) => {
      const dto = req.body as ValiderJustificatifDto;
      const absence = absences.list().find((a) => a.justificatif?.id === id);
      if (!absence || !absence.justificatif) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const justUpdated: Justificatif = {
        ...absence.justificatif,
        statut: dto.statut,
        commentaireValidation: dto.commentaire,
        validateParId: 'staff-mock',
        validatedParNom: 'Validator mock',
        dateValidation: nowIso(),
      };
      const newStatut = dto.statut === 'accepte' ? 'justifiee' : 'rejetee';
      absences.update(absence.id, {
        justificatif: justUpdated,
        statut: newStatut,
        updatedAt: nowIso(),
      });
      return ok(justUpdated);
    },
  },

  // Absences enseignants
  {
    method: 'GET', path: '/absences-enseignants',
    handler: (req) => {
      const q = readQuery(req.params);
      const list = q['enseignantId']
        ? absEnseignants.list().filter((a) => a.enseignantId === q['enseignantId'])
        : absEnseignants.list();
      return ok(list);
    },
  },
  {
    method: 'POST', path: '/absences-enseignants',
    handler: (req) => {
      const dto = req.body as CreateAbsenceEnseignantDto;
      const created: AbsenceEnseignant = {
        ...dto,
        id: crypto.randomUUID(),
        remplacementPrevu: !!dto.enseignantRemplacantId,
        createdAt: nowIso(),
      };
      return ok(absEnseignants.create(created));
    },
  },
  {
    method: 'DELETE', path: '/absences-enseignants/:id',
    handler: (_req, { id }) => {
      if (!absEnseignants.remove(id)) throw new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      return ok(undefined);
    },
  },
];
