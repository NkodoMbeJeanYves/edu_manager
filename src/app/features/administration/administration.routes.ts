import { Routes } from '@angular/router';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.routes').then((m) => m.ROLES_ROUTES),
  },
  {
    path: 'departments',
    loadChildren: () => import('./departments/departments.routes').then((m) => m.DEPARTMENTS_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
];
