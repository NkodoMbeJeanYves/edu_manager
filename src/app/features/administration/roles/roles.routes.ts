import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./roles.page').then((m) => m.RolesPage),
  },
];
