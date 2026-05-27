import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Dashboard } from './models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  load(): Observable<Dashboard> { return of(this.seed()).pipe(delay(200)); }

  private seed(): Dashboard {
    return {
      periodLabel: 'Trimestre 2 — 2024-2025',
      effectives: [
        { id: 'tot', label: 'Total apprenants', value: 1248, trend: 3.2 },
        { id: 'act', label: 'Actifs', value: 1192, trend: 2.8 },
        { id: 'sec', label: 'Scolaires', value: 720 },
        { id: 'uni', label: 'Universitaires', value: 472 },
        { id: 'new', label: 'Nouveaux inscrits', value: 56, trend: 14.3 },
      ],
      pedagogy: [
        { id: 'r', label: 'Taux de réussite', value: 78, unit: '%', trend: 2.1 },
        { id: 'm', label: 'Moyenne générale', value: 13.4, unit: '/20', trend: 0.4 },
        { id: 'a', label: "Taux d'absentéisme", value: 6.8, unit: '%', trend: -1.2 },
        { id: 's', label: 'Séances réalisées', value: 4528, trend: -0.5 },
        { id: 'edt', label: 'Couverture EDT', value: 96, unit: '%' },
        { id: 'b', label: 'Bulletins publiés', value: 1180 },
      ],
      finance: [
        { id: 'att', label: 'Total attendu', value: '2 480 000 €' },
        { id: 'rec', label: 'Total recouvré', value: '2 052 800 €' },
        { id: 'tx',  label: 'Taux de recouvrement', value: 82.8, unit: '%', trend: 4.1 },
        { id: 'enc', label: 'En cours', value: '427 200 €' },
        { id: 'ret', label: 'Dossiers en retard', value: 38 },
      ],
      alerts: [
        {
          id: 'al-1', level: 'CRITICAL', module: 'Finance',
          message: '38 dossiers en retard de paiement (>30j). 14 apprenants risquent un blocage de services.',
        },
        {
          id: 'al-2', level: 'WARNING', module: 'Absences',
          message: '7 apprenants dépassent le seuil de 30h d\'absences injustifiées sur le trimestre.',
        },
        {
          id: 'al-3', level: 'WARNING', module: 'Pédagogie',
          message: 'Le taux de réussite en Mathématiques (Terminale S) est de 54%, sous la cible (70%).',
        },
        {
          id: 'al-4', level: 'INFO', module: 'EDT',
          message: 'La couverture EDT est de 96% : 2 séances de Sciences physiques restent à programmer.',
        },
      ],
    };
  }
}
