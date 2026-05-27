import { Routes } from '@angular/router';

export const TEACHERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./teachers.page').then((m) => m.TeachersPage),
  },
];
