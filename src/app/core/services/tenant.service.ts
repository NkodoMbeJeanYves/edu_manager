import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Tenant } from '@core/models/tenant.model';
import { TenantStore } from '@core/stores/tenant.store';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(TenantStore);

  loadAvailable(): Observable<Tenant[]> {
    return this.mockTenants().pipe(tap((list) => this.store.setAvailable(list)));
  }

  select(tenant: Tenant): void {
    this.store.select(tenant);
  }

  private mockTenants(): Observable<Tenant[]> {
    return of([
      { id: 't-1', code: 'GREEN-SCH', name: 'Green Valley School', type: 'SCHOOL', active: true },
      { id: 't-2', code: 'MIT-UNI', name: 'Metropolitan University', type: 'UNIVERSITY', active: true },
      { id: 't-3', code: 'EDU-MIX', name: 'EduCampus (K-12 + Higher)', type: 'MIXED', active: true },
    ]);
  }
}
