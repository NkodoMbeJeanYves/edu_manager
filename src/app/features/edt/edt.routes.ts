import { Routes } from '@angular/router';

export const EDT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/edt-calendrier/edt-calendrier.component')
        .then(m => m.EdtCalendrierComponent),
  },
  {
    path: 'couverture',
    loadComponent: () =>
      import('./pages/edt-couverture/edt-couverture.component')
        .then(m => m.EdtCouvertureComponent),
  },
];
