import { Injectable, computed, inject, signal } from '@angular/core';
import { Payment, PaymentDraft, PaymentFilter } from './models/payment.model';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsStore {
  private readonly service = inject(PaymentsService);

  private readonly _items = signal<Payment[]>([]);
  private readonly _filter = signal<PaymentFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filtered = computed<Payment[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._items().filter((p) => {
      if (filter.method && p.method !== filter.method) return false;
      if (filter.status && p.status !== filter.status) return false;
      if (search) {
        const haystack = `${p.receiptNumber} ${p.invoiceNumber} ${p.studentName} ${p.reference ?? ''}`.toLowerCase();
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
      error: (err) => { this._error.set(err?.message ?? 'Failed to load payments'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<PaymentFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
  }

  create(draft: PaymentDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => this._items.update((list) => [created, ...list]),
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: PaymentDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => this._items.update((list) => list.map((p) => (p.id === id ? updated : p))),
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this._items.update((list) => list.filter((p) => p.id !== id)),
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
