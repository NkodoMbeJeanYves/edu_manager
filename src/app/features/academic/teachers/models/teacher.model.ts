export type ContractType = 'PERMANENT' | 'TEMPORARY' | 'HOURLY' | 'VISITING';
export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RETIRED';

export interface Teacher {
  id: string;
  tenantId: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  discipline: string;
  contractType: ContractType;
  status: TeacherStatus;
  hiredAt: string;
}

export interface TeacherFilter {
  search?: string;
  contractType?: ContractType;
  status?: TeacherStatus;
}

export type TeacherDraft = Omit<Teacher, 'id' | 'tenantId' | 'hiredAt'>;
