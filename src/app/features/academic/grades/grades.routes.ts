import { Routes } from '@angular/router';

export const GRADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./grades.page').then((m) => m.GradesPage),
  },
];
