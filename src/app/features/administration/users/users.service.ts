import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { User, UserDraft } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  list(): Observable<User[]> {
    return of(this.seed()).pipe(delay(200));
  }

  create(draft: UserDraft): Observable<User> {
    const user: User = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      createdAt: new Date().toISOString(),
    };
    return of(user).pipe(delay(150));
  }

  update(id: string, draft: UserDraft): Observable<User> {
    const existing = this.seed().find((u) => u.id === id);
    const merged: User = {
      ...(existing ?? { id, tenantId: 't-1', createdAt: new Date().toISOString() }),
      ...draft,
    } as User;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): User[] {
    return [
      {
        id: 'u-1',
        tenantId: 't-1',
        username: 'admin',
        email: 'admin@school.edu',
        firstName: 'Aïcha',
        lastName: 'Bernard',
        role: 'ADMIN',
        status: 'ACTIVE',
        lastLoginAt: '2025-05-26T08:14:00Z',
        createdAt: '2023-01-15T00:00:00Z',
      },
      {
        id: 'u-2',
        tenantId: 't-1',
        username: 'c.dupont',
        email: 'camille.dupont@school.edu',
        firstName: 'Camille',
        lastName: 'Dupont',
        role: 'TEACHER',
        status: 'ACTIVE',
        lastLoginAt: '2025-05-25T17:42:00Z',
        createdAt: '2021-09-01T00:00:00Z',
      },
      {
        id: 'u-3',
        tenantId: 't-1',
        username: 'm.lefebvre',
        email: 'marie.lefebvre@school.edu',
        firstName: 'Marie',
        lastName: 'Lefebvre',
        role: 'STAFF',
        status: 'ACTIVE',
        lastLoginAt: '2025-05-26T09:01:00Z',
        createdAt: '2022-08-20T00:00:00Z',
      },
      {
        id: 'u-4',
        tenantId: 't-1',
        username: 'a.johnson',
        email: 'alice.johnson@school.edu',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'STUDENT',
        status: 'ACTIVE',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'u-5',
        tenantId: 't-1',
        username: 'p.morel',
        email: 'patrick.morel@parents.edu',
        firstName: 'Patrick',
        lastName: 'Morel',
        role: 'PARENT',
        status: 'PENDING',
        createdAt: '2025-05-10T00:00:00Z',
      },
    ];
  }
}
