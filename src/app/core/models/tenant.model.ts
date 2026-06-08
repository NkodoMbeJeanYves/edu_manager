export type TenantType = "SCHOOL" | "UNIVERSITY" | "MIXED";

export interface TenantContext {
  tenantId: string;
  tenantCode: string;
}

// Interface pour un tenant
export interface Tenant {
  id: string;
  code: string;
  name: string;
  type: TenantType;
  status: string;
  locale: string;
  timezone: string;
  logoUrl?: string;
  active?: boolean;
}
