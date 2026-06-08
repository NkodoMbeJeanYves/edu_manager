import { Injectable, computed, inject, signal } from '@angular/core';
import { Role, RoleDraft, RoleFilter } from './models/role.model';
import { RolesService } from './roles.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class RolesStore {
  private readonly service = inject(RolesService);

  private readonly _all = signal<Role[]>([]);
  private readonly _items = signal<Role[]>([]);
  private readonly _filter = signal<RoleFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<Role[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._all().filter((r) => {
      if (filter.scope && r.scope !== filter.scope) return false;
      if (search) {
        const haystack = `${r.name} ${r.code} ${r.description}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._all.set(list); this.refresh(); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load roles'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<RoleFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
    this.pagination.reset();
    this.refresh();
  }

  goToPage(page: number): void {
    this.pagination.goTo(page);
    this.refresh();
  }

  private refresh(): void {
    const { data, meta } = paginateClient(this._filteredAll(), this.pagination.request());
    this._items.set(data);
    this.pagination.setMeta(meta);
  }

  create(draft: RoleDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => { this._all.update((list) => [created, ...list]); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: RoleDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => { this._all.update((list) => list.map((r) => (r.id === id ? updated : r))); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => { this._all.update((list) => list.filter((r) => r.id !== id)); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
