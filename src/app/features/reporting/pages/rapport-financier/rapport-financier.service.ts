import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { RapportFinancier } from './models/rapport-financier.model';

@Injectable({ providedIn: 'root' })
export class RapportFinancierService {
  load(): Observable<RapportFinancier> { return of(this.seed()).pipe(delay(200)); }

  private seed(): RapportFinancier {
    return {
      periodLabel: 'Année 2024-2025',
      currency: 'EUR',
      totalExpected: 2_480_000,
      totalRecovered: 2_052_800,
      recoveryRate: 82.8,
      outstanding: 427_200,
      monthly: [
        { month: 'Sep', expected: 800_000, recovered: 720_000 },
        { month: 'Oct', expected: 200_000, recovered: 180_000 },
        { month: 'Nov', expected: 180_000, recovered: 170_000 },
        { month: 'Dec', expected: 160_000, recovered: 145_000 },
        { month: 'Jan', expected: 700_000, recovered: 580_000 },
        { month: 'Feb', expected: 180_000, recovered: 130_000 },
        { month: 'Mar', expected: 140_000, recovered: 75_000 },
        { month: 'Apr', expected: 120_000, recovered: 52_800 },
      ],
      byFiliere: [
        { filiere: 'Sciences (Bac S)', expected: 720_000, recovered: 640_000, rate: 88.9 },
        { filiere: 'Lettres (Bac L)', expected: 580_000, recovered: 484_000, rate: 83.4 },
        { filiere: 'Économique (Bac ES)', expected: 540_000, recovered: 432_000, rate: 80.0 },
        { filiere: 'Licence Informatique', expected: 380_000, recovered: 304_000, rate: 80.0 },
        { filiere: 'Master Management', expected: 260_000, recovered: 192_800, rate: 74.2 },
      ],
      byMethod: [
        { method: 'Bank transfer', amount: 1_232_000, share: 60.0 },
        { method: 'Card',          amount: 410_500,   share: 20.0 },
        { method: 'Cash',          amount: 246_300,   share: 12.0 },
        { method: 'Mobile money',  amount: 123_200,   share:  6.0 },
        { method: 'Check',         amount: 40_800,    share:  2.0 },
      ],
      topDebtors: [
        { name: 'Sofia Martinez', registrationNumber: 'STU-2022-009', outstanding: 4500 },
        { name: 'Marcus Lee',     registrationNumber: 'STU-2023-014', outstanding: 3200 },
        { name: 'David Cohen',    registrationNumber: 'STU-2023-022', outstanding: 2800 },
        { name: 'Lina Moreau',    registrationNumber: 'STU-2024-018', outstanding: 2500 },
        { name: 'Karim Benali',   registrationNumber: 'STU-2023-007', outstanding: 2100 },
      ],
    };
  }
}
