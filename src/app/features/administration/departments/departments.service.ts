import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Department, DepartmentDraft } from './models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  list(): Observable<Department[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: DepartmentDraft): Observable<Department> {
    const d: Department = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      createdAt: new Date().toISOString(),
    };
    return of(d).pipe(delay(150));
  }

  update(id: string, draft: DepartmentDraft): Observable<Department> {
    const existing = this.seed().find((d) => d.id === id);
    const merged: Department = {
      ...(existing ?? { id, tenantId: 't-1', createdAt: new Date().toISOString() }),
      ...draft,
    } as Department;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Department[] {
    return [
      {
        id: 'd-1', tenantId: 't-1', name: 'Sciences exactes', code: 'SCI',
        description: 'Mathématiques, physique, chimie, informatique.',
        managerName: 'Camille Dupont', staffCount: 12, status: 'ACTIVE',
        createdAt: '2020-09-01T00:00:00Z',
      },
      {
        id: 'd-2', tenantId: 't-1', name: 'Lettres et sciences humaines', code: 'LSH',
        description: 'Français, anglais, philosophie, histoire-géographie.',
        managerName: 'Robert Tremblay', staffCount: 9, status: 'ACTIVE',
        createdAt: '2020-09-01T00:00:00Z',
      },
      {
        id: 'd-3', tenantId: 't-1', name: 'Vie scolaire', code: 'VSC',
        description: 'Accueil, surveillance, accompagnement social.',
        managerName: 'Marie Lefebvre', staffCount: 6, status: 'ACTIVE',
        createdAt: '2020-09-01T00:00:00Z',
      },
      {
        id: 'd-4', tenantId: 't-1', name: 'Scolarité', code: 'SCO',
        description: 'Inscriptions, dossiers, bulletins, archives.',
        managerName: 'Aïcha Bernard', staffCount: 4, status: 'ACTIVE',
        createdAt: '2020-09-01T00:00:00Z',
      },
      {
        id: 'd-5', tenantId: 't-1', name: 'Sport', code: 'EPS',
        description: 'Éducation physique et activités sportives.',
        managerName: '—', staffCount: 0, status: 'INACTIVE',
        createdAt: '2018-09-01T00:00:00Z',
      },
    ];
  }
}
