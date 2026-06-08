import { Injectable, computed, inject, signal } from '@angular/core';
import { Payment, PaymentDraft, PaymentFilter } from './models/payment.model';
import { PaymentsService } from './payments.service';
import { createPagination } from '@shared/pagination/create-pagination';
import { paginateClient } from '@shared/pagination/pagination.types';

@Injectable()
export class PaymentsStore {
  private readonly service = inject(PaymentsService);

  private readonly _all = signal<Payment[]>([]);
  private readonly _items = signal<Payment[]>([]);
  private readonly _filter = signal<PaymentFilter>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagination = createPagination();

  readonly items = this._items.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly _filteredAll = computed<Payment[]>(() => {
    const filter = this._filter();
    const search = filter.search?.toLowerCase().trim();
    return this._all().filter((p) => {
      if (filter.method && p.method !== filter.method) return false;
      if (filter.status && p.status !== filter.status) return false;
      if (search) {
        const haystack = `${p.receiptNumber} ${p.invoiceNumber} ${p.studentName} ${p.reference ?? ''}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  load(): void {
    this._loading.set(true); this._error.set(null);
    this.service.list().subscribe({
      next: (list) => { this._all.set(list); this.refresh(); this._loading.set(false); },
      error: (err) => { this._error.set(err?.message ?? 'Failed to load payments'); this._loading.set(false); },
    });
  }

  setFilter(patch: Partial<PaymentFilter>): void {
    this._filter.update((curr) => ({ ...curr, ...patch }));
    this.pagination.reset();
    this.refresh();
  }

  goToPage(page: number): void {
    this.pagination.goTo(page);
    this.refresh();
  }

  private refresh(): void {
    const { data, meta } = paginateClient(this._filteredAll(), this.pagination.request());
    this._items.set(data);
    this.pagination.setMeta(meta);
  }

  create(draft: PaymentDraft): void {
    this.service.create(draft).subscribe({
      next: (created) => { this._all.update((list) => [created, ...list]); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Create failed'),
    });
  }

  update(id: string, draft: PaymentDraft): void {
    this.service.update(id, draft).subscribe({
      next: (updated) => { this._all.update((list) => list.map((p) => (p.id === id ? updated : p))); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Update failed'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => { this._all.update((list) => list.filter((p) => p.id !== id)); this.refresh(); },
      error: (err) => this._error.set(err?.message ?? 'Delete failed'),
    });
  }
}
