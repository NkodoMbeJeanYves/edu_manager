import { Routes } from '@angular/router';

export const TIMETABLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./timetable.page').then((m) => m.TimetablePage),
  },
];
