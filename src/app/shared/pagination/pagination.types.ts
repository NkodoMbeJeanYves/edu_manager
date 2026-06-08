import { ApiResponse } from "@core/models/apiResponse";
import { PaginatedResponse } from "@core/models/etablissement.models";

/** Forme interne normalisée de la métadonnée de pagination. */
export interface PageMeta {
  page: number; // 1-based
  size: number;
  total: number;
  totalPages: number;
}

/** Requête de page envoyée au service. */
export interface PageRequest {
  page: number; // 1-based
  size: number;
}

/** Adapte la forme `ApiResponse.Items<T>.meta` (students) vers `PageMeta`. */
export function fromItemsMeta(meta: ApiResponse.Meta): PageMeta {
  return {
    page: meta.page,
    size: meta.size,
    total: meta.totalItems,
    totalPages: meta.totalPages,
  };
}

/** Adapte la forme plate `PaginatedResponse<T>` vers `PageMeta`. */
export function fromPaginated<T>(res: PaginatedResponse<T>): PageMeta {
  return {
    page: res.page,
    size: res.limit,
    total: res.total,
    totalPages: res.totalPages,
  };
}

/**
 * Pagine un tableau complet côté client (pour les services encore en mock).
 * Bascule triviale vers le serveur ensuite : remplacer l'appel par la réponse paginée réelle.
 */
export function paginateClient<T>(
  all: T[],
  req: PageRequest,
): { data: T[]; meta: PageMeta } {
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / req.size));
  const page = Math.min(Math.max(1, req.page), totalPages);
  const start = (page - 1) * req.size;
  return {
    data: all.slice(start, start + req.size),
    meta: { page, size: req.size, total, totalPages },
  };
}
