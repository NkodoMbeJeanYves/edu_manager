import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AcademicSession, AcademicSessionDraft } from './models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  list(): Observable<AcademicSession[]> {
    return of(this.seed()).pipe(delay(200));
  }

  create(draft: AcademicSessionDraft): Observable<AcademicSession> {
    const session: AcademicSession = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      createdAt: new Date().toISOString(),
    };
    return of(session).pipe(delay(150));
  }

  update(id: string, draft: AcademicSessionDraft): Observable<AcademicSession> {
    const existing = this.seed().find((s) => s.id === id);
    const merged: AcademicSession = {
      ...(existing ?? { id, tenantId: 't-1', createdAt: new Date().toISOString() }),
      ...draft,
    } as AcademicSession;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): AcademicSession[] {
    return [
      {
        id: 'sess-1',
        tenantId: 't-1',
        label: 'Année 2024-2025',
        type: 'YEAR',
        startDate: '2024-09-02',
        endDate: '2025-07-04',
        status: 'ACTIVE',
        createdAt: '2024-06-15T00:00:00Z',
      },
      {
        id: 'sess-2',
        tenantId: 't-1',
        label: 'Trimestre 1 — 2024-2025',
        type: 'TERM',
        startDate: '2024-09-02',
        endDate: '2024-12-20',
        status: 'CLOSED',
        createdAt: '2024-06-15T00:00:00Z',
      },
      {
        id: 'sess-3',
        tenantId: 't-1',
        label: 'Trimestre 2 — 2024-2025',
        type: 'TERM',
        startDate: '2025-01-06',
        endDate: '2025-03-28',
        status: 'ACTIVE',
        createdAt: '2024-06-15T00:00:00Z',
      },
      {
        id: 'sess-4',
        tenantId: 't-1',
        label: 'Examens semestriels',
        type: 'EXAM_PERIOD',
        startDate: '2025-01-13',
        endDate: '2025-01-24',
        status: 'CLOSED',
        createdAt: '2024-11-01T00:00:00Z',
      },
      {
        id: 'sess-5',
        tenantId: 't-1',
        label: 'Année 2025-2026',
        type: 'YEAR',
        startDate: '2025-09-01',
        endDate: '2026-07-03',
        status: 'UPCOMING',
        createdAt: '2025-03-10T00:00:00Z',
      },
    ];
  }
}
