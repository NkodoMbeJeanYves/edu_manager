import { Injectable, computed, inject, signal } from '@angular/core';
import { ExamSession, ExamSessionDraft, ExamSessionFilter } from './models/exam-session.model';
import { ExamSessionsService } from './sessions-list.service';

@Injectable()
export class ExamSessionsStore {
  private readonly service = inject(ExamSessionsService);

  private readonly _items = signal<ExamSession[]>([]);
  private readonly _filter = signal<ExamSessionFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<ExamSession[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((s) => {
      if (filter.type && s.type !== filter.type) return false;
      if (filter.status && s.status !== filter.status) return false;
      if (search && !s.label.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._items.set(list); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load sessions'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<ExamSessionFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: ExamSessionDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: ExamSessionDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((s) => (s.id === id ? updated : s))),
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
