export namespace ApiResponse {
  export interface Meta {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  }

  // Interface pour les liens de navigation
  export interface Links {
    self: string;
    first: string;
    last: string;
  }

  // Interface principale pour la réponse
  export interface Items<T> {
    data: T[];
    meta: Meta;
    links: Links;
  }
}
