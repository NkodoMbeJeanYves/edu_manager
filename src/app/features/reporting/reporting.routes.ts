import { Routes } from '@angular/router';

export const REPORTING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tableau-bord/tableau-bord.component')
        .then(m => m.TableauBordComponent),
  },
  {
    path: 'pedagogique',
    loadComponent: () =>
      import('./pages/rapport-pedagogique/rapport-pedagogique.component')
        .then(m => m.RapportPedagogiqueComponent),
  },
  {
    path: 'absenteisme',
    loadComponent: () =>
      import('./pages/rapport-absenteisme/rapport-absenteisme.component')
        .then(m => m.RapportAbsenteismeComponent),
  },
  {
    path: 'financier',
    loadComponent: () =>
      import('./pages/rapport-financier/rapport-financier.component')
        .then(m => m.RapportFinancierComponent),
  },
];
