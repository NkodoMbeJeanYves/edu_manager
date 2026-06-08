# Guide du Seed — edu_manager

## Contexte des données

| Paramètre | Valeur |
|---|---|
| Établissements | Lycée Bilingue de Yaoundé (LBY) · Institut Supérieur de Technologie de Douala (ISTD) |
| Années académiques | 2023-2024 (clôturée) · 2024-2025 (active) par établissement |
| Apprenants | 10 au lycée (3ème A + Tle S1) · 7 à l'IST (L1 Info + L2 Info) |
| Enseignants | 8 (dont 1 multi-rôles) |
| Devise | XAF (Franc CFA) |
| Mot de passe universel | `EduManager@2025!` |

## Comptes utilisateurs créés

| Email | Rôle(s) | Profil |
|---|---|---|
| `superadmin@edu-manager.cm` | super_admin | Administrateur système |
| `admin.multi@lby.cm` | **directeur + resp_scolarite + resp_financier + enseignant** | Alain NKODO — directeur et prof de Maths |
| `j.martin@lby.cm` | enseignant | Jean-Pierre MARTIN — Maths |
| `p.tchoupo@ist-douala.cm` | enseignant | Patrick TCHOUPO — Informatique IST |
| `agent.scol@lby.cm` | agent_scolarite | Scolarité LBY |
| `comptable@lby.cm` | agent_comptable | Comptabilité LBY |
| `kamga.jean@eleve.lby.cm` | apprenant | Élève portail |
| `kamga.etienne@parent.lby.cm` | parent | Portail parent |
| `auditeur@edu-manager.cm` | auditeur | Lecture seule |

## Features couvertes par les données

| Feature | Couverture |
|---|---|
| Multi-tenant | ✅ 2 établissements indépendants |
| Structure académique | ✅ cycles → filières → niveaux → classes/promotions → groupes |
| Référentiel pédagogique | ✅ matières + UE (LMD) + programme |
| Inscriptions | ✅ tous les statuts : brouillon, validée, rejetée, annulée, en_attente |
| Liste d'attente | ✅ 1 apprenant en attente (IST) |
| EDT | ✅ cours planifiés + séances réalisées/annulées/reportées/planifiées |
| Cahier de textes | ✅ contenu enseignant sur séances réalisées |
| Remplacement enseignant | ✅ 1 remplacement sur séance |
| Notes | ✅ tous les statuts : brouillon, soumise, validée, publiée |
| Saisie en masse | ✅ simulée sur évaluation publiée |
| Moyennes calculées | ✅ moyennes matière + moyennes générales T1 |
| Présences / Absences | ✅ tous les statuts présence + absence |
| Justificatifs | ✅ en_attente, accepté, rejeté |
| Absences enseignants | ✅ avec remplacement prévu |
| Paramètres absentéisme | ✅ configurés par établissement |
| Sessions examen | ✅ planifiée (LBY) + en_cours (IST) |
| Convocations | ✅ éligibles + 1 inéligible (dette) |
| PV examen + fraude | ✅ 1 cas de fraude signé |
| Bulletins | ✅ brouillon → généré → signé → publié |
| Relevé de notes (LMD) | ✅ relevé universitaire IST |
| Délibérations | ✅ conseil de classe (LBY) + jury universitaire (IST) |
| Communication | ✅ notifications, messages, annonces, modèles |
| Finance | ✅ factures (tous statuts) + paiements |

## Utilisation

### Option A — C# (recommandée, gère le hachage des mots de passe)

```csharp
// Program.cs
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    await DbInitializer.SeedAsync(db, userManager, roleManager);
}
```

### Option B — SQL (entités métier uniquement, hors utilisateurs)

```sql
-- Dans SSMS ou Azure Data Studio :
-- 1. Ouvrir seed_complet.sql
-- 2. Vérifier que la base cible est sélectionnée
-- 3. Exécuter (F5)
-- Les tables AspNetUsers/AspNetRoles/AspNetUserRoles sont gérées par le DbInitializer C#
```

### Ordre d'exécution (SQL seul)

```
1. seed_complet.sql    ← tout le schéma métier
2. DbInitializer.cs    ← utilisateurs + rôles (via API au 1er démarrage)
```

## Réinitialisation complète

```sql
-- Supprimer dans l'ordre inverse des FK (à adapter si soft-delete activé)
DELETE FROM Paiements; DELETE FROM Factures;
DELETE FROM DeliberationLignes; DELETE FROM Deliberations;
DELETE FROM BulletinLignes; DELETE FROM Bulletins;
DELETE FROM CasFraude; DELETE FROM PVExamens; DELETE FROM Convocations; DELETE FROM Epreuves; DELETE FROM SessionsExamen;
DELETE FROM Justificatifs; DELETE FROM Absences; DELETE FROM Presences;
DELETE FROM NotesHistorique; DELETE FROM Notes; DELETE FROM Evaluations;
DELETE FROM MoyennesGenerales; DELETE FROM MoyennesMatieres;
DELETE FROM Seances; DELETE FROM CoursPlanifies; DELETE FROM CreneauxHoraires;
DELETE FROM InscriptionHistoriques; DELETE FROM InscriptionUEs; DELETE FROM InscriptionGroupes; DELETE FROM ListesAttente; DELETE FROM Inscriptions;
DELETE FROM AffectationsMatieres;
DELETE FROM EnseignantSpecialites; DELETE FROM Enseignants;
DELETE FROM PiecesJustificatives; DELETE FROM Tuteurs; DELETE FROM Apprenants;
DELETE FROM Matieres; DELETE FROM UniteEnseignements;
DELETE FROM Groupes; DELETE FROM Promotions; DELETE FROM Classes;
DELETE FROM Niveaux; DELETE FROM Filieres; DELETE FROM Cycles;
DELETE FROM SalleEquipements; DELETE FROM Salles;
DELETE FROM EvenementsCalendrier; DELETE FROM Periodes; DELETE FROM AnneesAcademiques;
DELETE FROM Campus; DELETE FROM ParametresAbsenteisme; DELETE FROM Tenants;
DELETE FROM Annonces; DELETE FROM Messages; DELETE FROM Notifications; DELETE FROM ModelesMessage;
DELETE FROM AspNetUserRoles; DELETE FROM AspNetUsers; DELETE FROM AspNetRoles;
```
