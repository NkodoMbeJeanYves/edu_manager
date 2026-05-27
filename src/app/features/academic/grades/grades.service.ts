import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Grade, GradeDraft } from './models/grade.model';

@Injectable({ providedIn: 'root' })
export class GradesService {
  list(): Observable<Grade[]> {
    return of(this.seed()).pipe(delay(200));
  }

  create(draft: GradeDraft): Observable<Grade> {
    const grade: Grade = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
    };
    return of(grade).pipe(delay(150));
  }

  update(id: string, draft: GradeDraft): Observable<Grade> {
    const existing = this.seed().find((g) => g.id === id);
    const merged: Grade = {
      ...(existing ?? { id, tenantId: 't-1' }),
      ...draft,
    } as Grade;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): Grade[] {
    return [
      {
        id: 'g-1',
        tenantId: 't-1',
        studentName: 'Alice Johnson',
        registrationNumber: 'STU-2024-001',
        subject: 'Mathématiques',
        evaluationType: 'MIDTERM',
        score: 16,
        maxScore: 20,
        evaluatedAt: '2024-11-12',
      },
      {
        id: 'g-2',
        tenantId: 't-1',
        studentName: 'Alice Johnson',
        registrationNumber: 'STU-2024-001',
        subject: 'Sciences physiques',
        evaluationType: 'QUIZ',
        score: 14,
        maxScore: 20,
        evaluatedAt: '2024-11-20',
      },
      {
        id: 'g-3',
        tenantId: 't-1',
        studentName: 'Marcus Lee',
        registrationNumber: 'STU-2023-014',
        subject: 'Anglais',
        evaluationType: 'HOMEWORK',
        score: 18,
        maxScore: 20,
        evaluatedAt: '2024-11-05',
      },
      {
        id: 'g-4',
        tenantId: 't-1',
        studentName: 'Sofia Martinez',
        registrationNumber: 'STU-2022-009',
        subject: 'Histoire-Géographie',
        evaluationType: 'PROJECT',
        score: 17,
        maxScore: 20,
        evaluatedAt: '2024-10-28',
      },
      {
        id: 'g-5',
        tenantId: 't-1',
        studentName: 'Marcus Lee',
        registrationNumber: 'STU-2023-014',
        subject: 'Mathématiques',
        evaluationType: 'FINAL',
        score: 9,
        maxScore: 20,
        evaluatedAt: '2024-12-15',
      },
    ];
  }
}
