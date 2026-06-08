import { computed, signal } from "@angular/core";
import { PageMeta, PageRequest } from "./pagination.types";

/**
 * Fabrique un état de pagination réutilisable (signals + actions),
 * à intégrer dans n'importe quel store Pattern A.
 */
export function createPagination(opts?: { size?: number }) {
  const _page = signal(1);
  const _size = signal(opts?.size ?? 20);
  const _total = signal(0);
  const _totalPages = signal(0);

  return {
    page: _page.asReadonly(),
    size: _size.asReadonly(),
    total: _total.asReadonly(),
    totalPages: _totalPages.asReadonly(),

    hasPrev: computed(() => _page() > 1),
    hasNext: computed(() => _page() < _totalPages()),

    /** Synchronise l'état à partir de la réponse (serveur ou mock). */
    setMeta(meta: PageMeta): void {
      _total.set(meta.total);
      _totalPages.set(meta.totalPages);
      _page.set(meta.page);
    },

    /** Requête de page courante à passer au service. */
    request(): PageRequest {
      return { page: _page(), size: _size() };
    },

    goTo(page: number): void {
      _page.set(page);
    },

    reset(): void {
      _page.set(1);
    },

    setSize(size: number): void {
      _size.set(size);
      _page.set(1);
    },
  };
}

export type Pagination = ReturnType<typeof createPagination>;
