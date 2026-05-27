export type UserRole = 'ADMIN' | 'TEACHER' | 'STAFF' | 'STUDENT' | 'PARENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';

export interface User {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export type UserDraft = Omit<User, 'id' | 'tenantId' | 'lastLoginAt' | 'createdAt'>;
