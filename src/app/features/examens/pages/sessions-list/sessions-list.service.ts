import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ExamSession, ExamSessionDraft } from './models/exam-session.model';

@Injectable({ providedIn: 'root' })
export class ExamSessionsService {
  list(): Observable<ExamSession[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: ExamSessionDraft): Observable<ExamSession> {
    const s: ExamSession = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      examsCount: 0,
      createdAt: new Date().toISOString(),
    };
    return of(s).pipe(delay(150));
  }

  update(id: string, draft: ExamSessionDraft): Observable<ExamSession> {
    const existing = this.seed().find((s) => s.id === id);
    const merged: ExamSession = {
      ...(existing ?? { id, tenantId: 't-1', examsCount: 0, createdAt: new Date().toISOString() }),
      ...draft,
    } as ExamSession;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): ExamSession[] {
    return [
      {
        id: 'ex-1', tenantId: 't-1', label: 'Session normale — Trimestre 1 2024-2025',
        type: 'NORMAL', status: 'CLOSED', startDate: '2024-12-09', endDate: '2024-12-20',
        examsCount: 18, createdAt: '2024-11-01T00:00:00Z',
      },
      {
        id: 'ex-2', tenantId: 't-1', label: 'Session de rattrapage — Trimestre 1',
        type: 'MAKEUP', status: 'CLOSED', startDate: '2025-01-13', endDate: '2025-01-17',
        examsCount: 6, createdAt: '2024-12-22T00:00:00Z',
      },
      {
        id: 'ex-3', tenantId: 't-1', label: 'Session normale — Trimestre 2 2024-2025',
        type: 'NORMAL', status: 'IN_PROGRESS', startDate: '2025-05-19', endDate: '2025-05-30',
        examsCount: 21, createdAt: '2025-04-08T00:00:00Z',
      },
      {
        id: 'ex-4', tenantId: 't-1', label: 'Session spéciale — Soutenance M2',
        type: 'SPECIAL', status: 'PLANNED', startDate: '2025-06-15', endDate: '2025-06-25',
        examsCount: 8, createdAt: '2025-04-20T00:00:00Z',
      },
    ];
  }
}
