import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { ModuleKey } from '@core/models/auth.models';
import { UserRole } from '@core/models/user.model';

/**
 * Guard de rôle. Configurable via `data` sur la route :
 *
 *   data: { module: 'notes' }            → autorise si l'utilisateur a au
 *                                          moins une action sur ce module.
 *   data: { roles: ['directeur', ...] }  → autorise si l'utilisateur a au
 *                                          moins un des rôles listés.
 *
 * Les deux peuvent être combinés (ET logique).
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthorizationService);
  const router = inject(Router);

  const module = route.data['module'] as ModuleKey | undefined;
  const roles = route.data['roles'] as readonly UserRole[] | undefined;

  const moduleOk = module === undefined || auth.canAccessModule(module);
  const rolesOk = roles === undefined || auth.hasAnyRole(roles);

  if (moduleOk && rolesOk) {
    return true;
  }
  return router.createUrlTree(['/acces-refuse']);
};
