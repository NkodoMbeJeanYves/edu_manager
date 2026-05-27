import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Tenant } from '@core/models/tenant.model';
import { TenantStore } from '@core/stores/tenant.store';
import { TenantService } from '@core/services/tenant.service';

@Component({
  selector: 'app-tenant-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tenant-select.page.html',
  styleUrl: './tenant-select.page.scss',
})
export class TenantSelectPage implements OnInit {
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  protected readonly store = inject(TenantStore);

  ngOnInit(): void {
    this.tenantService.loadAvailable().subscribe();
  }

  select(tenant: Tenant): void {
    this.tenantService.select(tenant);
    this.router.navigate(['/']);
  }
}
