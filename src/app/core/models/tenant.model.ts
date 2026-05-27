export type TenantType = 'SCHOOL' | 'UNIVERSITY' | 'MIXED';

export interface Tenant {
  id: string;
  code: string;
  name: string;
  type: TenantType;
  logoUrl?: string;
  active: boolean;
}

export interface TenantContext {
  tenantId: string;
  tenantCode: string;
}
