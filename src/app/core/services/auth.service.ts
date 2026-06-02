import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthCredentials, AuthSession } from '@core/models/user.model';
import { AuthStore } from '@core/stores/auth.store';
import { TenantStore } from '@core/stores/tenant.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);

  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((session) => this.authStore.setSession(session)));
  }

  logout(): void {
    this.authStore.clear();
    this.tenantStore.clear();
    this.router.navigate(['/login']);
  }

  refresh(): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/refresh`, {});
  }
}
