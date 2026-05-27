import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { TenantStore } from '@core/stores/tenant.store';
import { AuthService } from '@core/services/auth.service';
import { AuthorizationService } from '@core/services/authorization.service';
import { AUTHORITY_LEVEL_LABEL } from '@core/auth/authority-level';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly authz = inject(AuthorizationService);

  protected readonly auth = inject(AuthStore);
  protected readonly tenant = inject(TenantStore);
  protected readonly currentLocale = inject(LOCALE_ID);
  protected readonly noneLabel = $localize`:@@navbar.tenantNone:None`;

  protected readonly authorityLabel = computed<string | null>(() => {
    const levels = this.authz.currentLevels();
    if (levels.length === 0) return null;
    return levels.map((l) => AUTHORITY_LEVEL_LABEL[l]).join(' · ');
  });

  switchTenant(): void {
    this.router.navigate(['/select-tenant']);
  }

  logout(): void {
    this.authService.logout();
  }
}
