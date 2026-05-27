import { Injectable, computed, inject, signal } from '@angular/core';
import { User, UserDraft, UserFilter } from './models/user.model';
import { UsersService } from './users.service';

@Injectable()
export class UsersStore {
  private readonly service = inject(UsersService);

  private readonly _items = signal<User[]>([]);
  private readonly _filter = signal<UserFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<User[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();

    return this._items().filter((u) => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.status && u.status !== filter.status) return false;
      if (search) {
        const haystack = `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase();
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
        this._error.set(err?.message ?? 'Failed to load users');
        this._loading.set(false);
      },
    });
  }

  setFilter(patch: Partial<UserFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: UserDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: UserDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) =>
        this._items.update((list) => list.map((u) => (u.id === id ? updated : u))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((u) => u.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
