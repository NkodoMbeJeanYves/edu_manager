import { Injectable, computed, inject, signal } from '@angular/core';
import { Teacher, TeacherDraft, TeacherFilter } from './models/teacher.model';
import { TeachersService } from './teachers.service';

@Injectable()
export class TeachersStore {
  private readonly service = inject(TeachersService);

  private readonly _items = signal<Teacher[]>([]);
  private readonly _filter = signal<TeacherFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Teacher[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._items().filter((t) => {
      if (filter.contractType && t.contractType !== filter.contractType) return false;
      if (filter.status && t.status !== filter.status) return false;
      if (search) {
        const haystack = `${t.firstName} ${t.lastName} ${t.email} ${t.staffNumber} ${t.discipline}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.list().subscribe({
      next: (list) => {
        this._items.set(list);
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
  }

  create(draft: TeacherDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: TeacherDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) =>
        this._items.update((list) => list.map((t) => (t.id === id ? updated : t))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((t) => t.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
