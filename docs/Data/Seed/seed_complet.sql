-- =============================================================================
-- SEED COMPLET — edu_manager
-- SQL Server / T-SQL
-- Entités métier UNIQUEMENT  — AspNetUsers/AspNetRoles/AspNetUserRoles
-- sont gérées par DbInitializer.cs (hachage des mots de passe via UserManager)
-- =============================================================================
-- Contexte :
--   • Lycée Bilingue de Yaoundé (LBY)         — scolaire, 3 trimestres
--   • Institut Supérieur de Technologie Douala (ISTD) — universitaire, LMD
--   • Années : 2023-2024 (clôturée) + 2024-2025 (active)
--   • Devise : XAF (Franc CFA)
--   • Toutes les fonctionnalités couvertes
-- =============================================================================

BEGIN TRANSACTION;
SET NOCOUNT ON;

-- ===========================================================================
-- 0. VARIABLES — GUIDs nommés pour lisibilité
-- ===========================================================================

-- Tenants
DECLARE @LBY  UNIQUEIDENTIFIER = 'A1000000-0000-0000-0000-000000000001';
DECLARE @ISTD UNIQUEIDENTIFIER = 'A2000000-0000-0000-0000-000000000001';

-- Campus
DECLARE @CAM_LBY  UNIQUEIDENTIFIER = 'B1000000-0000-0000-0000-000000000001';
DECLARE @CAM_ISTD UNIQUEIDENTIFIER = 'B2000000-0000-0000-0000-000000000001';

-- Années académiques
DECLARE @AA_LBY_2324   UNIQUEIDENTIFIER = 'C1000000-0000-0000-0000-000000000001';
DECLARE @AA_LBY_2425   UNIQUEIDENTIFIER = 'C1000000-0000-0000-0000-000000000002';
DECLARE @AA_ISTD_2324  UNIQUEIDENTIFIER = 'C2000000-0000-0000-0000-000000000001';
DECLARE @AA_ISTD_2425  UNIQUEIDENTIFIER = 'C2000000-0000-0000-0000-000000000002';

-- Périodes (trimestres LBY / semestres ISTD)
DECLARE @P_LBY_T1   UNIQUEIDENTIFIER = 'D1000000-0000-0000-0000-000000000001';
DECLARE @P_LBY_T2   UNIQUEIDENTIFIER = 'D1000000-0000-0000-0000-000000000002';
DECLARE @P_LBY_T3   UNIQUEIDENTIFIER = 'D1000000-0000-0000-0000-000000000003';
DECLARE @P_ISTD_S1  UNIQUEIDENTIFIER = 'D2000000-0000-0000-0000-000000000001';
DECLARE @P_ISTD_S2  UNIQUEIDENTIFIER = 'D2000000-0000-0000-0000-000000000002';

-- Salles
DECLARE @S_LBY_A1   UNIQUEIDENTIFIER = 'E1000000-0000-0000-0000-000000000001';
DECLARE @S_LBY_A2   UNIQUEIDENTIFIER = 'E1000000-0000-0000-0000-000000000002';
DECLARE @S_LBY_INFO UNIQUEIDENTIFIER = 'E1000000-0000-0000-0000-000000000003';
DECLARE @S_ISTD_1   UNIQUEIDENTIFIER = 'E2000000-0000-0000-0000-000000000001';
DECLARE @S_ISTD_2   UNIQUEIDENTIFIER = 'E2000000-0000-0000-0000-000000000002';
DECLARE @S_ISTD_LAB UNIQUEIDENTIFIER = 'E2000000-0000-0000-0000-000000000003';

-- Cycles
DECLARE @CYC_SEC    UNIQUEIDENTIFIER = 'F1000000-0000-0000-0000-000000000001'; -- Secondaire LBY
DECLARE @CYC_LIC    UNIQUEIDENTIFIER = 'F2000000-0000-0000-0000-000000000001'; -- Licence ISTD
DECLARE @CYC_MAS    UNIQUEIDENTIFIER = 'F2000000-0000-0000-0000-000000000002'; -- Master ISTD

-- Filières
DECLARE @FIL_GENE   UNIQUEIDENTIFIER = 'G1000000-0000-0000-0000-000000000001'; -- Générale LBY
DECLARE @FIL_INFO   UNIQUEIDENTIFIER = 'G2000000-0000-0000-0000-000000000001'; -- Informatique ISTD

-- Niveaux
DECLARE @NIV_3EME   UNIQUEIDENTIFIER = 'H1000000-0000-0000-0000-000000000001';
DECLARE @NIV_TLE    UNIQUEIDENTIFIER = 'H1000000-0000-0000-0000-000000000002';
DECLARE @NIV_L1     UNIQUEIDENTIFIER = 'H2000000-0000-0000-0000-000000000001';
DECLARE @NIV_L2     UNIQUEIDENTIFIER = 'H2000000-0000-0000-0000-000000000002';

-- Classes (LBY)
DECLARE @CL_3A      UNIQUEIDENTIFIER = 'I1000000-0000-0000-0000-000000000001'; -- 3ème A
DECLARE @CL_TLS1    UNIQUEIDENTIFIER = 'I1000000-0000-0000-0000-000000000002'; -- Tle S1

-- Promotions (ISTD)
DECLARE @PRO_L1I    UNIQUEIDENTIFIER = 'J2000000-0000-0000-0000-000000000001'; -- L1 Informatique
DECLARE @PRO_L2I    UNIQUEIDENTIFIER = 'J2000000-0000-0000-0000-000000000002'; -- L2 Informatique

-- Groupes
DECLARE @GRP_3A_A   UNIQUEIDENTIFIER = 'K1000000-0000-0000-0000-000000000001';
DECLARE @GRP_TLS_A  UNIQUEIDENTIFIER = 'K1000000-0000-0000-0000-000000000002';
DECLARE @GRP_L1_A   UNIQUEIDENTIFIER = 'K2000000-0000-0000-0000-000000000001';
DECLARE @GRP_L1_B   UNIQUEIDENTIFIER = 'K2000000-0000-0000-0000-000000000002';
DECLARE @GRP_L2_A   UNIQUEIDENTIFIER = 'K2000000-0000-0000-0000-000000000003';

-- Matières LBY
DECLARE @MAT_MATH   UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000001';
DECLARE @MAT_FRAN   UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000002';
DECLARE @MAT_ANGL   UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000003';
DECLARE @MAT_SVT    UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000004';
DECLARE @MAT_PHYS   UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000005';
DECLARE @MAT_HG     UNIQUEIDENTIFIER = 'L1000000-0000-0000-0000-000000000006';

-- Matières ISTD (liées à UE)
DECLARE @MAT_ALGO   UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000001';
DECLARE @MAT_BD     UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000002';
DECLARE @MAT_POO    UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000003';
DECLARE @MAT_SYS    UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000004';
DECLARE @MAT_WEB    UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000005';
DECLARE @MAT_RESX   UNIQUEIDENTIFIER = 'L2000000-0000-0000-0000-000000000006';

-- Unités d'Enseignement ISTD
DECLARE @UE_INFO1   UNIQUEIDENTIFIER = 'M2000000-0000-0000-0000-000000000001'; -- INFO101
DECLARE @UE_INFO2   UNIQUEIDENTIFIER = 'M2000000-0000-0000-0000-000000000002'; -- INFO102
DECLARE @UE_INFO3   UNIQUEIDENTIFIER = 'M2000000-0000-0000-0000-000000000003'; -- INFO201
DECLARE @UE_INFO4   UNIQUEIDENTIFIER = 'M2000000-0000-0000-0000-000000000004'; -- INFO202

-- Enseignants (profils — les comptes Users sont dans DbInitializer)
DECLARE @ENS_MULTI  UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000001'; -- Alain NKODO (multi-rôle)
DECLARE @ENS_JPM    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000002'; -- Jean-Pierre MARTIN
DECLARE @ENS_PTC    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000003'; -- Patrick TCHOUPO
DECLARE @ENS_MBL    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000004'; -- Marie-Blanche LOBE
DECLARE @ENS_HAD    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000005'; -- Henri ATEBA DJOMO
DECLARE @ENS_CNA    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000006'; -- Christelle NANA
DECLARE @ENS_OFO    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000007'; -- Olivier FOUDA
DECLARE @ENS_FTA    UNIQUEIDENTIFIER = 'N0000000-0000-0000-0000-000000000008'; -- Fatima TAMBE

-- Apprenants LBY — 3ème A (5)
DECLARE @APP_KJ     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000001'; -- Kamga Jean
DECLARE @APP_NM     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000002'; -- Nguemo Marie
DECLARE @APP_AT     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000003'; -- Ateba Thomas
DECLARE @APP_BK     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000004'; -- Biyong Karine
DECLARE @APP_FT     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000005'; -- Fouda Thierry

-- Apprenants LBY — Tle S1 (5)
DECLARE @APP_EO     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000006'; -- Eba Olivier
DECLARE @APP_PN     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000007'; -- Penda Nadège
DECLARE @APP_SM     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000008'; -- Samba Martin
DECLARE @APP_ZC     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000009'; -- Zang Christine
DECLARE @APP_AE     UNIQUEIDENTIFIER = 'O1000000-0000-0000-0000-000000000010'; -- Awono Eric

-- Apprenants ISTD — L1 Info (5)
DECLARE @APP_DB     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000001'; -- Djoum Bertrand
DECLARE @APP_EF     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000002'; -- Ekambi Fanta
DECLARE @APP_LB     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000003'; -- Lekane Boris
DECLARE @APP_MO     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000004'; -- Mbarga Olivia
DECLARE @APP_NW     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000005'; -- Njoya William (liste attente)

-- Apprenants ISTD — L2 Info (2)
DECLARE @APP_TF     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000006'; -- Tonye Florian
DECLARE @APP_CB     UNIQUEIDENTIFIER = 'O2000000-0000-0000-0000-000000000007'; -- Christelle BELLA

-- Tuteurs
DECLARE @TUT_KE     UNIQUEIDENTIFIER = 'O9000000-0000-0000-0000-000000000001'; -- Kamga Etienne (parent de APP_KJ)
DECLARE @TUT_NP     UNIQUEIDENTIFIER = 'O9000000-0000-0000-0000-000000000002'; -- parent APP_DB

-- Inscriptions LBY 3ème A
DECLARE @INS_KJ_3A  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000001';
DECLARE @INS_NM_3A  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000002';
DECLARE @INS_AT_3A  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000003';
DECLARE @INS_BK_3A  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000004'; -- rejetée
DECLARE @INS_FT_3A  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000005'; -- brouillon

-- Inscriptions LBY Tle S1
DECLARE @INS_EO_TL  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000006';
DECLARE @INS_PN_TL  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000007';
DECLARE @INS_SM_TL  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000008';
DECLARE @INS_ZC_TL  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000009'; -- annulée
DECLARE @INS_AE_TL  UNIQUEIDENTIFIER = 'Q1000000-0000-0000-0000-000000000010';

-- Inscriptions ISTD L1
DECLARE @INS_DB_L1  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000001';
DECLARE @INS_EF_L1  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000002';
DECLARE @INS_LB_L1  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000003';
DECLARE @INS_MO_L1  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000004';

-- Inscriptions ISTD L2
DECLARE @INS_TF_L2  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000005';
DECLARE @INS_CB_L2  UNIQUEIDENTIFIER = 'Q2000000-0000-0000-0000-000000000006';

