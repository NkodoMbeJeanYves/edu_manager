import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthCredentials, AuthSession, UserRole } from '@core/models/user.model';
import { AuthStore } from '@core/stores/auth.store';
import { TenantStore } from '@core/stores/tenant.store';

const MOCK_ROLE_BY_EMAIL: Record<string, UserRole> = {
  'admin@test.com': 'super_admin',
  'directeur@test.com': 'directeur',
  'scolarite@test.com': 'resp_scolarite',
  'financier@test.com': 'resp_financier',
  'filiere@test.com': 'resp_filiere',
  'enseignant@test.com': 'enseignant',
  'surveillant@test.com': 'surveillant_examen',
  'agent.scolarite@test.com': 'agent_scolarite',
  'comptable@test.com': 'agent_comptable',
  'apprenant@test.com': 'apprenant',
  'parent@test.com': 'parent',
  'auditeur@test.com': 'auditeur',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly tenantStore = inject(TenantStore);

  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.mockLogin(credentials).pipe(
      tap((session) => this.authStore.setSession(session)),
    );
  }

  logout(): void {
    this.authStore.clear();
    this.tenantStore.clear();
    this.router.navigate(['/login']);
  }

  refresh(): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${environment.apiUrl}/auth/refresh`, {});
  }

  private mockLogin(credentials: AuthCredentials): Observable<AuthSession> {
    const role = MOCK_ROLE_BY_EMAIL[credentials.email.toLowerCase()] ?? 'directeur';
    const session: AuthSession = {
      token: 'mock.jwt.' + btoa(credentials.email),
      refreshToken: 'mock.refresh.' + btoa(credentials.email),
      expiresAt: Date.now() + 60 * 60 * 1000,
      user: {
        id: 'u-1',
        tenantId: 't-1',
        email: credentials.email,
        firstName: 'Jane',
        lastName: 'Doe',
        roles: [role],
        active: true,
      },
    };
    return of(session);
  }
}
