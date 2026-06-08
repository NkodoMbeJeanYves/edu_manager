import { Injectable, computed, inject, signal } from '@angular/core';
import { TimetableSlot, TimetableSlotDraft, TimetableFilter } from './models/timetable.model';
import { TimetableService } from './timetable.service';
import { createPagination } from '@shared/pagination/create-pagination';

@Injectable()
export class TimetableStore {
  private readonly service = inject(TimetableService);

  private readonly _items = signal<TimetableSlot[]>([]);
  private readonly _filter = signal<TimetableFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Pagination de la vue "liste" uniquement (la vue "grille" affiche toute la classe). */
  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<TimetableSlot[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._items().filter((s) => {
      if (filter.day && s.day !== filter.day) return false;
      if (filter.classGroup && s.classGroup !== filter.classGroup) return false;
      if (search) {
        const haystack = `${s.subject} ${s.teacherName} ${s.classGroup} ${s.room}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);

  /** Sous-ensemble paginé de `filtered` pour la vue liste. */
  readonly pagedList = computed<TimetableSlot[]>(() => {
    const all = this.filtered();
    const size = this.pagination.size();
    const start = (this.pagination.page() - 1) * size;
    return all.slice(start, start + size);
  });

  /** Met à jour la métadonnée de pagination quand la liste filtrée change. */
  private syncPageMeta(): void {
    const total = this.filtered().length;
    const totalPages = Math.max(1, Math.ceil(total / this.pagination.size()));
    this.pagination.setMeta({
      page: Math.min(this.pagination.page(), totalPages),
      size: this.pagination.size(),
      total,
      totalPages,
    });
  }

  goToPage(page: number): void {
    this.pagination.goTo(page);
  }

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.service.list().subscribe({
      next: (list) => {
        this._items.set(list);
        this.syncPageMeta();
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.message ?? 'Failed to load timetable');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<TimetableFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
    this.pagination.reset();
    this.syncPageMeta();
  }

  create(draft: TimetableSlotDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => {
        this._items.update((list) => [created, ...list]);
        this.syncPageMeta();
      },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: TimetableSlotDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => {
        this._items.update((list) => list.map((s) => (s.id === id ? updated : s)));
        this.syncPageMeta();
      },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => {
        this._items.update((list) => list.filter((s) => s.id !== id));
        this.syncPageMeta();
      },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
