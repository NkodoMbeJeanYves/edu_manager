import { Injectable, computed, inject, signal } from '@angular/core';
import { Grade, GradeDraft, GradeFilter } from './models/grade.model';
import { GradesService } from './grades.service';

@Injectable()
export class GradesStore {
  private readonly service = inject(GradesService);

  private readonly _items = signal<Grade[]>([]);
  private readonly _filter = signal<GradeFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Grade[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._items().filter((g) => {
      if (filter.evaluationType && g.evaluationType !== filter.evaluationType) return false;
      if (filter.subject && g.subject !== filter.subject) return false;
      if (search) {
        const haystack = `${g.studentName} ${g.registrationNumber} ${g.subject}`.toLowerCase();
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
        this._error.set(err?.message ?? 'Failed to load grades');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<GradeFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: GradeDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: GradeDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) =>
        this._items.update((list) => list.map((g) => (g.id === id ? updated : g))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((g) => g.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
