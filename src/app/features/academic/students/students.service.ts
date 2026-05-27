import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { environment } from '@env/environment';
import { Student, StudentDraft } from './models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/students`;

  list(): Observable<Student[]> {
    return of(this.seed()).pipe(delay(200));
  }

  getById(id: string): Observable<Student | undefined> {
    return of(this.seed().find((s) => s.id === id));
  }

  create(draft: StudentDraft): Observable<Student> {
    const student: Student = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      enrolledAt: new Date().toISOString(),
    };
    return of(student).pipe(delay(150));
  }

  update(id: string, draft: StudentDraft): Observable<Student> {
    const existing = this.seed().find((s) => s.id === id);
    const merged: Student = {
      ...(existing ?? {
        id,
        tenantId: 't-1',
        enrolledAt: new Date().toISOString(),
      }),
      ...draft,
    } as Student;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): Student[] {
    return [
      {
        id: 's-1',
        tenantId: 't-1',
        registrationNumber: 'STU-2024-001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@school.edu',
        birthDate: '2008-04-12',
        level: 'SECONDARY',
        status: 'ACTIVE',
        enrolledAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 's-2',
        tenantId: 't-1',
        registrationNumber: 'STU-2023-014',
        firstName: 'Marcus',
        lastName: 'Lee',
        email: 'marcus.lee@uni.edu',
        birthDate: '2003-07-22',
        level: 'UNDERGRAD',
        status: 'ACTIVE',
        enrolledAt: '2023-09-01T00:00:00Z',
      },
      {
        id: 's-3',
        tenantId: 't-1',
        registrationNumber: 'STU-2022-009',
        firstName: 'Sofia',
        lastName: 'Martinez',
        email: 'sofia.martinez@uni.edu',
        birthDate: '2001-11-03',
        level: 'GRADUATE',
        status: 'GRADUATED',
        enrolledAt: '2022-09-01T00:00:00Z',
      },
    ];
  }
}
