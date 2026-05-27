import { Routes } from '@angular/router';

export const STRUCTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/structure-tree/structure-tree.component')
        .then(m => m.StructureTreeComponent),
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./pages/classes-list/classes-list.component')
        .then(m => m.ClassesListComponent),
  },
];
