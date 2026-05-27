import { Injectable, computed, inject, signal } from '@angular/core';
import { Annonce, AnnonceDraft, AnnonceFilter } from './models/annonce.model';
import { AnnoncesService } from './annonces.service';

@Injectable()
export class AnnoncesStore {
  private readonly service = inject(AnnoncesService);

  private readonly _items = signal<Annonce[]>([]);
  private readonly _filter = signal<AnnonceFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Annonce[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    let result = this._items().filter((a) => {
      if (filter.audience && a.audience !== filter.audience) return false;
      if (filter.pinnedOnly && !a.pinned) return false;
      if (search) {
        const haystack = `${a.title} ${a.body}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
    // Pinned first
    result = [...result].sort((x, y) => Number(y.pinned) - Number(x.pinned));
    return result;
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

  setFilter(patch: Partial<AnnonceFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: AnnonceDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: AnnonceDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((a) => (a.id === id ? updated : a))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((a) => a.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
