import { Routes } from '@angular/router';

export const ETABLISSEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/etablissements-list/etablissements-list.component')
        .then(m => m.EtablissementsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/etablissement-detail/etablissement-detail.component')
        .then(m => m.EtablissementDetailComponent),
  },
];
