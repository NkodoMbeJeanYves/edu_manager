import { Injectable, computed, signal } from '@angular/core';
import { AuthSession, User, UserRole } from '@core/models/user.model';

const STORAGE_KEY = 'edu.auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _session = signal<AuthSession | null>(this.restore());

  readonly session = this._session.asReadonly();

  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly token = computed<string | null>(() => this._session()?.token ?? null);
  readonly isAuthenticated = computed(() => {
    const s = this._session();
    return !!s && s.expiresAt > Date.now();
  });
  readonly roles = computed<UserRole[]>(() => this._session()?.user.roles ?? []);

  setSession(session: AuthSession): void {
    this._session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  private restore(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}