-- Créneaux horaires LBY
DECLARE @CR_LBY_1   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000001'; -- Lun 07:30-09:30
DECLARE @CR_LBY_2   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000002'; -- Lun 09:45-11:45
DECLARE @CR_LBY_3   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000003'; -- Mar 07:30-09:30
DECLARE @CR_LBY_4   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000004'; -- Mar 09:45-11:45
DECLARE @CR_LBY_5   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000005'; -- Mer 07:30-09:30
DECLARE @CR_LBY_6   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000006'; -- Jeu 07:30-09:30
DECLARE @CR_LBY_7   UNIQUEIDENTIFIER = 'R1000000-0000-0000-0000-000000000007'; -- Ven 07:30-09:30

-- Créneaux horaires ISTD
DECLARE @CR_ISTD_1  UNIQUEIDENTIFIER = 'R2000000-0000-0000-0000-000000000001'; -- Lun 08:00-10:00
DECLARE @CR_ISTD_2  UNIQUEIDENTIFIER = 'R2000000-0000-0000-0000-000000000002'; -- Lun 10:15-12:15
DECLARE @CR_ISTD_3  UNIQUEIDENTIFIER = 'R2000000-0000-0000-0000-000000000003'; -- Mar 08:00-10:00
DECLARE @CR_ISTD_4  UNIQUEIDENTIFIER = 'R2000000-0000-0000-0000-000000000004'; -- Mar 10:15-12:15
DECLARE @CR_ISTD_5  UNIQUEIDENTIFIER = 'R2000000-0000-0000-0000-000000000005'; -- Mer 14:00-16:00

-- Cours planifiés (quelques représentatifs)
DECLARE @CP_3A_MATH UNIQUEIDENTIFIER = 'S1000000-0000-0000-0000-000000000001';
DECLARE @CP_3A_FRAN UNIQUEIDENTIFIER = 'S1000000-0000-0000-0000-000000000002';
DECLARE @CP_TL_PHYS UNIQUEIDENTIFIER = 'S1000000-0000-0000-0000-000000000003';
DECLARE @CP_TL_MATH UNIQUEIDENTIFIER = 'S1000000-0000-0000-0000-000000000004';
DECLARE @CP_L1_ALGO UNIQUEIDENTIFIER = 'S2000000-0000-0000-0000-000000000001';
DECLARE @CP_L1_BD   UNIQUEIDENTIFIER = 'S2000000-0000-0000-0000-000000000002';
DECLARE @CP_L2_WEB  UNIQUEIDENTIFIER = 'S2000000-0000-0000-0000-000000000003';

-- Séances
DECLARE @SEA_001    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000001'; -- réalisée
DECLARE @SEA_002    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000002'; -- réalisée
DECLARE @SEA_003    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000003'; -- annulée
DECLARE @SEA_004    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000004'; -- reportée
DECLARE @SEA_005    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000005'; -- planifiée
DECLARE @SEA_006    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000006'; -- réalisée (remplacement)
DECLARE @SEA_007    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000007'; -- réalisée ISTD
DECLARE @SEA_008    UNIQUEIDENTIFIER = 'SE000000-0000-0000-0000-000000000008'; -- planifiée ISTD

-- Évaluations
DECLARE @EV_3A_M1   UNIQUEIDENTIFIER = 'T1000000-0000-0000-0000-000000000001'; -- Devoir 1 Maths 3ème A (publiée)
DECLARE @EV_3A_M2   UNIQUEIDENTIFIER = 'T1000000-0000-0000-0000-000000000002'; -- Devoir 2 Maths 3ème A (validée)
DECLARE @EV_3A_F1   UNIQUEIDENTIFIER = 'T1000000-0000-0000-0000-000000000003'; -- Devoir 1 Français 3ème A (soumise)
DECLARE @EV_TL_P1   UNIQUEIDENTIFIER = 'T1000000-0000-0000-0000-000000000004'; -- Examen Phys Tle (publiée)
DECLARE @EV_L1_A1   UNIQUEIDENTIFIER = 'T2000000-0000-0000-0000-000000000001'; -- CC1 Algo L1 (publiée)
DECLARE @EV_L1_B1   UNIQUEIDENTIFIER = 'T2000000-0000-0000-0000-000000000002'; -- CC1 BD L1 (brouillon)
DECLARE @EV_L2_W1   UNIQUEIDENTIFIER = 'T2000000-0000-0000-0000-000000000003'; -- Examen Web L2 (publiée)

-- Sessions d'examen
DECLARE @SES_LBY    UNIQUEIDENTIFIER = 'U1000000-0000-0000-0000-000000000001'; -- Examen T1 LBY (planifiée)
DECLARE @SES_ISTD   UNIQUEIDENTIFIER = 'U2000000-0000-0000-0000-000000000001'; -- Session S1 ISTD (en_cours)

-- Épreuves
DECLARE @EPR_LBY_M  UNIQUEIDENTIFIER = 'U1000000-0000-0000-0000-000000000011';
DECLARE @EPR_LBY_F  UNIQUEIDENTIFIER = 'U1000000-0000-0000-0000-000000000012';
DECLARE @EPR_ISTD_A UNIQUEIDENTIFIER = 'U2000000-0000-0000-0000-000000000011';

-- Bulletins LBY
DECLARE @BUL_KJ_T1  UNIQUEIDENTIFIER = 'V1000000-0000-0000-0000-000000000001'; -- signé
DECLARE @BUL_NM_T1  UNIQUEIDENTIFIER = 'V1000000-0000-0000-0000-000000000002'; -- généré
DECLARE @BUL_EO_T1  UNIQUEIDENTIFIER = 'V1000000-0000-0000-0000-000000000003'; -- publié
DECLARE @BUL_PN_T1  UNIQUEIDENTIFIER = 'V1000000-0000-0000-0000-000000000004'; -- brouillon

-- Délibérations
DECLARE @DEL_LBY    UNIQUEIDENTIFIER = 'W1000000-0000-0000-0000-000000000001'; -- Conseil LBY
DECLARE @DEL_ISTD   UNIQUEIDENTIFIER = 'W2000000-0000-0000-0000-000000000001'; -- Jury ISTD

-- Factures
DECLARE @FAC_KJ     UNIQUEIDENTIFIER = 'X1000000-0000-0000-0000-000000000001'; -- payée
DECLARE @FAC_NM     UNIQUEIDENTIFIER = 'X1000000-0000-0000-0000-000000000002'; -- partielle
DECLARE @FAC_AT     UNIQUEIDENTIFIER = 'X1000000-0000-0000-0000-000000000003'; -- émise
DECLARE @FAC_BK     UNIQUEIDENTIFIER = 'X1000000-0000-0000-0000-000000000004'; -- brouillon
DECLARE @FAC_EO     UNIQUEIDENTIFIER = 'X1000000-0000-0000-0000-000000000005'; -- en_retard
DECLARE @FAC_DB     UNIQUEIDENTIFIER = 'X2000000-0000-0000-0000-000000000001'; -- payée (ISTD)
DECLARE @FAC_EF     UNIQUEIDENTIFIER = 'X2000000-0000-0000-0000-000000000002'; -- émise (ISTD)
DECLARE @FAC_TF     UNIQUEIDENTIFIER = 'X2000000-0000-0000-0000-000000000003'; -- partielle (ISTD)

-- Absences enseignants
DECLARE @ABS_ENS_1  UNIQUEIDENTIFIER = 'AE000000-0000-0000-0000-000000000001';

-- Paramètres absentéisme
DECLARE @PARAM_LBY  UNIQUEIDENTIFIER = 'PA000000-0000-0000-0000-000000000001';
DECLARE @PARAM_ISTD UNIQUEIDENTIFIER = 'PA000000-0000-0000-0000-000000000002';

-- Modèles de messages
DECLARE @MOD_MSG_1  UNIQUEIDENTIFIER = 'MM000000-0000-0000-0000-000000000001';
DECLARE @MOD_MSG_2  UNIQUEIDENTIFIER = 'MM000000-0000-0000-0000-000000000002';

-- Users ASP.NET Identity (référencés depuis les entités métier uniquement par FK)
-- Valeurs identiques à ce qui sera créé par DbInitializer.cs
DECLARE @USR_SUPER  UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000001';
DECLARE @USR_MULTI  UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000002';
DECLARE @USR_JPM    UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000003';
DECLARE @USR_PTC    UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000004';
DECLARE @USR_SCOL   UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000005';
DECLARE @USR_COMPT  UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000006';
DECLARE @USR_KJ     UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000007';
DECLARE @USR_KE     UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000008';
DECLARE @USR_AUDIT  UNIQUEIDENTIFIER = 'P0000000-0000-0000-0000-000000000009';

-- ===========================================================================
-- 1. TENANTS (Établissements)
-- ===========================================================================
INSERT INTO Tenants (Id, Nom, Code, Type, Ville, Pays, Telephone, Email, SiteWeb, Devise, Actif, DateCreation)
VALUES
  (@LBY,  N'Lycée Bilingue de Yaoundé',                 'LBY',  'scolaire',      N'Yaoundé',  'CM', '+237 222 123 456', 'contact@lby.cm',       'www.lby.cm',       'XAF', 1, '2023-01-15'),
  (@ISTD, N'Institut Supérieur de Technologie de Douala','ISTD', 'universitaire', N'Douala',   'CM', '+237 233 987 654', 'contact@ist-douala.cm', 'www.ist-douala.cm','XAF', 1, '2023-01-20');

-- ===========================================================================
-- 2. CAMPUS
-- ===========================================================================
INSERT INTO Campus (Id, TenantId, Nom, Adresse, Ville, EstPrincipal, DateCreation)
VALUES
  (@CAM_LBY,  @LBY,  N'Campus Principal Yaoundé',  N'Boulevard de la Réunification, Yaoundé',  N'Yaoundé', 1, '2023-01-15'),
  (@CAM_ISTD, @ISTD, N'Campus Principal Douala',   N'Rue des Écoles, Akwa, Douala',             N'Douala',  1, '2023-01-20');

-- ===========================================================================
-- 3. PARAMÈTRES ABSENTÉISME
-- ===========================================================================
INSERT INTO ParametresAbsenteisme (Id, TenantId, NbHeuresAbsenceAvantAlerte, NbHeuresAbsenceAvantConvocation, NbHeuresAbsenceAvantExclusion, DelaiJustificatifJours, DateCreation)
VALUES
  (@PARAM_LBY,  @LBY,  10, 20, 40, 3, '2023-09-01'),
  (@PARAM_ISTD, @ISTD, 15, 30, 60, 5, '2023-09-01');

-- ===========================================================================
-- 4. ANNÉES ACADÉMIQUES
-- ===========================================================================
INSERT INTO AnneesAcademiques (Id, TenantId, Libelle, DateDebut, DateFin, EstActive, Statut, DateCreation)
VALUES
  (@AA_LBY_2324,  @LBY,  '2023-2024', '2023-09-04', '2024-06-28', 0, 'cloturee', '2023-08-01'),
  (@AA_LBY_2425,  @LBY,  '2024-2025', '2024-09-02', '2025-06-27', 1, 'active',   '2024-08-01'),
  (@AA_ISTD_2324, @ISTD, '2023-2024', '2023-10-02', '2024-07-15', 0, 'cloturee', '2023-09-01'),
  (@AA_ISTD_2425, @ISTD, '2024-2025', '2024-10-07', '2025-07-14', 1, 'active',   '2024-09-01');

