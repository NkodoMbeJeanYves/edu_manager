export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
  managerName: string;
  staffCount: number;
  status: DepartmentStatus;
  createdAt: string;
}

export interface DepartmentFilter {
  search?: string;
  status?: DepartmentStatus;
}

export type DepartmentDraft = Omit<Department, 'id' | 'tenantId' | 'createdAt'>;
