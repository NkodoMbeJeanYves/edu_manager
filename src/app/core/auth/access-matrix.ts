import { AccessMatrix, Action, ModuleKey } from '@core/models/auth.models';
import { UserRole } from '@core/models/user.model';

const FULL: readonly Action[] = ['read', 'write', 'validate', 'publish', 'delete', 'export', 'sign'];
const CRUD: readonly Action[] = ['read', 'write', 'delete'];
const RW: readonly Action[] = ['read', 'write'];
const R: readonly Action[] = ['read'];

/**
 * Matrice de droits V1.
 *
 * Mapping doc → projet :
 *   M04 Apprenants  ↔ inscriptions
 *   M07 EDT         ↔ edt
 *   M08 Notes       ↔ notes
 *   M10 Absences    ↔ absences
 *   M11 Bulletins   ↔ bulletins
 *   M12 Financier   ↔ finance
 *   M14 Reporting   ↔ reporting
 *
 * Modules orphelins de la matrice (academic, administration, etablissements,
 * structure, referentiel, enseignants, examens, communication) : restreints
 * à `directeur` + `super_admin` par sécurité.
 *
 * Les périmètres fins (sa filière, ses classes, son dossier) sont marqués
 * dans la doc mais non enforced en V1 (cloisonnement tenant seulement).
 */
export const ACCESS_MATRIX: AccessMatrix = {
  super_admin: {
    academic: FULL, administration: FULL, finance: FULL, etablissements: FULL,
    inscriptions: FULL, notes: FULL, bulletins: FULL, structure: FULL,
    referentiel: FULL, edt: FULL, absences: FULL, enseignants: FULL,
    examens: FULL, communication: FULL, reporting: FULL,
  },

  directeur: {
    academic: FULL, administration: FULL, finance: FULL, etablissements: FULL,
    inscriptions: R, edt: R, notes: R, absences: R,
    bulletins: ['read', 'validate', 'sign'],
    structure: FULL, referentiel: FULL, enseignants: FULL,
    examens: FULL, communication: FULL,
    reporting: FULL,
  },

  resp_scolarite: {
    inscriptions: CRUD,
    edt: CRUD,
    notes: ['read', 'validate'],
    absences: CRUD,
    bulletins: ['read', 'write', 'publish'],
    finance: CRUD,
    reporting: R,
  },

  resp_financier: {
    inscriptions: R,
    finance: CRUD,
    reporting: R,
  },

  resp_filiere: {
    inscriptions: R,
    edt: R,
    notes: ['read', 'validate'],
    absences: R,
    bulletins: ['read', 'publish'],
    finance: R,
    reporting: R,
  },

  enseignant: {
    inscriptions: R,
    edt: R,
    notes: RW,
    absences: RW,
    bulletins: RW,
    reporting: R,
  },

  surveillant_examen: {
    edt: R,
    examens: R,
  },

  agent_scolarite: {
    inscriptions: RW,
    edt: R,
    absences: R,
    finance: R,
  },

  agent_comptable: {
    finance: CRUD,
    reporting: R,
  },

  apprenant: {
    inscriptions: R,
    edt: R,
    notes: R,
    absences: R,
    bulletins: R,
    finance: R,
  },

  parent: {
    inscriptions: R,
    edt: R,
    notes: R,
    absences: R,
    bulletins: R,
    finance: R,
  },

  auditeur: {
    academic: R, administration: R, finance: R, etablissements: R,
    inscriptions: R, notes: R, bulletins: R, structure: R,
    referentiel: R, edt: R, absences: R, enseignants: R,
    examens: R, communication: R, reporting: R,
  },
};

export function actionsFor(role: UserRole, module: ModuleKey): readonly Action[] {
  return ACCESS_MATRIX[role]?.[module] ?? [];
}
