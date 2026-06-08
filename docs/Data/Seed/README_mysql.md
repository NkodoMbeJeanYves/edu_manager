# Guide du Seed — edu_manager (MySQL)

## Contexte des données

| Paramètre | Valeur |
|---|---|
| Établissements | Lycée Bilingue de Yaoundé (LBY) · Institut Supérieur de Technologie de Douala (ISTD) |
| Années académiques | 2023-2024 (clôturée) · 2024-2025 (active) par établissement |
| Apprenants | 10 au lycée (3ème A + Tle S1) · 7 à l'IST (L1 Info + L2 Info) |
| Enseignants | 8 (dont 1 multi-rôles) |
| Devise | XAF (Franc CFA) |
| Mot de passe universel | `EduManager@2025!` |
| Encodage BDD | `utf8mb4` / `utf8mb4_unicode_ci` |
| Moteur de tables | InnoDB (FK + transactions) |

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

---

## Prérequis MySQL

### 1. Package NuGet

```bash
dotnet add package Pomelo.EntityFrameworkCore.MySql
```

### 2. Chaîne de connexion (`appsettings.json`)

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=edu_manager;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
}
```

### 3. Configuration EF Core (`Program.cs`)

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        b => b.MigrationsAssembly("EduManager.Infrastructure")
    )
);
```

### 4. Configuration Identity (`Program.cs`)

```csharp
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
    {
        options.Password.RequiredLength         = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase       = true;
        options.Password.RequireDigit           = true;
        options.User.RequireUniqueEmail         = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
```

### 5. Appel du DbInitializer (`Program.cs`)

```csharp
using (var scope = app.Services.CreateScope())
{
    var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    await DbInitializerMySql.SeedAsync(db, userManager, roleManager);
}
```

---

## Différences SQL Server → MySQL

| Élément | SQL Server | MySQL |
|---|---|---|
| Début transaction | `BEGIN TRANSACTION` | `START TRANSACTION` |
| Fin transaction | `COMMIT TRANSACTION` | `COMMIT` |
| Encodage | `N'texte'` (nvarchar) | `'texte'` (utf8mb4) |
| UUID généré | `NEWID()` | `UUID()` |
| Délimiteurs identifiants | `[NomTable]` | `` `NomTable` `` |
| Variables | `DECLARE @v TYPE = val` | `SET @v = val` |
| Booléen | `BIT` (`1`/`0`) | `TINYINT(1)` (`1`/`0`) |
| Type GUID colonne | `UNIQUEIDENTIFIER` | `CHAR(36)` |
| Provider EF Core | `UseSqlServer(...)` | `UseMySql(...)` |
| Package EF Core | `Microsoft.EntityFrameworkCore.SqlServer` | `Pomelo.EntityFrameworkCore.MySql` |

> **Important :** si vos colonnes `Id` sont définies en `CHAR(36)` dans le schéma MySQL, vérifiez que la configuration Fluent API utilise `.HasColumnType("char(36)")` pour les propriétés `Guid`.

---

## Utilisation

### Option A — C# recommandée (gère le hachage des mots de passe)

```
1. Créer la base MySQL :
   CREATE DATABASE edu_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

2. Appliquer les migrations EF Core :
   dotnet ef database update

3. Exécuter seed_complet_mysql.sql  ← entités métier
4. Lancer l'application             ← DbInitializerMySql.SeedAsync() s'exécute au démarrage
```

### Option B — SQL + C# séparé

```
1. CREATE DATABASE edu_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
2. dotnet ef database update        ← crée toutes les tables via migrations
3. Exécuter seed_complet_mysql.sql  ← peuple les entités métier
4. dotnet run                       ← DbInitializerMySql seed les utilisateurs/rôles
```

### Exécuter le fichier SQL

**MySQL Workbench**
```
File > Open SQL Script > seed_complet_mysql.sql
Sélectionner la connexion et la base edu_manager
Ctrl+Shift+Enter (exécuter tout)
```

**DBeaver**
```
Clic droit sur la base edu_manager > SQL Editor
File > Open File > seed_complet_mysql.sql
Alt+X (exécuter)
```

**CLI mysql**
```bash
mysql -u root -p edu_manager < seed_complet_mysql.sql
```

### Ordre d'exécution

```
1. dotnet ef database update     ← schéma (tables AspNet* + métier)
2. seed_complet_mysql.sql        ← données métier
3. DbInitializerMySql.SeedAsync  ← utilisateurs + rôles (au 1er démarrage)
```

---

## Réinitialisation complète (MySQL)

```sql
-- Désactiver temporairement les contraintes FK
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `Paiements`;          DELETE FROM `Factures`;
DELETE FROM `DeliberationLignes`; DELETE FROM `Deliberations`;
DELETE FROM `BulletinLignes`;     DELETE FROM `Bulletins`;     DELETE FROM `RelevesNotes`;
DELETE FROM `CasFraude`;          DELETE FROM `PVExamens`;
DELETE FROM `Convocations`;       DELETE FROM `Epreuves`;       DELETE FROM `SessionsExamen`;
DELETE FROM `Justificatifs`;      DELETE FROM `Absences`;       DELETE FROM `Presences`;
DELETE FROM `AbsencesEnseignants`;
DELETE FROM `NotesHistorique`;    DELETE FROM `Notes`;          DELETE FROM `Evaluations`;
DELETE FROM `MoyennesGenerales`;  DELETE FROM `MoyennesMatieres`;
DELETE FROM `Seances`;            DELETE FROM `CoursPlanifies`; DELETE FROM `CreneauxHoraires`;
DELETE FROM `InscriptionHistoriques`;
DELETE FROM `InscriptionUEs`;     DELETE FROM `InscriptionGroupes`;
DELETE FROM `ListesAttente`;      DELETE FROM `Inscriptions`;
DELETE FROM `AffectationsMatieres`;
DELETE FROM `EnseignantSpecialites`; DELETE FROM `Enseignants`;
DELETE FROM `PiecesJustificatives`;  DELETE FROM `Tuteurs`;    DELETE FROM `Apprenants`;
DELETE FROM `Matieres`;           DELETE FROM `UniteEnseignements`;
DELETE FROM `Groupes`;            DELETE FROM `Promotions`;    DELETE FROM `Classes`;
DELETE FROM `Niveaux`;            DELETE FROM `Filieres`;      DELETE FROM `Cycles`;
DELETE FROM `SalleEquipements`;   DELETE FROM `Salles`;
DELETE FROM `EvenementsCalendrier`; DELETE FROM `Periodes`; DELETE FROM `AnneesAcademiques`;
DELETE FROM `Campus`;             DELETE FROM `ParametresAbsenteisme`; DELETE FROM `Tenants`;
DELETE FROM `Annonces`;           DELETE FROM `Messages`;
DELETE FROM `Notifications`;      DELETE FROM `ModelesMessage`;
DELETE FROM `AspNetUserRoles`;    DELETE FROM `AspNetUsers`;   DELETE FROM `AspNetRoles`;

-- Réactiver les contraintes FK
SET FOREIGN_KEY_CHECKS = 1;
```

---

## Fichiers du dossier

| Fichier | Description |
|---|---|
| `seed_complet_mysql.sql` | Données métier — à exécuter dans MySQL avant le démarrage |
| `DbInitializer_mysql.cs` | Seed C# — utilisateurs + rôles via `UserManager` (MySQL) |
| `README_mysql.md` | Ce guide |
| `seed_complet.sql` | Équivalent SQL Server (T-SQL) |
| `DbInitializer.cs` | Équivalent SQL Server (C#) |
| `README.md` | Guide SQL Server |
