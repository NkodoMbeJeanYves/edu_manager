import { Injectable, computed, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { Action, ModuleKey } from '@core/models/auth.models';
import { UserRole } from '@core/models/user.model';
import { actionsFor } from '@core/auth/access-matrix';
import { AuthorityLevel, ROLE_AUTHORITY } from '@core/auth/authority-level';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly auth = inject(AuthStore);

  readonly roles = this.auth.roles;

  readonly isSuperAdmin = computed(() => this.roles().includes('super_admin'));

  readonly currentLevels = computed<AuthorityLevel[]>(() => {
    const set = new Set<AuthorityLevel>();
    for (const role of this.roles()) {
      set.add(ROLE_AUTHORITY[role]);
    }
    return [...set];
  });

  levelOf(role: UserRole): AuthorityLevel {
    return ROLE_AUTHORITY[role];
  }

  isAtLevel(level: AuthorityLevel): boolean {
    return this.currentLevels().includes(level);
  }

  can(action: Action, module: ModuleKey): boolean {
    const roles = this.roles();
    if (roles.length === 0) return false;
    return roles.some((role) => actionsFor(role, module).includes(action));
  }

  canAccessModule(module: ModuleKey): boolean {
    const roles = this.roles();
    if (roles.length === 0) return false;
    return roles.some((role) => actionsFor(role, module).length > 0);
  }

  hasAnyRole(allowed: readonly UserRole[]): boolean {
    if (allowed.length === 0) return true;
    return this.roles().some((role) => allowed.includes(role));
  }

  actionsOn(module: ModuleKey): readonly Action[] {
    const set = new Set<Action>();
    for (const role of this.roles()) {
      for (const action of actionsFor(role, module)) {
        set.add(action);
      }
    }
    return [...set];
  }
}
