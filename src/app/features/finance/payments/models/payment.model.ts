export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  tenantId: string;
  receiptNumber: string;
  invoiceNumber: string;
  studentName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  receivedAt: string;
  receivedBy: string;
}

export interface PaymentFilter {
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export type PaymentDraft = Omit<Payment, 'id' | 'tenantId'>;
