import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { PaymentsStore } from './payments.store';
import { Payment, PaymentDraft } from './models/payment.model';
import { PaymentListComponent } from './components/payment-list/payment-list.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [PaymentListComponent, PaymentFormComponent, PaginatorComponent],
  providers: [PaymentsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.page.html',
  styleUrl: './payments.page.scss',
})
export class PaymentsPage implements OnInit {
  protected readonly store = inject(PaymentsStore);
  protected readonly editing = signal<Payment | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(p: Payment): void { this.editing.set(p); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: PaymentDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(p: Payment): void {
    const message = $localize`:@@payments.confirmRemove:Remove payment ${p.receiptNumber}?`;
    if (confirm(message)) this.store.remove(p.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }

  onPageChange(e: PaginatorChange): void { this.store.goToPage(e.pageIndex + 1); }
}
