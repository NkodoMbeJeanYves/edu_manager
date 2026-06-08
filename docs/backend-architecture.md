# Architecture Backend — edu_manager

> Généré le 2026-06-02 à partir de l'analyse du codebase Angular (`src/`)

---

## Résumé de l'analyse

| Catégorie | Détail |
|---|---|
| Tables détectées | 60 |
| Endpoints API | ~150 |
| Contrôleurs | 15 |
| Domaines fonctionnels | 14 |

### Entités par domaine

| Domaine | Tables |
|---|---|
| Tenant / Établissement | Tenants, Campus, AnneesAcademiques, Periodes, EvenementsCalendrier |
| Structure académique | Cycles, Filieres, Niveaux, Classes, Promotions, Groupes |
| Référentiel pédagogique | Matieres, UniteEnseignements, Programmes |
| Apprenants | Apprenants, Tuteurs, PiecesJustificatives |
| Enseignants | Enseignants, EnseignantSpecialites, AffectationsMatieres, Indisponibilites |
| Inscriptions | Inscriptions, InscriptionGroupes, InscriptionUEs, PeriodesInscription, ListesAttente, InscriptionHistorique |
| EDT | CreneauxHoraires, CoursPlanifies, Seances |
| Notes | Evaluations, Notes, NotesHistorique, MoyennesMatieres, MoyennesGenerales |
| Absences | Presences, Absences, Justificatifs, AbsencesEnseignants, ParametresAbsenteisme |
| Bulletins / Délibérations | Bulletins, BulletinLignes, Deliberations, DeliberationMembres, DeliberationLignes, PVDeliberations |
| Examens | SessionsExamen, Epreuves, Convocations, PVExamens, CasFraude |
| Communication | Notifications, Messages, Annonces, ModelesMessage |
| Finance | Factures, Paiements |
| IAM | Users, UserRoles |

### Relations principales

- `Tenant` 1→N `Campus`, `AnneesAcademiques`, `Cycles`, `Apprenants`, `Enseignants`, …
- `AnneeAcademique` 1→N `Periodes`, `Classes`, `Promotions`, `Inscriptions`
- `Apprenant` 1→N `Tuteurs`, `PiecesJustificatives`, `Inscriptions`, `Notes`, `Presences`
- `Inscription` N→N `Groupes` (InscriptionGroupes), N→N `UE` (InscriptionUEs)
- `CoursPlanifie` 1→N `Seances`
- `Seance` 1→N `Presences` → déduit `Absences`
- `Evaluation` 1→N `Notes`
- `Bulletin` 1→N `BulletinLignes`
- `Deliberation` 1→N `DeliberationLignes`

---

## Livrable 1 — Schéma de base de données

### ERD Textuel

