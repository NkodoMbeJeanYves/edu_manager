import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Payment, PaymentDraft } from '../../models/payment.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnChanges {
  @Input() payment: Payment | null = null;
  @Output() save = new EventEmitter<PaymentDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    receiptNumber: ['', Validators.required],
    invoiceNumber: ['', Validators.required],
    studentName: ['', Validators.required],
    amount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    currency: ['EUR', Validators.required],
    method: this.fb.nonNullable.control<Payment['method']>('CASH', Validators.required),
    status: this.fb.nonNullable.control<Payment['status']>('PENDING', Validators.required),
    reference: [''],
    receivedAt: ['', Validators.required],
    receivedBy: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payment']) {
      if (this.payment) {
        this.form.patchValue({ ...this.payment, reference: this.payment.reference ?? '' });
      } else {
        this.form.reset({
          receiptNumber: '', invoiceNumber: '', studentName: '',
          amount: 0, currency: 'EUR', method: 'CASH', status: 'PENDING',
          reference: '', receivedAt: '', receivedBy: '',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.save.emit({ ...value, reference: value.reference || undefined });
  }
}
