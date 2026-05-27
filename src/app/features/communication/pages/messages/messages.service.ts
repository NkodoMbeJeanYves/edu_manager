import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Message, MessageDraft } from './models/message.model';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  list(): Observable<Message[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: MessageDraft): Observable<Message> {
    const m: Message = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      read: false,
      sentAt: new Date().toISOString(),
    };
    return of(m).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Message[] {
    return [
      {
        id: 'm-1', tenantId: 't-1', folder: 'INBOX',
        fromName: 'Camille Dupont', toName: 'Direction',
        subject: 'Demande de salle supplémentaire — Examens',
        body: 'Bonjour, pourriez-vous prévoir une salle supplémentaire pour la session du 19 mai ?',
        priority: 'HIGH', read: false, sentAt: '2025-05-26T09:14:00Z',
      },
      {
        id: 'm-2', tenantId: 't-1', folder: 'INBOX',
        fromName: 'Patrick Morel', toName: 'Scolarité',
        subject: 'Justificatif absence de mon fils',
        body: 'Bonjour, veuillez trouver ci-joint le certificat médical pour l\'absence du 24/05.',
        priority: 'NORMAL', read: false, sentAt: '2025-05-25T16:42:00Z',
      },
      {
        id: 'm-3', tenantId: 't-1', folder: 'INBOX',
        fromName: 'Léa Moreau', toName: 'Direction pédagogique',
        subject: 'Programme révisé — Anglais Première L',
        body: 'Voici la version révisée du programme d\'anglais pour la classe de Première L.',
        priority: 'NORMAL', read: true, sentAt: '2025-05-20T11:30:00Z',
      },
      {
        id: 'm-4', tenantId: 't-1', folder: 'SENT',
        fromName: 'Direction', toName: 'Tous les enseignants',
        subject: 'Conseil pédagogique 5 juin',
        body: 'Le prochain conseil pédagogique aura lieu le mercredi 5 juin à 17h en salle B-201.',
        priority: 'NORMAL', read: true, sentAt: '2025-05-22T08:00:00Z',
      },
      {
        id: 'm-5', tenantId: 't-1', folder: 'SENT',
        fromName: 'Scolarité', toName: 'Patrick Morel',
        subject: 'Réception de votre justificatif',
        body: 'Nous avons bien reçu votre justificatif. L\'absence sera marquée comme justifiée.',
        priority: 'NORMAL', read: true, sentAt: '2025-05-25T17:12:00Z',
      },
    ];
  }
}