```
TENANTS (PK Id, Code UNIQUE, Nom, Type, Adresse, Ville, Pays, Telephone, Email UNIQUE,
         SiteWeb, LogoUrl, Actif, CreatedAt, UpdatedAt)
    |1
    |N
CAMPUS (PK Id, FK EtablissementId→TENANTS, Code, Nom, Adresse, Ville, TelephoneDirecteur,
        Principal, Actif, CreatedAt, UpdatedAt)
    |1
    |N
SALLES (PK Id, FK CampusId→CAMPUS, Code, Nom, Type, Capacite, Statut, Batiment, Etage,
        CreatedAt, UpdatedAt)
        |1
        |N
SALLE_EQUIPEMENTS (PK Id INT IDENTITY, FK SalleId→SALLES, Nom, Description)

TENANTS |1—N ANNEES_ACADEMIQUES (PK Id, FK EtablissementId→TENANTS, Libelle, DateDebut,
                DateFin, Statut, TypePeriode, Active, CreatedAt, UpdatedAt)
    |1
    |N
PERIODES (PK Id, FK AnneeAcademiqueId→ANNEES_ACADEMIQUES, Libelle, Numero, Type,
          DateDebut, DateFin, Active, CreatedAt, UpdatedAt)

TENANTS |1—N EVENEMENTS_CALENDRIER (PK Id, FK EtablissementId, FK? AnneeAcademiqueId,
                Titre, Description, DateDebut, DateFin, Type, CreatedAt, UpdatedAt)

TENANTS |1—N CYCLES (PK Id, FK EtablissementId, Libelle, Code, Type, TypeFormation,
                Description, Actif, Ordre, CreatedAt, UpdatedAt)
    |1
    |N
FILIERES (PK Id, FK CycleId→CYCLES, FK EtablissementId, Libelle, Code, Description,
          SystemeLMD, DureeAnnees, Actif, CreatedAt, UpdatedAt)
    |1
    |N
NIVEAUX (PK Id, FK FiliereId→FILIERES, Libelle, Code, Ordre, TypeFormation, Actif,
         CreatedAt, UpdatedAt)
    |1
    |N
CLASSES (PK Id, FK NiveauId→NIVEAUX, FK FiliereId, FK EtablissementId,
         FK AnneeAcademiqueId, FK? ProfesseurPrincipalId→ENSEIGNANTS, Libelle, Code,
         CapaciteMax, EffectifActuel, Statut, Salle, CreatedAt, UpdatedAt)

NIVEAUX |1—N PROMOTIONS (PK Id, FK NiveauId, FK FiliereId, FK EtablissementId,
                FK AnneeAcademiqueId, FK? ResponsableId→ENSEIGNANTS, Libelle, Code,
                CapaciteMax, EffectifActuel, Statut, CreatedAt, UpdatedAt)
    |1
    |N
GROUPES (PK Id, FK PromotionId→PROMOTIONS, FK? EnseignantId→ENSEIGNANTS, Libelle,
         Code, Type, CapaciteMax, EffectifActuel, Actif, CreatedAt, UpdatedAt)

FILIERES |1—N MATIERES (PK Id, FK EtablissementId, FK? FiliereId, FK? NiveauId,
                FK? UeId→UNITE_ENSEIGNEMENTS, FK? AnneeAcademiqueId, Code, Libelle,
                Type, Coefficient, VolHoraireCM, VolHoraireTD, VolHoraireTP, VolHoraireTotal,
                NatureEvaluation, PonderationCC, PonderationExamen, Eliminatoire,
                SeuilEliminatoire, NoteMax, Actif, CreatedAt, UpdatedAt)

NIVEAUX |1—N UNITE_ENSEIGNEMENTS (PK Id, FK EtablissementId, FK FiliereId, FK NiveauId,
                FK? AnneeAcademiqueId, Semestre, Code, Libelle, Type, Credits, Coefficient,
                VolHoraireTotal, NatureEvaluation, PonderationCC, PonderationExamen,
                Eliminatoire, SeuilValidation, Compensable, Actif, CreatedAt, UpdatedAt)

UNITE_ENSEIGNEMENTS |1—N MATIERES  (FK UeId — relation UE→Matières)

TENANTS |1—N APPRENANTS (PK Id, FK EtablissementId, NumeroInscription UNIQUE, Type,
                Nom, Prenom, DateNaissance, LieuNaissance, Genre, Nationalite, PhotoUrl,
                Adresse, Ville, Pays, Telephone, Email, Statut, CreatedAt, UpdatedAt)
    |1
    |N
TUTEURS (PK Id, FK ApprenantId→APPRENANTS, Nom, Prenom, LienParente, Telephone,
         TelephoneSecondaire, Email, Adresse, Profession, ContactPrincipal,
         AccesPortail, CreatedAt, UpdatedAt)
APPRENANTS |1—N PIECES_JUSTIFICATIVES (PK Id, FK ApprenantId, Type, Nom, FichierUrl,
                    Statut, Commentaire, UploadedAt, ValidatedAt)

TENANTS |1—N ENSEIGNANTS (PK Id, FK EtablissementId, Matricule UNIQUE, Prenom, Nom,
                Email UNIQUE, Telephone, Genre, DateNaissance, Adresse, PhotoUrl,
                Statut, TypeContrat, DateEntree, DateSortie, NiveauDiplome,
                ChargeHoraireMax, TauxHoraire, CreatedAt, UpdatedAt)
ENSEIGNANTS |1—N ENSEIGNANT_SPECIALITES (PK Id INT IDENTITY, FK EnseignantId, Libelle)

ENSEIGNANTS |N—N MATIERES via AFFECTATIONS_MATIERES
AFFECTATIONS_MATIERES (PK Id, FK EnseignantId, FK MatiereId, FK? ClasseId, FK? PromotionId,
                       FK AnneeAcademiqueId, HeuresPrevues, HeuresRealisees, Actif, CreatedAt)

APPRENANTS |1—N INSCRIPTIONS (PK Id, FK ApprenantId, FK AnneeAcademiqueId,
                FK EtablissementId, Type, Statut, FK? ClasseId→CLASSES, FK? PromotionId,
                NumeroInscription UNIQUE, DateInscription, DateLimiteValidation,
                DateValidation, ValidePar, MotifRejet, FraisInscription, FraisPayes,
                ListAttente, PositionListeAttente, Commentaire,
                FK? ReinscriptionDepuis→INSCRIPTIONS, CreatedAt, UpdatedAt)

INSCRIPTIONS |N—N GROUPES via INSCRIPTION_GROUPES
INSCRIPTION_GROUPES (PK InscriptionId+GroupeId)

INSCRIPTIONS |N—N UNITE_ENSEIGNEMENTS via INSCRIPTION_UES
INSCRIPTION_UES (PK Id, FK InscriptionId, FK UeId, Statut, UNIQUE InscriptionId+UeId)

TENANTS |1—N PERIODES_INSCRIPTION (PK Id, FK EtablissementId, FK AnneeAcademiqueId,
                Libelle, Type, DateOuverture, DateCloture, Ouverte, CapaciteMax,
                CreatedAt, UpdatedAt)

INSCRIPTIONS |1—1 LISTES_ATTENTE (PK Id, FK InscriptionId UNIQUE, ClasseOuPromotionId,
                   Position, DateAjout, Notifie)

INSCRIPTIONS |1—N INSCRIPTION_HISTORIQUE (PK Id, FK InscriptionId, Statut, Date, Par, Commentaire)

TENANTS |1—N CRENEAUX_HORAIRES (PK Id, FK EtablissementId, Libelle, HeureDebut,
                HeureFin, DureeMinutes, Ordre, Actif)

MATIERES |1—N COURS_PLANIFIES (PK Id, FK EtablissementId, FK AnneeAcademiqueId,
                FK? PeriodeId, FK MatiereId, FK EnseignantId, FK? ClasseId,
                FK? PromotionId, FK? GroupeId, FK SalleId, FK? CreneauId,
                TypeCours, TypeRecurrence, JourSemaine, HeureDebut, HeureFin,
                DateDebutValidite, DateFinValidite, Couleur, Note, Statut,
                CreatedAt, UpdatedAt)
    |1
    |N
SEANCES (PK Id, FK? CoursPlanifieId→COURS_PLANIFIES, FK EtablissementId,
         FK MatiereId, FK EnseignantId, FK? ClasseId, FK? PromotionId,
         FK? GroupeId, FK SalleId, TypeCours, Date, HeureDebut, HeureFin,
         DureeMinutes, Statut, ContenuEnseignant, TravauxDemandes,
         PresencesSaisies, EstRemplacement, FK? EnseignantRemplacantId,
         MotifAnnulation, MotifReport, DateReport, CreatedAt, UpdatedAt)

ENSEIGNANTS |1—N INDISPONIBILITES (PK Id, FK EnseignantId, DateDebut, DateFin,
                   HeureDebut, HeureFin, Motif, Type, CreatedAt)

MATIERES |1—N EVALUATIONS (PK Id, FK MatiereId, FK PeriodeId, FK AnneeAcademiqueId,
                FK? ClasseId, FK? PromotionId, FK EnseignantId, Intitule, Type,
                Ponderation, Coefficient, NoteMax, DateEvaluation, Statut,
                CreatedAt, UpdatedAt)
    |1
    |N
NOTES (PK Id, FK EvaluationId→EVALUATIONS, FK ApprenantId→APPRENANTS,
       Valeur, Absent, Dispense, Commentaire, Statut, FK? SaisieParId→USERS,
       FK? ValideParId→USERS, MotifModification, CreatedAt, UpdatedAt,
       UNIQUE EvaluationId+ApprenantId)

NOTES |1—N NOTES_HISTORIQUE (PK Id, FK NoteId, AncienneValeur, NouvelleValeur,
             ModifiePar, Motif, Date)

APPRENANTS |1—N MOYENNES_MATIERES (PK Id, FK MatiereId, FK ApprenantId, FK PeriodeId,
                   Moyenne, NoteCC, NotePartiel, NoteExamen, AppreciationEnseignant,
                   Eliminatoire, SeuilEliminatoire, Statut)

APPRENANTS |1—N MOYENNES_GENERALES (PK Id, FK ApprenantId, FK? PeriodeId,
                   FK AnneeAcademiqueId, Moyenne, Rang, TotalApprenants, Mention,
                   EctsAcquis, EctsTotal, Validee, Statut,
                   UNIQUE ApprenantId+AnneeAcademiqueId+PeriodeId)

SEANCES |1—N PRESENCES (PK Id, FK SeanceId, FK ApprenantId, Statut, MinutesRetard,
                Remarque, FK? SaisieParId→USERS, CreatedAt, UpdatedAt,
                UNIQUE SeanceId+ApprenantId)

APPRENANTS |1—N ABSENCES (PK Id, FK ApprenantId, FK SeanceId, FK? MatiereId,
                FK? EnseignantId, FK? ClasseId, FK? PromotionId, Date, HeureDebut,
                HeureFin, DureeHeures, Statut, EstExamen, ImpactNote, NotifieeParent,
                DateNotification, CreatedAt, UpdatedAt)

ABSENCES |1—1 JUSTIFICATIFS (PK Id, FK AbsenceId UNIQUE, Type, Description,
                 FichierUrl, FichierNom, SoumisParId, DateSoumission,
                 ValidateParId, DateValidation, CommentaireValidation, Statut)

ENSEIGNANTS |1—N ABSENCES_ENSEIGNANTS (PK Id, FK EnseignantId,
                    FK? EnseignantRemplacantId→ENSEIGNANTS, Type, DateDebut, DateFin,
                    Motif, RemplacementPrevu, CreatedAt)

TENANTS |1—1 PARAMETRES_ABSENTEISME (PK Id, FK EtablissementId UNIQUE,
                SeuilAlerte, DelaiSaisieHeures, AbsenceExamenNote0,
                NotificationParent, NotificationDelaiHeures)

TENANTS |1—N SESSIONS_EXAMEN (PK Id, FK EtablissementId, FK AnneeAcademiqueId,
                FK? PeriodeId, Libelle, Type, Statut, DateDebut, DateFin,
                CreatedAt, UpdatedAt)
    |1
    |N
EPREUVES (PK Id, FK SessionId→SESSIONS_EXAMEN, FK MatiereId, FK? ClasseId,
          FK? PromotionId, FK SalleId, FK? EnseignantSurveillantId→ENSEIGNANTS,
          Date, HeureDebut, HeureFin, DureeMinutes, Coefficient, NoteMax,
          ConvocationsGenerees, CreatedAt)
    |1
    |N
CONVOCATIONS (PK Id, FK EpreuveId→EPREUVES, FK ApprenantId→APPRENANTS,
              NumeroPlace, Salle, Statut, DateEnvoi, Eligible, MotifIneligibilite,
              CreatedAt, UNIQUE EpreuveId+ApprenantId)

EPREUVES |1—1 PV_EXAMENS (PK Id, FK EpreuveId UNIQUE, DateRedaction, Observations,
                SignePar, DateSigne, Statut)
    |1
    |N
CAS_FRAUDE (PK Id, FK PVExamenId→PV_EXAMENS, FK ApprenantId, Type, Description, Sanction)

APPRENANTS |1—N BULLETINS (PK Id, FK ApprenantId, FK EtablissementId,
                FK AnneeAcademiqueId, FK PeriodeId→PERIODES, Type, Statut,
                MoyenneGenerale, MoyenneClasse, Rang, TotalApprenants, Mention,
                Decision, AppreciationGenerale, AppreciationProfPrincipal, BilanAbsTotal,
                BilanAbsJustifiees, BilanAbsInjustifiees, SignePar, DateSigne,
                DatePublication, PdfUrl, CreatedAt, UpdatedAt,
                UNIQUE ApprenantId+PeriodeId)
    |1
    |N
BULLETIN_LIGNES (PK Id, FK BulletinId→BULLETINS, FK MatiereId, Coefficient,
                 NoteCC, NotePartiel, NoteExamen, Moyenne, MoyenneClasse,
                 Appreciation, EnseignantNom, Rang, Eliminatoire)

TENANTS |1—N DELIBERATIONS (PK Id, FK EtablissementId, FK AnneeAcademiqueId,
                FK PeriodeId, ClasseOuPromotionId, ClasseOuPromotionLibelle, Type,
                Statut, Session, DateDeliberation, President, CompensationActivee,
                PvUrl, SignePar, DateSigne, DatePublication, CreatedAt, UpdatedAt)

DELIBERATIONS |1—N DELIBERATION_MEMBRES (FK DeliberationId, Membre)
DELIBERATIONS |1—N DELIBERATION_LIGNES (PK Id, FK DeliberationId, FK ApprenantId,
                        MoyenneGenerale, EctsAcquis, SemestreValide, Decision, Mention,
                        Commentaire, CasSpecial, ModifieeManuel)

TENANTS |1—N USERS (PK Id, FK TenantId, Email UNIQUE, PasswordHash, FirstName, LastName,
                Active, FK? ApprenantId→APPRENANTS, CreatedAt)
USERS |1—N USER_ROLES (FK UserId, Role, PK UserId+Role)

TENANTS |1—N NOTIFICATIONS (PK Id, FK TenantId, FK DestinatairId→USERS, Type,
                Titre, Corps, Statut, CreatedAt)
TENANTS |1—N MESSAGES (PK Id, FK TenantId, FK ExpediteurId→USERS,
                FK DestinataireId→USERS, Sujet, Corps, Priorite, Lu, EnvoyeAt)
TENANTS |1—N ANNONCES (PK Id, FK TenantId, Titre, Corps, Audience, Epingle,
                PublieAt, PubliePar)
TENANTS |1—N MODELES_MESSAGE (PK Id, FK TenantId, Nom, Type, Evenement,
                Sujet, Corps, Actif, UpdatedAt)

TENANTS |1—N FACTURES (PK Id, FK TenantId, NumeroFacture UNIQUE, FK ApprenantId,
                Description, Montant, MontantPaye, Devise, EmisAt, EcheanceAt, Statut)
FACTURES |1—N PAIEMENTS (PK Id, FK TenantId, NumeroRecu UNIQUE, FK FactureId,
                FK ApprenantId, Montant, Devise, Methode, Statut, Reference,
                RecuAt, RecuPar)
```

