import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Invoice, InvoiceDraft } from './models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  list(): Observable<Invoice[]> { return of(this.seed()).pipe(delay(200)); }

  create(draft: InvoiceDraft): Observable<Invoice> {
    const inv: Invoice = {
      ...draft,
      id: crypto.randomUUID(),
      tenantId: 't-1',
      paidAmount: 0,
    };
    return of(inv).pipe(delay(150));
  }

  update(id: string, draft: InvoiceDraft): Observable<Invoice> {
    const existing = this.seed().find((i) => i.id === id);
    const merged: Invoice = {
      ...(existing ?? { id, tenantId: 't-1', paidAmount: 0 }),
      ...draft,
    } as Invoice;
    return of(merged).pipe(delay(150));
  }

  remove(id: string): Observable<void> { return of(void id).pipe(delay(100)); }

  private seed(): Invoice[] {
    return [
      {
        id: 'inv-1', tenantId: 't-1', invoiceNumber: 'INV-2024-0001',
        studentName: 'Alice Johnson', registrationNumber: 'STU-2024-001',
        description: 'Frais de scolarité — Trimestre 1', amount: 1500, paidAmount: 1500,
        currency: 'EUR', issuedAt: '2024-09-05', dueAt: '2024-09-30', status: 'PAID',
      },
      {
        id: 'inv-2', tenantId: 't-1', invoiceNumber: 'INV-2024-0014',
        studentName: 'Marcus Lee', registrationNumber: 'STU-2023-014',
        description: 'Frais universitaires — Semestre 1', amount: 3200, paidAmount: 1600,
        currency: 'EUR', issuedAt: '2024-09-05', dueAt: '2024-10-15', status: 'PARTIAL',
      },
      {
        id: 'inv-3', tenantId: 't-1', invoiceNumber: 'INV-2024-0027',
        studentName: 'Sofia Martinez', registrationNumber: 'STU-2022-009',
        description: 'Inscription Master 2', amount: 4500, paidAmount: 0,
        currency: 'EUR', issuedAt: '2024-09-10', dueAt: '2024-10-31', status: 'OVERDUE',
      },
      {
        id: 'inv-4', tenantId: 't-1', invoiceNumber: 'INV-2025-0033',
        studentName: 'Alice Johnson', registrationNumber: 'STU-2024-001',
        description: 'Frais de scolarité — Trimestre 2', amount: 1500, paidAmount: 0,
        currency: 'EUR', issuedAt: '2025-01-08', dueAt: '2025-01-31', status: 'ISSUED',
      },
      {
        id: 'inv-5', tenantId: 't-1', invoiceNumber: 'INV-2025-0048',
        studentName: 'Marcus Lee', registrationNumber: 'STU-2023-014',
        description: 'Frais universitaires — Semestre 2', amount: 3200, paidAmount: 0,
        currency: 'EUR', issuedAt: '2025-01-15', dueAt: '2025-02-15', status: 'DRAFT',
      },
    ];
  }
}
