import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { tenantGuard } from '@core/guards/tenant.guard';
import { roleGuard } from '@core/guards/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'select-tenant',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/tenant-select/tenant-select.page').then((m) => m.TenantSelectPage),
  },
  {
    path: '',
    canActivate: [authGuard, tenantGuard],
    loadComponent: () =>
      import('@layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'academic/students' },
      {
        path: 'acces-refuse',
        loadComponent: () =>
          import('@features/acces-refuse/acces-refuse.page').then((m) => m.AccesRefusePage),
      },
      {
        path: 'academic',
        canActivate: [roleGuard],
        data: { module: 'academic' },
        loadChildren: () =>
          import('@features/academic/academic.routes').then((m) => m.ACADEMIC_ROUTES),
      },
      {
        path: 'administration',
        canActivate: [roleGuard],
        data: { module: 'administration' },
        loadChildren: () =>
          import('@features/administration/administration.routes').then((m) => m.ADMINISTRATION_ROUTES),
      },
      {
        path: 'finance',
        canActivate: [roleGuard],
        data: { module: 'finance' },
        loadChildren: () =>
          import('@features/finance/finance.routes').then((m) => m.FINANCE_ROUTES),
      },
      {
        path: 'etablissements',
        canActivate: [roleGuard],
        data: { module: 'etablissements' },
        loadChildren: () =>
          import('@features/etablissements/etablissements.routes').then((m) => m.ETABLISSEMENTS_ROUTES),
      },
      {
        path: 'inscriptions',
        canActivate: [roleGuard],
        data: { module: 'inscriptions' },
        loadChildren: () =>
          import('@features/inscriptions/inscriptions.routes').then((m) => m.INSCRIPTIONS_ROUTES),
      },
      {
        path: 'notes',
        canActivate: [roleGuard],
        data: { module: 'notes' },
        loadChildren: () =>
          import('@features/notes/notes.routes').then((m) => m.NOTES_ROUTES),
      },
      {
        path: 'bulletins',
        canActivate: [roleGuard],
        data: { module: 'bulletins' },
        loadChildren: () =>
          import('@features/bulletins/bulletins.routes').then((m) => m.BULLETINS_ROUTES),
      },
      {
        path: 'structure',
        canActivate: [roleGuard],
        data: { module: 'structure' },
        loadChildren: () =>
          import('@features/structure/structure.routes').then((m) => m.STRUCTURE_ROUTES),
      },
      {
        path: 'referentiel',
        canActivate: [roleGuard],
        data: { module: 'referentiel' },
        loadChildren: () =>
          import('@features/referentiel/referentiel.routes').then((m) => m.REFERENTIEL_ROUTES),
      },
      {
        path: 'edt',
        canActivate: [roleGuard],
        data: { module: 'edt' },
        loadChildren: () =>
          import('@features/edt/edt.routes').then((m) => m.EDT_ROUTES),
      },
      {
        path: 'absences',
        canActivate: [roleGuard],
        data: { module: 'absences' },
        loadChildren: () =>
          import('@features/absences/absences.routes').then((m) => m.ABSENCES_ROUTES),
      },
      {
        path: 'enseignants',
        canActivate: [roleGuard],
        data: { module: 'enseignants' },
        loadChildren: () =>
          import('@features/enseignants/enseignants.routes').then((m) => m.ENSEIGNANTS_ROUTES),
      },
      {
        path: 'examens',
        canActivate: [roleGuard],
        data: { module: 'examens' },
        loadChildren: () =>
          import('@features/examens/examens.routes').then((m) => m.EXAMENS_ROUTES),
      },
      {
        path: 'communication',
        canActivate: [roleGuard],
        data: { module: 'communication' },
        loadChildren: () =>
          import('@features/communication/communication.routes').then((m) => m.COMMUNICATION_ROUTES),
      },
      {
        path: 'reporting',
        canActivate: [roleGuard],
        data: { module: 'reporting' },
        loadChildren: () =>
          import('@features/reporting/reporting.routes').then((m) => m.REPORTING_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