### Choix de conception

| Décision | Justification |
|---|---|
| `uniqueidentifier` (GUID) pour toutes les PK | L'application utilise `string` partout (UUIDs), pas d'auto-incrément — compatible avec génération côté client |
| `Tenant` = `Etablissement` fusionnés | `tenantId` (feature models) et `etablissementId` (core models) désignent la même entité. Une seule table `Tenants` évite la duplication |
| Soft delete absent — pas de `IsDeleted` | Les modèles utilisent des champs `statut`/`actif` pour désactiver sans supprimer. Pas de soft delete générique, colonne `Actif BIT` par entité |
| `SalleEquipements` table dédiée | `equipements: Equipement[]` est un array dans la salle — modélisé en table dépendante plutôt qu'en JSON pour permettre la recherche par équipement |
| `EnseignantSpecialites` table dépendante | `specialites: string[]` idem |
| `MoyennesMatieres` / `MoyennesGenerales` persistées | Ces entités ont un `statut` (en_cours/calculee/validee) → elles doivent être stockées, pas juste calculées à la volée |
| `InscriptionGroupes` table de jointure | Relation N-N explicite : un apprenant peut être dans plusieurs groupes (TD, TP, langue) pour une même inscription |
| `BulletinLignes` table dépendante | `lignes: LigneBulletin[]` — structure tabulaire du bulletin |
| Champs d'audit sur toutes les tables principales | `CreatedAt`, `UpdatedAt` systématiques. `CreatedBy`/`UpdatedBy` à ajouter si besoin d'audit trail complet |
| Pas de table `Roles` — enum en DB | Les rôles sont un ensemble fermé de 12 valeurs — stockés comme `nvarchar(50)` dans `UserRoles`, contrainte CHECK pour validation |

---

## Livrable 2 — Documentation des API (ASP.NET Core 8)

### Contraintes techniques

- Base de données : **SQL Server**
- ORM : **Entity Framework Core 8**
- Pattern : **RESTful**, versioning `/api/v1/`
- Auth : **JWT Bearer** + ASP.NET Core Identity
- Nommage C# : **PascalCase** entités, **camelCase** JSON
- Nommage SQL : **PascalCase** colonnes
- Null safety : types nullables C# 8+

### Pattern pagination commun

```json
{
  "data": [...],
  "total": 250,
  "page": 1,
  "limit": 20,
  "totalPages": 13
}
```

### Pattern response standard

```json
{
  "data": { ... },
  "message": "Opération réussie",
  "success": true
}
```

---

### 1. AuthController

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Non | Authentification, retourne JWT + refresh token |
| POST | `/api/v1/auth/refresh` | Non | Renouveler le JWT via refresh token |
| POST | `/api/v1/auth/logout` | Oui | Invalider le refresh token côté serveur |
| GET | `/api/v1/auth/me` | Oui | Retourne l'utilisateur courant |

**POST /api/v1/auth/login**
```json
// Request
{ "email": "string", "password": "string", "tenantCode": "string?" }

// Response 200
{ "token": "string", "refreshToken": "string", "expiresAt": 1234567890,
  "user": { "id": "guid", "tenantId": "guid", "email": "string",
            "firstName": "string", "lastName": "string",
            "roles": ["directeur"], "active": true } }
// Erreurs : 400, 401
```

---

### 2. EtablissementsController

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/etablissements` | super_admin, directeur | Liste paginée |
| GET | `/api/v1/etablissements/{id}` | Oui | Détail |
| POST | `/api/v1/etablissements` | super_admin | Création |
| PATCH | `/api/v1/etablissements/{id}` | super_admin, directeur | Mise à jour |
| DELETE | `/api/v1/etablissements/{id}` | super_admin | Suppression |
| GET | `/api/v1/etablissements/{id}/campus` | Oui | Campus de l'établissement |
| GET | `/api/v1/etablissements/{id}/annees-academiques` | Oui | Années académiques |
| GET | `/api/v1/etablissements/{id}/calendrier` | Oui | Événements calendrier |

**Query params GET /etablissements** : `search?`, `type?`, `actif?`, `page=1`, `limit=20`

**CreateEtablissementDto**
```json
{ "nom": "string", "code": "string", "type": "scolaire|universitaire",
  "adresse": "string", "ville": "string", "pays": "string",
  "telephone": "string", "email": "string", "siteWeb": "string?" }
```

---

### 3. CampusController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/campus/{id}` |
| POST | `/api/v1/campus` |
| PATCH | `/api/v1/campus/{id}` |
| DELETE | `/api/v1/campus/{id}` |

**CreateCampusDto** : `{ etablissementId, nom, code, adresse, ville, telephoneDirecteur?, principal? }`

---

### 4. AnneesAcademiquesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/annees-academiques/{id}` | Détail |
| POST | `/api/v1/annees-academiques` | Création |
| PATCH | `/api/v1/annees-academiques/{id}` | Mise à jour |
| PATCH | `/api/v1/annees-academiques/{id}/activer` | Activer |
| PATCH | `/api/v1/annees-academiques/{id}/cloturer` | Clôturer |

---

### 5. PeriodesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/annees-academiques/{anneeId}/periodes` |
| POST | `/api/v1/periodes` |
| PATCH | `/api/v1/periodes/{id}` |
| DELETE | `/api/v1/periodes/{id}` |

---

### 6. SallesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/salles` |
| GET | `/api/v1/salles/{id}` |
| POST | `/api/v1/salles` |
| PATCH | `/api/v1/salles/{id}` |
| DELETE | `/api/v1/salles/{id}` |

**Query params GET /salles** : `campusId?`, `type?`, `statut?`, `capaciteMin?`, `page`, `limit`

---

### 7. CalendrierController

| Méthode | Endpoint |
|---|---|
| POST | `/api/v1/calendrier` |
| DELETE | `/api/v1/calendrier/{id}` |

---

### 8. Structure (Cycles → Filieres → Niveaux → Classes → Promotions → Groupes)

#### CyclesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/cycles?etablissementId&actif&search&page&limit` |
| GET | `/api/v1/cycles/{id}` |
| POST | `/api/v1/cycles` |
| PATCH | `/api/v1/cycles/{id}` |
| DELETE | `/api/v1/cycles/{id}` |

#### FilieresController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/filieres?cycleId&etablissementId&actif&search&page&limit` |
| GET | `/api/v1/filieres/{id}` |
| POST | `/api/v1/filieres` |
| PATCH | `/api/v1/filieres/{id}` |
| DELETE | `/api/v1/filieres/{id}` |

#### NiveauxController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/niveaux?filiereId&actif&search&page&limit` |
| GET | `/api/v1/niveaux/{id}` |
| POST | `/api/v1/niveaux` |
| PATCH | `/api/v1/niveaux/{id}` |
| DELETE | `/api/v1/niveaux/{id}` |

#### ClassesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/classes?etablissementId&anneeAcademiqueId&filiereId&niveauId&statut&search&page&limit` |
| GET | `/api/v1/classes/{id}` |
| POST | `/api/v1/classes` |
| PATCH | `/api/v1/classes/{id}` |
| DELETE | `/api/v1/classes/{id}` |

#### PromotionsController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/promotions?etablissementId&anneeAcademiqueId&filiereId&niveauId&statut&search&page&limit` |
| GET | `/api/v1/promotions/{id}` |
| POST | `/api/v1/promotions` |
| PATCH | `/api/v1/promotions/{id}` |
| DELETE | `/api/v1/promotions/{id}` |

#### GroupesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/groupes?promotionId&type&actif` |
| GET | `/api/v1/groupes/{id}` |
| POST | `/api/v1/groupes` |
| PATCH | `/api/v1/groupes/{id}` |
| DELETE | `/api/v1/groupes/{id}` |

---

### 9. Référentiel (Matières, UE, Programmes)

#### MatieresController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/matieres?etablissementId&filiereId&niveauId&ueId&type&eliminatoire&actif&search&page&limit` | Liste |
| GET | `/api/v1/matieres/{id}` | Détail |
| POST | `/api/v1/matieres` | Création |
| PATCH | `/api/v1/matieres/{id}` | Mise à jour |
| DELETE | `/api/v1/matieres/{id}` | Suppression |
| POST | `/api/v1/matieres/{id}/rattacher-ue` | Rattacher à une UE |

#### UniteEnseignementsController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/ue?etablissementId&filiereId&niveauId&semestre&type&actif&search&page&limit` |
| GET | `/api/v1/ue/{id}` |
| POST | `/api/v1/ue` |
| PATCH | `/api/v1/ue/{id}` |
| DELETE | `/api/v1/ue/{id}` |

#### ProgrammesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/programmes?etablissementId&filiereId&niveauId&anneeAcademiqueId&actif` |
| GET | `/api/v1/programmes/{id}` |
| POST | `/api/v1/programmes/dupliquer` |

---

### 10. ApprenantsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/apprenants?search&type&statut&etablissementId&anneeAcademiqueId&classeId&page&limit` | Liste |
| GET | `/api/v1/apprenants/{id}` | Détail |
| POST | `/api/v1/apprenants` | Création |
| PATCH | `/api/v1/apprenants/{id}` | Mise à jour |
| DELETE | `/api/v1/apprenants/{id}` | Suppression |
| GET | `/api/v1/apprenants/{id}/inscriptions` | Inscriptions de l'apprenant |
| GET | `/api/v1/apprenants/{id}/notes?periodeId?&anneeId?` | Notes |
| GET | `/api/v1/apprenants/{id}/moyennes?anneeAcademiqueId` | Moyennes |
| GET | `/api/v1/apprenants/{id}/moyennes-ue?semestreId` | Moyennes UE |
| POST | `/api/v1/apprenants/{id}/tuteurs` | Ajouter tuteur |
| PATCH | `/api/v1/apprenants/{id}/tuteurs/{tuteurId}` | Modifier tuteur |
| DELETE | `/api/v1/apprenants/{id}/tuteurs/{tuteurId}` | Supprimer tuteur |
| POST | `/api/v1/apprenants/{id}/pieces` | Upload pièce justificative (multipart) |
| PATCH | `/api/v1/apprenants/{id}/pieces/{pieceId}/valider` | Valider pièce |
| DELETE | `/api/v1/apprenants/{id}/pieces/{pieceId}` | Supprimer pièce |
| GET | `/api/v1/apprenants/stats?etablissementId?` | Statistiques |

---

### 11. EnseignantsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/enseignants?etablissementId&statut&typeContrat&matiereId&search&page&limit` | Liste |
| GET | `/api/v1/enseignants/{id}` | Détail |
| POST | `/api/v1/enseignants` | Création |
| PATCH | `/api/v1/enseignants/{id}` | Mise à jour |
| DELETE | `/api/v1/enseignants/{id}` | Suppression |
| POST | `/api/v1/enseignants/{id}/affecter-matiere` | Affecter une matière |
| PATCH | `/api/v1/enseignants/{id}/affectations/{affId}` | Modifier affectation |
| DELETE | `/api/v1/enseignants/{id}/affectations/{affId}` | Retirer affectation |
| GET | `/api/v1/enseignants/{id}/charge-horaire?anneeAcademiqueId` | Charge horaire |
| GET | `/api/v1/enseignants/stats?etablissementId?` | Statistiques |

---

### 12. InscriptionsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/inscriptions?search&anneeAcademiqueId&etablissementId&statut&type&classeId&promotionId&fraisPayes&listAttente&page&limit` | Liste |
| GET | `/api/v1/inscriptions/{id}` | Détail |
| POST | `/api/v1/inscriptions` | Création |
| PATCH | `/api/v1/inscriptions/{id}` | Mise à jour |
| PATCH | `/api/v1/inscriptions/{id}/soumettre` | Soumettre |
| PATCH | `/api/v1/inscriptions/{id}/valider` | Valider |
| PATCH | `/api/v1/inscriptions/{id}/rejeter` | Rejeter |
| PATCH | `/api/v1/inscriptions/{id}/annuler` | Annuler |
| PATCH | `/api/v1/inscriptions/{id}/affecter` | Affecter classe/promotion |
| GET | `/api/v1/inscriptions/{id}/historique` | Historique des statuts |
| GET | `/api/v1/inscriptions/stats?etablissementId?&anneeId?` | Statistiques |
| POST | `/api/v1/inscriptions/reinscription` | Initier réinscription |
| GET | `/api/v1/inscriptions/eligibilite-reinscription?apprenantId&anneeAcademiqueId` | Vérifier éligibilité |

---

### 13. PeriodeInscriptionController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/periodes-inscription?etablissementId` |
| POST | `/api/v1/periodes-inscription` |
| PATCH | `/api/v1/periodes-inscription/{id}/ouvrir` |
| PATCH | `/api/v1/periodes-inscription/{id}/fermer` |
| DELETE | `/api/v1/periodes-inscription/{id}` |

---

### 14. EDT Controllers

#### CoursPlanifiesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cours-planifies?etablissementId&anneeAcademiqueId&classeId?&promotionId?` | Liste |
| GET | `/api/v1/cours-planifies/{id}` | Détail |
| POST | `/api/v1/cours-planifies` | Création |
| PATCH | `/api/v1/cours-planifies/{id}` | Mise à jour |
| DELETE | `/api/v1/cours-planifies/{id}` | Suppression |
| POST | `/api/v1/cours-planifies/{id}/generer` | Générer les séances |

#### SeancesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/seances?etablissementId&anneeId&periodeId?&enseignantId?&classeId?&promotionId?&groupeId?&salleId?&matiereId?&dateDebut?&dateFin?&statut?&semaine?&page&limit` | Liste |
| GET | `/api/v1/seances/{id}` | Détail |
| POST | `/api/v1/seances` | Création |
| PATCH | `/api/v1/seances/{id}` | Mise à jour |
| DELETE | `/api/v1/seances/{id}` | Suppression |
| PATCH | `/api/v1/seances/{id}/annuler` | Annuler |
| PATCH | `/api/v1/seances/{id}/reporter` | Reporter |
| PATCH | `/api/v1/seances/{id}/realiser` | Marquer réalisée |
| PATCH | `/api/v1/seances/{id}/cahier-texte` | Saisir cahier de textes |
| PATCH | `/api/v1/seances/{id}/remplacer` | Remplacer enseignant |

#### EDTController (vues & outils)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/edt/vue?vue=classe\|enseignant\|salle\|promotion&entityId&semaine&anneeAcademiqueId` | Vue calendrier |
| POST | `/api/v1/edt/conflits` | Vérifier conflits |
| PATCH | `/api/v1/edt/publier` | Publier EDT |
| GET | `/api/v1/edt/stats?etablissementId&anneeAcademiqueId&classeId?` | Statistiques |
| GET | `/api/v1/edt/couverture?classeOuPromotionId&periodeId?` | Couverture par matière |

#### CreneauxController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/creneaux?etablissementId` |
| POST | `/api/v1/creneaux` |
| PATCH | `/api/v1/creneaux/{id}` |
| DELETE | `/api/v1/creneaux/{id}` |

#### IndisponibilitesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/indisponibilites?enseignantId` |
| POST | `/api/v1/indisponibilites` |
| DELETE | `/api/v1/indisponibilites/{id}` |

---

### 15. Notes Controllers

#### EvaluationsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/evaluations?matiereId?&periodeId?&anneeId?&classeId?&promotionId?&enseignantId?&type?&statut?&page&limit` | Liste |
| GET | `/api/v1/evaluations/{id}` | Détail |
| POST | `/api/v1/evaluations` | Création |
| PATCH | `/api/v1/evaluations/{id}` | Mise à jour |
| DELETE | `/api/v1/evaluations/{id}` | Suppression |
| GET | `/api/v1/evaluations/{id}/notes` | Notes de l'évaluation |
| POST | `/api/v1/evaluations/{id}/soumettre` | Soumettre |
| PATCH | `/api/v1/evaluations/{id}/valider` | Valider |
| PATCH | `/api/v1/evaluations/{id}/publier` | Publier |
| PATCH | `/api/v1/evaluations/{id}/cloturer` | Clôturer |
| GET | `/api/v1/evaluations/{id}/statistiques` | Statistiques |

#### NotesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/notes?evaluationId?&apprenantId?&matiereId?&periodeId?&statut?&page&limit` | Liste |
| POST | `/api/v1/notes` | Saisie individuelle |
| PATCH | `/api/v1/notes/{id}` | Modification |
| POST | `/api/v1/notes/masse` | Saisie de masse |

#### MoyennesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/moyennes/{classeOuPromotionId}?periodeId&type=classe\|promotion` | Moyennes de classe |
| POST | `/api/v1/moyennes/calculer` | Calculer les moyennes |
| PATCH | `/api/v1/appreciations` | Saisir appréciation matière |

---

### 16. Absences Controllers

#### PresencesController

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/presences/saisir` | Saisir feuille de présence |
| PATCH | `/api/v1/presences/{id}` | Modifier présence |

#### AbsencesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/absences?apprenantId?&classeId?&promotionId?&matiereId?&statut?&dateDebut?&dateFin?&estExamen?&etablissementId?&anneeAcademiqueId?&page&limit` | Liste |
| GET | `/api/v1/absences/{id}` | Détail |
| POST | `/api/v1/absences/{id}/justificatif` | Soumettre justificatif (multipart) |
| PATCH | `/api/v1/justificatifs/{id}/valider` | Valider/rejeter justificatif |
| GET | `/api/v1/absences/stats-apprenant/{apprenantId}?anneeId?&classeId?` | Stats apprenant |
| GET | `/api/v1/absences/stats-classe/{classeOuPromotionId}?periodeId?` | Stats classe |

#### AbsencesEnseignantsController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/absences-enseignants?enseignantId?&etablissementId?` |
| POST | `/api/v1/absences-enseignants` |
| GET | `/api/v1/absences-enseignants/{id}` |

#### ParametresAbsenteismeController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/parametres-absenteisme/{etablissementId}` |
| PUT | `/api/v1/parametres-absenteisme/{etablissementId}` |

---

### 17. BulletinsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/bulletins?apprenantId?&periodeId?&anneeId?&classeId?&statut?&type?&page&limit` | Liste |
| GET | `/api/v1/bulletins/{id}` | Détail |
| GET | `/api/v1/bulletins/{id}/pdf` | Télécharger PDF |
| POST | `/api/v1/bulletins/generer` | Générer bulletins en masse |
| POST | `/api/v1/bulletins/releve` | Générer relevé universitaire |
| PATCH | `/api/v1/bulletins/{id}/valider` | Valider |
| PATCH | `/api/v1/bulletins/{id}/signer` | Signer |
| PATCH | `/api/v1/bulletins/{id}/publier` | Publier |
| PATCH | `/api/v1/bulletins/appreciations` | Saisir appréciations |
| GET | `/api/v1/deliberations?etablissementId?&anneeId?&periodeId?&type?&statut?&page&limit` | Liste délibérations |
| GET | `/api/v1/deliberations/{id}` | Détail délibération |
| POST | `/api/v1/deliberations` | Créer délibération |
| PATCH | `/api/v1/deliberations/{id}/decision` | Saisir décision |
| PATCH | `/api/v1/deliberations/{id}/signer` | Signer |
| PATCH | `/api/v1/deliberations/{id}/publier` | Publier |

---

### 18. Examens Controllers

#### SessionsExamenController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/sessions-examen?etablissementId?&anneeId?&type?&statut?&page&limit` |
| GET | `/api/v1/sessions-examen/{id}` |
| POST | `/api/v1/sessions-examen` |
| PATCH | `/api/v1/sessions-examen/{id}` |
| DELETE | `/api/v1/sessions-examen/{id}` |

#### EpreuvesController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/epreuves?sessionId?&matiereId?&classeId?&promotionId?` | Liste |
| GET | `/api/v1/epreuves/{id}` | Détail |
| POST | `/api/v1/epreuves` | Création |
| PATCH | `/api/v1/epreuves/{id}` | Mise à jour |
| DELETE | `/api/v1/epreuves/{id}` | Suppression |
| POST | `/api/v1/epreuves/{id}/convocations/generer` | Générer convocations |

#### ConvocationsController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/convocations?epreuveId?&apprenantId?&statut?` |
| GET | `/api/v1/convocations/{id}` |
| PATCH | `/api/v1/convocations/{id}/envoyer` |

#### PVExamensController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/pv-examens/{epreuveId}` |
| POST | `/api/v1/pv-examens` |
| PATCH | `/api/v1/pv-examens/{id}/signer` |

---

### 19. Communication Controllers

#### NotificationsController

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/notifications?page&limit` | Notifications de l'utilisateur courant |
| PATCH | `/api/v1/notifications/{id}/lire` | Marquer lue |
| PATCH | `/api/v1/notifications/lire-tout` | Tout marquer lu |
| DELETE | `/api/v1/notifications/{id}` | Supprimer |
| GET | `/api/v1/notifications/non-lues` | Compteur non lues |

#### MessagesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/messages?folder=INBOX\|SENT&search?&page&limit` |
| GET | `/api/v1/messages/{id}` |
| POST | `/api/v1/messages` |
| PATCH | `/api/v1/messages/{id}/lire` |
| DELETE | `/api/v1/messages/{id}` |

#### AnnoncesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/annonces?audience?&pinnedOnly?&search?&page&limit` |
| GET | `/api/v1/annonces/{id}` |
| POST | `/api/v1/annonces` |
| PATCH | `/api/v1/annonces/{id}` |
| DELETE | `/api/v1/annonces/{id}` |

#### ModelesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/modeles?type?&event?&actif?&search?&page&limit` |
| GET | `/api/v1/modeles/{id}` |
| POST | `/api/v1/modeles` |
| PATCH | `/api/v1/modeles/{id}` |
| DELETE | `/api/v1/modeles/{id}` |

---

### 20. Finance Controllers

#### FacturesController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/factures?search?&statut?&page&limit` |
| GET | `/api/v1/factures/{id}` |
| POST | `/api/v1/factures` |
| PATCH | `/api/v1/factures/{id}` |
| DELETE | `/api/v1/factures/{id}` |

#### PaiementsController

| Méthode | Endpoint |
|---|---|
| GET | `/api/v1/paiements?search?&method?&statut?&page&limit` |
| GET | `/api/v1/paiements/{id}` |
| POST | `/api/v1/paiements` |
| PATCH | `/api/v1/paiements/{id}/confirmer` |
| PATCH | `/api/v1/paiements/{id}/rembourser` |

---

## Livrable 3 — Code C# (EF Core 8)

> **Convention** : Fluent API dans `OnModelCreating`. PascalCase pour les entités C#. Les enums TypeScript sont mappés en `string` (`nvarchar`) avec contrainte CHECK. Les `id: string` deviennent `Guid`.

### A) BaseEntity

