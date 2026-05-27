export type RoleScope = 'GLOBAL' | 'TENANT' | 'DEPARTMENT';

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
  scope: RoleScope;
  permissionsCount: number;
  usersCount: number;
  isSystem: boolean;
  createdAt: string;
}

export interface RoleFilter {
  search?: string;
  scope?: RoleScope;
}

export type RoleDraft = Omit<Role, 'id' | 'tenantId' | 'usersCount' | 'createdAt'>;
