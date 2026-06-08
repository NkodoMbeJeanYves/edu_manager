import { Injectable, computed, inject, signal } from '@angular/core';
import { Department, DepartmentDraft, DepartmentFilter } from './models/department.model';
import { DepartmentsService } from './departments.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class DepartmentsStore {
  private readonly service = inject(DepartmentsService);

  private readonly _all = signal<Department[]>([]);
  private readonly _items = signal<Department[]>([]);
  private readonly _filter = signal<DepartmentFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<Department[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._all().filter((d) => {
      if (filter.status && d.status !== filter.status) return false;
      if (search) {
        const haystack = `${d.name} ${d.code} ${d.managerName} ${d.description}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._all.set(list); this.refresh(); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load departments'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<DepartmentFilter>): void {
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

  create(draft: DepartmentDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => { this._all.update((list) => [created, ...list]); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: DepartmentDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => { this._all.update((list) => list.map((d) => (d.id === id ? updated : d))); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => { this._all.update((list) => list.filter((d) => d.id !== id)); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
