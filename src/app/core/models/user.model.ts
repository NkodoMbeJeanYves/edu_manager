export type UserRole =
  | 'super_admin'
  | 'directeur'
  | 'resp_scolarite'
  | 'resp_financier'
  | 'resp_filiere'
  | 'enseignant'
  | 'surveillant_examen'
  | 'agent_scolarite'
  | 'agent_comptable'
  | 'apprenant'
  | 'parent'
  | 'auditeur';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  active: boolean;
  apprenantId?: string;
  enfantIds?: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  tenantCode?: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: number;
}
