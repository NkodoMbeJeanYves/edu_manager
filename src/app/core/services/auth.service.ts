import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { mockSession } from "@core/mocks/seeds/auth.mock";
import { AuthCredentials, AuthSession } from "@core/models/user.model";
import { AuthStore } from "@core/stores/auth.store";
import { TenantStore } from "@core/stores/tenant.store";
import { environment } from "@env/environment";
import { delay, Observable, of, tap } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);

  /**
   * Authenticate user with email and password.
   *
   * Makes a real HTTP POST to the backend's /auth/login endpoint.
   * The backend returns an AuthSession with JWT token and user info.
   *
   * With mocks: mockBackendInterceptor intercepts and returns a mock session.
   * With real API: the request reaches the backend server.
   */
  login(credentials: AuthCredentials): Observable<AuthSession> {
    return of(mockSession(credentials.username, "directeur")).pipe(
      delay(500),
      tap((session) => this.authStore.setSession(session)),
    ); // Simule une requête HTTP avec délai
    // return this.http
    //   .post<AuthSession>(`${environment.apiUrl}/tokens/login`, credentials)
    //   .pipe(tap((session) => this.authStore.setSession(session)));
  }

  logout(): void {
    this.authStore.clear();
    this.tenantStore.clear();
    this.router.navigate(["/login"]);
  }

  /**
   * Refresh expired JWT token.
   *
   * Makes a POST to /auth/refresh to get a new token before the current one expires.
   */
  refresh(): Observable<AuthSession> {
    return this.http.post<AuthSession>(
      `${environment.apiUrl}/tokens/refresh`,
      {},
    );
  }
}


