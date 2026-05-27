import { Routes } from '@angular/router';

export const SESSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sessions.page').then((m) => m.SessionsPage),
  },
];
