import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademicSession, AcademicSessionDraft, SessionFilter } from './models/session.model';
import { SessionsService } from './sessions.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class SessionsStore {
  private readonly service = inject(SessionsService);

  private readonly _all = signal<AcademicSession[]>([]);
  private readonly _items = signal<AcademicSession[]>([]);
  private readonly _filter = signal<SessionFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<AcademicSession[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._all().filter((s) => {
      if (filter.type && s.type !== filter.type) return false;
      if (filter.status && s.status !== filter.status) return false;
      if (search && !s.label.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.list().subscribe({
      next: (list) => {
        this._all.set(list);
        this.refresh();
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.message ?? 'Failed to load sessions');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<SessionFilter>): void {
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

  create(draft: AcademicSessionDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => {
        this._all.update((list) => [created, ...list]);
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: AcademicSessionDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => {
        this._all.update((list) => list.map((s) => (s.id === id ? updated : s)));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => {
        this._all.update((list) => list.filter((s) => s.id !== id));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
