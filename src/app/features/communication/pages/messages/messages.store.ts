import { Injectable, computed, inject, signal } from '@angular/core';
import { Message, MessageDraft, MessageFilter } from './models/message.model';
import { MessagesService } from './messages.service';

@Injectable()
export class MessagesStore {
  private readonly service = inject(MessagesService);

  private readonly _items = signal<Message[]>([]);
  private readonly _filter = signal<MessageFilter>({ folder: 'INBOX' });
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Message[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((m) => {
      if (filter.folder && m.folder !== filter.folder) return false;
      if (search) {
        const haystack = `${m.fromName} ${m.toName} ${m.subject} ${m.body}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this._items().length);
  readonly visibleCount = computed(() => this.filtered().length);
  readonly unreadInboxCount = computed(() =>
    this._items().filter((m) => m.folder === 'INBOX' && !m.read).length
  );

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._items.set(list); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load messages'); this._loading.set(false); },
    });
  }

  setFolder(folder: Message['folder']): void { this._filter.update((f) => ({ ...f, folder })); }
  setSearch(search: string): void { this._filter.update((f) => ({ ...f, search })); }

  create(draft: MessageDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Send failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((m) => m.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
