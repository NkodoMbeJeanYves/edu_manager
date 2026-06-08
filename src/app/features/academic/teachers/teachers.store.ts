import { Injectable, computed, inject, signal } from '@angular/core';
import { Teacher, TeacherDraft, TeacherFilter } from './models/teacher.model';
import { TeachersService } from './teachers.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class TeachersStore {
  private readonly service = inject(TeachersService);

  private readonly _all = signal<Teacher[]>([]);
  private readonly _items = signal<Teacher[]>([]);
  private readonly _filter = signal<TeacherFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<Teacher[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._all().filter((t) => {
      if (filter.contractType && t.contractType !== filter.contractType) return false;
      if (filter.status && t.status !== filter.status) return false;
      if (search) {
        const haystack = `${t.firstName} ${t.lastName} ${t.email} ${t.staffNumber} ${t.discipline}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
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
        this._error.set(err?.message ?? 'Failed to load teachers');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<TeacherFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
    this.pagination.reset();
    this.refresh();
  }

  goToPage(page: number): void {
    this.pagination.goTo(page);
    this.refresh();
  }

  /** Recalcule la page courante à partir de la liste filtrée (pagination client/mock). */
  private refresh(): void {
    const { data, meta } = paginateClient(this._filteredAll(), this.pagination.request());
    this._items.set(data);
    this.pagination.setMeta(meta);
  }

  create(draft: TeacherDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => {
        this._all.update((list) => [created, ...list]);
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: TeacherDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => {
        this._all.update((list) => list.map((t) => (t.id === id ? updated : t)));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => {
        this._all.update((list) => list.filter((t) => t.id !== id));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
