import { Injectable, computed, inject, signal } from '@angular/core';
import { Role, RoleDraft, RoleFilter } from './models/role.model';
import { RolesService } from './roles.service';

@Injectable()
export class RolesStore {
  private readonly service = inject(RolesService);

  private readonly _items = signal<Role[]>([]);
  private readonly _filter = signal<RoleFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Role[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((r) => {
      if (filter.scope && r.scope !== filter.scope) return false;
      if (search) {
        const haystack = `${r.name} ${r.code} ${r.description}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._items.set(list); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load roles'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<RoleFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: RoleDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: RoleDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((r) => (r.id === id ? updated : r))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((r) => r.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
