import { Routes } from '@angular/router';

export const EXAMENS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sessions-list/sessions-list.component')
        .then(m => m.SessionsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/session-detail/session-detail.component')
        .then(m => m.SessionDetailComponent),
  },
];
