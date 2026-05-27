export type ModeleType = 'EMAIL' | 'SMS' | 'PUSH';
export type ModeleEvent = 'ABSENCE' | 'GRADE_PUBLISHED' | 'PAYMENT_RECEIVED' | 'EXAM_CONVOCATION' | 'GENERAL';

export interface Modele {
  id: string;
  tenantId: string;
  name: string;
  type: ModeleType;
  event: ModeleEvent;
  subject: string;
  body: string;
  active: boolean;
  updatedAt: string;
}

export interface ModeleFilter {
  search?: string;
  type?: ModeleType;
  event?: ModeleEvent;
}

export type ModeleDraft = Omit<Modele, 'id' | 'tenantId' | 'updatedAt'>;
