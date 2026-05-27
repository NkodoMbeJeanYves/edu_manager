import { Routes } from '@angular/router';

export const COMMUNICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/notifications/notifications.component')
        .then(m => m.NotificationsComponent),
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('./pages/messages/messages.component')
        .then(m => m.MessagesComponent),
  },
  {
    path: 'annonces',
    loadComponent: () =>
      import('./pages/annonces/annonces.component')
        .then(m => m.AnnoncesComponent),
  },
  {
    path: 'modeles',
    loadComponent: () =>
      import('./pages/modeles/modeles.component')
        .then(m => m.ModelesComponent),
  },
];
