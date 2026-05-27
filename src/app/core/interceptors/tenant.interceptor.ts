import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantStore } from '@core/stores/tenant.store';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenant = inject(TenantStore);
  const tenantId = tenant.tenantId();

  if (!tenantId) {
    return next(req);
  }

  const tenantReq = req.clone({
    setHeaders: { 'X-Tenant-Id': tenantId },
  });

  return next(tenantReq);
};
