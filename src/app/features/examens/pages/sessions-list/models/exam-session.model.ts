export type ExamSessionType = 'NORMAL' | 'MAKEUP' | 'SPECIAL';
export type ExamSessionStatus = 'PLANNED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';

export interface ExamSession {
  id: string;
  tenantId: string;
  label: string;
  type: ExamSessionType;
  status: ExamSessionStatus;
  startDate: string;
  endDate: string;
  examsCount: number;
  createdAt: string;
}

export interface ExamSessionFilter {
  search?: string;
  type?: ExamSessionType;
  status?: ExamSessionStatus;
}

export type ExamSessionDraft = Omit<ExamSession, 'id' | 'tenantId' | 'examsCount' | 'createdAt'>;
