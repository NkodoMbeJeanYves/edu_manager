import { MockRoute } from '../mock-types';

/**
 * Auth mocks.
 *
 * `auth.service.login()` and `tenant.service.loadAvailable()` already return
 * `of(...)` locally — they don't hit HTTP, so nothing to intercept for them.
 *
 * The only HTTP call in auth.service is `refresh()`, used after the JWT
 * expires. We return a fresh mock session.
 */
export const AUTH_ROUTES: MockRoute[] = [
  {
    method: 'POST', path: '/auth/refresh',
    handler: () => {
      const email = 'mock@example.com';
      return {
        token: 'mock.jwt.refreshed.' + btoa(email),
        refreshToken: 'mock.refresh.' + btoa(email),
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'u-1', tenantId: 't-1', email,
          firstName: 'Jane', lastName: 'Doe',
          roles: ['directeur'], active: true,
        },
      };
    },
  },
];
