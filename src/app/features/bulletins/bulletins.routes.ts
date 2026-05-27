import { Routes } from '@angular/router';

export const BULLETINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/bulletins-list/bulletins-list.component')
        .then(m => m.BulletinsListComponent),
  },
  {
    path: 'deliberations',
    loadComponent: () =>
      import('./pages/deliberations-list/deliberations-list.component')
        .then(m => m.DeliberationsListComponent),
  },
  {
    path: 'deliberations/:id',
    loadComponent: () =>
      import('./pages/deliberation-detail/deliberation-detail.component')
        .then(m => m.DeliberationDetailComponent),
  },
];
