import { HttpRequest } from '@angular/common/http';
import { MockRoute } from '../mock-types';

const MOCK_ROLE_BY_EMAIL: Record<string, string> = {
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

/**
 * Auth mocks.
 *
 * `auth.service.login()` now makes a real HTTP call and is intercepted by
 * mockBackendInterceptor when `environment.useMocks === true`.
 *
 * The only other HTTP call in auth.service is `refresh()`, used after the JWT expires.
 * Both handlers return a mock session.
 */
export const AUTH_ROUTES: MockRoute[] = [
  {
    method: 'POST',
    path: '/api/tokens/login',
    handler: (req: HttpRequest<unknown>) => {
      const { email } = (req.body as { email?: string }) ?? {};
      const role = (email ? MOCK_ROLE_BY_EMAIL[(email as string).toLowerCase()] : null) ?? 'directeur';
      return {
        token: 'mock.jwt.' + btoa(email || 'unknown'),
        refreshToken: 'mock.refresh.' + btoa(email || 'unknown'),
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'u-1',
          tenantId: 't-1',
          email: email || 'mock@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          roles: [role],
          active: true,
        },
      };
    },
  },
  {
    method: 'POST',
    path: '/api/tokens/refresh',
    handler: () => {
      const email = 'mock@example.com';
      return {
        token: 'mock.jwt.refreshed.' + btoa(email),
        refreshToken: 'mock.refresh.' + btoa(email),
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'u-1',
          tenantId: 't-1',
          email,
          firstName: 'Jane',
          lastName: 'Doe',
          roles: ['directeur'],
          active: true,
        },
      };
    },
  },
];
