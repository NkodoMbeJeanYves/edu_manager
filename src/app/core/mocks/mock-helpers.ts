import { HttpParams } from '@angular/common/http';
import { PaginatedResponse } from '../models/etablissement.models';

/**
 * Matches a path template like '/matieres/:id' against an actual url.
 * Returns captured params or null if no match.
 *
 * Path/query string handling:
 * - leading '/' is normalized
 * - any '?...' suffix is stripped before matching
 */
export function matchPath(template: string, url: string): Record<string, string> | null {
  const cleanUrl = url.split('?')[0];
  const tParts = template.replace(/^\//, '').split('/');
  const uParts = cleanUrl.replace(/^\//, '').split('/');

  if (tParts.length !== uParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < tParts.length; i++) {
    const t = tParts[i];
    const u = uParts[i];
    if (t.startsWith(':')) {
      params[t.slice(1)] = decodeURIComponent(u);
    } else if (t !== u) {
      return null;
    }
  }
  return params;
}

/**
 * Reads query parameters from an HttpRequest, returning a plain object.
 * Repeated keys keep the last value (consistent with simple form filters).
 */
export function readQuery(params: HttpParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of params.keys()) {
    const v = params.get(key);
    if (v !== null) out[key] = v;
  }
  return out;
}

/**
 * Returns a relative path from a full URL by stripping the apiUrl prefix.
 * Returns null if the URL doesn't belong to the mock backend.
 */
export function relativePath(url: string, apiUrl: string): string | null {
  if (!url.startsWith(apiUrl)) return null;
  return url.slice(apiUrl.length) || '/';
}

/**
 * Generic case-insensitive 'search' filter over selected string fields.
 */
export function search<T>(items: T[], query: string | undefined, fields: (keyof T)[]): T[] {
  if (!query) return items;
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((x) =>
    fields.some((f) => String(x[f] ?? '').toLowerCase().includes(q)),
  );
}

/**
 * Paginates an array into the project's PaginatedResponse shape.
 * Reads `page` (1-based) and `limit` from the filters; defaults: page=1, limit=20.
 */
export function paginate<T>(
  items: T[],
  q: { page?: string | number; limit?: string | number },
): PaginatedResponse<T> {
  const page = Math.max(1, Number(q.page ?? 1));
  const limit = Math.max(1, Number(q.limit ?? 20));
  const start = (page - 1) * limit;
  const total = items.length;
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Wraps a single item in the project's ApiResponse shape.
 */
export function ok<T>(data: T, message?: string): { data: T; success: boolean; message?: string } {
  return { data, success: true, ...(message ? { message } : {}) };
}

/** Current ISO timestamp (used by mock create/update). */
export function nowIso(): string {
  return new Date().toISOString();
}
