import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademicSession, AcademicSessionDraft, SessionFilter } from './models/session.model';
import { SessionsService } from './sessions.service';

@Injectable()
export class SessionsStore {
  private readonly service = inject(SessionsService);

  private readonly _items = signal<AcademicSession[]>([]);
  private readonly _filter = signal<SessionFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<AcademicSession[]>(() => {
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
    this._loading.set(true);
    this._error.set(null);

    this.service.list().subscribe({
      next: (list) => {
        this._items.set(list);
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
  }

  create(draft: AcademicSessionDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: AcademicSessionDraft): void {
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
