import { Injectable, computed, inject, signal } from '@angular/core';
import { Student, StudentDraft, StudentFilter } from './models/student.model';
import { StudentsService } from './students.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { fromItemsMeta } from '@shared/pagination/pagination.types';

@Injectable()
export class StudentsStore {
  private readonly service = inject(StudentsService);

  private readonly _items = signal<Student[]>([]);
  private readonly _filter = signal<StudentFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedId = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();

  readonly selected = computed<Student | null>(() => {
    const id = this._selectedId();
    return id ? this._items().find((s) => s.id === id) ?? null : null;
  });

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    const req = this.pagination.request();
    this.service
      .list({ ...this._filter(), page: req.page, size: req.size })
      .subscribe({
        next: (res) => {
          this._items.set(res.data);
          this.pagination.setMeta(fromItemsMeta(res.meta));
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err?.message ?? 'Failed to load students');
          this._loading.set(false);
        },
      });
  }

  setFilter(patch: Partial<StudentFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
    this.pagination.reset();
    this.load();
  }

  goToPage(page: number): void {
    this.pagination.goTo(page);
    this.load();
  }

  resetFilter(): void {
    this._filter.set({});
    this.pagination.reset();
    this.load();
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  create(draft: StudentDraft): void {
    this.service.create(draft).subscribe({
      next: () => this.load(),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: StudentDraft): void {
    this.service.update(id, draft).subscribe({
      next: () => this.load(),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this.load(),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
