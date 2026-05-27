import {
  TableauBordDirection, RapportPedagogique, RapportAbsenteisme,
  RapportFinancier, IndicateursTempsReel,
} from '../../models/reporting.models';
import { MockRoute } from '../mock-types';
import { ok } from '../mock-helpers';

// ── Builders (static mocks; pages already have their own local mocks) ───────

function buildTableauBord(): TableauBordDirection {
  return {
    periode: 'Trimestre 2 — 2024-2025',
    effectifs: {
      total: 1248, actifs: 1192,
      scolaires: 720, universitaires: 472,
      nouveauxInscrits: 56, evolution: 3.2,
    },
    pedagogique: {
      tauxReussite: 78, moyenneGenerale: 13.4,
      tauxAbsenteisme: 6.8,
      seancesRealisees: 4528,
      tauxCouvertureEDT: 96,
      bulletinsPublies: 1180,
    },
    financier: {
      totalAttendu: 2_480_000, totalRecouvre: 2_052_800,
      tauxRecouvrement: 82.8, encours: 427_200,
      dossiersEnRetard: 38,
    },
    alertes: [
      { niveau: 'critical', module: 'Finance', message: '38 dossiers en retard de paiement (>30j).', valeur: 38, seuil: 20, lien: '/finance/invoices' },
      { niveau: 'warning',  module: 'Absences', message: '7 apprenants dépassent le seuil d\'absences injustifiées.', valeur: 7, seuil: 5, lien: '/absences/alertes' },
      { niveau: 'warning',  module: 'Pédagogie', message: 'Taux de réussite en Mathématiques Term.S à 54% (cible 70%).', valeur: 54, seuil: 70, lien: '/reporting/pedagogique' },
      { niveau: 'info',     module: 'EDT', message: 'Couverture EDT à 96% : 2 séances restantes à programmer.', valeur: 96, seuil: 100 },
    ],
  };
}

function buildIndicateursReel(): IndicateursTempsReel {
  return {
    absencesAujourdHui: 14,
    seancesAujourdHui: 86,
    paiementsAujourdHui: 4,
    montantAujourdHui: 6850,
    notificationsEnAttente: 12,
    justificatifsEnAttente: 6,
    boursesEnAttente: 2,
  };
}

function buildRapportPeda(): RapportPedagogique {
  return {
    type: 'classe', entityId: 'cl-1', entityLibelle: 'Terminale S — A',
    periode: 'Trimestre 2 — 2024-2025',
    moyenneGenerale: 13.2, tauxReussite: 81, nombreApprenants: 32, absenteisme: 6.8,
    topPerformeurs: [
      { apprenantId: 'app-1', nom: 'Alice Johnson', moyenne: 17.4 },
      { apprenantId: 'app-7', nom: 'Léo Bernard', moyenne: 16.9 },
      { apprenantId: 'app-8', nom: 'Nour El-Khaled', moyenne: 16.2 },
      { apprenantId: 'app-9', nom: 'Marie Dubois', moyenne: 15.8 },
      { apprenantId: 'app-10', nom: 'Thomas Petit', moyenne: 15.5 },
    ],
    enDifficulte: [
      { apprenantId: 'app-2', nom: 'Marcus Lee', moyenne: 8.4 },
      { apprenantId: 'app-6', nom: 'Sophie Garcia', moyenne: 8.9 },
      { apprenantId: 'app-11', nom: 'Karim Benali', moyenne: 9.2 },
      { apprenantId: 'app-12', nom: 'Lina Moreau', moyenne: 9.6 },
    ],
    evolutionParMois: [
      { mois: 'Jan', moyenne: 12.8 },
      { mois: 'Fév', moyenne: 13.1 },
      { mois: 'Mar', moyenne: 13.4 },
      { mois: 'Avr', moyenne: 13.2 },
    ],
    parMatiere: [
      { matiereLibelle: 'Mathématiques', moyenne: 12.4, tauxReussite: 72 },
      { matiereLibelle: 'Sciences physiques', moyenne: 13.1, tauxReussite: 78 },
      { matiereLibelle: 'SVT', moyenne: 14.2, tauxReussite: 91 },
      { matiereLibelle: 'Anglais', moyenne: 13.8, tauxReussite: 85 },
      { matiereLibelle: 'Histoire-Géographie', moyenne: 12.9, tauxReussite: 80 },
      { matiereLibelle: 'Philosophie', moyenne: 11.8, tauxReussite: 68 },
    ],
  };
}

