import { Injectable, computed, signal } from '@angular/core';
import { Tenant } from '@core/models/tenant.model';

const STORAGE_KEY = 'edu.tenant';

@Injectable({ providedIn: 'root' })
export class TenantStore {
  private readonly _current = signal<Tenant | null>(this.restore());
  private readonly _available = signal<Tenant[]>([]);

  readonly current = this._current.asReadonly();
  readonly available = this._available.asReadonly();

  readonly tenantId = computed(() => this._current()?.id ?? null);
  readonly hasTenant = computed(() => this._current() !== null);
  readonly isUniversity = computed(() => {
    const t = this._current();
    return t?.type === 'UNIVERSITY' || t?.type === 'MIXED';
  });

  setAvailable(tenants: Tenant[]): void {
    this._available.set(tenants);
  }

  select(tenant: Tenant): void {
    this._current.set(tenant);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenant));
  }

  clear(): void {
    this._current.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private restore(): Tenant | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Tenant;
    } catch {
      return null;
    }
  }
}
