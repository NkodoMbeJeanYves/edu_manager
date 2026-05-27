import { Routes } from '@angular/router';

export const ABSENCES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/absences-list/absences-list.component')
        .then(m => m.AbsencesListComponent),
  },
  {
    path: 'appel/:seanceId',
    loadComponent: () =>
      import('./pages/appel/appel.component')
        .then(m => m.AppelComponent),
  },
  {
    path: 'alertes',
    loadComponent: () =>
      import('./pages/alertes-absenteisme/alertes-absenteisme.component')
        .then(m => m.AlertesAbsenteismeComponent),
  },
];
