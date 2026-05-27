import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent {
  @Input({ required: true }) invoices: Invoice[] = [];
  @Output() edit = new EventEmitter<Invoice>();
  @Output() remove = new EventEmitter<Invoice>();

  outstanding(i: Invoice): number {
    return Math.max(0, i.amount - i.paidAmount);
  }
}
