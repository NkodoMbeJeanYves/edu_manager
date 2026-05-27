import { HttpRequest } from '@angular/common/http';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * Route matcher for the mock backend.
 *
 * - `method` HTTP verb (matched exactly)
 * - `path`   path template relative to environment.apiUrl, with `:name` placeholders
 *            e.g. '/matieres/:id' will capture `{ id: 'abc' }` from '/matieres/abc'
 * - `handler` returns the response body (will be wrapped in HttpResponse(200))
 *
 * The handler can also throw HttpErrorResponse to simulate error paths.
 */
export interface MockRoute {
  method: HttpMethod;
  path: string;
  handler: MockHandler;
}

export type MockHandler = (
  req: HttpRequest<unknown>,
  params: Record<string, string>,
) => unknown;
