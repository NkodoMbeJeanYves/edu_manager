import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Annonce, AnnonceDraft } from './models/annonce.model';

@Injectable({ providedIn: 'root' })
export class AnnoncesService {
  list(): Observable<Annonce[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: AnnonceDraft): Observable<Annonce> {
    const a: Annonce = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      publishedAt: new Date().toISOString(),
    };
    return of(a).pipe(delay(150));
  }

  update(id: string, draft: AnnonceDraft): Observable<Annonce> {
    const existing = this.seed().find((a) => a.id === id);
    const merged: Annonce = {
      ...(existing ?? { id, tenantId: 't-1', publishedAt: new Date().toISOString() }),
      ...draft,
    } as Annonce;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Annonce[] {
    return [
      {
        id: 'a-1', tenantId: 't-1',
        title: 'Fermeture exceptionnelle — 30 mai',
        body: 'L\'établissement sera fermé le vendredi 30 mai pour journée pédagogique.',
        audience: 'ALL', pinned: true,
        publishedAt: '2025-05-20T10:00:00Z',
        publishedBy: 'Aïcha Bernard',
      },
      {
        id: 'a-2', tenantId: 't-1',
        title: 'Session d\'examens — calendrier 2025',
        body: 'Le calendrier des sessions d\'examens 2025 est disponible dans l\'espace scolarité.',
        audience: 'STUDENTS', pinned: true,
        publishedAt: '2025-04-08T09:00:00Z',
        publishedBy: 'Direction pédagogique',
      },
      {
        id: 'a-3', tenantId: 't-1',
        title: 'Conseil pédagogique 5 juin',
        body: 'Le prochain conseil pédagogique aura lieu mercredi 5 juin à 17h en salle B-201.',
        audience: 'TEACHERS', pinned: false,
        publishedAt: '2025-05-22T08:00:00Z',
        publishedBy: 'Aïcha Bernard',
      },
      {
        id: 'a-4', tenantId: 't-1',
        title: 'Réunion parents-professeurs — Trimestre 2',
        body: 'La réunion parents-professeurs Trimestre 2 est prévue le samedi 14 juin de 9h à 12h.',
        audience: 'PARENTS', pinned: false,
        publishedAt: '2025-05-15T14:30:00Z',
        publishedBy: 'Direction pédagogique',
      },
    ];
  }
}
