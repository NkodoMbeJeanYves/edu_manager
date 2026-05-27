import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Notification } from './models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  list(): Observable<Notification[]> { return of(this.seed()).pipe(delay(200)); }

  markRead(id: string): Observable<void> { return of(void id).pipe(delay(80)); }
  markAllRead(): Observable<void> { return of(undefined).pipe(delay(120)); }

  private seed(): Notification[] {
    return [
      {
        id: 'n-1', tenantId: 't-1', type: 'GRADE',
        title: 'Nouvelle note publiée — Mathématiques',
        body: 'La note de la Composition de Mathématiques (Trimestre 2) est disponible.',
        status: 'UNREAD', createdAt: '2025-05-26T08:14:00Z',
      },
      {
        id: 'n-2', tenantId: 't-1', type: 'ABSENCE',
        title: 'Absence enregistrée — Marcus Lee',
        body: 'Absence de 2h en Sciences physiques le 26/05/2025. Notification parent envoyée.',
        status: 'UNREAD', createdAt: '2025-05-26T10:02:00Z',
      },
      {
        id: 'n-3', tenantId: 't-1', type: 'PAYMENT',
        title: 'Paiement reçu — INV-2025-0033',
        body: 'Paiement de 1 500 € reçu pour la facture INV-2025-0033 (Alice Johnson).',
        status: 'READ', createdAt: '2025-05-25T17:32:00Z',
      },
      {
        id: 'n-4', tenantId: 't-1', type: 'EXAM',
        title: 'Convocations envoyées — Session normale Trim. 2',
        body: '142 convocations ont été générées et envoyées pour la session du 19/05.',
        status: 'READ', createdAt: '2025-05-15T14:18:00Z',
      },
      {
        id: 'n-5', tenantId: 't-1', type: 'ANNOUNCEMENT',
        title: 'Annonce — Conseil de classe Term. S',
        body: 'Le conseil de classe Terminale S aura lieu le 03/06 à 17h.',
        status: 'READ', createdAt: '2025-05-22T09:45:00Z',
      },
      {
        id: 'n-6', tenantId: 't-1', type: 'SYSTEM',
        title: 'Sauvegarde quotidienne effectuée',
        body: 'La sauvegarde de la base a été effectuée à 03:00 UTC. Taille : 1.2 GB.',
        status: 'READ', createdAt: '2025-05-26T03:00:00Z',
      },
    ];
  }
}
