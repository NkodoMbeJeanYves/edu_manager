import { Injectable, computed, inject, signal } from '@angular/core';
import { Grade, GradeDraft, GradeFilter } from './models/grade.model';
import { GradesService } from './grades.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class GradesStore {
  private readonly service = inject(GradesService);

  private readonly _all = signal<Grade[]>([]);
  private readonly _items = signal<Grade[]>([]);
  private readonly _filter = signal<GradeFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<Grade[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._all().filter((g) => {
      if (filter.evaluationType && g.evaluationType !== filter.evaluationType) return false;
      if (filter.subject && g.subject !== filter.subject) return false;
      if (search) {
        const haystack = `${g.studentName} ${g.registrationNumber} ${g.subject}`.toLowerCase();
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
        this._error.set(err?.message ?? 'Failed to load grades');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<GradeFilter>): void {
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

  create(draft: GradeDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => {
        this._all.update((list) => [created, ...list]);
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: GradeDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => {
        this._all.update((list) => list.map((g) => (g.id === id ? updated : g)));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => {
        this._all.update((list) => list.filter((g) => g.id !== id));
        this.refresh();
      },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
