import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_ROUTES } from '../mocks/mock-routes';
import { matchPath, relativePath } from '../mocks/mock-helpers';

const MOCK_LATENCY_MS = 180;

/**
 * Mock backend interceptor.
 *
 * - No-op when `environment.useMocks === false`.
 * - For URLs starting with `environment.apiUrl`, looks up a matching route in
 *   MOCK_ROUTES. If found, runs the handler and returns its result as a 200
 *   HttpResponse (or as the thrown HttpErrorResponse if the handler throws).
 * - If no route matches, the request is forwarded to the next handler. In a
 *   fully-mocked dev setup that means it will hit the live URL (and likely
 *   fail), so a warning is logged to help spot missing routes early.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!environment.useMocks) return next(req);

  const path = relativePath(req.url, environment.apiUrl);
  if (path === null) return next(req);

  for (const route of MOCK_ROUTES) {
    if (route.method !== req.method) continue;
    const params = matchPath(route.path, path);
    if (!params) continue;

    try {
      const body = route.handler(req, params);
      return of(
        new HttpResponse<unknown>({
          status: 200,
          body,
          url: req.url,
        }),
      ).pipe(delay(MOCK_LATENCY_MS));
    } catch (err) {
      const httpErr =
        err instanceof HttpErrorResponse
          ? err
          : new HttpErrorResponse({
              status: 500,
              statusText: 'Mock Handler Error',
              error: err instanceof Error ? err.message : String(err),
            });
      return throwError(() => httpErr).pipe(delay(MOCK_LATENCY_MS));
    }
  }

  console.warn(`[mock] no route for ${req.method} ${path} — forwarding to real backend`);
  return next(req);
};
