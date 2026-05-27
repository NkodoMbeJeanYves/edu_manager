import { Routes } from '@angular/router';

export const ENSEIGNANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/enseignants-list/enseignants-list.component')
        .then(m => m.EnseignantsListComponent),
  },
];
