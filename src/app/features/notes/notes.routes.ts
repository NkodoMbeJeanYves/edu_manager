import { Routes } from '@angular/router';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/evaluations-list/evaluations-list.component')
        .then(m => m.EvaluationsListComponent),
  },
  {
    path: 'moyennes',
    loadComponent: () =>
      import('./pages/moyennes-classe/moyennes-classe.component')
        .then(m => m.MoyennesClasseComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/saisie-notes/saisie-notes.component')
        .then(m => m.SaisieNotesComponent),
  },
];
