export type SessionType = 'YEAR' | 'TERM' | 'SEMESTER' | 'EXAM_PERIOD';
export type SessionStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface AcademicSession {
  id: string;
  tenantId: string;
  label: string;
  type: SessionType;
  startDate: string;
  endDate: string;
  status: SessionStatus;
  createdAt: string;
}

export interface SessionFilter {
  search?: string;
  type?: SessionType;
  status?: SessionStatus;
}

export type AcademicSessionDraft = Omit<AcademicSession, 'id' | 'tenantId' | 'createdAt'>;
