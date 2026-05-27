import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Teacher, TeacherDraft } from './models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeachersService {
  list(): Observable<Teacher[]> {
    return of(this.seed()).pipe(delay(200));
  }

  create(draft: TeacherDraft): Observable<Teacher> {
    const teacher: Teacher = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      hiredAt: new Date().toISOString(),
    };
    return of(teacher).pipe(delay(150));
  }

  update(id: string, draft: TeacherDraft): Observable<Teacher> {
    const existing = this.seed().find((t) => t.id === id);
    const merged: Teacher = {
      ...(existing ?? { id, tenantId: 't-1', hiredAt: new Date().toISOString() }),
      ...draft,
    } as Teacher;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): Teacher[] {
    return [
      {
        id: 't-1',
        tenantId: 't-1',
        staffNumber: 'TCH-2021-007',
        firstName: 'Camille',
        lastName: 'Dupont',
        email: 'camille.dupont@school.edu',
        phone: '+33 6 12 34 56 78',
        discipline: 'Mathématiques',
        contractType: 'PERMANENT',
        status: 'ACTIVE',
        hiredAt: '2021-09-01T00:00:00Z',
      },
      {
        id: 't-2',
        tenantId: 't-1',
        staffNumber: 'TCH-2019-002',
        firstName: 'Idrissa',
        lastName: 'Diallo',
        email: 'idrissa.diallo@school.edu',
        phone: '+33 6 98 76 54 32',
        discipline: 'Sciences physiques',
        contractType: 'PERMANENT',
        status: 'ACTIVE',
        hiredAt: '2019-09-01T00:00:00Z',
      },
      {
        id: 't-3',
        tenantId: 't-1',
        staffNumber: 'TCH-2023-014',
        firstName: 'Léa',
        lastName: 'Moreau',
        email: 'lea.moreau@school.edu',
        discipline: 'Anglais',
        contractType: 'HOURLY',
        status: 'ACTIVE',
        hiredAt: '2023-09-15T00:00:00Z',
      },
      {
        id: 't-4',
        tenantId: 't-1',
        staffNumber: 'TCH-2018-001',
        firstName: 'Robert',
        lastName: 'Tremblay',
        email: 'robert.tremblay@school.edu',
        discipline: 'Histoire-Géographie',
        contractType: 'PERMANENT',
        status: 'RETIRED',
        hiredAt: '1998-09-01T00:00:00Z',
      },
    ];
  }
}
