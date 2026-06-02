import { MockRoute } from '../mock-types';
import { UserRole } from '../../models/user.model';

/**
 * Auth mocks.
 *
 * `AuthService.login()` and `AuthService.refresh()` both call HTTP. With
 * `useMocks: true`, those calls are short-circuited here by the mock-backend
 * interceptor.
 *
 * The login handler reproduces the previous email→role mapping that used to
 * live in `auth.service.ts` so dev login still works without a real backend.
 */
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

function buildSession(email: string) {
  const role = MOCK_ROLE_BY_EMAIL[email.toLowerCase()] ?? 'directeur';
  return {
    token: 'mock.jwt.' + btoa(email),
    refreshToken: 'mock.refresh.' + btoa(email),
    expiresAt: Date.now() + 60 * 60 * 1000,
    user: {
      id: 'u-1',
      tenantId: 't-1',
      email,
      firstName: 'Jane',
      lastName: 'Doe',
      roles: [role],
      active: true,
    },
  };
}

export const AUTH_ROUTES: MockRoute[] = [
  {
    method: 'POST',
    path: '/auth/login',
    handler: (req) => {
      const body = (req.body as { email?: string } | null) ?? {};
      const email = body.email ?? 'directeur@test.com';
      return buildSession(email);
    },
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    handler: () => buildSession('mock@example.com'),
  },
];
