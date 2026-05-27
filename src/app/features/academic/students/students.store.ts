import { Injectable, computed, inject, signal } from '@angular/core';
import { Student, StudentDraft, StudentFilter } from './models/student.model';
import { StudentsService } from './students.service';

@Injectable()
export class StudentsStore {
  private readonly service = inject(StudentsService);

  private readonly _items = signal<Student[]>([]);
  private readonly _filter = signal<StudentFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedId = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedId = this._selectedId.asReadonly();

  readonly filtered = computed<Student[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._items().filter((s) => {
      if (filter.level && s.level !== filter.level) return false;
      if (filter.status && s.status !== filter.status) return false;
      if (search) {
        const haystack = `${s.firstName} ${s.lastName} ${s.email} ${s.registrationNumber}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);
  readonly selected = computed<Student | null>(() => {
    const id = this._selectedId();
    return id ? this._items().find((s) => s.id === id) ?? null : null;
  });

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.list().subscribe({
      next: (list) => {
        this._items.set(list);
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
  }

  resetFilter(): void {
    this._filter.set({});
  }

  select(id: string | null): void {
    this._selectedId.set(id);
  }

  create(draft: StudentDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: StudentDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) =>
        this._items.update((list) => list.map((s) => (s.id === id ? updated : s))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((s) => s.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
