import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Invoice, InvoiceDraft } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss',
})
export class InvoiceFormComponent implements OnChanges {
  @Input() invoice: Invoice | null = null;
  @Output() save = new EventEmitter<InvoiceDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    invoiceNumber: ['', Validators.required],
    studentName: ['', Validators.required],
    registrationNumber: ['', Validators.required],
    description: ['', Validators.required],
    amount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    currency: ['EUR', Validators.required],
    issuedAt: ['', Validators.required],
    dueAt: ['', Validators.required],
    status: this.fb.nonNullable.control<Invoice['status']>('DRAFT', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice']) {
      if (this.invoice) {
        this.form.patchValue(this.invoice);
      } else {
        this.form.reset({
          invoiceNumber: '', studentName: '', registrationNumber: '',
          description: '', amount: 0, currency: 'EUR',
          issuedAt: '', dueAt: '', status: 'DRAFT',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
