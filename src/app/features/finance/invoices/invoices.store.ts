import { Injectable, computed, inject, signal } from '@angular/core';
import { Invoice, InvoiceDraft, InvoiceFilter } from './models/invoice.model';
import { InvoicesService } from './invoices.service';

@Injectable()
export class InvoicesStore {
  private readonly service = inject(InvoicesService);

  private readonly _items = signal<Invoice[]>([]);
  private readonly _filter = signal<InvoiceFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Invoice[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((i) => {
      if (filter.status && i.status !== filter.status) return false;
      if (search) {
        const haystack = `${i.invoiceNumber} ${i.studentName} ${i.registrationNumber} ${i.description}`.toLowerCase();
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
      error: (err) => { this._error.set(err?.message ?? 'Failed to load invoices'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<InvoiceFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: InvoiceDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: InvoiceDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((i) => (i.id === id ? updated : i))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((i) => i.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
