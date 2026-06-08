import { UserRole } from "@core/models/user.model";

/**
 * Niveau par portée d'autorité (section 1 du doc d'accréditation).
 *
 * Variante 4 niveaux pratiques (fusion `apprenant`+`parent`+`auditeur` en
 * `externe`). Ne porte pas de hiérarchie ordonnée — c'est une catégorisation
 * d'affichage. La substitution hiérarchique (cas 4.2) reste hors-scope V1.
 */
export type AuthorityLevel =
  | "institutionnel"
  | "pedagogique"
  | "support"
  | "externe";

export const ROLE_AUTHORITY: Record<UserRole, AuthorityLevel> = {
  super_admin: "institutionnel",
  SuperAdmin: "institutionnel",
  Directeur: "institutionnel",
  DirecteurPedagogique: "institutionnel",
  ResponsableAdministratif: "institutionnel",
  Apprenant: "externe",
  Parent: "externe",
  Externe: "externe",
  Auditeur: "externe",
  Bibliothecaire: "support",
  Comptable: "support",
  Secretaire: "support",
  Enseignant: "pedagogique",
  Surveillant: "support",
  directeur: "institutionnel",
  resp_scolarite: "institutionnel",
  resp_financier: "institutionnel",
  resp_filiere: "pedagogique",
  enseignant: "pedagogique",
  surveillant_examen: "support",
  agent_scolarite: "support",
  agent_comptable: "support",
  apprenant: "externe",
  parent: "externe",
  auditeur: "externe",
};

export const AUTHORITY_LEVEL_LABEL: Record<AuthorityLevel, string> = {
  institutionnel: $localize`:@@authorityLevel.institutionnel:Institutionnel`,
  pedagogique: $localize`:@@authorityLevel.pedagogique:Pédagogique`,
  support: $localize`:@@authorityLevel.support:Support`,
  externe: $localize`:@@authorityLevel.externe:Externe`,
};
