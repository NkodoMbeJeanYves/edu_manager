import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantStore } from '@core/stores/tenant.store';

export const tenantGuard: CanActivateFn = () => {
  const tenant = inject(TenantStore);
  const router = inject(Router);

  if (tenant.hasTenant()) {
    return true;
  }

  return router.createUrlTree(['/select-tenant']);
};
