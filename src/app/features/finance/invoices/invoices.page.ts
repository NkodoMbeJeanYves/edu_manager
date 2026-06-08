import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { InvoicesStore } from './invoices.store';
import { Invoice, InvoiceDraft } from './models/invoice.model';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [InvoiceListComponent, InvoiceFormComponent, PaginatorComponent],
  providers: [InvoicesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoices.page.html',
  styleUrl: './invoices.page.scss',
})
export class InvoicesPage implements OnInit {
  protected readonly store = inject(InvoicesStore);
  protected readonly editing = signal<Invoice | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(invoice: Invoice): void { this.editing.set(invoice); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: InvoiceDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(invoice: Invoice): void {
    const message = $localize`:@@invoices.confirmRemove:Remove invoice ${invoice.invoiceNumber}?`;
    if (confirm(message)) this.store.remove(invoice.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }

  onPageChange(e: PaginatorChange): void { this.store.goToPage(e.pageIndex + 1); }
}
