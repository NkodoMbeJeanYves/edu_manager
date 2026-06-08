import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiResponse } from "@core/models/apiResponse";
import { Tenant } from "@core/models/tenant.model";
import { TenantStore } from "@core/stores/tenant.store";
import { Observable, map, tap } from "rxjs";
import { environment } from "../../../environments/environment.development";

@Injectable({ providedIn: "root" })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(TenantStore);
  private base = `${environment.apiUrl}v1`;

  loadAvailable(): Observable<Tenant[]> {
    return this.http
      .get<ApiResponse.Items<Tenant>>(`${this.base}/tenants`)
      .pipe(
        map((response) =>
          response.data.map((t) => ({
            ...t,
            id: t.code, // Assuming code is unique and can serve as ID
            active: t.status === "ACTIVE".toLocaleLowerCase(), // Convert status to boolean
          })),
        ),
        tap((response) => {
          console.log(response);
          this.store.setAvailable(response);
        }),
      );
  }

  select(tenant: Tenant): void {
    this.store.select(tenant);
  }
}
