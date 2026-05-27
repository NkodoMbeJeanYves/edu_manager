import { UserRole } from './user.model';

export type Action =
  | 'read'
  | 'write'
  | 'validate'
  | 'publish'
  | 'delete'
  | 'export'
  | 'sign';

export type ModuleKey =
  | 'academic'
  | 'administration'
  | 'finance'
  | 'etablissements'
  | 'inscriptions'
  | 'notes'
  | 'bulletins'
  | 'structure'
  | 'referentiel'
  | 'edt'
  | 'absences'
  | 'enseignants'
  | 'examens'
  | 'communication'
  | 'reporting';

export type ModulePermissions = Partial<Record<ModuleKey, readonly Action[]>>;

export type AccessMatrix = Record<UserRole, ModulePermissions>;

export { UserRole };
