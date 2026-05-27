import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Payment, PaymentDraft } from './models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  list(): Observable<Payment[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: PaymentDraft): Observable<Payment> {
    const p: Payment = { ...draft, id: crypto.randomUUID(), tenantId: 't-1' };
    return of(p).pipe(delay(150));
  }

  update(id: string, draft: PaymentDraft): Observable<Payment> {
    const existing = this.seed().find((p) => p.id === id);
    const merged: Payment = { ...(existing ?? { id, tenantId: 't-1' }), ...draft } as Payment;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Payment[] {
    return [
      {
        id: 'p-1', tenantId: 't-1', receiptNumber: 'RCP-2024-0001',
        invoiceNumber: 'INV-2024-0001', studentName: 'Alice Johnson',
        amount: 1500, currency: 'EUR', method: 'BANK_TRANSFER', status: 'CONFIRMED',
        reference: 'TRX-A1B2-C3D4', receivedAt: '2024-09-20T10:32:00Z',
        receivedBy: 'Marie Lefebvre',
      },
      {
        id: 'p-2', tenantId: 't-1', receiptNumber: 'RCP-2024-0012',
        invoiceNumber: 'INV-2024-0014', studentName: 'Marcus Lee',
        amount: 1600, currency: 'EUR', method: 'CARD', status: 'CONFIRMED',
        reference: 'CB-2024-09-25-771', receivedAt: '2024-09-25T14:18:00Z',
        receivedBy: 'Marie Lefebvre',
      },
      {
        id: 'p-3', tenantId: 't-1', receiptNumber: 'RCP-2024-0019',
        invoiceNumber: 'INV-2024-0014', studentName: 'Marcus Lee',
        amount: 500, currency: 'EUR', method: 'MOBILE_MONEY', status: 'PENDING',
        reference: 'MM-X9Y8-Z7W6', receivedAt: '2025-01-05T16:02:00Z',
        receivedBy: 'Aïcha Bernard',
      },
      {
        id: 'p-4', tenantId: 't-1', receiptNumber: 'RCP-2024-0023',
        invoiceNumber: 'INV-2024-0027', studentName: 'Sofia Martinez',
        amount: 1000, currency: 'EUR', method: 'CASH', status: 'CONFIRMED',
        receivedAt: '2024-11-12T11:00:00Z',
        receivedBy: 'Marie Lefebvre',
      },
      {
        id: 'p-5', tenantId: 't-1', receiptNumber: 'RCP-2024-0031',
        invoiceNumber: 'INV-2024-0027', studentName: 'Sofia Martinez',
        amount: 500, currency: 'EUR', method: 'CHECK', status: 'FAILED',
        reference: 'CHK-887766', receivedAt: '2024-12-03T09:45:00Z',
        receivedBy: 'Marie Lefebvre',
      },
    ];
  }
}
