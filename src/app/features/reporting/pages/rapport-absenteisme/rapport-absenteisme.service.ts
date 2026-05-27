import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { RapportAbsenteisme } from './models/rapport-absenteisme.model';

@Injectable({ providedIn: 'root' })
export class RapportAbsenteismeService {
  load(): Observable<RapportAbsenteisme> { return of(this.seed()).pipe(delay(200)); }

  private seed(): RapportAbsenteisme {
    return {
      periodLabel: 'Trimestre 2 — 2024-2025',
      overallRate: 6.8,
      totalHours: 2148,
      justifiedRate: 64,
      topAbsents: [
        { name: 'Karim Benali', classGroup: 'Terminale S', hours: 48, rate: 14.2 },
        { name: 'Sophie Garcia', classGroup: 'Première L', hours: 42, rate: 12.8 },
        { name: 'Marcus Lee', classGroup: 'Terminale S', hours: 38, rate: 11.6 },
        { name: 'Lina Moreau', classGroup: 'Première S', hours: 34, rate: 10.4 },
        { name: 'David Cohen', classGroup: 'Terminale L', hours: 30, rate: 9.2 },
      ],
      weekly: [
        { week: 'S05', rate: 5.2 },
        { week: 'S06', rate: 6.1 },
        { week: 'S07', rate: 5.8 },
        { week: 'S08', rate: 7.4 },
        { week: 'S09', rate: 6.9 },
        { week: 'S10', rate: 8.2 },
        { week: 'S11', rate: 7.5 },
        { week: 'S12', rate: 6.4 },
      ],
      byDay: [
        { day: 'Mon', rate: 5.8 },
        { day: 'Tue', rate: 6.4 },
        { day: 'Wed', rate: 7.2 },
        { day: 'Thu', rate: 6.1 },
        { day: 'Fri', rate: 8.9 },
        { day: 'Sat', rate: 9.4 },
      ],
    };
  }
}
