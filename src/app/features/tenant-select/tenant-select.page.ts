import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { Tenant } from "@core/models/tenant.model";
import { TenantService } from "@core/services/tenant.service";
import { TenantStore } from "@core/stores/tenant.store";
import { Subscription } from "rxjs";

@Component({
  selector: "app-tenant-select",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./tenant-select.page.html",
  styleUrl: "./tenant-select.page.scss",
})
export class TenantSelectPage implements OnInit, OnDestroy {
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private tenantSubscription?: Subscription;

  protected readonly store = inject(TenantStore);

  ngOnInit(): void {
    this.tenantSubscription = this.tenantService.loadAvailable().subscribe();
  }

  ngOnDestroy(): void {
    console.log("Clearing tenant selection");
    // this.store.clear();
    this.tenantSubscription?.unsubscribe();
  }

  select(tenant: Tenant): void {
    this.tenantService.select(tenant);
    this.router.navigate(["/"]);
  }
}
