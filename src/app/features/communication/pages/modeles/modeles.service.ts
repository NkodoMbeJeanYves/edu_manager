import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Modele, ModeleDraft } from './models/modele.model';

@Injectable({ providedIn: 'root' })
export class ModelesService {
  list(): Observable<Modele[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: ModeleDraft): Observable<Modele> {
    const m: Modele = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      updatedAt: new Date().toISOString(),
    };
    return of(m).pipe(delay(150));
  }

  update(id: string, draft: ModeleDraft): Observable<Modele> {
    const existing = this.seed().find((m) => m.id === id);
    const merged: Modele = {
      ...(existing ?? { id, tenantId: 't-1', updatedAt: new Date().toISOString() }),
      ...draft,
      updatedAt: new Date().toISOString(),
    } as Modele;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Modele[] {
    return [
      {
        id: 'tpl-1', tenantId: 't-1',
        name: 'Notification absence — Email parents',
        type: 'EMAIL', event: 'ABSENCE',
        subject: 'Absence de {{student_name}} — {{date}}',
        body: 'Bonjour {{parent_name}},\n\nNous vous informons que {{student_name}} a été absent(e) le {{date}} en cours de {{subject}}.\n\nMerci de nous transmettre un justificatif sous 48h.\n\nCordialement,\n{{school_name}}',
        active: true, updatedAt: '2025-04-12T10:14:00Z',
      },
      {
        id: 'tpl-2', tenantId: 't-1',
        name: 'Publication des notes — SMS apprenant',
        type: 'SMS', event: 'GRADE_PUBLISHED',
        subject: '',
        body: '{{school_name}} : votre note de {{subject}} ({{evaluation_type}}) est disponible : {{score}}/{{max_score}}.',
        active: true, updatedAt: '2025-03-28T09:20:00Z',
      },
      {
        id: 'tpl-3', tenantId: 't-1',
        name: 'Confirmation paiement reçu',
        type: 'EMAIL', event: 'PAYMENT_RECEIVED',
        subject: 'Reçu de paiement n° {{receipt_number}}',
        body: 'Bonjour,\n\nNous accusons réception de votre paiement de {{amount}} {{currency}} pour la facture {{invoice_number}}.\n\nReçu n° {{receipt_number}}.\n\nMerci.',
        active: true, updatedAt: '2025-02-10T15:30:00Z',
      },
      {
        id: 'tpl-4', tenantId: 't-1',
        name: 'Convocation à un examen',
        type: 'EMAIL', event: 'EXAM_CONVOCATION',
        subject: 'Convocation — {{exam_label}}',
        body: 'Vous êtes convoqué(e) à l\'épreuve de {{subject}} le {{date}} à {{start_time}}, salle {{room}}.\n\nMerci de vous présenter 15 minutes avant le début.',
        active: true, updatedAt: '2025-04-08T11:00:00Z',
      },
      {
        id: 'tpl-5', tenantId: 't-1',
        name: 'Annonce générale',
        type: 'PUSH', event: 'GENERAL',
        subject: '{{title}}',
        body: '{{body}}',
        active: false, updatedAt: '2024-12-05T08:00:00Z',
      },
    ];
  }
}
