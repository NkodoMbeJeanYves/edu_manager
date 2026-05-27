import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: 'payments',
    loadChildren: () => import('./payments/payments.routes').then((m) => m.PAYMENTS_ROUTES),
  },
  {
    path: 'invoices',
    loadChildren: () => import('./invoices/invoices.routes').then((m) => m.INVOICES_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'payments' },
];
