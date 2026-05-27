import { Injectable, computed, inject, signal } from '@angular/core';
import { Modele, ModeleDraft, ModeleFilter } from './models/modele.model';
import { ModelesService } from './modeles.service';

@Injectable()
export class ModelesStore {
  private readonly service = inject(ModelesService);

  private readonly _items = signal<Modele[]>([]);
  private readonly _filter = signal<ModeleFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Modele[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((m) => {
      if (filter.type && m.type !== filter.type) return false;
      if (filter.event && m.event !== filter.event) return false;
      if (search) {
        const haystack = `${m.name} ${m.subject} ${m.body}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._items.set(list); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<ModeleFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: ModeleDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: ModeleDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((m) => (m.id === id ? updated : m))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((m) => m.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
