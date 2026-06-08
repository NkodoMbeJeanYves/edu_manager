import { HttpRequest } from '@angular/common/http';
import { AuthSession, UserRole } from "../../models/user.model";
import { MockRoute } from "../mock-types";

const ONE_HOUR_MS = 60 * 60 * 1000;

/** Construit une AuthSession mock conforme à l'interface réelle. */
export function mockSession(
  identifier: string,
  role: UserRole,
  tokenPrefix = "mock.jwt.",
): AuthSession {
  return {
    accessToken: tokenPrefix + btoa(identifier),
    refreshToken: "mock.refresh." + btoa(identifier),
    accessTokenExpiry: new Date(Date.now() + ONE_HOUR_MS).toISOString(),
    user: {
      id: "u-1",
      tenantId: "t-1",
      email: identifier,
      firstName: "Jane",
      lastName: "Doe",
      roles: [role],
      active: true,
    },
  };
}

const MOCK_ROLE_BY_EMAIL: Record<string, UserRole> = {
  "admin@test.com": "super_admin",
  "directeur@test.com": "directeur",
  "scolarite@test.com": "resp_scolarite",
  "financier@test.com": "resp_financier",
  "filiere@test.com": "resp_filiere",
  "enseignant@test.com": "enseignant",
  "surveillant@test.com": "surveillant_examen",
  "agent.scolarite@test.com": "agent_scolarite",
  "comptable@test.com": "agent_comptable",
  "apprenant@test.com": "apprenant",
  "parent@test.com": "parent",
  "auditeur@test.com": "auditeur",
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
    method: "POST",
    path: "/tokens/login",
    handler: (req: HttpRequest<unknown>) => {
      const body = (req.body as { username?: string; email?: string }) ?? {};
      const identifier = (
        body.username ??
        body.email ??
        "mock@example.com"
      ).toLowerCase();
      const role = MOCK_ROLE_BY_EMAIL[identifier] ?? "directeur";
      return mockSession(identifier, role);
    },
  },
  {
    method: "POST",
    path: "/tokens/refresh",
    handler: () =>
      mockSession("mock@example.com", "directeur", "mock.jwt.refreshed."),
  },
];
