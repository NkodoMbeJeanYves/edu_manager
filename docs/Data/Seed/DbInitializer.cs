using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EduManager.Infrastructure.Data.Seed;

/// <summary>
/// Initialise les rôles et les comptes utilisateurs ASP.NET Identity.
/// Doit être appelé après l'exécution de seed_complet.sql.
/// Mot de passe universel : EduManager@2025!
/// </summary>
public static class DbInitializer
{
    // ── GUIDs partagés avec seed_complet.sql ──────────────────────────────────

    private static readonly Guid TenantLby  = new("A1000000-0000-0000-0000-000000000001");
    private static readonly Guid TenantIstd = new("A2000000-0000-0000-0000-000000000001");

    private static readonly Guid UsrSuper  = new("P0000000-0000-0000-0000-000000000001");
    private static readonly Guid UsrMulti  = new("P0000000-0000-0000-0000-000000000002");
    private static readonly Guid UsrJpm    = new("P0000000-0000-0000-0000-000000000003");
    private static readonly Guid UsrPtc    = new("P0000000-0000-0000-0000-000000000004");
    private static readonly Guid UsrScol   = new("P0000000-0000-0000-0000-000000000005");
    private static readonly Guid UsrCompt  = new("P0000000-0000-0000-0000-000000000006");
    private static readonly Guid UsrKj     = new("P0000000-0000-0000-0000-000000000007");
    private static readonly Guid UsrKe     = new("P0000000-0000-0000-0000-000000000008");
    private static readonly Guid UsrAudit  = new("P0000000-0000-0000-0000-000000000009");

    private const string UniversalPassword = "EduManager@2025!";

    // ── Rôles ─────────────────────────────────────────────────────────────────

    private static readonly string[] AllRoles =
    [
        "super_admin",
        "directeur",
        "resp_scolarite",
        "resp_financier",
        "resp_filiere",
        "enseignant",
        "surveillant_examen",
        "agent_scolarite",
        "agent_comptable",
        "apprenant",
        "parent",
        "auditeur",
    ];

    // ── Point d'entrée ────────────────────────────────────────────────────────

    public static async Task SeedAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        await db.Database.MigrateAsync();

        await SeedRolesAsync(roleManager);
        await SeedUsersAsync(userManager);
    }

    // =========================================================================
    // Rôles
    // =========================================================================

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        foreach (var role in AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        $"Impossible de créer le rôle '{role}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
    }

    // =========================================================================
    // Utilisateurs
    // =========================================================================

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrSuper,
            Email       = "superadmin@edu-manager.cm",
            UserName    = "superadmin@edu-manager.cm",
            NomComplet  = "Administrateur Système",
            TenantId    = null,
            Roles       = ["super_admin"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrMulti,
            Email       = "admin.multi@lby.cm",
            UserName    = "admin.multi@lby.cm",
            NomComplet  = "Alain NKODO",
            TenantId    = TenantLby,
            Roles       = ["directeur", "resp_scolarite", "resp_financier", "enseignant"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrJpm,
            Email       = "j.martin@lby.cm",
            UserName    = "j.martin@lby.cm",
            NomComplet  = "Jean-Pierre MARTIN",
            TenantId    = TenantLby,
            Roles       = ["enseignant"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrPtc,
            Email       = "p.tchoupo@ist-douala.cm",
            UserName    = "p.tchoupo@ist-douala.cm",
            NomComplet  = "Patrick TCHOUPO",
            TenantId    = TenantIstd,
            Roles       = ["enseignant"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrScol,
            Email       = "agent.scol@lby.cm",
            UserName    = "agent.scol@lby.cm",
            NomComplet  = "Agent Scolarité LBY",
            TenantId    = TenantLby,
            Roles       = ["agent_scolarite"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrCompt,
            Email       = "comptable@lby.cm",
            UserName    = "comptable@lby.cm",
            NomComplet  = "Comptable LBY",
            TenantId    = TenantLby,
            Roles       = ["agent_comptable"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrKj,
            Email       = "kamga.jean@eleve.lby.cm",
            UserName    = "kamga.jean@eleve.lby.cm",
            NomComplet  = "Jean KAMGA",
            TenantId    = TenantLby,
            Roles       = ["apprenant"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrKe,
            Email       = "kamga.etienne@parent.lby.cm",
            UserName    = "kamga.etienne@parent.lby.cm",
            NomComplet  = "Etienne KAMGA",
            TenantId    = TenantLby,
            Roles       = ["parent"],
        });

        await CreateUserAsync(userManager, new UserSeed
        {
            Id          = UsrAudit,
            Email       = "auditeur@edu-manager.cm",
            UserName    = "auditeur@edu-manager.cm",
            NomComplet  = "Auditeur Système",
            TenantId    = null,
            Roles       = ["auditeur"],
        });
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private static async Task CreateUserAsync(
        UserManager<ApplicationUser> userManager,
        UserSeed seed)
    {
        // Idempotent — ne re-crée pas si déjà présent
        var existing = await userManager.FindByEmailAsync(seed.Email);
        if (existing is not null) return;

        var user = new ApplicationUser
        {
            Id             = seed.Id,
            UserName       = seed.UserName,
            Email          = seed.Email,
            EmailConfirmed = true,
            NomComplet     = seed.NomComplet,
            TenantId       = seed.TenantId,
        };

        var result = await userManager.CreateAsync(user, UniversalPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Impossible de créer l'utilisateur '{seed.Email}': " +
                string.Join(", ", result.Errors.Select(e => e.Description)));

        foreach (var role in seed.Roles)
        {
            var roleResult = await userManager.AddToRoleAsync(user, role);
            if (!roleResult.Succeeded)
                throw new InvalidOperationException(
                    $"Impossible d'assigner le rôle '{role}' à '{seed.Email}': " +
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
        }
    }

    // =========================================================================
    // DTO interne
    // =========================================================================

    private sealed class UserSeed
    {
        public required Guid         Id         { get; init; }
        public required string       Email      { get; init; }
        public required string       UserName   { get; init; }
        public required string       NomComplet { get; init; }
        public          Guid?        TenantId   { get; init; }
        public required string[]     Roles      { get; init; }
    }
}