-- ===========================================================================
-- 5. PÉRIODES
-- ===========================================================================
INSERT INTO Periodes (Id, AnneeAcademiqueId, TenantId, Libelle, Type, Numero, DateDebut, DateFin, EstActive, DateCreation)
VALUES
  -- LBY 2024-2025 (trimestres)
  (@P_LBY_T1,  @AA_LBY_2425,  @LBY,  N'Trimestre 1', 'trimestre', 1, '2024-09-02', '2024-12-13', 0, '2024-08-01'),
  (@P_LBY_T2,  @AA_LBY_2425,  @LBY,  N'Trimestre 2', 'trimestre', 2, '2025-01-06', '2025-03-28', 0, '2024-08-01'),
  (@P_LBY_T3,  @AA_LBY_2425,  @LBY,  N'Trimestre 3', 'trimestre', 3, '2025-04-07', '2025-06-27', 1, '2024-08-01'),
  -- ISTD 2024-2025 (semestres)
  (@P_ISTD_S1, @AA_ISTD_2425, @ISTD, N'Semestre 1',  'semestre',  1, '2024-10-07', '2025-02-14', 0, '2024-09-01'),
  (@P_ISTD_S2, @AA_ISTD_2425, @ISTD, N'Semestre 2',  'semestre',  2, '2025-02-17', '2025-07-14', 1, '2024-09-01');

-- ===========================================================================
-- 6. SALLES
-- ===========================================================================
INSERT INTO Salles (Id, TenantId, CampusId, Nom, Code, Capacite, Type, EstDisponible, DateCreation)
VALUES
  (@S_LBY_A1,   @LBY,  @CAM_LBY,  N'Salle A1',            'A1',    45, 'cours',        1, '2023-01-15'),
  (@S_LBY_A2,   @LBY,  @CAM_LBY,  N'Salle A2',            'A2',    45, 'cours',        1, '2023-01-15'),
  (@S_LBY_INFO, @LBY,  @CAM_LBY,  N'Salle Informatique',  'INFO',  30, 'laboratoire',  1, '2023-01-15'),
  (@S_ISTD_1,   @ISTD, @CAM_ISTD, N'Amphithéâtre 1',      'AMP1', 120, 'amphi',        1, '2023-01-20'),
  (@S_ISTD_2,   @ISTD, @CAM_ISTD, N'Salle TD 1',          'TD1',   40, 'cours',        1, '2023-01-20'),
  (@S_ISTD_LAB, @ISTD, @CAM_ISTD, N'Laboratoire Réseau',  'LAB1',  25, 'laboratoire',  1, '2023-01-20');

-- ===========================================================================
-- 7. STRUCTURE ACADÉMIQUE : Cycles → Filières → Niveaux
-- ===========================================================================
INSERT INTO Cycles (Id, TenantId, Nom, Code, Duree, DateCreation)
VALUES
  (@CYC_SEC, @LBY,  N'Second Cycle',  'SEC',    3, '2023-01-15'),
  (@CYC_LIC, @ISTD, N'Licence',       'LIC',    3, '2023-01-20'),
  (@CYC_MAS, @ISTD, N'Master',        'MAS',    2, '2023-01-20');

INSERT INTO Filieres (Id, TenantId, CycleId, Nom, Code, DateCreation)
VALUES
  (@FIL_GENE, @LBY,  @CYC_SEC, N'Enseignement Général', 'GENE', '2023-01-15'),
  (@FIL_INFO, @ISTD, @CYC_LIC, N'Génie Informatique',   'GINFO','2023-01-20');

INSERT INTO Niveaux (Id, TenantId, FiliereId, Nom, Code, Ordre, DateCreation)
VALUES
  (@NIV_3EME, @LBY,  @FIL_GENE, N'Troisième', '3EME', 1, '2023-01-15'),
  (@NIV_TLE,  @LBY,  @FIL_GENE, N'Terminale', 'TLE',  3, '2023-01-15'),
  (@NIV_L1,   @ISTD, @FIL_INFO, N'Licence 1', 'L1',   1, '2023-01-20'),
  (@NIV_L2,   @ISTD, @FIL_INFO, N'Licence 2', 'L2',   2, '2023-01-20');

-- ===========================================================================
-- 8. CLASSES (LBY) & PROMOTIONS (ISTD)
-- ===========================================================================
INSERT INTO Classes (Id, TenantId, NiveauId, AnneeAcademiqueId, Nom, Code, EffectifMax, DateCreation)
VALUES
  (@CL_3A,   @LBY, @NIV_3EME, @AA_LBY_2425,  N'3ème A',   '3A',  50, '2024-08-15'),
  (@CL_TLS1, @LBY, @NIV_TLE,  @AA_LBY_2425,  N'Tle S1',   'TLS1',50, '2024-08-15');

INSERT INTO Promotions (Id, TenantId, NiveauId, AnneeAcademiqueId, Nom, Code, EffectifMax, DateCreation)
VALUES
  (@PRO_L1I, @ISTD, @NIV_L1, @AA_ISTD_2425, N'L1 Informatique 2024-2025', 'L1I-2425', 60, '2024-09-15'),
  (@PRO_L2I, @ISTD, @NIV_L2, @AA_ISTD_2425, N'L2 Informatique 2024-2025', 'L2I-2425', 40, '2024-09-15');

-- ===========================================================================
-- 9. GROUPES
-- ===========================================================================
INSERT INTO Groupes (Id, TenantId, ClasseId, PromotionId, Nom, Code, Type, EffectifMax, DateCreation)
VALUES
  (@GRP_3A_A,  @LBY,  @CL_3A,   NULL,       N'Groupe A', 'GRA', 'td', 30, '2024-08-15'),
  (@GRP_TLS_A, @LBY,  @CL_TLS1, NULL,       N'Groupe A', 'GRA', 'td', 30, '2024-08-15'),
  (@GRP_L1_A,  @ISTD, NULL,     @PRO_L1I,   N'Groupe A', 'GRA', 'td', 30, '2024-09-15'),
  (@GRP_L1_B,  @ISTD, NULL,     @PRO_L1I,   N'Groupe B', 'GRB', 'td', 30, '2024-09-15'),
  (@GRP_L2_A,  @ISTD, NULL,     @PRO_L2I,   N'Groupe A', 'GRA', 'td', 25, '2024-09-15');

-- ===========================================================================
-- 10. RÉFÉRENTIEL — Unités d'Enseignement (ISTD)
-- ===========================================================================
INSERT INTO UniteEnseignements (Id, TenantId, NiveauId, PeriodeType, Code, Intitule, Credits, Coefficient, Obligatoire, DateCreation)
VALUES
  (@UE_INFO1, @ISTD, @NIV_L1, 'semestre', 'INFO101', N'Algorithmique et Structures de Données', 6, 3, 1, '2023-01-20'),
  (@UE_INFO2, @ISTD, @NIV_L1, 'semestre', 'INFO102', N'Bases de Données',                       4, 2, 1, '2023-01-20'),
  (@UE_INFO3, @ISTD, @NIV_L2, 'semestre', 'INFO201', N'Développement Web Avancé',               5, 3, 1, '2023-01-20'),
  (@UE_INFO4, @ISTD, @NIV_L2, 'semestre', 'INFO202', N'Réseaux et Systèmes',                    5, 3, 1, '2023-01-20');

-- ===========================================================================
-- 11. RÉFÉRENTIEL — Matières
-- ===========================================================================
INSERT INTO Matieres (Id, TenantId, NiveauId, UeId, Nom, Code, Coefficient, VolumeHoraire, Type, DateCreation)
VALUES
  -- LBY
  (@MAT_MATH, @LBY,  @NIV_3EME, NULL,       N'Mathématiques',         'MATH', 4, 4, 'obligatoire', '2023-01-15'),
  (@MAT_FRAN, @LBY,  @NIV_3EME, NULL,       N'Français',              'FRAN', 3, 4, 'obligatoire', '2023-01-15'),
  (@MAT_ANGL, @LBY,  @NIV_3EME, NULL,       N'Anglais',               'ANGL', 2, 2, 'obligatoire', '2023-01-15'),
  (@MAT_SVT,  @LBY,  @NIV_3EME, NULL,       N'Sciences de la Vie',    'SVT',  2, 2, 'obligatoire', '2023-01-15'),
  (@MAT_PHYS, @LBY,  @NIV_TLE,  NULL,       N'Physique-Chimie',       'PHYS', 4, 4, 'obligatoire', '2023-01-15'),
  (@MAT_HG,   @LBY,  @NIV_3EME, NULL,       N'Histoire-Géographie',   'HG',   2, 2, 'obligatoire', '2023-01-15'),
  -- ISTD
  (@MAT_ALGO, @ISTD, @NIV_L1,   @UE_INFO1,  N'Algorithmique',         'ALGO', 3, 3, 'obligatoire', '2023-01-20'),
  (@MAT_BD,   @ISTD, @NIV_L1,   @UE_INFO2,  N'Bases de Données',      'BD',   2, 2, 'obligatoire', '2023-01-20'),
  (@MAT_POO,  @ISTD, @NIV_L1,   @UE_INFO1,  N'Programmation Orientée Objet','POO',3,2,'obligatoire','2023-01-20'),
  (@MAT_SYS,  @ISTD, @NIV_L2,   @UE_INFO4,  N'Systèmes d''Exploitation','SYS', 3, 2, 'obligatoire', '2023-01-20'),
  (@MAT_WEB,  @ISTD, @NIV_L2,   @UE_INFO3,  N'Développement Web',     'WEB',  3, 3, 'obligatoire', '2023-01-20'),
  (@MAT_RESX, @ISTD, @NIV_L2,   @UE_INFO4,  N'Réseaux Informatiques', 'RESX', 3, 2, 'obligatoire', '2023-01-20');

-- ===========================================================================
-- 12. ENSEIGNANTS
-- ===========================================================================
INSERT INTO Enseignants (Id, TenantId, UserId, Matricule, Nom, Prenom, Email, Telephone, Specialite, Grade, TypeContrat, Actif, DateCreation)
VALUES
  (@ENS_MULTI, @LBY,  @USR_MULTI, 'LBY-ENS-001', N'NKODO',        N'Alain',         'admin.multi@lby.cm',    '+237 677 111 001', N'Mathématiques',       'Certifié',  'permanent',  1, '2023-09-01'),
  (@ENS_JPM,   @LBY,  @USR_JPM,   'LBY-ENS-002', N'MARTIN',       N'Jean-Pierre',   'j.martin@lby.cm',       '+237 677 111 002', N'Mathématiques',       'Certifié',  'permanent',  1, '2023-09-01'),
  (@ENS_MBL,   @LBY,  NULL,       'LBY-ENS-003', N'LOBE',         N'Marie-Blanche', 'm.lobe@lby.cm',         '+237 677 111 003', N'Lettres Modernes',    'Certifié',  'permanent',  1, '2023-09-01'),
  (@ENS_HAD,   @LBY,  NULL,       'LBY-ENS-004', N'ATEBA DJOMO',  N'Henri',         'h.ateba@lby.cm',        '+237 677 111 004', N'Sciences Physiques',  'Certifié',  'permanent',  1, '2023-09-01'),
  (@ENS_CNA,   @LBY,  NULL,       'LBY-ENS-005', N'NANA',         N'Christelle',    'c.nana@lby.cm',         '+237 677 111 005', N'Biologie',            'Licencié',  'vacataire',  1, '2023-09-01'),
  (@ENS_PTC,   @ISTD, @USR_PTC,   'ISTD-ENS-001',N'TCHOUPO',      N'Patrick',       'p.tchoupo@ist-douala.cm','+237 699 222 001',N'Informatique',        'Maître de Conf','permanent',1, '2023-10-01'),
  (@ENS_OFO,   @ISTD, NULL,       'ISTD-ENS-002',N'FOUDA',        N'Olivier',       'o.fouda@ist-douala.cm', '+237 699 222 002', N'Réseaux',             'Docteur',   'permanent',  1, '2023-10-01'),
  (@ENS_FTA,   @ISTD, NULL,       'ISTD-ENS-003',N'TAMBE',        N'Fatima',        'f.tambe@ist-douala.cm', '+237 699 222 003', N'Bases de Données',    'Docteur',   'vacataire',  1, '2023-10-01');

