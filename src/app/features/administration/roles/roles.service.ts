import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Role, RoleDraft } from './models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  list(): Observable<Role[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: RoleDraft): Observable<Role> {
    const role: Role = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      usersCount: 0,
      createdAt: new Date().toISOString(),
    };
    return of(role).pipe(delay(150));
  }

  update(id: string, draft: RoleDraft): Observable<Role> {
    const existing = this.seed().find((r) => r.id === id);
    const merged: Role = {
      ...(existing ?? { id, tenantId: 't-1', usersCount: 0, createdAt: new Date().toISOString() }),
      ...draft,
    } as Role;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Role[] {
    return [
      {
        id: 'r-1', tenantId: 't-1', name: 'Super Administrator', code: 'SUPER_ADMIN',
        description: 'Full access to all features and tenants.',
        scope: 'GLOBAL', permissionsCount: 48, usersCount: 1, isSystem: true,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'r-2', tenantId: 't-1', name: 'Tenant Administrator', code: 'TENANT_ADMIN',
        description: 'Manage users, roles, and settings within the tenant.',
        scope: 'TENANT', permissionsCount: 32, usersCount: 2, isSystem: true,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'r-3', tenantId: 't-1', name: 'Pedagogical Director', code: 'PED_DIR',
        description: 'Oversee academic activities, validate grades and bulletins.',
        scope: 'DEPARTMENT', permissionsCount: 18, usersCount: 3, isSystem: false,
        createdAt: '2023-03-15T00:00:00Z',
      },
      {
        id: 'r-4', tenantId: 't-1', name: 'Teacher', code: 'TEACHER',
        description: 'Record grades, manage attendance, view class rosters.',
        scope: 'TENANT', permissionsCount: 12, usersCount: 24, isSystem: true,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'r-5', tenantId: 't-1', name: 'Bursar', code: 'BURSAR',
        description: 'Manage invoices, receive payments, financial reports.',
        scope: 'DEPARTMENT', permissionsCount: 14, usersCount: 2, isSystem: false,
        createdAt: '2024-02-10T00:00:00Z',
      },
    ];
  }
}
