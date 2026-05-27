export type AudienceType = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'STAFF';

export interface Annonce {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  audience: AudienceType;
  pinned: boolean;
  publishedAt: string;
  publishedBy: string;
}

export interface AnnonceFilter {
  search?: string;
  audience?: AudienceType;
  pinnedOnly?: boolean;
}

export type AnnonceDraft = Omit<Annonce, 'id' | 'tenantId' | 'publishedAt'>;