function buildRapportAbsenteisme(): RapportAbsenteisme {
  return {
    periode: 'Trimestre 2 — 2024-2025',
    tauxMoyen: 6.8,
    topAbsents: [
      { apprenantId: 'app-11', nom: 'Karim Benali', heures: 48, taux: 14.2 },
      { apprenantId: 'app-6', nom: 'Sophie Garcia', heures: 42, taux: 12.8 },
      { apprenantId: 'app-2', nom: 'Marcus Lee', heures: 38, taux: 11.6 },
      { apprenantId: 'app-12', nom: 'Lina Moreau', heures: 34, taux: 10.4 },
      { apprenantId: 'app-13', nom: 'David Cohen', heures: 30, taux: 9.2 },
    ],
    evolutionHebdo: [
      { semaine: 'S05', taux: 5.2 },
      { semaine: 'S06', taux: 6.1 },
      { semaine: 'S07', taux: 5.8 },
      { semaine: 'S08', taux: 7.4 },
      { semaine: 'S09', taux: 6.9 },
      { semaine: 'S10', taux: 8.2 },
      { semaine: 'S11', taux: 7.5 },
      { semaine: 'S12', taux: 6.4 },
    ],
    parJourSemaine: [
      { jour: 'Mon', taux: 5.8 },
      { jour: 'Tue', taux: 6.4 },
      { jour: 'Wed', taux: 7.2 },
      { jour: 'Thu', taux: 6.1 },
      { jour: 'Fri', taux: 8.9 },
      { jour: 'Sat', taux: 9.4 },
    ],
    matieresImpactees: [
      { matiereLibelle: 'Mathématiques', taux: 8.4 },
      { matiereLibelle: 'Sciences physiques', taux: 7.1 },
      { matiereLibelle: 'Sport', taux: 11.2 },
      { matiereLibelle: 'Anglais', taux: 4.8 },
    ],
  };
}

function buildRapportFinancier(): RapportFinancier {
  return {
    periode: 'Année 2024-2025',
    totalAttendu: 2_480_000,
    totalRecouvre: 2_052_800,
    encours: 427_200,
    tauxRecouvrement: 82.8,
    evolutionMensuelle: [
      { mois: 'Sep', recouvre: 720_000, attendu: 800_000 },
      { mois: 'Oct', recouvre: 180_000, attendu: 200_000 },
      { mois: 'Nov', recouvre: 170_000, attendu: 180_000 },
      { mois: 'Dec', recouvre: 145_000, attendu: 160_000 },
      { mois: 'Jan', recouvre: 580_000, attendu: 700_000 },
      { mois: 'Fév', recouvre: 130_000, attendu: 180_000 },
      { mois: 'Mar', recouvre: 75_000,  attendu: 140_000 },
      { mois: 'Avr', recouvre: 52_800,  attendu: 120_000 },
    ],
    parFiliere: [
      { filiereLibelle: 'Sciences (Bac S)',     attendu: 720_000, recouvre: 640_000, taux: 88.9 },
      { filiereLibelle: 'Lettres (Bac L)',      attendu: 580_000, recouvre: 484_000, taux: 83.4 },
      { filiereLibelle: 'Économique (Bac ES)',  attendu: 540_000, recouvre: 432_000, taux: 80.0 },
      { filiereLibelle: 'Licence Informatique', attendu: 380_000, recouvre: 304_000, taux: 80.0 },
      { filiereLibelle: 'Master Management',    attendu: 260_000, recouvre: 192_800, taux: 74.2 },
    ],
    parModePaiement: [
      { mode: 'Bank transfer', montant: 1_232_000, pourcentage: 60 },
      { mode: 'Card',          montant: 410_500,   pourcentage: 20 },
      { mode: 'Cash',          montant: 246_300,   pourcentage: 12 },
      { mode: 'Mobile money',  montant: 123_200,   pourcentage: 6 },
      { mode: 'Check',         montant: 40_800,    pourcentage: 2 },
    ],
    topDebiteurs: [
      { apprenantId: 'app-3', nom: 'Sofia Martinez', montantRestant: 4500 },
      { apprenantId: 'app-2', nom: 'Marcus Lee',     montantRestant: 3200 },
      { apprenantId: 'app-13', nom: 'David Cohen',   montantRestant: 2800 },
      { apprenantId: 'app-12', nom: 'Lina Moreau',   montantRestant: 2500 },
      { apprenantId: 'app-11', nom: 'Karim Benali',  montantRestant: 2100 },
    ],
  };
}

function emptyBlob(format: string): Blob {
  return new Blob([`mock ${format} export`], {
    type: format === 'pdf' ? 'application/pdf'
      : format === 'csv' ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────

export const REPORTING_API_ROUTES: MockRoute[] = [
  {
    method: 'GET', path: '/reporting/tableau-bord',
    handler: () => ok(buildTableauBord()),
  },
  {
    method: 'GET', path: '/reporting/temps-reel',
    handler: () => ok(buildIndicateursReel()),
  },
  {
    method: 'GET', path: '/reporting/pedagogique',
    handler: () => ok(buildRapportPeda()),
  },
  {
    method: 'GET', path: '/reporting/enseignant/:enseignantId',
    handler: (_req, { enseignantId }) => ok({
      ...buildRapportPeda(),
      type: 'enseignant',
      entityId: enseignantId,
      entityLibelle: `Enseignant ${enseignantId}`,
    }),
  },
  {
    method: 'GET', path: '/reporting/absenteisme',
    handler: () => ok(buildRapportAbsenteisme()),
  },
  {
    method: 'GET', path: '/reporting/financier',
    handler: () => ok(buildRapportFinancier()),
  },
  {
    method: 'GET', path: '/reporting/export',
    handler: (req) => {
      const format = req.params.get('format') ?? 'pdf';
      return emptyBlob(format);
    },
  },
];
