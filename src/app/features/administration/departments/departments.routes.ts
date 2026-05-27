import { Routes } from '@angular/router';

export const DEPARTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./departments.page').then((m) => m.DepartmentsPage),
  },
];