```csharp
// Domain/Entities/BaseEntity.cs
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

### A) Entités principales

```csharp
// Domain/Entities/Tenant.cs
public class Tenant : BaseEntity
{
    public string Code { get; set; } = null!;
    public string Nom { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Adresse { get; set; } = null!;
    public string Ville { get; set; } = null!;
    public string Pays { get; set; } = null!;
    public string Telephone { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? SiteWeb { get; set; }
    public string? LogoUrl { get; set; }
    public bool Actif { get; set; } = true;

    public ICollection<Campus> Campus { get; set; } = [];
    public ICollection<AnneeAcademique> AnneesAcademiques { get; set; } = [];
    public ICollection<Cycle> Cycles { get; set; } = [];
    public ICollection<Apprenant> Apprenants { get; set; } = [];
    public ICollection<Enseignant> Enseignants { get; set; } = [];
    public ICollection<User> Users { get; set; } = [];
    public ParametresAbsenteisme? ParametresAbsenteisme { get; set; }
}

// Domain/Entities/Apprenant.cs
public class Apprenant : BaseEntity
{
    public Guid EtablissementId { get; set; }
    public string NumeroInscription { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Nom { get; set; } = null!;
    public string Prenom { get; set; } = null!;
    public DateOnly DateNaissance { get; set; }
    public string LieuNaissance { get; set; } = null!;
    public string Genre { get; set; } = null!;
    public string Nationalite { get; set; } = null!;
    public string? PhotoUrl { get; set; }
    public string Adresse { get; set; } = null!;
    public string Ville { get; set; } = null!;
    public string Pays { get; set; } = null!;
    public string? Telephone { get; set; }
    public string? Email { get; set; }
    public string Statut { get; set; } = "actif";

    public Tenant Etablissement { get; set; } = null!;
    public ICollection<Tuteur> Tuteurs { get; set; } = [];
    public ICollection<PieceJustificative> PiecesJustificatives { get; set; } = [];
    public ICollection<Inscription> Inscriptions { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
    public ICollection<Absence> Absences { get; set; } = [];
    public ICollection<Presence> Presences { get; set; } = [];
    public ICollection<Convocation> Convocations { get; set; } = [];
    public ICollection<Bulletin> Bulletins { get; set; } = [];
    public ICollection<Facture> Factures { get; set; } = [];
}

// Domain/Entities/Enseignant.cs
public class Enseignant : BaseEntity
{
    public Guid EtablissementId { get; set; }
    public string Matricule { get; set; } = null!;
    public string Prenom { get; set; } = null!;
    public string Nom { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Telephone { get; set; }
    public string Genre { get; set; } = null!;
    public DateOnly? DateNaissance { get; set; }
    public string? Adresse { get; set; }
    public string? PhotoUrl { get; set; }
    public string Statut { get; set; } = "actif";
    public string TypeContrat { get; set; } = null!;
    public DateOnly DateEntree { get; set; }
    public DateOnly? DateSortie { get; set; }
    public string? NiveauDiplome { get; set; }
    public int? ChargeHoraireMax { get; set; }
    public decimal? TauxHoraire { get; set; }

    public Tenant Etablissement { get; set; } = null!;
    public ICollection<EnseignantSpecialite> Specialites { get; set; } = [];
    public ICollection<AffectationMatiere> Affectations { get; set; } = [];
    public ICollection<Seance> Seances { get; set; } = [];
    public ICollection<Evaluation> Evaluations { get; set; } = [];
    public ICollection<Indisponibilite> Indisponibilites { get; set; } = [];
    public ICollection<AbsenceEnseignant> Absences { get; set; } = [];
}

// Domain/Entities/Inscription.cs
public class Inscription : BaseEntity
{
    public Guid ApprenantId { get; set; }
    public Guid AnneeAcademiqueId { get; set; }
    public Guid EtablissementId { get; set; }
    public string Type { get; set; } = null!;
    public string Statut { get; set; } = "brouillon";
    public Guid? ClasseId { get; set; }
    public Guid? PromotionId { get; set; }
    public string NumeroInscription { get; set; } = null!;
    public DateTime DateInscription { get; set; } = DateTime.UtcNow;
    public DateTime? DateLimiteValidation { get; set; }
    public DateTime? DateValidation { get; set; }
    public string? ValidePar { get; set; }
    public string? MotifRejet { get; set; }
    public decimal? FraisInscription { get; set; }
    public bool FraisPayes { get; set; } = false;
    public bool ListAttente { get; set; } = false;
    public int? PositionListeAttente { get; set; }
    public string? Commentaire { get; set; }
    public Guid? ReinscriptionDepuisId { get; set; }

    public Apprenant Apprenant { get; set; } = null!;
    public AnneeAcademique AnneeAcademique { get; set; } = null!;
    public Classe? Classe { get; set; }
    public Promotion? Promotion { get; set; }
    public Inscription? ReinscriptionDepuis { get; set; }
    public ICollection<InscriptionGroupe> InscriptionGroupes { get; set; } = [];
    public ICollection<InscriptionUE> InscriptionUEs { get; set; } = [];
    public ICollection<InscriptionHistorique> Historique { get; set; } = [];
    public ListeAttente? ListeAttenteEntry { get; set; }
}

// Domain/Entities/Seance.cs
public class Seance : BaseEntity
{
    public Guid? CoursPlanifieId { get; set; }
    public Guid EtablissementId { get; set; }
    public Guid MatiereId { get; set; }
    public Guid EnseignantId { get; set; }
    public Guid? ClasseId { get; set; }
    public Guid? PromotionId { get; set; }
    public Guid? GroupeId { get; set; }
    public Guid SalleId { get; set; }
    public string TypeCours { get; set; } = null!;
    public DateOnly Date { get; set; }
    public TimeOnly HeureDebut { get; set; }
    public TimeOnly HeureFin { get; set; }
    public int DureeMinutes { get; set; }
    public string Statut { get; set; } = "planifiee";
    public string? ContenuEnseignant { get; set; }
    public string? TravauxDemandes { get; set; }
    public bool PresencesSaisies { get; set; } = false;
    public bool EstRemplacement { get; set; } = false;
    public Guid? EnseignantRemplacantId { get; set; }
    public string? MotifAnnulation { get; set; }
    public string? MotifReport { get; set; }
    public DateOnly? DateReport { get; set; }

    public CoursPlanifie? CoursPlanifie { get; set; }
    public Matiere Matiere { get; set; } = null!;
    public Enseignant Enseignant { get; set; } = null!;
    public Enseignant? EnseignantRemplacant { get; set; }
    public Salle Salle { get; set; } = null!;
    public Classe? Classe { get; set; }
    public Promotion? Promotion { get; set; }
    public Groupe? Groupe { get; set; }
    public ICollection<Presence> Presences { get; set; } = [];
    public ICollection<Absence> Absences { get; set; } = [];
}

// Domain/Entities/Note.cs
public class Note : BaseEntity
{
    public Guid EvaluationId { get; set; }
    public Guid ApprenantId { get; set; }
    public decimal? Valeur { get; set; }
    public bool Absent { get; set; } = false;
    public bool Dispense { get; set; } = false;
    public string? Commentaire { get; set; }
    public string Statut { get; set; } = "brouillon";
    public Guid? SaisieParId { get; set; }
    public Guid? ValideParId { get; set; }
    public string? MotifModification { get; set; }

    public Evaluation Evaluation { get; set; } = null!;
    public Apprenant Apprenant { get; set; } = null!;
    public ICollection<NoteHistorique> Historique { get; set; } = [];
}

// Domain/Entities/Bulletin.cs
public class Bulletin : BaseEntity
{
    public Guid ApprenantId { get; set; }
    public Guid EtablissementId { get; set; }
    public Guid AnneeAcademiqueId { get; set; }
    public Guid PeriodeId { get; set; }
    public string Type { get; set; } = "bulletin";
    public string Statut { get; set; } = "brouillon";
    public decimal? MoyenneGenerale { get; set; }
    public decimal? MoyenneClasse { get; set; }
    public int? Rang { get; set; }
    public int? TotalApprenants { get; set; }
    public string? Mention { get; set; }
    public string? Decision { get; set; }
    public string? AppreciationGenerale { get; set; }
    public string? AppreciationProfPrincipal { get; set; }
    public int BilanAbsTotal { get; set; } = 0;
    public int BilanAbsJustifiees { get; set; } = 0;
    public int BilanAbsInjustifiees { get; set; } = 0;
    public string? SignePar { get; set; }
    public DateTime? DateSigne { get; set; }
    public DateTime? DatePublication { get; set; }
    public string? PdfUrl { get; set; }

    public Apprenant Apprenant { get; set; } = null!;
    public Periode Periode { get; set; } = null!;
    public ICollection<BulletinLigne> Lignes { get; set; } = [];
}
```

### B) DbContext

```csharp
// Infrastructure/Data/AppDbContext.cs
public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Campus> Campus => Set<Campus>();
    public DbSet<AnneeAcademique> AnneesAcademiques => Set<AnneeAcademique>();
    public DbSet<Periode> Periodes => Set<Periode>();
    public DbSet<EvenementCalendrier> EvenementsCalendrier => Set<EvenementCalendrier>();
    public DbSet<Salle> Salles => Set<Salle>();
    public DbSet<SalleEquipement> SalleEquipements => Set<SalleEquipement>();
    public DbSet<Cycle> Cycles => Set<Cycle>();
    public DbSet<Filiere> Filieres => Set<Filiere>();
    public DbSet<Niveau> Niveaux => Set<Niveau>();
    public DbSet<Classe> Classes => Set<Classe>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<Groupe> Groupes => Set<Groupe>();
    public DbSet<Apprenant> Apprenants => Set<Apprenant>();
    public DbSet<Tuteur> Tuteurs => Set<Tuteur>();
    public DbSet<PieceJustificative> PiecesJustificatives => Set<PieceJustificative>();
    public DbSet<Enseignant> Enseignants => Set<Enseignant>();
    public DbSet<EnseignantSpecialite> EnseignantSpecialites => Set<EnseignantSpecialite>();
    public DbSet<AffectationMatiere> AffectationsMatieres => Set<AffectationMatiere>();
    public DbSet<Matiere> Matieres => Set<Matiere>();
    public DbSet<UniteEnseignement> UniteEnseignements => Set<UniteEnseignement>();
    public DbSet<Inscription> Inscriptions => Set<Inscription>();
    public DbSet<InscriptionGroupe> InscriptionGroupes => Set<InscriptionGroupe>();
    public DbSet<InscriptionUE> InscriptionUEs => Set<InscriptionUE>();
    public DbSet<InscriptionHistorique> InscriptionHistoriques => Set<InscriptionHistorique>();
    public DbSet<ListeAttente> ListesAttente => Set<ListeAttente>();
    public DbSet<PeriodeInscription> PeriodesInscription => Set<PeriodeInscription>();
    public DbSet<CreneauHoraire> CreneauxHoraires => Set<CreneauHoraire>();
    public DbSet<CoursPlanifie> CoursPlanifies => Set<CoursPlanifie>();
    public DbSet<Seance> Seances => Set<Seance>();
    public DbSet<Indisponibilite> Indisponibilites => Set<Indisponibilite>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<NoteHistorique> NotesHistorique => Set<NoteHistorique>();
    public DbSet<MoyenneMatiere> MoyennesMatieres => Set<MoyenneMatiere>();
    public DbSet<MoyenneGenerale> MoyennesGenerales => Set<MoyenneGenerale>();
    public DbSet<Presence> Presences => Set<Presence>();
    public DbSet<Absence> Absences => Set<Absence>();
    public DbSet<Justificatif> Justificatifs => Set<Justificatif>();
    public DbSet<AbsenceEnseignant> AbsencesEnseignants => Set<AbsenceEnseignant>();
    public DbSet<ParametresAbsenteisme> ParametresAbsenteisme => Set<ParametresAbsenteisme>();
    public DbSet<SessionExamen> SessionsExamen => Set<SessionExamen>();
    public DbSet<Epreuve> Epreuves => Set<Epreuve>();
    public DbSet<Convocation> Convocations => Set<Convocation>();
    public DbSet<PVExamen> PVExamens => Set<PVExamen>();
    public DbSet<CasFraude> CasFraude => Set<CasFraude>();
    public DbSet<Bulletin> Bulletins => Set<Bulletin>();
    public DbSet<BulletinLigne> BulletinLignes => Set<BulletinLigne>();
    public DbSet<Deliberation> Deliberations => Set<Deliberation>();
    public DbSet<DeliberationLigne> DeliberationLignes => Set<DeliberationLigne>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Annonce> Annonces => Set<Annonce>();
    public DbSet<ModeleMessage> ModelesMessage => Set<ModeleMessage>();
    public DbSet<Facture> Factures => Set<Facture>();
    public DbSet<Paiement> Paiements => Set<Paiement>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(ct);
    }
}
```

### B) Configurations Fluent API (extraits clés)

```csharp
// Infrastructure/Data/Configurations/TenantConfiguration.cs
public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> b)
    {
        b.ToTable("Tenants");
        b.HasKey(t => t.Id);
        b.Property(t => t.Code).HasMaxLength(50).IsRequired();
        b.Property(t => t.Nom).HasMaxLength(200).IsRequired();
        b.Property(t => t.Type).HasMaxLength(20).IsRequired();
        b.Property(t => t.Email).HasMaxLength(200).IsRequired();
        b.HasIndex(t => t.Code).IsUnique();
        b.HasIndex(t => t.Email).IsUnique();
        b.Property(t => t.Actif).HasDefaultValue(true);
        b.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
    }
}

// Infrastructure/Data/Configurations/InscriptionConfiguration.cs
public class InscriptionConfiguration : IEntityTypeConfiguration<Inscription>
{
    public void Configure(EntityTypeBuilder<Inscription> b)
    {
        b.ToTable("Inscriptions");
        b.HasKey(i => i.Id);
        b.HasIndex(i => i.NumeroInscription).IsUnique();
        b.Property(i => i.Statut).HasMaxLength(20).HasDefaultValue("brouillon");
        b.Property(i => i.FraisInscription).HasColumnType("decimal(12,2)");

        b.HasOne(i => i.Apprenant).WithMany(a => a.Inscriptions)
            .HasForeignKey(i => i.ApprenantId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(i => i.AnneeAcademique).WithMany(a => a.Inscriptions)
            .HasForeignKey(i => i.AnneeAcademiqueId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(i => i.Classe).WithMany(c => c.Inscriptions)
            .HasForeignKey(i => i.ClasseId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        b.HasOne(i => i.Promotion).WithMany(p => p.Inscriptions)
            .HasForeignKey(i => i.PromotionId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        b.HasOne(i => i.ReinscriptionDepuis).WithMany()
            .HasForeignKey(i => i.ReinscriptionDepuisId).IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

// Infrastructure/Data/Configurations/NoteConfiguration.cs
public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> b)
    {
        b.ToTable("Notes");
        b.HasKey(n => n.Id);
        b.HasIndex(n => new { n.EvaluationId, n.ApprenantId }).IsUnique();
        b.Property(n => n.Valeur).HasColumnType("decimal(5,2)");
        b.Property(n => n.Statut).HasMaxLength(20).HasDefaultValue("brouillon");
        b.HasOne(n => n.Evaluation).WithMany(e => e.Notes)
            .HasForeignKey(n => n.EvaluationId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(n => n.Apprenant).WithMany(a => a.Notes)
            .HasForeignKey(n => n.ApprenantId).OnDelete(DeleteBehavior.Restrict);
    }
}

// Infrastructure/Data/Configurations/SeanceConfiguration.cs
public class SeanceConfiguration : IEntityTypeConfiguration<Seance>
{
    public void Configure(EntityTypeBuilder<Seance> b)
    {
        b.ToTable("Seances");
        b.HasKey(s => s.Id);
        b.HasOne(s => s.Enseignant).WithMany(e => e.Seances)
            .HasForeignKey(s => s.EnseignantId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(s => s.EnseignantRemplacant).WithMany()
            .HasForeignKey(s => s.EnseignantRemplacantId).IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);
        b.HasOne(s => s.Salle).WithMany(sa => sa.Seances)
            .HasForeignKey(s => s.SalleId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(s => s.CoursPlanifie).WithMany(cp => cp.Seances)
            .HasForeignKey(s => s.CoursPlanifieId).IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
        b.HasIndex(s => new { s.EtablissementId, s.Date, s.SalleId });
        b.HasIndex(s => new { s.EtablissementId, s.Date, s.EnseignantId });
    }
}

// Infrastructure/Data/Configurations/BulletinConfiguration.cs
public class BulletinConfiguration : IEntityTypeConfiguration<Bulletin>
{
    public void Configure(EntityTypeBuilder<Bulletin> b)
    {
        b.ToTable("Bulletins");
        b.HasKey(bl => bl.Id);
        b.HasIndex(bl => new { bl.ApprenantId, bl.PeriodeId }).IsUnique();
        b.Property(bl => bl.MoyenneGenerale).HasColumnType("decimal(5,2)");
        b.HasOne(bl => bl.Apprenant).WithMany(a => a.Bulletins)
            .HasForeignKey(bl => bl.ApprenantId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(bl => bl.Periode).WithMany(p => p.Bulletins)
            .HasForeignKey(bl => bl.PeriodeId).OnDelete(DeleteBehavior.Restrict);
    }
}
```

### C) Migration initiale

```csharp
// Migrations/XXXXXX_InitialCreate.cs
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Ordre de création respectant les FK :
        // 1. Tenants (racine)
        migrationBuilder.CreateTable("Tenants", t => new
        {
            Id = t.Column<Guid>(nullable: false),
            Code = t.Column<string>(maxLength: 50, nullable: false),
            Nom = t.Column<string>(maxLength: 200, nullable: false),
            Type = t.Column<string>(maxLength: 20, nullable: false),
            Adresse = t.Column<string>(maxLength: 500, nullable: false),
            Ville = t.Column<string>(maxLength: 100, nullable: false),
            Pays = t.Column<string>(maxLength: 100, nullable: false),
            Telephone = t.Column<string>(maxLength: 50, nullable: false),
            Email = t.Column<string>(maxLength: 200, nullable: false),
            SiteWeb = t.Column<string>(maxLength: 500, nullable: true),
            LogoUrl = t.Column<string>(maxLength: 500, nullable: true),
            Actif = t.Column<bool>(nullable: false, defaultValue: true),
            CreatedAt = t.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
            UpdatedAt = t.Column<DateTime>(nullable: false)
        }, constraints: t => t.PrimaryKey("PK_Tenants", x => x.Id));

        migrationBuilder.CreateIndex("IX_Tenants_Code", "Tenants", "Code", unique: true);
        migrationBuilder.CreateIndex("IX_Tenants_Email", "Tenants", "Email", unique: true);

        // 2. Campus
        migrationBuilder.CreateTable("Campus", t => new
        {
            Id = t.Column<Guid>(nullable: false),
            EtablissementId = t.Column<Guid>(nullable: false),
            Nom = t.Column<string>(maxLength: 200, nullable: false),
            Code = t.Column<string>(maxLength: 50, nullable: false),
            Adresse = t.Column<string>(maxLength: 500, nullable: false),
            Ville = t.Column<string>(maxLength: 100, nullable: false),
            TelephoneDirecteur = t.Column<string>(maxLength: 50, nullable: true),
            Principal = t.Column<bool>(nullable: false, defaultValue: false),
            Actif = t.Column<bool>(nullable: false, defaultValue: true),
            CreatedAt = t.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
            UpdatedAt = t.Column<DateTime>(nullable: false)
        }, constraints: t =>
        {
            t.PrimaryKey("PK_Campus", x => x.Id);
            t.ForeignKey("FK_Campus_Tenants_EtablissementId", x => x.EtablissementId,
                "Tenants", "Id", onDelete: ReferentialAction.Restrict);
        });

        // Suite dans le même ordre :
        // 3. AnneesAcademiques → 4. Periodes
        // 5. EvenementsCalendrier
        // 6. Salles → 7. SalleEquipements
        // 8. Cycles → 9. Filieres → 10. Niveaux → 11. Classes / 12. Promotions → 13. Groupes
        // 14. Apprenants → 15. Tuteurs / 16. PiecesJustificatives
        // 17. Enseignants → 18. EnseignantSpecialites
        // 19. UniteEnseignements → 20. Matieres (FK UeId nullable)
        // 21. AffectationsMatieres
        // 22. Inscriptions → 23. InscriptionGroupes / 24. InscriptionUEs / 25. InscriptionHistoriques / 26. ListesAttente
        // 27. PeriodesInscription
        // 28. CreneauxHoraires → 29. CoursPlanifies → 30. Seances
        // 31. Indisponibilites
        // 32. Evaluations → 33. Notes → 34. NotesHistorique
        // 35. MoyennesMatieres / 36. MoyennesGenerales
        // 37. Presences / 38. Absences → 39. Justificatifs
        // 40. AbsencesEnseignants / 41. ParametresAbsenteisme
        // 42. SessionsExamen → 43. Epreuves → 44. Convocations / 45. PVExamens → 46. CasFraude
        // 47. Bulletins → 48. BulletinLignes
        // 49. Deliberations → 50. DeliberationMembres / 51. DeliberationLignes
        // 52. Users / 53. Notifications / 54. Messages / 55. Annonces / 56. ModelesMessage
        // 57. Factures → 58. Paiements
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Ordre inverse (feuilles avant racines)
        migrationBuilder.DropTable("Paiements");
        migrationBuilder.DropTable("Factures");
        migrationBuilder.DropTable("ModelesMessage");
        migrationBuilder.DropTable("Annonces");
        migrationBuilder.DropTable("Messages");
        migrationBuilder.DropTable("Notifications");
        migrationBuilder.DropTable("DeliberationLignes");
        migrationBuilder.DropTable("DeliberationMembres");
        migrationBuilder.DropTable("Deliberations");
        migrationBuilder.DropTable("BulletinLignes");
        migrationBuilder.DropTable("Bulletins");
        migrationBuilder.DropTable("CasFraude");
        migrationBuilder.DropTable("PVExamens");
        migrationBuilder.DropTable("Convocations");
        migrationBuilder.DropTable("Epreuves");
        migrationBuilder.DropTable("SessionsExamen");
        migrationBuilder.DropTable("Justificatifs");
        migrationBuilder.DropTable("Absences");
        migrationBuilder.DropTable("Presences");
        migrationBuilder.DropTable("ParametresAbsenteisme");
        migrationBuilder.DropTable("AbsencesEnseignants");
        migrationBuilder.DropTable("NotesHistorique");
        migrationBuilder.DropTable("Notes");
        migrationBuilder.DropTable("Evaluations");
        migrationBuilder.DropTable("MoyennesGenerales");
        migrationBuilder.DropTable("MoyennesMatieres");
        migrationBuilder.DropTable("Indisponibilites");
        migrationBuilder.DropTable("Seances");
        migrationBuilder.DropTable("CoursPlanifies");
        migrationBuilder.DropTable("CreneauxHoraires");
        migrationBuilder.DropTable("PeriodesInscription");
        migrationBuilder.DropTable("ListesAttente");
        migrationBuilder.DropTable("InscriptionHistoriques");
        migrationBuilder.DropTable("InscriptionUEs");
        migrationBuilder.DropTable("InscriptionGroupes");
        migrationBuilder.DropTable("Inscriptions");
        migrationBuilder.DropTable("AffectationsMatieres");
        migrationBuilder.DropTable("Matieres");
        migrationBuilder.DropTable("UniteEnseignements");
        migrationBuilder.DropTable("Groupes");
        migrationBuilder.DropTable("Promotions");
        migrationBuilder.DropTable("Classes");
        migrationBuilder.DropTable("Niveaux");
        migrationBuilder.DropTable("Filieres");
        migrationBuilder.DropTable("Cycles");
        migrationBuilder.DropTable("PiecesJustificatives");
        migrationBuilder.DropTable("Tuteurs");
        migrationBuilder.DropTable("Apprenants");
        migrationBuilder.DropTable("EnseignantSpecialites");
        migrationBuilder.DropTable("Enseignants");
        migrationBuilder.DropTable("SalleEquipements");
        migrationBuilder.DropTable("Salles");
        migrationBuilder.DropTable("EvenementsCalendrier");
        migrationBuilder.DropTable("Periodes");
        migrationBuilder.DropTable("AnneesAcademiques");
        migrationBuilder.DropTable("Campus");
        migrationBuilder.DropTable("Tenants");
    }
}
```

### D) Seed de données de référence

```csharp
// Infrastructure/Data/Seeds/RoleSeed.cs
public static class RoleSeed
{
    public static readonly string[] Roles =
    [
        "super_admin", "directeur", "resp_scolarite", "resp_financier",
        "resp_filiere", "enseignant", "surveillant_examen", "agent_scolarite",
        "agent_comptable", "apprenant", "parent", "auditeur"
    ];

    public static async Task SeedAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }
}

// Infrastructure/Data/Seeds/SuperAdminSeed.cs
public static class SuperAdminSeed
{
    public static async Task SeedAsync(UserManager<User> userManager, AppDbContext db)
    {
        if (await db.Tenants.AnyAsync()) return;

        var tenant = new Tenant
        {
            Code = "DEMO",
            Nom = "Établissement Demo",
            Type = "scolaire",
            Adresse = "1 rue de l'École",
            Ville = "Paris",
            Pays = "France",
            Telephone = "+33100000000",
            Email = "demo@school.edu"
        };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var admin = new User
        {
            TenantId = tenant.Id,
            UserName = "admin@school.edu",
            Email = "admin@school.edu",
            FirstName = "Super",
            LastName = "Admin",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(admin, "Admin@123!");
        await userManager.AddToRoleAsync(admin, "super_admin");
    }
}
```

---

## Points d'attention et recommandations

### Multi-tenancy
Le header `X-Tenant-Id` injecté par l'intercepteur Angular doit être validé dans un **middleware ASP.NET Core** qui ajoute le `tenantId` au `HttpContext`. Envisager un **Global Query Filter** EF Core sur toutes les entités ayant `EtablissementId` pour l'isolation automatique :

```csharp
builder.HasQueryFilter(e => e.EtablissementId == _tenantId);
```

### FK circulaire Matiere ↔ UniteEnseignement
`Matiere.UeId` est nullable et `UniteEnseignement` a `Matieres` comme collection. FK nullable résolue avec `OnDelete(DeleteBehavior.SetNull)`. La migration doit créer `UniteEnseignements` **avant** `Matieres`.

### Index de performance
Ajouter sur les requêtes les plus fréquentes :

```sql
CREATE INDEX IX_Seances_Date_Enseignant   ON Seances (Date, EnseignantId, EtablissementId);
CREATE INDEX IX_Notes_Evaluation          ON Notes (EvaluationId, ApprenantId);
CREATE INDEX IX_Absences_Apprenant_Date   ON Absences (ApprenantId, Date, Statut);
CREATE INDEX IX_Bulletins_Apprenant       ON Bulletins (ApprenantId, PeriodeId);
CREATE INDEX IX_Inscriptions_Annee_Statut ON Inscriptions (AnneeAcademiqueId, Statut, EtablissementId);
```

### Entités reporting (vues calculées)
`RapportPedagogique`, `RapportAbsenteisme`, `RapportFinancier`, `Dashboard` sont des **projections calculées** — ne pas les persister en table. Les exposer via des endpoints dédiés qui agrègent en SQL ou depuis un cache Redis.

### Champs d'audit complets
Ajouter `CreatedById` / `UpdatedById` (FK → Users) sur les entités sensibles (Notes, Bulletins, Délibérations) pour la traçabilité réglementaire.

### Upload de fichiers
`PieceJustificative.FichierUrl` et `Justificatif.FichierUrl` pointent vers un stockage externe (Azure Blob / S3). Prévoir un service dédié avec URL signées — ne jamais stocker les binaires en base.

### Versioning API
Le préfixe `/api/v1/` est dans les routes. Configurer via `AddApiVersioning()` pour faciliter la migration future vers `/api/v2/` sans casser les clients existants.
