import { Routes } from '@angular/router';

export const REFERENTIEL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/referentiel-list/referentiel-list.component')
        .then(m => m.ReferentielListComponent),
  },
];
