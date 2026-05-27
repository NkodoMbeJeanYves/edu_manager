export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  studentName: string;
  registrationNumber: string;
  description: string;
  amount: number;
  paidAmount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
}

export interface InvoiceFilter {
  search?: string;
  status?: InvoiceStatus;
}

export type InvoiceDraft = Omit<Invoice, 'id' | 'tenantId' | 'paidAmount'>;
