import { Injectable, computed, inject, signal } from '@angular/core';
import { Notification } from './models/notification.model';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsStore {
  private readonly service = inject(NotificationsService);

  private readonly _items = signal<Notification[]>([]);
  private readonly _filterUnread = signal(false);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filterUnread = this._filterUnread.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Notification[]>(() => {
    return this._filterUnread()
      ? this._items().filter((n) => n.status === 'UNREAD')
      : this._items();
  });

  readonly total = computed(() => this._items().length);
  readonly unreadCount = computed(() => this._items().filter((n) => n.status === 'UNREAD').length);

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._items.set(list); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load notifications'); this._loading.set(false); },
    });
  }

  toggleUnreadFilter(): void { this._filterUnread.update((v) => !v); }

  markRead(id: string): void {
    this.service.markRead(id).subscribe({
      next: () => this._items.update((list) =>
        list.map((n) => (n.id === id ? { ...n, status: 'READ' as const } : n))
      ),
      error: (err) => this._error.set(err?.message ?? 'Mark read failed'),
    });
  }

  markAllRead(): void {
    this.service.markAllRead().subscribe({
      next: () => this._items.update((list) =>
        list.map((n) => ({ ...n, status: 'READ' as const }))
      ),
      error: (err) => this._error.set(err?.message ?? 'Mark all read failed'),
    });
  }
}
