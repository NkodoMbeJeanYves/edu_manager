import { MockRoute } from './mock-types';
import { REFERENTIEL_ROUTES } from './seeds/referentiel.mock';
import { ETABLISSEMENT_ROUTES } from './seeds/etablissement.mock';
import { STRUCTURE_ROUTES } from './seeds/structure.mock';
import { ENSEIGNANT_ROUTES } from './seeds/enseignant.mock';
import { INSCRIPTION_ROUTES } from './seeds/inscription.mock';
import { NOTE_ROUTES } from './seeds/note.mock';
import { BULLETIN_ROUTES } from './seeds/bulletin.mock';
import { EDT_ROUTES } from './seeds/edt.mock';
import { ABSENCE_ROUTES } from './seeds/absence.mock';
import { EXAMEN_ROUTES } from './seeds/examen.mock';
import { COMMUNICATION_API_ROUTES } from './seeds/communication.mock';
import { REPORTING_API_ROUTES } from './seeds/reporting.mock';
import { AUTH_ROUTES } from './seeds/auth.mock';

/**
 * Aggregate of all mock routes registered with the mock-backend interceptor.
 *
 * Order matters: routes are matched top-to-bottom. Place more specific paths
 * (e.g. `/matieres/by-niveau`) BEFORE wildcard params (e.g. `/matieres/:id`).
 * Each seed file already handles this internally.
 */
export const MOCK_ROUTES: MockRoute[] = [
  ...AUTH_ROUTES,
  ...REFERENTIEL_ROUTES,
  ...ETABLISSEMENT_ROUTES,
  ...STRUCTURE_ROUTES,
  ...ENSEIGNANT_ROUTES,
  ...INSCRIPTION_ROUTES,
  ...NOTE_ROUTES,
  ...BULLETIN_ROUTES,
  ...EDT_ROUTES,
  ...ABSENCE_ROUTES,
  ...EXAMEN_ROUTES,
  ...COMMUNICATION_API_ROUTES,
  ...REPORTING_API_ROUTES,
];
