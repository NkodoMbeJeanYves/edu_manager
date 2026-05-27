import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { RapportPedagogique } from './models/rapport-pedagogique.model';

@Injectable({ providedIn: 'root' })
export class RapportPedagogiqueService {
  load(): Observable<RapportPedagogique> { return of(this.seed()).pipe(delay(200)); }

  private seed(): RapportPedagogique {
    return {
      periodLabel: 'Trimestre 2 — 2024-2025',
      classLabel: 'Terminale S',
      overallAverage: 13.2,
      passRate: 81,
      totalStudents: 32,
      bySubject: [
        { subject: 'Mathématiques', average: 12.4, passRate: 72, enrolled: 32 },
        { subject: 'Sciences physiques', average: 13.1, passRate: 78, enrolled: 32 },
        { subject: 'Sciences de la vie et de la Terre', average: 14.2, passRate: 91, enrolled: 32 },
        { subject: 'Anglais', average: 13.8, passRate: 85, enrolled: 32 },
        { subject: 'Histoire-Géographie', average: 12.9, passRate: 80, enrolled: 32 },
        { subject: 'Philosophie', average: 11.8, passRate: 68, enrolled: 32 },
      ],
      topPerformers: [
        { name: 'Alice Johnson', classGroup: 'Terminale S', average: 17.4 },
        { name: 'Léo Bernard', classGroup: 'Terminale S', average: 16.9 },
        { name: 'Nour El-Khaled', classGroup: 'Terminale S', average: 16.2 },
        { name: 'Marie Dubois', classGroup: 'Terminale S', average: 15.8 },
        { name: 'Thomas Petit', classGroup: 'Terminale S', average: 15.5 },
      ],
      inDifficulty: [
        { name: 'Marcus Lee', classGroup: 'Terminale S', average: 8.4 },
        { name: 'Sophie Garcia', classGroup: 'Terminale S', average: 8.9 },
        { name: 'Karim Benali', classGroup: 'Terminale S', average: 9.2 },
        { name: 'Lina Moreau', classGroup: 'Terminale S', average: 9.6 },
      ],
    };
  }
}