-- ===========================================================================
-- 13. SPÉCIALITÉS ENSEIGNANTS
-- ===========================================================================
INSERT INTO EnseignantSpecialites (EnseignantId, MatiereId)
VALUES
  (@ENS_MULTI, @MAT_MATH),
  (@ENS_JPM,   @MAT_MATH),
  (@ENS_MBL,   @MAT_FRAN),
  (@ENS_HAD,   @MAT_PHYS),
  (@ENS_CNA,   @MAT_SVT),
  (@ENS_PTC,   @MAT_ALGO),
  (@ENS_PTC,   @MAT_POO),
  (@ENS_PTC,   @MAT_BD),
  (@ENS_OFO,   @MAT_RESX),
  (@ENS_OFO,   @MAT_SYS),
  (@ENS_FTA,   @MAT_BD),
  (@ENS_FTA,   @MAT_WEB);

-- ===========================================================================
-- 14. AFFECTATIONS MATIÈRES ↔ ENSEIGNANTS
-- ===========================================================================
INSERT INTO AffectationsMatieres (Id, TenantId, EnseignantId, MatiereId, ClasseId, PromotionId, AnneeAcademiqueId, DateDebut, EstPrincipal, DateCreation)
VALUES
  (NEWID(), @LBY,  @ENS_MULTI, @MAT_MATH, @CL_3A,   NULL,      @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (NEWID(), @LBY,  @ENS_JPM,   @MAT_MATH, @CL_TLS1, NULL,      @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (NEWID(), @LBY,  @ENS_MBL,   @MAT_FRAN, @CL_3A,   NULL,      @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (NEWID(), @LBY,  @ENS_MBL,   @MAT_FRAN, @CL_TLS1, NULL,      @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (NEWID(), @LBY,  @ENS_HAD,   @MAT_PHYS, @CL_TLS1, NULL,      @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (NEWID(), @ISTD, @ENS_PTC,   @MAT_ALGO, NULL,     @PRO_L1I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (NEWID(), @ISTD, @ENS_PTC,   @MAT_POO,  NULL,     @PRO_L1I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (NEWID(), @ISTD, @ENS_FTA,   @MAT_BD,   NULL,     @PRO_L1I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (NEWID(), @ISTD, @ENS_FTA,   @MAT_WEB,  NULL,     @PRO_L2I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (NEWID(), @ISTD, @ENS_OFO,   @MAT_RESX, NULL,     @PRO_L2I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (NEWID(), @ISTD, @ENS_OFO,   @MAT_SYS,  NULL,     @PRO_L2I,  @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20');

-- ===========================================================================
-- 15. APPRENANTS
-- ===========================================================================
INSERT INTO Apprenants (Id, TenantId, UserId, Matricule, Nom, Prenom, DateNaissance, LieuNaissance, Sexe, Nationalite, Telephone, Email, Adresse, Photo, DateCreation)
VALUES
  -- LBY 3ème A
  (@APP_KJ,  @LBY,  @USR_KJ, 'LBY-2025-001', N'KAMGA',   N'Jean',      '2008-03-12', N'Yaoundé',  'M', 'CM', '+237 677 001 001', 'kamga.jean@eleve.lby.cm',  N'Bastos, Yaoundé',  NULL, '2024-08-25'),
  (@APP_NM,  @LBY,  NULL,    'LBY-2025-002', N'NGUEMO',  N'Marie',     '2008-07-24', N'Bafoussam','F', 'CM', '+237 677 001 002', 'nguemo.m@eleve.lby.cm',    N'Mvan, Yaoundé',    NULL, '2024-08-25'),
  (@APP_AT,  @LBY,  NULL,    'LBY-2025-003', N'ATEBA',   N'Thomas',    '2009-01-05', N'Mbalmayo', 'M', 'CM', '+237 677 001 003', 'ateba.t@eleve.lby.cm',     N'Nkomo, Yaoundé',   NULL, '2024-08-25'),
  (@APP_BK,  @LBY,  NULL,    'LBY-2025-004', N'BIYONG',  N'Karine',    '2008-11-18', N'Ébolowa',  'F', 'CM', '+237 677 001 004', 'biyong.k@eleve.lby.cm',    N'Biyem Assi, Yaounde',NULL,'2024-08-25'),
  (@APP_FT,  @LBY,  NULL,    'LBY-2025-005', N'FOUDA',   N'Thierry',   '2008-05-30', N'Yaoundé',  'M', 'CM', '+237 677 001 005', 'fouda.t@eleve.lby.cm',     N'Essos, Yaoundé',   NULL, '2024-08-25'),
  -- LBY Tle S1
  (@APP_EO,  @LBY,  NULL,    'LBY-2025-006', N'EBA',     N'Olivier',   '2006-08-15', N'Kribi',    'M', 'CM', '+237 677 001 006', 'eba.o@eleve.lby.cm',       N'Omnisport, Yaoundé',NULL,'2024-08-25'),
  (@APP_PN,  @LBY,  NULL,    'LBY-2025-007', N'PENDA',   N'Nadège',    '2006-12-02', N'Yaoundé',  'F', 'CM', '+237 677 001 007', 'penda.n@eleve.lby.cm',     N'Mvog-Mbi, Yaoundé',NULL,'2024-08-25'),
  (@APP_SM,  @LBY,  NULL,    'LBY-2025-008', N'SAMBA',   N'Martin',    '2007-04-19', N'Garoua',   'M', 'CM', '+237 677 001 008', 'samba.m@eleve.lby.cm',     N'Ekoudou, Yaoundé', NULL, '2024-08-25'),
  (@APP_ZC,  @LBY,  NULL,    'LBY-2025-009', N'ZANG',    N'Christine', '2006-09-07', N'Bertoua',  'F', 'CM', '+237 677 001 009', 'zang.c@eleve.lby.cm',      N'Mfandena, Yaoundé',NULL,'2024-08-25'),
  (@APP_AE,  @LBY,  NULL,    'LBY-2025-010', N'AWONO',   N'Eric',      '2007-02-28', N'Bafia',    'M', 'CM', '+237 677 001 010', 'awono.e@eleve.lby.cm',     N'Tsinga, Yaoundé',  NULL, '2024-08-25'),
  -- ISTD L1
  (@APP_DB,  @ISTD, NULL,    'ISTD-2025-001',N'DJOUM',   N'Bertrand',  '2004-06-14', N'Douala',   'M', 'CM', '+237 699 002 001', 'djoum.b@etud.ist-douala.cm',N'Akwa, Douala',    NULL, '2024-09-20'),
  (@APP_EF,  @ISTD, NULL,    'ISTD-2025-002',N'EKAMBI',  N'Fanta',     '2005-03-21', N'Limbé',    'F', 'CM', '+237 699 002 002', 'ekambi.f@etud.ist-douala.cm',N'Bonanjo, Douala',NULL,'2024-09-20'),
  (@APP_LB,  @ISTD, NULL,    'ISTD-2025-003',N'LEKANE',  N'Boris',     '2004-10-09', N'Bafoussam','M', 'CM', '+237 699 002 003', 'lekane.b@etud.ist-douala.cm',N'Deido, Douala',  NULL,'2024-09-20'),
  (@APP_MO,  @ISTD, NULL,    'ISTD-2025-004',N'MBARGA',  N'Olivia',    '2005-07-17', N'Yaoundé',  'F', 'CM', '+237 699 002 004', 'mbarga.o@etud.ist-douala.cm',N'Bali, Douala',   NULL,'2024-09-20'),
  (@APP_NW,  @ISTD, NULL,    'ISTD-2025-005',N'NJOYA',   N'William',   '2004-12-03', N'Foumban',  'M', 'CM', '+237 699 002 005', 'njoya.w@etud.ist-douala.cm', N'Ndokoti, Douala',NULL,'2024-09-20'),
  -- ISTD L2
  (@APP_TF,  @ISTD, NULL,    'ISTD-2025-006',N'TONYE',   N'Florian',   '2003-08-22', N'Édéa',     'M', 'CM', '+237 699 002 006', 'tonye.f@etud.ist-douala.cm', N'Makepe, Douala', NULL, '2024-09-20'),
  (@APP_CB,  @ISTD, NULL,    'ISTD-2025-007',N'BELLA',   N'Christelle',N'2003-05-11',N'Douala',   'F', 'CM', '+237 699 002 007', 'bella.c@etud.ist-douala.cm', N'Bonapriso, Douala',NULL,'2024-09-20');

-- ===========================================================================
-- 16. TUTEURS
-- ===========================================================================
INSERT INTO Tuteurs (Id, TenantId, ApprenantId, UserId, Nom, Prenom, LienParente, Telephone, Email, EstContactUrgence, DateCreation)
VALUES
  (@TUT_KE, @LBY,  @APP_KJ, @USR_KE, N'KAMGA',  N'Etienne', 'pere',  '+237 677 999 001', 'kamga.etienne@parent.lby.cm', 1, '2024-08-25'),
  (@TUT_NP, @ISTD, @APP_DB, NULL,    N'DJOUM',  N'Pierre',  'pere',  '+237 699 999 002', 'djoum.pierre@gmail.com',      1, '2024-09-20');

-- ===========================================================================
-- 17. INSCRIPTIONS (tous les statuts représentés)
-- ===========================================================================
INSERT INTO Inscriptions (Id, TenantId, ApprenantId, AnneeAcademiqueId, ClasseId, PromotionId, Statut, TypeInscription, MontantScolarite, DateDemande, DateValidation, DateCreation)
VALUES
  -- LBY 3ème A — validées
  (@INS_KJ_3A, @LBY, @APP_KJ, @AA_LBY_2425, @CL_3A,   NULL,      'validee',  'premiere',     85000, '2024-08-26', '2024-09-01', '2024-08-26'),
  (@INS_NM_3A, @LBY, @APP_NM, @AA_LBY_2425, @CL_3A,   NULL,      'validee',  'premiere',     85000, '2024-08-27', '2024-09-01', '2024-08-27'),
  (@INS_AT_3A, @LBY, @APP_AT, @AA_LBY_2425, @CL_3A,   NULL,      'validee',  'premiere',     85000, '2024-08-28', '2024-09-01', '2024-08-28'),
  -- LBY 3ème A — rejetée
  (@INS_BK_3A, @LBY, @APP_BK, @AA_LBY_2425, @CL_3A,   NULL,      'rejetee',  'premiere',     85000, '2024-08-29', NULL,         '2024-08-29'),
  -- LBY 3ème A — brouillon
  (@INS_FT_3A, @LBY, @APP_FT, @AA_LBY_2425, @CL_3A,   NULL,      'brouillon','premiere',     85000, '2024-08-30', NULL,         '2024-08-30'),
  -- LBY Tle S1 — validées
  (@INS_EO_TL, @LBY, @APP_EO, @AA_LBY_2425, @CL_TLS1, NULL,      'validee',  'reinscription',85000, '2024-08-20', '2024-08-25', '2024-08-20'),
  (@INS_PN_TL, @LBY, @APP_PN, @AA_LBY_2425, @CL_TLS1, NULL,      'validee',  'reinscription',85000, '2024-08-21', '2024-08-25', '2024-08-21'),
  (@INS_SM_TL, @LBY, @APP_SM, @AA_LBY_2425, @CL_TLS1, NULL,      'validee',  'reinscription',85000, '2024-08-22', '2024-08-25', '2024-08-22'),
  -- LBY Tle S1 — annulée
  (@INS_ZC_TL, @LBY, @APP_ZC, @AA_LBY_2425, @CL_TLS1, NULL,      'annulee',  'reinscription',85000, '2024-08-23', NULL,         '2024-08-23'),
  -- LBY Tle S1 — validée
  (@INS_AE_TL, @LBY, @APP_AE, @AA_LBY_2425, @CL_TLS1, NULL,      'validee',  'reinscription',85000, '2024-08-24', '2024-08-28', '2024-08-24'),
  -- ISTD L1 — validées
  (@INS_DB_L1, @ISTD,@APP_DB, @AA_ISTD_2425, NULL,    @PRO_L1I,  'validee',  'premiere',    250000, '2024-09-21', '2024-09-28', '2024-09-21'),
  (@INS_EF_L1, @ISTD,@APP_EF, @AA_ISTD_2425, NULL,    @PRO_L1I,  'validee',  'premiere',    250000, '2024-09-22', '2024-09-28', '2024-09-22'),
  (@INS_LB_L1, @ISTD,@APP_LB, @AA_ISTD_2425, NULL,    @PRO_L1I,  'validee',  'premiere',    250000, '2024-09-23', '2024-09-28', '2024-09-23'),
  (@INS_MO_L1, @ISTD,@APP_MO, @AA_ISTD_2425, NULL,    @PRO_L1I,  'en_attente','premiere',   250000, '2024-09-24', NULL,         '2024-09-24'),
  -- ISTD L2 — validées
  (@INS_TF_L2, @ISTD,@APP_TF, @AA_ISTD_2425, NULL,    @PRO_L2I,  'validee',  'reinscription',250000,'2024-09-15','2024-09-20', '2024-09-15'),
  (@INS_CB_L2, @ISTD,@APP_CB, @AA_ISTD_2425, NULL,    @PRO_L2I,  'validee',  'reinscription',250000,'2024-09-16','2024-09-20', '2024-09-16');

-- ===========================================================================
-- 18. HISTORIQUE INSCRIPTIONS
-- ===========================================================================
INSERT INTO InscriptionHistoriques (Id, InscriptionId, AncienStatut, NouveauStatut, Motif, ChangePar, DateChangement)
VALUES
  (NEWID(), @INS_BK_3A, 'soumise',  'rejetee',   N'Documents incomplets — acte de naissance manquant', @USR_MULTI, '2024-09-02'),
  (NEWID(), @INS_ZC_TL, 'validee',  'annulee',   N'Déménagement de la famille hors de Yaoundé',        @USR_MULTI, '2024-09-10'),
  (NEWID(), @INS_KJ_3A, 'brouillon','soumise',   NULL, @USR_KJ, '2024-08-26'),
  (NEWID(), @INS_KJ_3A, 'soumise',  'validee',   NULL, @USR_MULTI, '2024-09-01');

-- ===========================================================================
-- 19. LISTE D'ATTENTE (ISTD — APP_NW non encore inscrit, en attente de place)
-- ===========================================================================
INSERT INTO ListesAttente (Id, TenantId, ApprenantId, PromotionId, AnneeAcademiqueId, Position, Statut, DateInscription, DateCreation)
VALUES
  (NEWID(), @ISTD, @APP_NW, @PRO_L1I, @AA_ISTD_2425, 1, 'en_attente', '2024-09-25', '2024-09-25');

-- ===========================================================================
-- 20. INSCRIPTIONS UE (ISTD LMD)
-- ===========================================================================
INSERT INTO InscriptionUEs (Id, InscriptionId, UeId, Statut, DateInscription)
VALUES
  (NEWID(), @INS_DB_L1, @UE_INFO1, 'active', '2024-10-07'),
  (NEWID(), @INS_DB_L1, @UE_INFO2, 'active', '2024-10-07'),
  (NEWID(), @INS_EF_L1, @UE_INFO1, 'active', '2024-10-07'),
  (NEWID(), @INS_EF_L1, @UE_INFO2, 'active', '2024-10-07'),
  (NEWID(), @INS_LB_L1, @UE_INFO1, 'active', '2024-10-07'),
  (NEWID(), @INS_LB_L1, @UE_INFO2, 'active', '2024-10-07'),
  (NEWID(), @INS_TF_L2, @UE_INFO3, 'active', '2024-10-07'),
  (NEWID(), @INS_TF_L2, @UE_INFO4, 'active', '2024-10-07'),
  (NEWID(), @INS_CB_L2, @UE_INFO3, 'active', '2024-10-07'),
  (NEWID(), @INS_CB_L2, @UE_INFO4, 'active', '2024-10-07');

-- ===========================================================================
-- 21. INSCRIPTIONS GROUPES
-- ===========================================================================
INSERT INTO InscriptionGroupes (Id, InscriptionId, GroupeId, DateAffectation)
VALUES
  (NEWID(), @INS_KJ_3A, @GRP_3A_A,  '2024-09-02'),
  (NEWID(), @INS_NM_3A, @GRP_3A_A,  '2024-09-02'),
  (NEWID(), @INS_AT_3A, @GRP_3A_A,  '2024-09-02'),
  (NEWID(), @INS_EO_TL, @GRP_TLS_A, '2024-09-02'),
  (NEWID(), @INS_PN_TL, @GRP_TLS_A, '2024-09-02'),
  (NEWID(), @INS_SM_TL, @GRP_TLS_A, '2024-09-02'),
  (NEWID(), @INS_AE_TL, @GRP_TLS_A, '2024-09-02'),
  (NEWID(), @INS_DB_L1, @GRP_L1_A,  '2024-10-07'),
  (NEWID(), @INS_EF_L1, @GRP_L1_A,  '2024-10-07'),
  (NEWID(), @INS_LB_L1, @GRP_L1_B,  '2024-10-07'),
  (NEWID(), @INS_TF_L2, @GRP_L2_A,  '2024-10-07'),
  (NEWID(), @INS_CB_L2, @GRP_L2_A,  '2024-10-07');

-- ===========================================================================
-- 22. CRÉNEAUX HORAIRES
-- ===========================================================================
INSERT INTO CreneauxHoraires (Id, TenantId, JourSemaine, HeureDebut, HeureFin, Libelle, DateCreation)
VALUES
  (@CR_LBY_1, @LBY,  1, '07:30', '09:30', N'Lundi    Créneau 1', '2023-09-01'),
  (@CR_LBY_2, @LBY,  1, '09:45', '11:45', N'Lundi    Créneau 2', '2023-09-01'),
  (@CR_LBY_3, @LBY,  2, '07:30', '09:30', N'Mardi    Créneau 1', '2023-09-01'),
  (@CR_LBY_4, @LBY,  2, '09:45', '11:45', N'Mardi    Créneau 2', '2023-09-01'),
  (@CR_LBY_5, @LBY,  3, '07:30', '09:30', N'Mercredi Créneau 1', '2023-09-01'),
  (@CR_LBY_6, @LBY,  4, '07:30', '09:30', N'Jeudi    Créneau 1', '2023-09-01'),
  (@CR_LBY_7, @LBY,  5, '07:30', '09:30', N'Vendredi Créneau 1', '2023-09-01'),
  (@CR_ISTD_1,@ISTD, 1, '08:00', '10:00', N'Lundi    CM 1',      '2023-10-01'),
  (@CR_ISTD_2,@ISTD, 1, '10:15', '12:15', N'Lundi    CM 2',      '2023-10-01'),
  (@CR_ISTD_3,@ISTD, 2, '08:00', '10:00', N'Mardi    CM 1',      '2023-10-01'),
  (@CR_ISTD_4,@ISTD, 2, '10:15', '12:15', N'Mardi    CM 2',      '2023-10-01'),
  (@CR_ISTD_5,@ISTD, 3, '14:00', '16:00', N'Mercredi TD',        '2023-10-01');

-- ===========================================================================
-- 23. COURS PLANIFIÉS
-- ===========================================================================
INSERT INTO CoursPlanifies (Id, TenantId, MatiereId, EnseignantId, ClasseId, PromotionId, AnneeAcademiqueId, CreneauId, SalleId, JourSemaine, Statut, Frequence, DateDebut, DateFin, DateCreation)
VALUES
  (@CP_3A_MATH,@LBY, @MAT_MATH,@ENS_MULTI,@CL_3A,   NULL,     @AA_LBY_2425,  @CR_LBY_1, @S_LBY_A1, 1,'publie','hebdomadaire','2024-09-02','2025-06-27','2024-08-20'),
  (@CP_3A_FRAN,@LBY, @MAT_FRAN,@ENS_MBL,  @CL_3A,   NULL,     @AA_LBY_2425,  @CR_LBY_3, @S_LBY_A2, 2,'publie','hebdomadaire','2024-09-02','2025-06-27','2024-08-20'),
  (@CP_TL_PHYS,@LBY, @MAT_PHYS,@ENS_HAD,  @CL_TLS1, NULL,     @AA_LBY_2425,  @CR_LBY_2, @S_LBY_A1, 1,'publie','hebdomadaire','2024-09-02','2025-06-27','2024-08-20'),
  (@CP_TL_MATH,@LBY, @MAT_MATH,@ENS_JPM,  @CL_TLS1, NULL,     @AA_LBY_2425,  @CR_LBY_6, @S_LBY_A2, 4,'publie','hebdomadaire','2024-09-02','2025-06-27','2024-08-20'),
  (@CP_L1_ALGO,@ISTD,@MAT_ALGO,@ENS_PTC,  NULL,     @PRO_L1I, @AA_ISTD_2425, @CR_ISTD_1,@S_ISTD_1, 1,'publie','hebdomadaire','2024-10-07','2025-07-14','2024-09-20'),
  (@CP_L1_BD,  @ISTD,@MAT_BD,  @ENS_FTA,  NULL,     @PRO_L1I, @AA_ISTD_2425, @CR_ISTD_3,@S_ISTD_2, 2,'publie','hebdomadaire','2024-10-07','2025-07-14','2024-09-20'),
  (@CP_L2_WEB, @ISTD,@MAT_WEB, @ENS_FTA,  NULL,     @PRO_L2I, @AA_ISTD_2425, @CR_ISTD_2,@S_ISTD_2, 1,'publie','hebdomadaire','2024-10-07','2025-07-14','2024-09-20');

-- ===========================================================================
-- 24. SÉANCES (divers statuts + remplacement + cahier de textes)
-- ===========================================================================
INSERT INTO Seances (Id, TenantId, CoursPlanifieId, EnseignantId, EnseignantRemplacantId, SalleId, DateSeance, HeureDebut, HeureFin, Statut, Contenu, Objectifs, Ressources, DateCreation)
VALUES
  -- Réalisée avec cahier de textes
  (@SEA_001,@LBY, @CP_3A_MATH,@ENS_MULTI,NULL,       @S_LBY_A1,'2024-09-09','07:30','09:30','realisee', N'Introduction aux équations du 2nd degré. Résolution par factorisation.',N'Maîtriser la méthode de factorisation',N'Manuel Maths 3ème, p.45-52','2024-09-09'),
  (@SEA_002,@LBY, @CP_3A_FRAN,@ENS_MBL,  NULL,       @S_LBY_A2,'2024-09-10','07:30','09:30','realisee', N'La narration : structure du récit. Analyse d''un extrait de Mongo Beti.',N'Identifier la structure narrative',N'Cahier de textes Français','2024-09-10'),
  -- Annulée
  (@SEA_003,@LBY, @CP_TL_PHYS,@ENS_HAD,  NULL,       @S_LBY_A1,'2024-09-16','09:45','11:45','annulee',  NULL,NULL,NULL,'2024-09-16'),
  -- Reportée
  (@SEA_004,@LBY, @CP_TL_MATH,@ENS_JPM,  NULL,       @S_LBY_A2,'2024-09-19','07:30','09:30','reportee',  NULL,NULL,NULL,'2024-09-19'),
  -- Planifiée
  (@SEA_005,@LBY, @CP_3A_MATH,@ENS_MULTI,NULL,       @S_LBY_A1,'2025-06-09','07:30','09:30','planifiee', NULL,NULL,NULL,'2024-08-20'),
  -- Réalisée avec remplacement
  (@SEA_006,@LBY, @CP_TL_PHYS,@ENS_HAD,  @ENS_MULTI, @S_LBY_A1,'2024-09-23','09:45','11:45','realisee', N'Optique géométrique — lois de Snell-Descartes.',N'Comprendre la réfraction',NULL,'2024-09-23'),
  -- ISTD réalisée
  (@SEA_007,@ISTD,@CP_L1_ALGO,@ENS_PTC,  NULL,       @S_ISTD_1,'2024-10-14','08:00','10:00','realisee', N'Tri par insertion, tri rapide — complexité algorithmique.',N'Comprendre et implémenter le tri rapide',N'Knuth, TAOCP Vol.3','2024-10-14'),
  -- ISTD planifiée
  (@SEA_008,@ISTD,@CP_L2_WEB, @ENS_FTA,  NULL,       @S_ISTD_2,'2025-06-16','10:15','12:15','planifiee', NULL,NULL,NULL,'2024-09-20');

-- ===========================================================================
-- 25. ABSENCES ENSEIGNANTS
-- ===========================================================================
INSERT INTO AbsencesEnseignants (Id, TenantId, EnseignantId, SeanceId, DateAbsence, Motif, Justifiee, EnseignantRemplacantId, DateCreation)
VALUES
  (@ABS_ENS_1, @LBY, @ENS_HAD, @SEA_003, '2024-09-16', N'Maladie — certificat médical fourni', 1, @ENS_MULTI, '2024-09-16');

-- ===========================================================================
-- 26. ÉVALUATIONS (tous les statuts : brouillon, soumise, validée, publiée)
-- ===========================================================================
INSERT INTO Evaluations (Id, TenantId, MatiereId, ClasseId, PromotionId, AnneeAcademiqueId, PeriodeId, EnseignantId, Titre, Type, NoteMax, Coefficient, DateEvaluation, Statut, DateCreation)
VALUES
  (@EV_3A_M1, @LBY,  @MAT_MATH, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MULTI, N'Devoir Maison 1 — Équations',        'devoir',  20, 1, '2024-10-04', 'publiee', '2024-10-01'),
  (@EV_3A_M2, @LBY,  @MAT_MATH, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MULTI, N'Devoir Surveillé 1 — Algèbre',       'devoir',  20, 2, '2024-11-08', 'validee', '2024-11-01'),
  (@EV_3A_F1, @LBY,  @MAT_FRAN, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MBL,   N'Composition Française T1',           'examen',  20, 3, '2024-11-15', 'soumise', '2024-11-10'),
  (@EV_TL_P1, @LBY,  @MAT_PHYS, @CL_TLS1, NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_HAD,   N'Examen Physique T1',                 'examen',  20, 3, '2024-11-20', 'publiee', '2024-11-15'),
  (@EV_L1_A1, @ISTD, @MAT_ALGO, NULL,     @PRO_L1I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_PTC,   N'Contrôle Continu 1 — Algorithmique', 'cc',      20, 1, '2024-11-04', 'publiee', '2024-10-28'),
  (@EV_L1_B1, @ISTD, @MAT_BD,   NULL,     @PRO_L1I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_FTA,   N'TP Noté 1 — SQL',                    'tp',      20, 1, '2024-11-11', 'brouillon','2024-11-05'),
  (@EV_L2_W1, @ISTD, @MAT_WEB,  NULL,     @PRO_L2I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_FTA,   N'Examen Web S1',                      'examen',  20, 3, '2025-01-20', 'publiee', '2025-01-15');

-- ===========================================================================
-- 27. NOTES (sur évaluations publiées et validées)
-- ===========================================================================
-- EV_3A_M1 — Devoir 1 Maths 3ème A (publiée)
INSERT INTO Notes (Id, TenantId, EvaluationId, ApprenantId, Note, Appreciation, Statut, SaisieParId, DateSaisie, DateCreation)
VALUES
  (NEWID(), @LBY, @EV_3A_M1, @APP_KJ, 16.5, N'Très bien', 'publiee', @ENS_MULTI, '2024-10-06', '2024-10-06'),
  (NEWID(), @LBY, @EV_3A_M1, @APP_NM, 13.0, N'Bien',      'publiee', @ENS_MULTI, '2024-10-06', '2024-10-06'),
  (NEWID(), @LBY, @EV_3A_M1, @APP_AT, 11.5, N'Assez bien','publiee', @ENS_MULTI, '2024-10-06', '2024-10-06');

-- EV_3A_M2 — Devoir 2 Maths 3ème A (validée)
INSERT INTO Notes (Id, TenantId, EvaluationId, ApprenantId, Note, Appreciation, Statut, SaisieParId, DateSaisie, DateCreation)
VALUES
  (NEWID(), @LBY, @EV_3A_M2, @APP_KJ, 17.0, N'Excellent', 'validee', @ENS_MULTI, '2024-11-10', '2024-11-10'),
  (NEWID(), @LBY, @EV_3A_M2, @APP_NM, 12.5, N'Bien',      'validee', @ENS_MULTI, '2024-11-10', '2024-11-10'),
  (NEWID(), @LBY, @EV_3A_M2, @APP_AT, 10.0, N'Passable',  'validee', @ENS_MULTI, '2024-11-10', '2024-11-10');

-- EV_TL_P1 — Examen Physique Tle S1 (publiée)
INSERT INTO Notes (Id, TenantId, EvaluationId, ApprenantId, Note, Appreciation, Statut, SaisieParId, DateSaisie, DateCreation)
VALUES
  (NEWID(), @LBY, @EV_TL_P1, @APP_EO, 14.0, N'Bien',       'publiee', @ENS_HAD, '2024-11-22', '2024-11-22'),
  (NEWID(), @LBY, @EV_TL_P1, @APP_PN, 15.5, N'Très bien',  'publiee', @ENS_HAD, '2024-11-22', '2024-11-22'),
  (NEWID(), @LBY, @EV_TL_P1, @APP_SM, 9.5,  N'Insuffisant','publiee', @ENS_HAD, '2024-11-22', '2024-11-22'),
  (NEWID(), @LBY, @EV_TL_P1, @APP_AE, 11.0, N'Passable',   'publiee', @ENS_HAD, '2024-11-22', '2024-11-22');

-- EV_L1_A1 — CC1 Algo L1 ISTD (publiée)
INSERT INTO Notes (Id, TenantId, EvaluationId, ApprenantId, Note, Appreciation, Statut, SaisieParId, DateSaisie, DateCreation)
VALUES
  (NEWID(), @ISTD, @EV_L1_A1, @APP_DB, 18.0, N'Excellent',  'publiee', @ENS_PTC, '2024-11-06', '2024-11-06'),
  (NEWID(), @ISTD, @EV_L1_A1, @APP_EF, 14.5, N'Bien',       'publiee', @ENS_PTC, '2024-11-06', '2024-11-06'),
  (NEWID(), @ISTD, @EV_L1_A1, @APP_LB, 12.0, N'Assez bien', 'publiee', @ENS_PTC, '2024-11-06', '2024-11-06');

-- EV_L2_W1 — Examen Web L2 ISTD (publiée)
INSERT INTO Notes (Id, TenantId, EvaluationId, ApprenantId, Note, Appreciation, Statut, SaisieParId, DateSaisie, DateCreation)
VALUES
  (NEWID(), @ISTD, @EV_L2_W1, @APP_TF, 15.0, N'Bien',      'publiee', @ENS_FTA, '2025-01-22', '2025-01-22'),
  (NEWID(), @ISTD, @EV_L2_W1, @APP_CB, 16.5, N'Très bien', 'publiee', @ENS_FTA, '2025-01-22', '2025-01-22');

-- ===========================================================================
-- 28. MOYENNES MATIÈRES (T1 LBY — calculées)
-- ===========================================================================
INSERT INTO MoyennesMatieres (Id, TenantId, ApprenantId, MatiereId, PeriodeId, AnneeAcademiqueId, Moyenne, NbEvaluations, Rang, DateCalcul)
VALUES
  (NEWID(), @LBY, @APP_KJ, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 16.75, 2, 1, '2024-12-10'),
  (NEWID(), @LBY, @APP_NM, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 12.75, 2, 2, '2024-12-10'),
  (NEWID(), @LBY, @APP_AT, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 10.75, 2, 3, '2024-12-10'),
  (NEWID(), @LBY, @APP_EO, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 14.00, 1, 2, '2024-12-10'),
  (NEWID(), @LBY, @APP_PN, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 15.50, 1, 1, '2024-12-10'),
  (NEWID(), @LBY, @APP_SM, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425,  9.50, 1, 4, '2024-12-10'),
  (NEWID(), @LBY, @APP_AE, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 11.00, 1, 3, '2024-12-10');

-- ===========================================================================
-- 29. MOYENNES GÉNÉRALES (T1 LBY)
-- ===========================================================================
INSERT INTO MoyennesGenerales (Id, TenantId, ApprenantId, PeriodeId, AnneeAcademiqueId, Moyenne, Rang, Mention, DateCalcul)
VALUES
  (NEWID(), @LBY, @APP_KJ, @P_LBY_T1, @AA_LBY_2425, 15.20, 1, N'Bien',          '2024-12-10'),
  (NEWID(), @LBY, @APP_NM, @P_LBY_T1, @AA_LBY_2425, 12.10, 2, N'Assez Bien',    '2024-12-10'),
  (NEWID(), @LBY, @APP_AT, @P_LBY_T1, @AA_LBY_2425, 10.30, 3, N'Passable',      '2024-12-10'),
  (NEWID(), @LBY, @APP_EO, @P_LBY_T1, @AA_LBY_2425, 13.80, 1, N'Assez Bien',    '2024-12-10'),
  (NEWID(), @LBY, @APP_PN, @P_LBY_T1, @AA_LBY_2425, 14.60, 1, N'Bien',          '2024-12-10'),
  (NEWID(), @LBY, @APP_SM, @P_LBY_T1, @AA_LBY_2425,  9.20, 3, N'Insuffisant',   '2024-12-10'),
  (NEWID(), @LBY, @APP_AE, @P_LBY_T1, @AA_LBY_2425, 11.40, 2, N'Passable',      '2024-12-10');

-- ===========================================================================
-- 30. PRÉSENCES / ABSENCES
-- ===========================================================================
-- Présences sur SEA_001 (Maths 3ème A — réalisée)
INSERT INTO Presences (Id, TenantId, SeanceId, ApprenantId, Statut, HeureArrivee, DateCreation)
VALUES
  (NEWID(), @LBY, @SEA_001, @APP_KJ, 'present',  '07:30', '2024-09-09'),
  (NEWID(), @LBY, @SEA_001, @APP_NM, 'present',  '07:32', '2024-09-09'),
  (NEWID(), @LBY, @SEA_001, @APP_AT, 'retard',   '07:50', '2024-09-09');

-- Absences sur SEA_002 (Français 3ème A — réalisée)
INSERT INTO Presences (Id, TenantId, SeanceId, ApprenantId, Statut, HeureArrivee, DateCreation)
VALUES
  (NEWID(), @LBY, @SEA_002, @APP_KJ, 'present',  '07:30', '2024-09-10'),
  (NEWID(), @LBY, @SEA_002, @APP_NM, 'absent',   NULL,    '2024-09-10'),
  (NEWID(), @LBY, @SEA_002, @APP_AT, 'present',  '07:31', '2024-09-10');

DECLARE @ABS_NM_S2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO Absences (Id, TenantId, ApprenantId, SeanceId, DateAbsence, NbHeures, Statut, DateCreation)
VALUES
  (@ABS_NM_S2, @LBY, @APP_NM, @SEA_002, '2024-09-10', 2, 'en_attente', '2024-09-10');

-- Justificatif pour cette absence
INSERT INTO Justificatifs (Id, TenantId, AbsenceId, ApprenantId, Motif, TypePiece, Statut, DateDepot, DateTraitement, TraiteParId, DateCreation)
VALUES
  (NEWID(), @LBY, @ABS_NM_S2, @APP_NM, N'Maladie — fièvre', 'certificat_medical', 'accepte', '2024-09-12', '2024-09-13', @USR_SCOL, '2024-09-12');

-- Absence SEA_007 ISTD (APP_LB absent — non justifiée)
DECLARE @ABS_LB_S7 UNIQUEIDENTIFIER = NEWID();
INSERT INTO Presences (Id, TenantId, SeanceId, ApprenantId, Statut, HeureArrivee, DateCreation)
VALUES
  (NEWID(), @ISTD, @SEA_007, @APP_DB, 'present', '08:00', '2024-10-14'),
  (NEWID(), @ISTD, @SEA_007, @APP_EF, 'present', '08:02', '2024-10-14'),
  (NEWID(), @ISTD, @SEA_007, @APP_LB, 'absent',  NULL,    '2024-10-14');

INSERT INTO Absences (Id, TenantId, ApprenantId, SeanceId, DateAbsence, NbHeures, Statut, DateCreation)
VALUES
  (@ABS_LB_S7, @ISTD, @APP_LB, @SEA_007, '2024-10-14', 2, 'non_justifiee', '2024-10-14');

-- Justificatif rejeté
INSERT INTO Justificatifs (Id, TenantId, AbsenceId, ApprenantId, Motif, TypePiece, Statut, DateDepot, DateTraitement, TraiteParId, CommentaireRejet, DateCreation)
VALUES
  (NEWID(), @ISTD, @ABS_LB_S7, @APP_LB, N'Panne de voiture', 'autre', 'rejete', '2024-10-15', '2024-10-16', @USR_PTC, N'Motif insuffisant — prévoir un document officiel', '2024-10-15');

-- ===========================================================================
-- 31. SESSIONS D'EXAMEN
-- ===========================================================================
INSERT INTO SessionsExamen (Id, TenantId, AnneeAcademiqueId, PeriodeId, Libelle, Type, DateDebut, DateFin, Statut, DateCreation)
VALUES
  (@SES_LBY,  @LBY,  @AA_LBY_2425,  @P_LBY_T1,  N'Session Examens T1 2024-2025',       'partiel', '2024-11-25', '2024-11-29', 'planifiee', '2024-11-01'),
  (@SES_ISTD, @ISTD, @AA_ISTD_2425, @P_ISTD_S1, N'Session Examens Semestre 1 2024-2025','session', '2025-01-20', '2025-02-07', 'en_cours',  '2025-01-05');

-- ===========================================================================
-- 32. ÉPREUVES
-- ===========================================================================
INSERT INTO Epreuves (Id, TenantId, SessionExamenId, MatiereId, EnseignantId, SalleId, DateEpreuve, HeureDebut, HeureFin, Duree, NoteMax, DateCreation)
VALUES
  (@EPR_LBY_M,  @LBY,  @SES_LBY,  @MAT_MATH, @ENS_MULTI, @S_LBY_A1,   '2024-11-25', '07:30', '10:30', 180, 20, '2024-11-10'),
  (@EPR_LBY_F,  @LBY,  @SES_LBY,  @MAT_FRAN, @ENS_MBL,   @S_LBY_A2,   '2024-11-26', '07:30', '10:30', 180, 20, '2024-11-10'),
  (@EPR_ISTD_A, @ISTD, @SES_ISTD, @MAT_ALGO, @ENS_PTC,   @S_ISTD_1,   '2025-01-20', '08:00', '11:00', 180, 20, '2025-01-08');

-- ===========================================================================
-- 33. CONVOCATIONS (éligibles + 1 inéligible pour dette financière)
-- ===========================================================================
INSERT INTO Convocations (Id, TenantId, SessionExamenId, EpreuveId, ApprenantId, Eligible, MotifIneligibilite, NumeroTable, DateCreation)
VALUES
  (NEWID(), @LBY,  @SES_LBY,  @EPR_LBY_M, @APP_KJ, 1, NULL,                               101, '2024-11-18'),
  (NEWID(), @LBY,  @SES_LBY,  @EPR_LBY_M, @APP_NM, 1, NULL,                               102, '2024-11-18'),
  (NEWID(), @LBY,  @SES_LBY,  @EPR_LBY_M, @APP_AT, 0, N'Scolarité non soldée — 35 000 XAF restant', 103, '2024-11-18'),
  (NEWID(), @LBY,  @SES_LBY,  @EPR_LBY_F, @APP_KJ, 1, NULL,                               201, '2024-11-18'),
  (NEWID(), @LBY,  @SES_LBY,  @EPR_LBY_F, @APP_NM, 1, NULL,                               202, '2024-11-18'),
  (NEWID(), @ISTD, @SES_ISTD, @EPR_ISTD_A,@APP_DB, 1, NULL,                               301, '2025-01-12'),
  (NEWID(), @ISTD, @SES_ISTD, @EPR_ISTD_A,@APP_EF, 1, NULL,                               302, '2025-01-12'),
  (NEWID(), @ISTD, @SES_ISTD, @EPR_ISTD_A,@APP_LB, 1, NULL,                               303, '2025-01-12');

-- ===========================================================================
-- 34. PV D'EXAMENS + CAS DE FRAUDE
-- ===========================================================================
DECLARE @PV_ISTD UNIQUEIDENTIFIER = NEWID();
INSERT INTO PVExamens (Id, TenantId, EpreuveId, NbCandidatsInscrits, NbCandidatsPresents, NbCandidatsAbsents, NbCopiesAnonymes, Observations, SigneParId, DateSignature, DateCreation)
VALUES
  (@PV_ISTD, @ISTD, @EPR_ISTD_A, 3, 3, 0, 3, N'Examen s''est déroulé sans incident majeur. Un cas de fraude détecté (voir CasFraude).', @USR_PTC, '2025-01-20', '2025-01-20');

INSERT INTO CasFraude (Id, TenantId, PVExamenId, ApprenantId, Description, Sanction, DateCreation)
VALUES
  (NEWID(), @ISTD, @PV_ISTD, @APP_LB, N'Téléphone portable trouvé allumé sur le bureau de l''étudiant pendant l''épreuve. Note annulée.', N'Note 0 — avertissement écrit', '2025-01-20');

-- ===========================================================================
-- 35. BULLETINS (brouillon → généré → signé → publié)
-- ===========================================================================
INSERT INTO Bulletins (Id, TenantId, ApprenantId, AnneeAcademiqueId, PeriodeId, ClasseId, Statut, MoyenneGenerale, Rang, Appreciation, SigneParId, DateSignature, DatePublication, DateCreation)
VALUES
  (@BUL_KJ_T1, @LBY, @APP_KJ, @AA_LBY_2425, @P_LBY_T1, @CL_3A,  'signe',   15.20, 1, N'Élève sérieux et travailleur. Continue ainsi.', @USR_MULTI, '2024-12-13', NULL,         '2024-12-10'),
  (@BUL_NM_T1, @LBY, @APP_NM, @AA_LBY_2425, @P_LBY_T1, @CL_3A,  'genere',  12.10, 2, N'Des efforts à fournir pour atteindre le potentiel.',NULL, NULL, NULL,'2024-12-10'),
  (@BUL_EO_T1, @LBY, @APP_EO, @AA_LBY_2425, @P_LBY_T1, @CL_TLS1,'publie',  13.80, 1, N'Bonne progression. Encouragements.',@USR_MULTI,'2024-12-13','2024-12-15','2024-12-10'),
  (@BUL_PN_T1, @LBY, @APP_PN, @AA_LBY_2425, @P_LBY_T1, @CL_TLS1,'brouillon',14.60,1, NULL, NULL, NULL, NULL, '2024-12-10');

-- Lignes de bulletins (APP_KJ — bulletin signé)
INSERT INTO BulletinLignes (Id, BulletinId, MatiereId, Moyenne, Coefficient, RangMatiere, AppreciationMatiere, DateCreation)
VALUES
  (NEWID(), @BUL_KJ_T1, @MAT_MATH, 16.75, 4, 1, N'Excellent niveau en algèbre', '2024-12-10'),
  (NEWID(), @BUL_KJ_T1, @MAT_FRAN, 13.50, 3, 2, N'Bonne maîtrise de la langue',  '2024-12-10');

-- Relevé de notes LMD (ISTD)
INSERT INTO RelevesNotes (Id, TenantId, ApprenantId, AnneeAcademiqueId, PeriodeId, PromotionId, Credits, MoyenneGenerale, Statut, DateCreation)
VALUES
  (NEWID(), @ISTD, @APP_DB, @AA_ISTD_2425, @P_ISTD_S1, @PRO_L1I, 10, 17.50, 'provisoire', '2025-02-10'),
  (NEWID(), @ISTD, @APP_TF, @AA_ISTD_2425, @P_ISTD_S1, @PRO_L2I, 10, 15.00, 'provisoire', '2025-02-10');

-- ===========================================================================
-- 36. DÉLIBÉRATIONS
-- ===========================================================================
INSERT INTO Deliberations (Id, TenantId, AnneeAcademiqueId, PeriodeId, ClasseId, PromotionId, Type, DateDeliberation, Statut, DateCreation)
VALUES
  (@DEL_LBY,  @LBY,  @AA_LBY_2425,  @P_LBY_T1, @CL_3A,   NULL,     'conseil_classe', '2024-12-11', 'tenu',  '2024-12-08'),
  (@DEL_ISTD, @ISTD, @AA_ISTD_2425, @P_ISTD_S1, NULL,    @PRO_L1I, 'jury_exam',      '2025-02-10', 'tenu',  '2025-02-07');

INSERT INTO DeliberationLignes (Id, DeliberationId, ApprenantId, Moyenne, Rang, Decision, Observation, DateCreation)
VALUES
  (NEWID(), @DEL_LBY,  @APP_KJ, 15.20, 1, 'admis',         N'Félicitations du conseil',          '2024-12-11'),
  (NEWID(), @DEL_LBY,  @APP_NM, 12.10, 2, 'admis',         NULL,                                 '2024-12-11'),
  (NEWID(), @DEL_LBY,  @APP_AT, 10.30, 3, 'admis_reserve', N'Doit améliorer les mathématiques',  '2024-12-11'),
  (NEWID(), @DEL_ISTD, @APP_DB, 17.50, 1, 'admis',         N'Major de promotion S1',             '2025-02-10'),
  (NEWID(), @DEL_ISTD, @APP_EF, 14.50, 2, 'admis',         NULL,                                 '2025-02-10'),
  (NEWID(), @DEL_ISTD, @APP_LB,  0.00, 3, 'ajourné',       N'Fraude lors de l''examen ALGO',     '2025-02-10');

-- ===========================================================================
-- 37. COMMUNICATION — Modèles, Annonces, Notifications, Messages
-- ===========================================================================
INSERT INTO ModelesMessage (Id, TenantId, Nom, Sujet, Corps, Variables, DateCreation)
VALUES
  (@MOD_MSG_1, @LBY,  N'Rappel paiement scolarité',        N'Rappel : solde de scolarité',      N'Bonjour {{prenom}}, votre solde de scolarité est de {{montant}} XAF.',          '["prenom","montant"]',        '2024-09-01'),
  (@MOD_MSG_2, @ISTD, N'Convocation examen',               N'Convocation aux examens {{session}}',N'Étudiant(e) {{nom}}, vous êtes convoqué(e) pour la session {{session}}.',  '["nom","session"]',           '2025-01-05');

INSERT INTO Annonces (Id, TenantId, Titre, Contenu, Auteur, Cible, DatePublication, DateExpiration, Priorite, DateCreation)
VALUES
  (NEWID(), @LBY,  N'Calendrier des examens T1',                   N'Les examens du Trimestre 1 se tiendront du 25 au 29 novembre 2024. Tableau de salle affiché au secrétariat.', @USR_MULTI, 'tous',      '2024-11-01', '2024-11-30', 'haute',   '2024-11-01'),
  (NEWID(), @LBY,  N'Fermeture exceptionnelle jeudi 21 novembre',  N'En raison de la Journée Nationale, l''établissement sera fermé le jeudi 21 novembre 2024.',                  @USR_MULTI, 'tous',      '2024-11-15', '2024-11-21', 'normale', '2024-11-15'),
  (NEWID(), @ISTD, N'Résultats CC1 Algorithmique disponibles',     N'Les résultats du premier contrôle continu d''algorithmique sont disponibles sur l''ENT.',                   @USR_PTC,   'apprenants','2024-11-08', '2024-11-30', 'normale', '2024-11-08');

INSERT INTO Notifications (Id, TenantId, UserId, Titre, Contenu, Type, Lu, DateCreation)
VALUES
  (NEWID(), @LBY,  @USR_KJ,    N'Bulletin T1 disponible',              N'Votre bulletin du Trimestre 1 est disponible.',             'info',    0, '2024-12-15'),
  (NEWID(), @LBY,  @USR_KE,    N'Bulletin T1 de votre enfant',         N'Le bulletin de Jean KAMGA pour le T1 est disponible.',      'info',    1, '2024-12-15'),
  (NEWID(), @LBY,  @USR_MULTI, N'Absence non justifiée signalée',      N'Un apprenant de 3ème A présente 4h d''absence non justifiée.','alerte', 0, '2024-09-15'),
  (NEWID(), @ISTD, @USR_PTC,   N'Fraude détectée — action requise',    N'Un cas de fraude a été enregistré. Veuillez signer le PV.',  'alerte',  0, '2025-01-20');

INSERT INTO Messages (Id, TenantId, ExpediteurId, DestinataireId, Sujet, Corps, Lu, DateEnvoi, DateCreation)
VALUES
  (NEWID(), @LBY,  @USR_KE, @USR_MULTI, N'Question scolarité Jean',     N'Bonjour, je souhaite des informations sur le solde de scolarité de mon fils Jean KAMGA.',    0, '2024-10-20', '2024-10-20'),
  (NEWID(), @ISTD, @USR_PTC,@USR_AUDIT, N'Rapport pédagogique S1',      N'Veuillez trouver ci-joint le résumé pédagogique du semestre 1 pour le département Info.', 1, '2025-02-12', '2025-02-12');

-- ===========================================================================
-- 38. FINANCE — Factures & Paiements (tous les statuts)
-- ===========================================================================
INSERT INTO Factures (Id, TenantId, ApprenantId, InscriptionId, NumeroFacture, Libelle, MontantTotal, MontantPaye, Statut, DateEmission, DateEcheance, Devise, DateCreation)
VALUES
  -- LBY
  (@FAC_KJ, @LBY,  @APP_KJ, @INS_KJ_3A,'LBY-2025-F001', N'Scolarité 2024-2025 — KAMGA Jean',     85000, 85000, 'payee',    '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_NM, @LBY,  @APP_NM, @INS_NM_3A,'LBY-2025-F002', N'Scolarité 2024-2025 — NGUEMO Marie',   85000, 50000, 'partielle','2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_AT, @LBY,  @APP_AT, @INS_AT_3A,'LBY-2025-F003', N'Scolarité 2024-2025 — ATEBA Thomas',   85000,     0, 'emise',    '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_BK, @LBY,  @APP_BK, @INS_BK_3A,'LBY-2025-F004', N'Scolarité 2024-2025 — BIYONG Karine',  85000,     0, 'brouillon',NULL,         NULL,         'XAF', '2024-09-03'),
  (@FAC_EO, @LBY,  @APP_EO, @INS_EO_TL,'LBY-2025-F005', N'Scolarité 2024-2025 — EBA Olivier',    85000,     0, 'en_retard','2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  -- ISTD
  (@FAC_DB, @ISTD, @APP_DB, @INS_DB_L1,'ISTD-2025-F001',N'Scolarité 2024-2025 — DJOUM Bertrand',250000,250000, 'payee',    '2024-10-07', '2024-11-15', 'XAF', '2024-10-07'),
  (@FAC_EF, @ISTD, @APP_EF, @INS_EF_L1,'ISTD-2025-F002',N'Scolarité 2024-2025 — EKAMBI Fanta',  250000,     0, 'emise',    '2024-10-07', '2024-11-15', 'XAF', '2024-10-07'),
  (@FAC_TF, @ISTD, @APP_TF, @INS_TF_L2,'ISTD-2025-F003',N'Scolarité 2024-2025 — TONYE Florian', 250000,125000, 'partielle','2024-10-07', '2024-11-15', 'XAF', '2024-10-07');

-- ===========================================================================
-- 39. PAIEMENTS
-- ===========================================================================
INSERT INTO Paiements (Id, TenantId, FactureId, ApprenantId, Montant, ModePaiement, Reference, DatePaiement, EnregistreParId, DateCreation)
VALUES
  -- KJ — scolarité payée intégralement
  (NEWID(), @LBY,  @FAC_KJ, @APP_KJ, 85000, 'especes',        'CASH-LBY-001', '2024-09-05', @USR_COMPT, '2024-09-05'),
  -- NM — 2 versements
  (NEWID(), @LBY,  @FAC_NM, @APP_NM, 30000, 'mobile_money',   'MTN-MM-20241005', '2024-10-05', @USR_COMPT, '2024-10-05'),
  (NEWID(), @LBY,  @FAC_NM, @APP_NM, 20000, 'mobile_money',   'MTN-MM-20241110', '2024-11-10', @USR_COMPT, '2024-11-10'),
  -- DB ISTD — virement bancaire
  (NEWID(), @ISTD, @FAC_DB, @APP_DB,250000, 'virement',       'VIR-SGBC-10142024','2024-10-14',@USR_COMPT,'2024-10-14'),
  -- TF ISTD — 1er versement
  (NEWID(), @ISTD, @FAC_TF, @APP_TF,125000, 'cheque',         'CHQ-BICEC-0042',   '2024-10-10',@USR_COMPT,'2024-10-10');

-- ===========================================================================
-- 40. ÉVÉNEMENTS CALENDRIER
-- ===========================================================================
INSERT INTO EvenementsCalendrier (Id, TenantId, AnneeAcademiqueId, Titre, Description, DateDebut, DateFin, Type, DateCreation)
VALUES
  (NEWID(), @LBY,  @AA_LBY_2425,  N'Rentrée scolaire 2024-2025',         N'Rentrée officielle des classes',               '2024-09-02', '2024-09-02', 'administratif', '2024-08-01'),
  (NEWID(), @LBY,  @AA_LBY_2425,  N'Fête de la Jeunesse',               N'Journée nationale — établissement fermé',      '2025-02-11', '2025-02-11', 'ferie',         '2024-08-01'),
  (NEWID(), @LBY,  @AA_LBY_2425,  N'Examens T1',                         N'Session d''examens du premier trimestre',      '2024-11-25', '2024-11-29', 'examen',        '2024-11-01'),
  (NEWID(), @ISTD, @AA_ISTD_2425, N'Rentrée universitaire 2024-2025',    N'Rentrée officielle',                           '2024-10-07', '2024-10-07', 'administratif', '2024-09-01'),
  (NEWID(), @ISTD, @AA_ISTD_2425, N'Semaine pédagogique S1',             N'Ateliers et conférences pédagogiques',         '2024-12-02', '2024-12-06', 'pedagogique',   '2024-11-01'),
  (NEWID(), @ISTD, @AA_ISTD_2425, N'Examens S1',                         N'Session examens semestre 1',                  '2025-01-20', '2025-02-07', 'examen',        '2025-01-05');

-- ===========================================================================
COMMIT TRANSACTION;
-- ===========================================================================
-- Fin du seed — entités métier
-- Exécuter ensuite DbInitializer.cs pour les comptes utilisateurs
-- ===========================================================================
