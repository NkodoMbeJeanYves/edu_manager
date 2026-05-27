import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { TimetableSlot, TimetableSlotDraft } from './models/timetable.model';

@Injectable({ providedIn: 'root' })
export class TimetableService {
  list(): Observable<TimetableSlot[]> {
    return of(this.seed()).pipe(delay(200));
  }

  create(draft: TimetableSlotDraft): Observable<TimetableSlot> {
    const slot: TimetableSlot = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      createdAt: new Date().toISOString(),
    };
    return of(slot).pipe(delay(150));
  }

  update(id: string, draft: TimetableSlotDraft): Observable<TimetableSlot> {
    const existing = this.seed().find((s) => s.id === id);
    const merged: TimetableSlot = {
      ...(existing ?? { id, tenantId: 't-1', createdAt: new Date().toISOString() }),
      ...draft,
    } as TimetableSlot;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> {
    return of(void id).pipe(delay(100));
  }

  private seed(): TimetableSlot[] {
    return [
      {
        id: 'slot-1',
        tenantId: 't-1',
        day: 'MONDAY',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Mathématiques',
        teacherName: 'Camille Dupont',
        classGroup: 'Terminale S',
        room: 'B-201',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'slot-2',
        tenantId: 't-1',
        day: 'MONDAY',
        startTime: '10:15',
        endTime: '12:15',
        subject: 'Sciences physiques',
        teacherName: 'Idrissa Diallo',
        classGroup: 'Terminale S',
        room: 'Labo-3',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'slot-3',
        tenantId: 't-1',
        day: 'TUESDAY',
        startTime: '09:00',
        endTime: '10:30',
        subject: 'Anglais',
        teacherName: 'Léa Moreau',
        classGroup: 'Première L',
        room: 'A-105',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'slot-4',
        tenantId: 't-1',
        day: 'WEDNESDAY',
        startTime: '14:00',
        endTime: '16:00',
        subject: 'Histoire-Géographie',
        teacherName: 'Robert Tremblay',
        classGroup: 'Première L',
        room: 'A-302',
        createdAt: '2024-09-01T00:00:00Z',
      },
      {
        id: 'slot-5',
        tenantId: 't-1',
        day: 'FRIDAY',
        startTime: '13:00',
        endTime: '15:00',
        subject: 'Mathématiques',
        teacherName: 'Camille Dupont',
        classGroup: 'Première S',
        room: 'B-201',
        createdAt: '2024-09-01T00:00:00Z',
      },
    ];
  }
}
