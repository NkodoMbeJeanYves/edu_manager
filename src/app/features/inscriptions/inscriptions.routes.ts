import { Routes } from '@angular/router';

export const INSCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inscriptions-list/inscriptions-list.component')
        .then(m => m.InscriptionsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/inscription-detail/inscription-detail.component')
        .then(m => m.InscriptionDetailComponent),
  },
];
