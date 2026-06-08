-- =============================================================================
-- SEED COMPLET — edu_manager  (MySQL 8.0+)
-- =============================================================================
-- Entités métier UNIQUEMENT — AspNetUsers/AspNetRoles/AspNetUserRoles
-- sont gérées par DbInitializer.cs (hachage des mots de passe via UserManager)
-- =============================================================================
-- Contexte :
--   • Lycée Bilingue de Yaoundé (LBY)              — scolaire, 3 trimestres
--   • Institut Supérieur de Technologie Douala (ISTD) — universitaire, LMD
--   • Années : 2023-2024 (clôturée) + 2024-2025 (active)
--   • Devise : XAF (Franc CFA)
-- =============================================================================

START TRANSACTION;
SET NAMES utf8mb4;

-- ===========================================================================
-- 0. VARIABLES — GUIDs nommés pour lisibilité
-- ===========================================================================

-- Tenants
SET @LBY  = 'A1000000-0000-0000-0000-000000000001';
SET @ISTD = 'A2000000-0000-0000-0000-000000000001';

-- Campus
SET @CAM_LBY  = 'B1000000-0000-0000-0000-000000000001';
SET @CAM_ISTD = 'B2000000-0000-0000-0000-000000000001';

-- Années académiques
SET @AA_LBY_2324   = 'C1000000-0000-0000-0000-000000000001';
SET @AA_LBY_2425   = 'C1000000-0000-0000-0000-000000000002';
SET @AA_ISTD_2324  = 'C2000000-0000-0000-0000-000000000001';
SET @AA_ISTD_2425  = 'C2000000-0000-0000-0000-000000000002';

-- Périodes
SET @P_LBY_T1   = 'D1000000-0000-0000-0000-000000000001';
SET @P_LBY_T2   = 'D1000000-0000-0000-0000-000000000002';
SET @P_LBY_T3   = 'D1000000-0000-0000-0000-000000000003';
SET @P_ISTD_S1  = 'D2000000-0000-0000-0000-000000000001';
SET @P_ISTD_S2  = 'D2000000-0000-0000-0000-000000000002';

-- Salles
SET @S_LBY_A1   = 'E1000000-0000-0000-0000-000000000001';
SET @S_LBY_A2   = 'E1000000-0000-0000-0000-000000000002';
SET @S_LBY_INFO = 'E1000000-0000-0000-0000-000000000003';
SET @S_ISTD_1   = 'E2000000-0000-0000-0000-000000000001';
SET @S_ISTD_2   = 'E2000000-0000-0000-0000-000000000002';
SET @S_ISTD_LAB = 'E2000000-0000-0000-0000-000000000003';

-- Cycles
SET @CYC_SEC    = 'F1000000-0000-0000-0000-000000000001';
SET @CYC_LIC    = 'F2000000-0000-0000-0000-000000000001';
SET @CYC_MAS    = 'F2000000-0000-0000-0000-000000000002';

-- Filières
SET @FIL_GENE   = 'G1000000-0000-0000-0000-000000000001';
SET @FIL_INFO   = 'G2000000-0000-0000-0000-000000000001';

-- Niveaux
SET @NIV_3EME   = 'H1000000-0000-0000-0000-000000000001';
SET @NIV_TLE    = 'H1000000-0000-0000-0000-000000000002';
SET @NIV_L1     = 'H2000000-0000-0000-0000-000000000001';
SET @NIV_L2     = 'H2000000-0000-0000-0000-000000000002';

-- Classes (LBY)
SET @CL_3A      = 'I1000000-0000-0000-0000-000000000001';
SET @CL_TLS1    = 'I1000000-0000-0000-0000-000000000002';

-- Promotions (ISTD)
SET @PRO_L1I    = 'J2000000-0000-0000-0000-000000000001';
SET @PRO_L2I    = 'J2000000-0000-0000-0000-000000000002';

-- Groupes
SET @GRP_3A_A   = 'K1000000-0000-0000-0000-000000000001';
SET @GRP_TLS_A  = 'K1000000-0000-0000-0000-000000000002';
SET @GRP_L1_A   = 'K2000000-0000-0000-0000-000000000001';
SET @GRP_L1_B   = 'K2000000-0000-0000-0000-000000000002';
SET @GRP_L2_A   = 'K2000000-0000-0000-0000-000000000003';

-- Matières LBY
SET @MAT_MATH   = 'L1000000-0000-0000-0000-000000000001';
SET @MAT_FRAN   = 'L1000000-0000-0000-0000-000000000002';
SET @MAT_ANGL   = 'L1000000-0000-0000-0000-000000000003';
SET @MAT_SVT    = 'L1000000-0000-0000-0000-000000000004';
SET @MAT_PHYS   = 'L1000000-0000-0000-0000-000000000005';
SET @MAT_HG     = 'L1000000-0000-0000-0000-000000000006';

-- Matières ISTD
SET @MAT_ALGO   = 'L2000000-0000-0000-0000-000000000001';
SET @MAT_BD     = 'L2000000-0000-0000-0000-000000000002';
SET @MAT_POO    = 'L2000000-0000-0000-0000-000000000003';
SET @MAT_SYS    = 'L2000000-0000-0000-0000-000000000004';
SET @MAT_WEB    = 'L2000000-0000-0000-0000-000000000005';
SET @MAT_RESX   = 'L2000000-0000-0000-0000-000000000006';

-- Unités d'Enseignement ISTD
SET @UE_INFO1   = 'M2000000-0000-0000-0000-000000000001';
SET @UE_INFO2   = 'M2000000-0000-0000-0000-000000000002';
SET @UE_INFO3   = 'M2000000-0000-0000-0000-000000000003';
SET @UE_INFO4   = 'M2000000-0000-0000-0000-000000000004';

-- Enseignants
SET @ENS_MULTI  = 'N0000000-0000-0000-0000-000000000001';
SET @ENS_JPM    = 'N0000000-0000-0000-0000-000000000002';
SET @ENS_PTC    = 'N0000000-0000-0000-0000-000000000003';
SET @ENS_MBL    = 'N0000000-0000-0000-0000-000000000004';
SET @ENS_HAD    = 'N0000000-0000-0000-0000-000000000005';
SET @ENS_CNA    = 'N0000000-0000-0000-0000-000000000006';
SET @ENS_OFO    = 'N0000000-0000-0000-0000-000000000007';
SET @ENS_FTA    = 'N0000000-0000-0000-0000-000000000008';

-- Apprenants LBY 3ème A
SET @APP_KJ     = 'O1000000-0000-0000-0000-000000000001';
SET @APP_NM     = 'O1000000-0000-0000-0000-000000000002';
SET @APP_AT     = 'O1000000-0000-0000-0000-000000000003';
SET @APP_BK     = 'O1000000-0000-0000-0000-000000000004';
SET @APP_FT     = 'O1000000-0000-0000-0000-000000000005';

-- Apprenants LBY Tle S1
SET @APP_EO     = 'O1000000-0000-0000-0000-000000000006';
SET @APP_PN     = 'O1000000-0000-0000-0000-000000000007';
SET @APP_SM     = 'O1000000-0000-0000-0000-000000000008';
SET @APP_ZC     = 'O1000000-0000-0000-0000-000000000009';
SET @APP_AE     = 'O1000000-0000-0000-0000-000000000010';

-- Apprenants ISTD L1
SET @APP_DB     = 'O2000000-0000-0000-0000-000000000001';
SET @APP_EF     = 'O2000000-0000-0000-0000-000000000002';
SET @APP_LB     = 'O2000000-0000-0000-0000-000000000003';
SET @APP_MO     = 'O2000000-0000-0000-0000-000000000004';
SET @APP_NW     = 'O2000000-0000-0000-0000-000000000005';

-- Apprenants ISTD L2
SET @APP_TF     = 'O2000000-0000-0000-0000-000000000006';
SET @APP_CB     = 'O2000000-0000-0000-0000-000000000007';

-- Tuteurs
SET @TUT_KE     = 'O9000000-0000-0000-0000-000000000001';
SET @TUT_NP     = 'O9000000-0000-0000-0000-000000000002';

-- Inscriptions LBY 3ème A
SET @INS_KJ_3A  = 'Q1000000-0000-0000-0000-000000000001';
SET @INS_NM_3A  = 'Q1000000-0000-0000-0000-000000000002';
SET @INS_AT_3A  = 'Q1000000-0000-0000-0000-000000000003';
SET @INS_BK_3A  = 'Q1000000-0000-0000-0000-000000000004';
SET @INS_FT_3A  = 'Q1000000-0000-0000-0000-000000000005';

-- Inscriptions LBY Tle S1
SET @INS_EO_TL  = 'Q1000000-0000-0000-0000-000000000006';
SET @INS_PN_TL  = 'Q1000000-0000-0000-0000-000000000007';
SET @INS_SM_TL  = 'Q1000000-0000-0000-0000-000000000008';
SET @INS_ZC_TL  = 'Q1000000-0000-0000-0000-000000000009';
SET @INS_AE_TL  = 'Q1000000-0000-0000-0000-000000000010';

-- Inscriptions ISTD
SET @INS_DB_L1  = 'Q2000000-0000-0000-0000-000000000001';
SET @INS_EF_L1  = 'Q2000000-0000-0000-0000-000000000002';
SET @INS_LB_L1  = 'Q2000000-0000-0000-0000-000000000003';
SET @INS_MO_L1  = 'Q2000000-0000-0000-0000-000000000004';
SET @INS_TF_L2  = 'Q2000000-0000-0000-0000-000000000005';
SET @INS_CB_L2  = 'Q2000000-0000-0000-0000-000000000006';

-- Créneaux horaires LBY
SET @CR_LBY_1   = 'R1000000-0000-0000-0000-000000000001';
SET @CR_LBY_2   = 'R1000000-0000-0000-0000-000000000002';
SET @CR_LBY_3   = 'R1000000-0000-0000-0000-000000000003';
SET @CR_LBY_4   = 'R1000000-0000-0000-0000-000000000004';
SET @CR_LBY_5   = 'R1000000-0000-0000-0000-000000000005';
SET @CR_LBY_6   = 'R1000000-0000-0000-0000-000000000006';
SET @CR_LBY_7   = 'R1000000-0000-0000-0000-000000000007';

-- Créneaux horaires ISTD
SET @CR_ISTD_1  = 'R2000000-0000-0000-0000-000000000001';
SET @CR_ISTD_2  = 'R2000000-0000-0000-0000-000000000002';
SET @CR_ISTD_3  = 'R2000000-0000-0000-0000-000000000003';
SET @CR_ISTD_4  = 'R2000000-0000-0000-0000-000000000004';
SET @CR_ISTD_5  = 'R2000000-0000-0000-0000-000000000005';

-- Cours planifiés
SET @CP_3A_MATH = 'S1000000-0000-0000-0000-000000000001';
SET @CP_3A_FRAN = 'S1000000-0000-0000-0000-000000000002';
SET @CP_TL_PHYS = 'S1000000-0000-0000-0000-000000000003';
SET @CP_TL_MATH = 'S1000000-0000-0000-0000-000000000004';
SET @CP_L1_ALGO = 'S2000000-0000-0000-0000-000000000001';
SET @CP_L1_BD   = 'S2000000-0000-0000-0000-000000000002';
SET @CP_L2_WEB  = 'S2000000-0000-0000-0000-000000000003';

-- Séances
SET @SEA_001    = 'SE000000-0000-0000-0000-000000000001';
SET @SEA_002    = 'SE000000-0000-0000-0000-000000000002';
SET @SEA_003    = 'SE000000-0000-0000-0000-000000000003';
SET @SEA_004    = 'SE000000-0000-0000-0000-000000000004';
SET @SEA_005    = 'SE000000-0000-0000-0000-000000000005';
SET @SEA_006    = 'SE000000-0000-0000-0000-000000000006';
SET @SEA_007    = 'SE000000-0000-0000-0000-000000000007';
SET @SEA_008    = 'SE000000-0000-0000-0000-000000000008';

-- Évaluations
SET @EV_3A_M1   = 'T1000000-0000-0000-0000-000000000001';
SET @EV_3A_M2   = 'T1000000-0000-0000-0000-000000000002';
SET @EV_3A_F1   = 'T1000000-0000-0000-0000-000000000003';
SET @EV_TL_P1   = 'T1000000-0000-0000-0000-000000000004';
SET @EV_L1_A1   = 'T2000000-0000-0000-0000-000000000001';
SET @EV_L1_B1   = 'T2000000-0000-0000-0000-000000000002';
SET @EV_L2_W1   = 'T2000000-0000-0000-0000-000000000003';

-- Sessions d'examen
SET @SES_LBY    = 'U1000000-0000-0000-0000-000000000001';
SET @SES_ISTD   = 'U2000000-0000-0000-0000-000000000001';

-- Épreuves
SET @EPR_LBY_M  = 'U1000000-0000-0000-0000-000000000011';
SET @EPR_LBY_F  = 'U1000000-0000-0000-0000-000000000012';
SET @EPR_ISTD_A = 'U2000000-0000-0000-0000-000000000011';

-- Bulletins
SET @BUL_KJ_T1  = 'V1000000-0000-0000-0000-000000000001';
SET @BUL_NM_T1  = 'V1000000-0000-0000-0000-000000000002';
SET @BUL_EO_T1  = 'V1000000-0000-0000-0000-000000000003';
SET @BUL_PN_T1  = 'V1000000-0000-0000-0000-000000000004';

-- Délibérations
SET @DEL_LBY    = 'W1000000-0000-0000-0000-000000000001';
SET @DEL_ISTD   = 'W2000000-0000-0000-0000-000000000001';

-- Factures
SET @FAC_KJ     = 'X1000000-0000-0000-0000-000000000001';
SET @FAC_NM     = 'X1000000-0000-0000-0000-000000000002';
SET @FAC_AT     = 'X1000000-0000-0000-0000-000000000003';
SET @FAC_BK     = 'X1000000-0000-0000-0000-000000000004';
SET @FAC_EO     = 'X1000000-0000-0000-0000-000000000005';
SET @FAC_DB     = 'X2000000-0000-0000-0000-000000000001';
SET @FAC_EF     = 'X2000000-0000-0000-0000-000000000002';
SET @FAC_TF     = 'X2000000-0000-0000-0000-000000000003';

-- Absences enseignants
SET @ABS_ENS_1  = 'AE000000-0000-0000-0000-000000000001';

-- Paramètres absentéisme
SET @PARAM_LBY  = 'PA000000-0000-0000-0000-000000000001';
SET @PARAM_ISTD = 'PA000000-0000-0000-0000-000000000002';

-- Modèles de messages
SET @MOD_MSG_1  = 'MM000000-0000-0000-0000-000000000001';
SET @MOD_MSG_2  = 'MM000000-0000-0000-0000-000000000002';

-- Users (FK uniquement — créés par DbInitializer.cs)
SET @USR_SUPER  = 'P0000000-0000-0000-0000-000000000001';
SET @USR_MULTI  = 'P0000000-0000-0000-0000-000000000002';
SET @USR_JPM    = 'P0000000-0000-0000-0000-000000000003';
SET @USR_PTC    = 'P0000000-0000-0000-0000-000000000004';
SET @USR_SCOL   = 'P0000000-0000-0000-0000-000000000005';
SET @USR_COMPT  = 'P0000000-0000-0000-0000-000000000006';
SET @USR_KJ     = 'P0000000-0000-0000-0000-000000000007';
SET @USR_KE     = 'P0000000-0000-0000-0000-000000000008';
SET @USR_AUDIT  = 'P0000000-0000-0000-0000-000000000009';

-- ===========================================================================
-- 1. TENANTS
-- ===========================================================================
INSERT INTO `Tenants` (`Id`, `Nom`, `Code`, `Type`, `Ville`, `Pays`, `Telephone`, `Email`, `SiteWeb`, `Devise`, `Actif`, `DateCreation`) VALUES
  (@LBY,  'Lycée Bilingue de Yaoundé',                  'LBY',  'scolaire',      'Yaoundé', 'CM', '+237 222 123 456', 'contact@lby.cm',        'www.lby.cm',        'XAF', 1, '2023-01-15'),
  (@ISTD, 'Institut Supérieur de Technologie de Douala', 'ISTD', 'universitaire', 'Douala',  'CM', '+237 233 987 654', 'contact@ist-douala.cm', 'www.ist-douala.cm', 'XAF', 1, '2023-01-20');

-- ===========================================================================
-- 2. CAMPUS
-- ===========================================================================
INSERT INTO `Campus` (`Id`, `TenantId`, `Nom`, `Adresse`, `Ville`, `EstPrincipal`, `DateCreation`) VALUES
  (@CAM_LBY,  @LBY,  'Campus Principal Yaoundé', 'Boulevard de la Réunification, Yaoundé', 'Yaoundé', 1, '2023-01-15'),
  (@CAM_ISTD, @ISTD, 'Campus Principal Douala',  'Rue des Écoles, Akwa, Douala',           'Douala',  1, '2023-01-20');

-- ===========================================================================
-- 3. PARAMÈTRES ABSENTÉISME
-- ===========================================================================
INSERT INTO `ParametresAbsenteisme` (`Id`, `TenantId`, `NbHeuresAbsenceAvantAlerte`, `NbHeuresAbsenceAvantConvocation`, `NbHeuresAbsenceAvantExclusion`, `DelaiJustificatifJours`, `DateCreation`) VALUES
  (@PARAM_LBY,  @LBY,  10, 20, 40, 3, '2023-09-01'),
  (@PARAM_ISTD, @ISTD, 15, 30, 60, 5, '2023-09-01');

-- ===========================================================================
-- 4. ANNÉES ACADÉMIQUES
-- ===========================================================================
INSERT INTO `AnneesAcademiques` (`Id`, `TenantId`, `Libelle`, `DateDebut`, `DateFin`, `EstActive`, `Statut`, `DateCreation`) VALUES
  (@AA_LBY_2324,  @LBY,  '2023-2024', '2023-09-04', '2024-06-28', 0, 'cloturee', '2023-08-01'),
  (@AA_LBY_2425,  @LBY,  '2024-2025', '2024-09-02', '2025-06-27', 1, 'active',   '2024-08-01'),
  (@AA_ISTD_2324, @ISTD, '2023-2024', '2023-10-02', '2024-07-15', 0, 'cloturee', '2023-09-01'),
  (@AA_ISTD_2425, @ISTD, '2024-2025', '2024-10-07', '2025-07-14', 1, 'active',   '2024-09-01');

-- ===========================================================================
-- 5. PÉRIODES
-- ===========================================================================
INSERT INTO `Periodes` (`Id`, `AnneeAcademiqueId`, `TenantId`, `Libelle`, `Type`, `Numero`, `DateDebut`, `DateFin`, `EstActive`, `DateCreation`) VALUES
  (@P_LBY_T1,  @AA_LBY_2425,  @LBY,  'Trimestre 1', 'trimestre', 1, '2024-09-02', '2024-12-13', 0, '2024-08-01'),
  (@P_LBY_T2,  @AA_LBY_2425,  @LBY,  'Trimestre 2', 'trimestre', 2, '2025-01-06', '2025-03-28', 0, '2024-08-01'),
  (@P_LBY_T3,  @AA_LBY_2425,  @LBY,  'Trimestre 3', 'trimestre', 3, '2025-04-07', '2025-06-27', 1, '2024-08-01'),
  (@P_ISTD_S1, @AA_ISTD_2425, @ISTD, 'Semestre 1',  'semestre',  1, '2024-10-07', '2025-02-14', 0, '2024-09-01'),
  (@P_ISTD_S2, @AA_ISTD_2425, @ISTD, 'Semestre 2',  'semestre',  2, '2025-02-17', '2025-07-14', 1, '2024-09-01');

-- ===========================================================================
-- 6. SALLES
-- ===========================================================================
INSERT INTO `Salles` (`Id`, `TenantId`, `CampusId`, `Nom`, `Code`, `Capacite`, `Type`, `EstDisponible`, `DateCreation`) VALUES
  (@S_LBY_A1,   @LBY,  @CAM_LBY,  'Salle A1',           'A1',   45,  'cours',       1, '2023-01-15'),
  (@S_LBY_A2,   @LBY,  @CAM_LBY,  'Salle A2',           'A2',   45,  'cours',       1, '2023-01-15'),
  (@S_LBY_INFO, @LBY,  @CAM_LBY,  'Salle Informatique', 'INFO', 30,  'laboratoire', 1, '2023-01-15'),
  (@S_ISTD_1,   @ISTD, @CAM_ISTD, 'Amphithéâtre 1',     'AMP1', 120, 'amphi',       1, '2023-01-20'),
  (@S_ISTD_2,   @ISTD, @CAM_ISTD, 'Salle TD 1',         'TD1',  40,  'cours',       1, '2023-01-20'),
  (@S_ISTD_LAB, @ISTD, @CAM_ISTD, 'Laboratoire Réseau', 'LAB1', 25,  'laboratoire', 1, '2023-01-20');

-- ===========================================================================
-- 7. STRUCTURE : Cycles → Filières → Niveaux
-- ===========================================================================
INSERT INTO `Cycles` (`Id`, `TenantId`, `Nom`, `Code`, `Duree`, `DateCreation`) VALUES
  (@CYC_SEC, @LBY,  'Second Cycle', 'SEC', 3, '2023-01-15'),
  (@CYC_LIC, @ISTD, 'Licence',      'LIC', 3, '2023-01-20'),
  (@CYC_MAS, @ISTD, 'Master',       'MAS', 2, '2023-01-20');

INSERT INTO `Filieres` (`Id`, `TenantId`, `CycleId`, `Nom`, `Code`, `DateCreation`) VALUES
  (@FIL_GENE, @LBY,  @CYC_SEC, 'Enseignement Général', 'GENE',  '2023-01-15'),
  (@FIL_INFO, @ISTD, @CYC_LIC, 'Génie Informatique',   'GINFO', '2023-01-20');

INSERT INTO `Niveaux` (`Id`, `TenantId`, `FiliereId`, `Nom`, `Code`, `Ordre`, `DateCreation`) VALUES
  (@NIV_3EME, @LBY,  @FIL_GENE, 'Troisième', '3EME', 1, '2023-01-15'),
  (@NIV_TLE,  @LBY,  @FIL_GENE, 'Terminale', 'TLE',  3, '2023-01-15'),
  (@NIV_L1,   @ISTD, @FIL_INFO, 'Licence 1', 'L1',   1, '2023-01-20'),
  (@NIV_L2,   @ISTD, @FIL_INFO, 'Licence 2', 'L2',   2, '2023-01-20');

-- ===========================================================================
-- 8. CLASSES & PROMOTIONS
-- ===========================================================================
INSERT INTO `Classes` (`Id`, `TenantId`, `NiveauId`, `AnneeAcademiqueId`, `Nom`, `Code`, `EffectifMax`, `DateCreation`) VALUES
  (@CL_3A,   @LBY, @NIV_3EME, @AA_LBY_2425, '3ème A', '3A',   50, '2024-08-15'),
  (@CL_TLS1, @LBY, @NIV_TLE,  @AA_LBY_2425, 'Tle S1', 'TLS1', 50, '2024-08-15');

INSERT INTO `Promotions` (`Id`, `TenantId`, `NiveauId`, `AnneeAcademiqueId`, `Nom`, `Code`, `EffectifMax`, `DateCreation`) VALUES
  (@PRO_L1I, @ISTD, @NIV_L1, @AA_ISTD_2425, 'L1 Informatique 2024-2025', 'L1I-2425', 60, '2024-09-15'),
  (@PRO_L2I, @ISTD, @NIV_L2, @AA_ISTD_2425, 'L2 Informatique 2024-2025', 'L2I-2425', 40, '2024-09-15');

-- ===========================================================================
-- 9. GROUPES
-- ===========================================================================
INSERT INTO `Groupes` (`Id`, `TenantId`, `ClasseId`, `PromotionId`, `Nom`, `Code`, `Type`, `EffectifMax`, `DateCreation`) VALUES
  (@GRP_3A_A,  @LBY,  @CL_3A,   NULL,      'Groupe A', 'GRA', 'td', 30, '2024-08-15'),
  (@GRP_TLS_A, @LBY,  @CL_TLS1, NULL,      'Groupe A', 'GRA', 'td', 30, '2024-08-15'),
  (@GRP_L1_A,  @ISTD, NULL,     @PRO_L1I,  'Groupe A', 'GRA', 'td', 30, '2024-09-15'),
  (@GRP_L1_B,  @ISTD, NULL,     @PRO_L1I,  'Groupe B', 'GRB', 'td', 30, '2024-09-15'),
  (@GRP_L2_A,  @ISTD, NULL,     @PRO_L2I,  'Groupe A', 'GRA', 'td', 25, '2024-09-15');

-- ===========================================================================
-- 10. UNITÉS D'ENSEIGNEMENT (ISTD — LMD)
-- ===========================================================================
INSERT INTO `UniteEnseignements` (`Id`, `TenantId`, `NiveauId`, `PeriodeType`, `Code`, `Intitule`, `Credits`, `Coefficient`, `Obligatoire`, `DateCreation`) VALUES
  (@UE_INFO1, @ISTD, @NIV_L1, 'semestre', 'INFO101', 'Algorithmique et Structures de Données', 6, 3, 1, '2023-01-20'),
  (@UE_INFO2, @ISTD, @NIV_L1, 'semestre', 'INFO102', 'Bases de Données',                       4, 2, 1, '2023-01-20'),
  (@UE_INFO3, @ISTD, @NIV_L2, 'semestre', 'INFO201', 'Développement Web Avancé',               5, 3, 1, '2023-01-20'),
  (@UE_INFO4, @ISTD, @NIV_L2, 'semestre', 'INFO202', 'Réseaux et Systèmes',                    5, 3, 1, '2023-01-20');

-- ===========================================================================
-- 11. MATIÈRES
-- ===========================================================================
INSERT INTO `Matieres` (`Id`, `TenantId`, `NiveauId`, `UeId`, `Nom`, `Code`, `Coefficient`, `VolumeHoraire`, `Type`, `DateCreation`) VALUES
  (@MAT_MATH, @LBY,  @NIV_3EME, NULL,      'Mathématiques',              'MATH', 4, 4, 'obligatoire', '2023-01-15'),
  (@MAT_FRAN, @LBY,  @NIV_3EME, NULL,      'Français',                   'FRAN', 3, 4, 'obligatoire', '2023-01-15'),
  (@MAT_ANGL, @LBY,  @NIV_3EME, NULL,      'Anglais',                    'ANGL', 2, 2, 'obligatoire', '2023-01-15'),
  (@MAT_SVT,  @LBY,  @NIV_3EME, NULL,      'Sciences de la Vie',         'SVT',  2, 2, 'obligatoire', '2023-01-15'),
  (@MAT_PHYS, @LBY,  @NIV_TLE,  NULL,      'Physique-Chimie',            'PHYS', 4, 4, 'obligatoire', '2023-01-15'),
  (@MAT_HG,   @LBY,  @NIV_3EME, NULL,      'Histoire-Géographie',        'HG',   2, 2, 'obligatoire', '2023-01-15'),
  (@MAT_ALGO, @ISTD, @NIV_L1,   @UE_INFO1, 'Algorithmique',              'ALGO', 3, 3, 'obligatoire', '2023-01-20'),
  (@MAT_BD,   @ISTD, @NIV_L1,   @UE_INFO2, 'Bases de Données',           'BD',   2, 2, 'obligatoire', '2023-01-20'),
  (@MAT_POO,  @ISTD, @NIV_L1,   @UE_INFO1, 'Programmation Orientée Objet','POO', 3, 2, 'obligatoire', '2023-01-20'),
  (@MAT_SYS,  @ISTD, @NIV_L2,   @UE_INFO4, 'Systèmes d''Exploitation',   'SYS',  3, 2, 'obligatoire', '2023-01-20'),
  (@MAT_WEB,  @ISTD, @NIV_L2,   @UE_INFO3, 'Développement Web',          'WEB',  3, 3, 'obligatoire', '2023-01-20'),
  (@MAT_RESX, @ISTD, @NIV_L2,   @UE_INFO4, 'Réseaux Informatiques',      'RESX', 3, 2, 'obligatoire', '2023-01-20');

-- ===========================================================================
-- 12. ENSEIGNANTS
-- ===========================================================================
INSERT INTO `Enseignants` (`Id`, `TenantId`, `UserId`, `Matricule`, `Nom`, `Prenom`, `Email`, `Telephone`, `Specialite`, `Grade`, `TypeContrat`, `Actif`, `DateCreation`) VALUES
  (@ENS_MULTI, @LBY,  @USR_MULTI, 'LBY-ENS-001',  'NKODO',       'Alain',         'admin.multi@lby.cm',      '+237 677 111 001', 'Mathématiques',     'Certifié',       'permanent', 1, '2023-09-01'),
  (@ENS_JPM,   @LBY,  @USR_JPM,   'LBY-ENS-002',  'MARTIN',      'Jean-Pierre',   'j.martin@lby.cm',         '+237 677 111 002', 'Mathématiques',     'Certifié',       'permanent', 1, '2023-09-01'),
  (@ENS_MBL,   @LBY,  NULL,       'LBY-ENS-003',  'LOBE',        'Marie-Blanche', 'm.lobe@lby.cm',           '+237 677 111 003', 'Lettres Modernes',  'Certifié',       'permanent', 1, '2023-09-01'),
  (@ENS_HAD,   @LBY,  NULL,       'LBY-ENS-004',  'ATEBA DJOMO', 'Henri',         'h.ateba@lby.cm',          '+237 677 111 004', 'Sciences Physiques','Certifié',       'permanent', 1, '2023-09-01'),
  (@ENS_CNA,   @LBY,  NULL,       'LBY-ENS-005',  'NANA',        'Christelle',    'c.nana@lby.cm',           '+237 677 111 005', 'Biologie',          'Licencié',       'vacataire', 1, '2023-09-01'),
  (@ENS_PTC,   @ISTD, @USR_PTC,   'ISTD-ENS-001', 'TCHOUPO',     'Patrick',       'p.tchoupo@ist-douala.cm', '+237 699 222 001', 'Informatique',      'Maître de Conf', 'permanent', 1, '2023-10-01'),
  (@ENS_OFO,   @ISTD, NULL,       'ISTD-ENS-002', 'FOUDA',       'Olivier',       'o.fouda@ist-douala.cm',   '+237 699 222 002', 'Réseaux',           'Docteur',        'permanent', 1, '2023-10-01'),
  (@ENS_FTA,   @ISTD, NULL,       'ISTD-ENS-003', 'TAMBE',       'Fatima',        'f.tambe@ist-douala.cm',   '+237 699 222 003', 'Bases de Données',  'Docteur',        'vacataire', 1, '2023-10-01');

-- ===========================================================================
-- 13. SPÉCIALITÉS ENSEIGNANTS
-- ===========================================================================
INSERT INTO `EnseignantSpecialites` (`EnseignantId`, `MatiereId`) VALUES
  (@ENS_MULTI, @MAT_MATH), (@ENS_JPM, @MAT_MATH),
  (@ENS_MBL,   @MAT_FRAN),
  (@ENS_HAD,   @MAT_PHYS),
  (@ENS_CNA,   @MAT_SVT),
  (@ENS_PTC,   @MAT_ALGO), (@ENS_PTC, @MAT_POO), (@ENS_PTC, @MAT_BD),
  (@ENS_OFO,   @MAT_RESX), (@ENS_OFO, @MAT_SYS),
  (@ENS_FTA,   @MAT_BD),   (@ENS_FTA, @MAT_WEB);

-- ===========================================================================
-- 14. AFFECTATIONS MATIÈRES
-- ===========================================================================
INSERT INTO `AffectationsMatieres` (`Id`, `TenantId`, `EnseignantId`, `MatiereId`, `ClasseId`, `PromotionId`, `AnneeAcademiqueId`, `DateDebut`, `EstPrincipal`, `DateCreation`) VALUES
  (UUID(), @LBY,  @ENS_MULTI, @MAT_MATH, @CL_3A,   NULL,     @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (UUID(), @LBY,  @ENS_JPM,   @MAT_MATH, @CL_TLS1, NULL,     @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (UUID(), @LBY,  @ENS_MBL,   @MAT_FRAN, @CL_3A,   NULL,     @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (UUID(), @LBY,  @ENS_MBL,   @MAT_FRAN, @CL_TLS1, NULL,     @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (UUID(), @LBY,  @ENS_HAD,   @MAT_PHYS, @CL_TLS1, NULL,     @AA_LBY_2425,  '2024-09-02', 1, '2024-08-20'),
  (UUID(), @ISTD, @ENS_PTC,   @MAT_ALGO, NULL,     @PRO_L1I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (UUID(), @ISTD, @ENS_PTC,   @MAT_POO,  NULL,     @PRO_L1I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (UUID(), @ISTD, @ENS_FTA,   @MAT_BD,   NULL,     @PRO_L1I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (UUID(), @ISTD, @ENS_FTA,   @MAT_WEB,  NULL,     @PRO_L2I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (UUID(), @ISTD, @ENS_OFO,   @MAT_RESX, NULL,     @PRO_L2I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20'),
  (UUID(), @ISTD, @ENS_OFO,   @MAT_SYS,  NULL,     @PRO_L2I, @AA_ISTD_2425, '2024-10-07', 1, '2024-09-20');

-- ===========================================================================
-- 15. APPRENANTS
-- ===========================================================================
INSERT INTO `Apprenants` (`Id`, `TenantId`, `UserId`, `Matricule`, `Nom`, `Prenom`, `DateNaissance`, `LieuNaissance`, `Sexe`, `Nationalite`, `Telephone`, `Email`, `Adresse`, `DateCreation`) VALUES
  (@APP_KJ, @LBY,  @USR_KJ, 'LBY-2025-001', 'KAMGA',  'Jean',      '2008-03-12', 'Yaoundé',   'M', 'CM', '+237 677 001 001', 'kamga.jean@eleve.lby.cm',   'Bastos, Yaoundé',        '2024-08-25'),
  (@APP_NM, @LBY,  NULL,    'LBY-2025-002', 'NGUEMO', 'Marie',     '2008-07-24', 'Bafoussam', 'F', 'CM', '+237 677 001 002', 'nguemo.m@eleve.lby.cm',     'Mvan, Yaoundé',          '2024-08-25'),
  (@APP_AT, @LBY,  NULL,    'LBY-2025-003', 'ATEBA',  'Thomas',    '2009-01-05', 'Mbalmayo',  'M', 'CM', '+237 677 001 003', 'ateba.t@eleve.lby.cm',      'Nkomo, Yaoundé',         '2024-08-25'),
  (@APP_BK, @LBY,  NULL,    'LBY-2025-004', 'BIYONG', 'Karine',    '2008-11-18', 'Ébolowa',   'F', 'CM', '+237 677 001 004', 'biyong.k@eleve.lby.cm',     'Biyem Assi, Yaoundé',    '2024-08-25'),
  (@APP_FT, @LBY,  NULL,    'LBY-2025-005', 'FOUDA',  'Thierry',   '2008-05-30', 'Yaoundé',   'M', 'CM', '+237 677 001 005', 'fouda.t@eleve.lby.cm',      'Essos, Yaoundé',         '2024-08-25'),
  (@APP_EO, @LBY,  NULL,    'LBY-2025-006', 'EBA',    'Olivier',   '2006-08-15', 'Kribi',     'M', 'CM', '+237 677 001 006', 'eba.o@eleve.lby.cm',        'Omnisport, Yaoundé',     '2024-08-25'),
  (@APP_PN, @LBY,  NULL,    'LBY-2025-007', 'PENDA',  'Nadège',    '2006-12-02', 'Yaoundé',   'F', 'CM', '+237 677 001 007', 'penda.n@eleve.lby.cm',      'Mvog-Mbi, Yaoundé',      '2024-08-25'),
  (@APP_SM, @LBY,  NULL,    'LBY-2025-008', 'SAMBA',  'Martin',    '2007-04-19', 'Garoua',    'M', 'CM', '+237 677 001 008', 'samba.m@eleve.lby.cm',      'Ekoudou, Yaoundé',       '2024-08-25'),
  (@APP_ZC, @LBY,  NULL,    'LBY-2025-009', 'ZANG',   'Christine', '2006-09-07', 'Bertoua',   'F', 'CM', '+237 677 001 009', 'zang.c@eleve.lby.cm',       'Mfandena, Yaoundé',      '2024-08-25'),
  (@APP_AE, @LBY,  NULL,    'LBY-2025-010', 'AWONO',  'Eric',      '2007-02-28', 'Bafia',     'M', 'CM', '+237 677 001 010', 'awono.e@eleve.lby.cm',      'Tsinga, Yaoundé',        '2024-08-25'),
  (@APP_DB, @ISTD, NULL,    'ISTD-2025-001','DJOUM',   'Bertrand',  '2004-06-14', 'Douala',    'M', 'CM', '+237 699 002 001', 'djoum.b@etud.ist-douala.cm','Akwa, Douala',           '2024-09-20'),
  (@APP_EF, @ISTD, NULL,    'ISTD-2025-002','EKAMBI',  'Fanta',     '2005-03-21', 'Limbé',     'F', 'CM', '+237 699 002 002', 'ekambi.f@etud.ist-douala.cm','Bonanjo, Douala',       '2024-09-20'),
  (@APP_LB, @ISTD, NULL,    'ISTD-2025-003','LEKANE',  'Boris',     '2004-10-09', 'Bafoussam', 'M', 'CM', '+237 699 002 003', 'lekane.b@etud.ist-douala.cm','Deido, Douala',         '2024-09-20'),
  (@APP_MO, @ISTD, NULL,    'ISTD-2025-004','MBARGA',  'Olivia',    '2005-07-17', 'Yaoundé',   'F', 'CM', '+237 699 002 004', 'mbarga.o@etud.ist-douala.cm','Bali, Douala',          '2024-09-20'),
  (@APP_NW, @ISTD, NULL,    'ISTD-2025-005','NJOYA',   'William',   '2004-12-03', 'Foumban',   'M', 'CM', '+237 699 002 005', 'njoya.w@etud.ist-douala.cm', 'Ndokoti, Douala',       '2024-09-20'),
  (@APP_TF, @ISTD, NULL,    'ISTD-2025-006','TONYE',   'Florian',   '2003-08-22', 'Édéa',      'M', 'CM', '+237 699 002 006', 'tonye.f@etud.ist-douala.cm', 'Makepe, Douala',        '2024-09-20'),
  (@APP_CB, @ISTD, NULL,    'ISTD-2025-007','BELLA',   'Christelle','2003-05-11', 'Douala',    'F', 'CM', '+237 699 002 007', 'bella.c@etud.ist-douala.cm', 'Bonapriso, Douala',     '2024-09-20');

-- ===========================================================================
-- 16. TUTEURS
-- ===========================================================================
INSERT INTO `Tuteurs` (`Id`, `TenantId`, `ApprenantId`, `UserId`, `Nom`, `Prenom`, `LienParente`, `Telephone`, `Email`, `EstContactUrgence`, `DateCreation`) VALUES
  (@TUT_KE, @LBY,  @APP_KJ, @USR_KE, 'KAMGA', 'Etienne', 'pere', '+237 677 999 001', 'kamga.etienne@parent.lby.cm', 1, '2024-08-25'),
  (@TUT_NP, @ISTD, @APP_DB, NULL,    'DJOUM', 'Pierre',  'pere', '+237 699 999 002', 'djoum.pierre@gmail.com',      1, '2024-09-20');

-- ===========================================================================
-- 17. INSCRIPTIONS
-- ===========================================================================
INSERT INTO `Inscriptions` (`Id`, `TenantId`, `ApprenantId`, `AnneeAcademiqueId`, `ClasseId`, `PromotionId`, `Statut`, `TypeInscription`, `MontantScolarite`, `DateDemande`, `DateValidation`, `DateCreation`) VALUES
  (@INS_KJ_3A, @LBY,  @APP_KJ, @AA_LBY_2425,  @CL_3A,   NULL,     'validee',   'premiere',      85000, '2024-08-26', '2024-09-01', '2024-08-26'),
  (@INS_NM_3A, @LBY,  @APP_NM, @AA_LBY_2425,  @CL_3A,   NULL,     'validee',   'premiere',      85000, '2024-08-27', '2024-09-01', '2024-08-27'),
  (@INS_AT_3A, @LBY,  @APP_AT, @AA_LBY_2425,  @CL_3A,   NULL,     'validee',   'premiere',      85000, '2024-08-28', '2024-09-01', '2024-08-28'),
  (@INS_BK_3A, @LBY,  @APP_BK, @AA_LBY_2425,  @CL_3A,   NULL,     'rejetee',   'premiere',      85000, '2024-08-29', NULL,         '2024-08-29'),
  (@INS_FT_3A, @LBY,  @APP_FT, @AA_LBY_2425,  @CL_3A,   NULL,     'brouillon', 'premiere',      85000, '2024-08-30', NULL,         '2024-08-30'),
  (@INS_EO_TL, @LBY,  @APP_EO, @AA_LBY_2425,  @CL_TLS1, NULL,     'validee',   'reinscription', 85000, '2024-08-20', '2024-08-25', '2024-08-20'),
  (@INS_PN_TL, @LBY,  @APP_PN, @AA_LBY_2425,  @CL_TLS1, NULL,     'validee',   'reinscription', 85000, '2024-08-21', '2024-08-25', '2024-08-21'),
  (@INS_SM_TL, @LBY,  @APP_SM, @AA_LBY_2425,  @CL_TLS1, NULL,     'validee',   'reinscription', 85000, '2024-08-22', '2024-08-25', '2024-08-22'),
  (@INS_ZC_TL, @LBY,  @APP_ZC, @AA_LBY_2425,  @CL_TLS1, NULL,     'annulee',   'reinscription', 85000, '2024-08-23', NULL,         '2024-08-23'),
  (@INS_AE_TL, @LBY,  @APP_AE, @AA_LBY_2425,  @CL_TLS1, NULL,     'validee',   'reinscription', 85000, '2024-08-24', '2024-08-28', '2024-08-24'),
  (@INS_DB_L1, @ISTD, @APP_DB, @AA_ISTD_2425, NULL,     @PRO_L1I, 'validee',   'premiere',     250000, '2024-09-21', '2024-09-28', '2024-09-21'),
  (@INS_EF_L1, @ISTD, @APP_EF, @AA_ISTD_2425, NULL,     @PRO_L1I, 'validee',   'premiere',     250000, '2024-09-22', '2024-09-28', '2024-09-22'),
  (@INS_LB_L1, @ISTD, @APP_LB, @AA_ISTD_2425, NULL,     @PRO_L1I, 'validee',   'premiere',     250000, '2024-09-23', '2024-09-28', '2024-09-23'),
  (@INS_MO_L1, @ISTD, @APP_MO, @AA_ISTD_2425, NULL,     @PRO_L1I, 'en_attente','premiere',     250000, '2024-09-24', NULL,         '2024-09-24'),
  (@INS_TF_L2, @ISTD, @APP_TF, @AA_ISTD_2425, NULL,     @PRO_L2I, 'validee',   'reinscription',250000, '2024-09-15', '2024-09-20', '2024-09-15'),
  (@INS_CB_L2, @ISTD, @APP_CB, @AA_ISTD_2425, NULL,     @PRO_L2I, 'validee',   'reinscription',250000, '2024-09-16', '2024-09-20', '2024-09-16');

-- ===========================================================================
-- 18. HISTORIQUE INSCRIPTIONS
-- ===========================================================================
INSERT INTO `InscriptionHistoriques` (`Id`, `InscriptionId`, `AncienStatut`, `NouveauStatut`, `Motif`, `ChangePar`, `DateChangement`) VALUES
  (UUID(), @INS_BK_3A, 'soumise',  'rejetee', 'Documents incomplets — acte de naissance manquant', @USR_MULTI, '2024-09-02'),
  (UUID(), @INS_ZC_TL, 'validee',  'annulee', 'Déménagement de la famille hors de Yaoundé',        @USR_MULTI, '2024-09-10'),
  (UUID(), @INS_KJ_3A, 'brouillon','soumise', NULL,                                                @USR_KJ,    '2024-08-26'),
  (UUID(), @INS_KJ_3A, 'soumise',  'validee', NULL,                                                @USR_MULTI, '2024-09-01');

-- ===========================================================================
-- 19. LISTE D'ATTENTE
-- ===========================================================================
INSERT INTO `ListesAttente` (`Id`, `TenantId`, `ApprenantId`, `PromotionId`, `AnneeAcademiqueId`, `Position`, `Statut`, `DateInscription`, `DateCreation`) VALUES
  (UUID(), @ISTD, @APP_NW, @PRO_L1I, @AA_ISTD_2425, 1, 'en_attente', '2024-09-25', '2024-09-25');

-- ===========================================================================
-- 20. INSCRIPTIONS UE (LMD)
-- ===========================================================================
INSERT INTO `InscriptionUEs` (`Id`, `InscriptionId`, `UeId`, `Statut`, `DateInscription`) VALUES
  (UUID(), @INS_DB_L1, @UE_INFO1, 'active', '2024-10-07'),
  (UUID(), @INS_DB_L1, @UE_INFO2, 'active', '2024-10-07'),
  (UUID(), @INS_EF_L1, @UE_INFO1, 'active', '2024-10-07'),
  (UUID(), @INS_EF_L1, @UE_INFO2, 'active', '2024-10-07'),
  (UUID(), @INS_LB_L1, @UE_INFO1, 'active', '2024-10-07'),
  (UUID(), @INS_LB_L1, @UE_INFO2, 'active', '2024-10-07'),
  (UUID(), @INS_TF_L2, @UE_INFO3, 'active', '2024-10-07'),
  (UUID(), @INS_TF_L2, @UE_INFO4, 'active', '2024-10-07'),
  (UUID(), @INS_CB_L2, @UE_INFO3, 'active', '2024-10-07'),
  (UUID(), @INS_CB_L2, @UE_INFO4, 'active', '2024-10-07');

-- ===========================================================================
-- 21. INSCRIPTIONS GROUPES
-- ===========================================================================
INSERT INTO `InscriptionGroupes` (`Id`, `InscriptionId`, `GroupeId`, `DateAffectation`) VALUES
  (UUID(), @INS_KJ_3A, @GRP_3A_A,  '2024-09-02'),
  (UUID(), @INS_NM_3A, @GRP_3A_A,  '2024-09-02'),
  (UUID(), @INS_AT_3A, @GRP_3A_A,  '2024-09-02'),
  (UUID(), @INS_EO_TL, @GRP_TLS_A, '2024-09-02'),
  (UUID(), @INS_PN_TL, @GRP_TLS_A, '2024-09-02'),
  (UUID(), @INS_SM_TL, @GRP_TLS_A, '2024-09-02'),
  (UUID(), @INS_AE_TL, @GRP_TLS_A, '2024-09-02'),
  (UUID(), @INS_DB_L1, @GRP_L1_A,  '2024-10-07'),
  (UUID(), @INS_EF_L1, @GRP_L1_A,  '2024-10-07'),
  (UUID(), @INS_LB_L1, @GRP_L1_B,  '2024-10-07'),
  (UUID(), @INS_TF_L2, @GRP_L2_A,  '2024-10-07'),
  (UUID(), @INS_CB_L2, @GRP_L2_A,  '2024-10-07');

-- ===========================================================================
-- 22. CRÉNEAUX HORAIRES
-- ===========================================================================
INSERT INTO `CreneauxHoraires` (`Id`, `TenantId`, `JourSemaine`, `HeureDebut`, `HeureFin`, `Libelle`, `DateCreation`) VALUES
  (@CR_LBY_1,  @LBY,  1, '07:30', '09:30', 'Lundi    Créneau 1', '2023-09-01'),
  (@CR_LBY_2,  @LBY,  1, '09:45', '11:45', 'Lundi    Créneau 2', '2023-09-01'),
  (@CR_LBY_3,  @LBY,  2, '07:30', '09:30', 'Mardi    Créneau 1', '2023-09-01'),
  (@CR_LBY_4,  @LBY,  2, '09:45', '11:45', 'Mardi    Créneau 2', '2023-09-01'),
  (@CR_LBY_5,  @LBY,  3, '07:30', '09:30', 'Mercredi Créneau 1', '2023-09-01'),
  (@CR_LBY_6,  @LBY,  4, '07:30', '09:30', 'Jeudi    Créneau 1', '2023-09-01'),
  (@CR_LBY_7,  @LBY,  5, '07:30', '09:30', 'Vendredi Créneau 1', '2023-09-01'),
  (@CR_ISTD_1, @ISTD, 1, '08:00', '10:00', 'Lundi    CM 1',      '2023-10-01'),
  (@CR_ISTD_2, @ISTD, 1, '10:15', '12:15', 'Lundi    CM 2',      '2023-10-01'),
  (@CR_ISTD_3, @ISTD, 2, '08:00', '10:00', 'Mardi    CM 1',      '2023-10-01'),
  (@CR_ISTD_4, @ISTD, 2, '10:15', '12:15', 'Mardi    CM 2',      '2023-10-01'),
  (@CR_ISTD_5, @ISTD, 3, '14:00', '16:00', 'Mercredi TD',        '2023-10-01');

-- ===========================================================================
-- 23. COURS PLANIFIÉS
-- ===========================================================================
INSERT INTO `CoursPlanifies` (`Id`, `TenantId`, `MatiereId`, `EnseignantId`, `ClasseId`, `PromotionId`, `AnneeAcademiqueId`, `CreneauId`, `SalleId`, `JourSemaine`, `Statut`, `Frequence`, `DateDebut`, `DateFin`, `DateCreation`) VALUES
  (@CP_3A_MATH, @LBY,  @MAT_MATH, @ENS_MULTI, @CL_3A,   NULL,     @AA_LBY_2425,  @CR_LBY_1,  @S_LBY_A1, 1, 'publie', 'hebdomadaire', '2024-09-02', '2025-06-27', '2024-08-20'),
  (@CP_3A_FRAN, @LBY,  @MAT_FRAN, @ENS_MBL,   @CL_3A,   NULL,     @AA_LBY_2425,  @CR_LBY_3,  @S_LBY_A2, 2, 'publie', 'hebdomadaire', '2024-09-02', '2025-06-27', '2024-08-20'),
  (@CP_TL_PHYS, @LBY,  @MAT_PHYS, @ENS_HAD,   @CL_TLS1, NULL,     @AA_LBY_2425,  @CR_LBY_2,  @S_LBY_A1, 1, 'publie', 'hebdomadaire', '2024-09-02', '2025-06-27', '2024-08-20'),
  (@CP_TL_MATH, @LBY,  @MAT_MATH, @ENS_JPM,   @CL_TLS1, NULL,     @AA_LBY_2425,  @CR_LBY_6,  @S_LBY_A2, 4, 'publie', 'hebdomadaire', '2024-09-02', '2025-06-27', '2024-08-20'),
  (@CP_L1_ALGO, @ISTD, @MAT_ALGO, @ENS_PTC,   NULL,     @PRO_L1I, @AA_ISTD_2425, @CR_ISTD_1, @S_ISTD_1, 1, 'publie', 'hebdomadaire', '2024-10-07', '2025-07-14', '2024-09-20'),
  (@CP_L1_BD,   @ISTD, @MAT_BD,   @ENS_FTA,   NULL,     @PRO_L1I, @AA_ISTD_2425, @CR_ISTD_3, @S_ISTD_2, 2, 'publie', 'hebdomadaire', '2024-10-07', '2025-07-14', '2024-09-20'),
  (@CP_L2_WEB,  @ISTD, @MAT_WEB,  @ENS_FTA,   NULL,     @PRO_L2I, @AA_ISTD_2425, @CR_ISTD_2, @S_ISTD_2, 1, 'publie', 'hebdomadaire', '2024-10-07', '2025-07-14', '2024-09-20');

-- ===========================================================================
-- 24. SÉANCES
-- ===========================================================================
INSERT INTO `Seances` (`Id`, `TenantId`, `CoursPlanifieId`, `EnseignantId`, `EnseignantRemplacantId`, `SalleId`, `DateSeance`, `HeureDebut`, `HeureFin`, `Statut`, `Contenu`, `Objectifs`, `Ressources`, `DateCreation`) VALUES
  (@SEA_001, @LBY,  @CP_3A_MATH, @ENS_MULTI, NULL,        @S_LBY_A1, '2024-09-09', '07:30', '09:30', 'realisee',  'Introduction aux équations du 2nd degré. Résolution par factorisation.', 'Maîtriser la méthode de factorisation',  'Manuel Maths 3ème, p.45-52', '2024-09-09'),
  (@SEA_002, @LBY,  @CP_3A_FRAN, @ENS_MBL,   NULL,        @S_LBY_A2, '2024-09-10', '07:30', '09:30', 'realisee',  'La narration : structure du récit. Analyse d''un extrait de Mongo Beti.','Identifier la structure narrative',       'Cahier de textes Français',  '2024-09-10'),
  (@SEA_003, @LBY,  @CP_TL_PHYS, @ENS_HAD,   NULL,        @S_LBY_A1, '2024-09-16', '09:45', '11:45', 'annulee',   NULL, NULL, NULL, '2024-09-16'),
  (@SEA_004, @LBY,  @CP_TL_MATH, @ENS_JPM,   NULL,        @S_LBY_A2, '2024-09-19', '07:30', '09:30', 'reportee',  NULL, NULL, NULL, '2024-09-19'),
  (@SEA_005, @LBY,  @CP_3A_MATH, @ENS_MULTI, NULL,        @S_LBY_A1, '2025-06-09', '07:30', '09:30', 'planifiee', NULL, NULL, NULL, '2024-08-20'),
  (@SEA_006, @LBY,  @CP_TL_PHYS, @ENS_HAD,   @ENS_MULTI,  @S_LBY_A1, '2024-09-23', '09:45', '11:45', 'realisee',  'Optique géométrique — lois de Snell-Descartes.', 'Comprendre la réfraction', NULL, '2024-09-23'),
  (@SEA_007, @ISTD, @CP_L1_ALGO, @ENS_PTC,   NULL,        @S_ISTD_1, '2024-10-14', '08:00', '10:00', 'realisee',  'Tri par insertion, tri rapide — complexité algorithmique.', 'Comprendre et implémenter le tri rapide', 'Knuth, TAOCP Vol.3', '2024-10-14'),
  (@SEA_008, @ISTD, @CP_L2_WEB,  @ENS_FTA,   NULL,        @S_ISTD_2, '2025-06-16', '10:15', '12:15', 'planifiee', NULL, NULL, NULL, '2024-09-20');

-- ===========================================================================
-- 25. ABSENCES ENSEIGNANTS
-- ===========================================================================
INSERT INTO `AbsencesEnseignants` (`Id`, `TenantId`, `EnseignantId`, `SeanceId`, `DateAbsence`, `Motif`, `Justifiee`, `EnseignantRemplacantId`, `DateCreation`) VALUES
  (@ABS_ENS_1, @LBY, @ENS_HAD, @SEA_003, '2024-09-16', 'Maladie — certificat médical fourni', 1, @ENS_MULTI, '2024-09-16');

-- ===========================================================================
-- 26. ÉVALUATIONS
-- ===========================================================================
INSERT INTO `Evaluations` (`Id`, `TenantId`, `MatiereId`, `ClasseId`, `PromotionId`, `AnneeAcademiqueId`, `PeriodeId`, `EnseignantId`, `Titre`, `Type`, `NoteMax`, `Coefficient`, `DateEvaluation`, `Statut`, `DateCreation`) VALUES
  (@EV_3A_M1, @LBY,  @MAT_MATH, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MULTI, 'Devoir Maison 1 — Équations',        'devoir', 20, 1, '2024-10-04', 'publiee',   '2024-10-01'),
  (@EV_3A_M2, @LBY,  @MAT_MATH, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MULTI, 'Devoir Surveillé 1 — Algèbre',       'devoir', 20, 2, '2024-11-08', 'validee',   '2024-11-01'),
  (@EV_3A_F1, @LBY,  @MAT_FRAN, @CL_3A,   NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_MBL,   'Composition Française T1',           'examen', 20, 3, '2024-11-15', 'soumise',   '2024-11-10'),
  (@EV_TL_P1, @LBY,  @MAT_PHYS, @CL_TLS1, NULL,     @AA_LBY_2425,  @P_LBY_T1,  @ENS_HAD,   'Examen Physique T1',                 'examen', 20, 3, '2024-11-20', 'publiee',   '2024-11-15'),
  (@EV_L1_A1, @ISTD, @MAT_ALGO, NULL,     @PRO_L1I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_PTC,   'Contrôle Continu 1 — Algorithmique', 'cc',     20, 1, '2024-11-04', 'publiee',   '2024-10-28'),
  (@EV_L1_B1, @ISTD, @MAT_BD,   NULL,     @PRO_L1I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_FTA,   'TP Noté 1 — SQL',                    'tp',     20, 1, '2024-11-11', 'brouillon', '2024-11-05'),
  (@EV_L2_W1, @ISTD, @MAT_WEB,  NULL,     @PRO_L2I, @AA_ISTD_2425, @P_ISTD_S1, @ENS_FTA,   'Examen Web S1',                      'examen', 20, 3, '2025-01-20', 'publiee',   '2025-01-15');

-- ===========================================================================
-- 27. NOTES
-- ===========================================================================
INSERT INTO `Notes` (`Id`, `TenantId`, `EvaluationId`, `ApprenantId`, `Note`, `Appreciation`, `Statut`, `SaisieParId`, `DateSaisie`, `DateCreation`) VALUES
  (UUID(), @LBY,  @EV_3A_M1, @APP_KJ, 16.5, 'Très bien',   'publiee', @ENS_MULTI, '2024-10-06', '2024-10-06'),
  (UUID(), @LBY,  @EV_3A_M1, @APP_NM, 13.0, 'Bien',        'publiee', @ENS_MULTI, '2024-10-06', '2024-10-06'),
  (UUID(), @LBY,  @EV_3A_M1, @APP_AT, 11.5, 'Assez bien',  'publiee', @ENS_MULTI, '2024-10-06', '2024-10-06'),
  (UUID(), @LBY,  @EV_3A_M2, @APP_KJ, 17.0, 'Excellent',   'validee', @ENS_MULTI, '2024-11-10', '2024-11-10'),
  (UUID(), @LBY,  @EV_3A_M2, @APP_NM, 12.5, 'Bien',        'validee', @ENS_MULTI, '2024-11-10', '2024-11-10'),
  (UUID(), @LBY,  @EV_3A_M2, @APP_AT, 10.0, 'Passable',    'validee', @ENS_MULTI, '2024-11-10', '2024-11-10'),
  (UUID(), @LBY,  @EV_TL_P1, @APP_EO, 14.0, 'Bien',        'publiee', @ENS_HAD,   '2024-11-22', '2024-11-22'),
  (UUID(), @LBY,  @EV_TL_P1, @APP_PN, 15.5, 'Très bien',   'publiee', @ENS_HAD,   '2024-11-22', '2024-11-22'),
  (UUID(), @LBY,  @EV_TL_P1, @APP_SM,  9.5, 'Insuffisant', 'publiee', @ENS_HAD,   '2024-11-22', '2024-11-22'),
  (UUID(), @LBY,  @EV_TL_P1, @APP_AE, 11.0, 'Passable',    'publiee', @ENS_HAD,   '2024-11-22', '2024-11-22'),
  (UUID(), @ISTD, @EV_L1_A1, @APP_DB, 18.0, 'Excellent',   'publiee', @ENS_PTC,   '2024-11-06', '2024-11-06'),
  (UUID(), @ISTD, @EV_L1_A1, @APP_EF, 14.5, 'Bien',        'publiee', @ENS_PTC,   '2024-11-06', '2024-11-06'),
  (UUID(), @ISTD, @EV_L1_A1, @APP_LB, 12.0, 'Assez bien',  'publiee', @ENS_PTC,   '2024-11-06', '2024-11-06'),
  (UUID(), @ISTD, @EV_L2_W1, @APP_TF, 15.0, 'Bien',        'publiee', @ENS_FTA,   '2025-01-22', '2025-01-22'),
  (UUID(), @ISTD, @EV_L2_W1, @APP_CB, 16.5, 'Très bien',   'publiee', @ENS_FTA,   '2025-01-22', '2025-01-22');

-- ===========================================================================
-- 28. MOYENNES MATIÈRES
-- ===========================================================================
INSERT INTO `MoyennesMatieres` (`Id`, `TenantId`, `ApprenantId`, `MatiereId`, `PeriodeId`, `AnneeAcademiqueId`, `Moyenne`, `NbEvaluations`, `Rang`, `DateCalcul`) VALUES
  (UUID(), @LBY, @APP_KJ, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 16.75, 2, 1, '2024-12-10'),
  (UUID(), @LBY, @APP_NM, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 12.75, 2, 2, '2024-12-10'),
  (UUID(), @LBY, @APP_AT, @MAT_MATH, @P_LBY_T1, @AA_LBY_2425, 10.75, 2, 3, '2024-12-10'),
  (UUID(), @LBY, @APP_EO, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 14.00, 1, 2, '2024-12-10'),
  (UUID(), @LBY, @APP_PN, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 15.50, 1, 1, '2024-12-10'),
  (UUID(), @LBY, @APP_SM, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425,  9.50, 1, 4, '2024-12-10'),
  (UUID(), @LBY, @APP_AE, @MAT_PHYS, @P_LBY_T1, @AA_LBY_2425, 11.00, 1, 3, '2024-12-10');

-- ===========================================================================
-- 29. MOYENNES GÉNÉRALES
-- ===========================================================================
INSERT INTO `MoyennesGenerales` (`Id`, `TenantId`, `ApprenantId`, `PeriodeId`, `AnneeAcademiqueId`, `Moyenne`, `Rang`, `Mention`, `DateCalcul`) VALUES
  (UUID(), @LBY, @APP_KJ, @P_LBY_T1, @AA_LBY_2425, 15.20, 1, 'Bien',        '2024-12-10'),
  (UUID(), @LBY, @APP_NM, @P_LBY_T1, @AA_LBY_2425, 12.10, 2, 'Assez Bien',  '2024-12-10'),
  (UUID(), @LBY, @APP_AT, @P_LBY_T1, @AA_LBY_2425, 10.30, 3, 'Passable',    '2024-12-10'),
  (UUID(), @LBY, @APP_EO, @P_LBY_T1, @AA_LBY_2425, 13.80, 1, 'Assez Bien',  '2024-12-10'),
  (UUID(), @LBY, @APP_PN, @P_LBY_T1, @AA_LBY_2425, 14.60, 1, 'Bien',        '2024-12-10'),
  (UUID(), @LBY, @APP_SM, @P_LBY_T1, @AA_LBY_2425,  9.20, 3, 'Insuffisant', '2024-12-10'),
  (UUID(), @LBY, @APP_AE, @P_LBY_T1, @AA_LBY_2425, 11.40, 2, 'Passable',    '2024-12-10');

-- ===========================================================================
-- 30. PRÉSENCES / ABSENCES / JUSTIFICATIFS
-- ===========================================================================
INSERT INTO `Presences` (`Id`, `TenantId`, `SeanceId`, `ApprenantId`, `Statut`, `HeureArrivee`, `DateCreation`) VALUES
  (UUID(), @LBY,  @SEA_001, @APP_KJ, 'present', '07:30', '2024-09-09'),
  (UUID(), @LBY,  @SEA_001, @APP_NM, 'present', '07:32', '2024-09-09'),
  (UUID(), @LBY,  @SEA_001, @APP_AT, 'retard',  '07:50', '2024-09-09'),
  (UUID(), @LBY,  @SEA_002, @APP_KJ, 'present', '07:30', '2024-09-10'),
  (UUID(), @LBY,  @SEA_002, @APP_NM, 'absent',  NULL,    '2024-09-10'),
  (UUID(), @LBY,  @SEA_002, @APP_AT, 'present', '07:31', '2024-09-10'),
  (UUID(), @ISTD, @SEA_007, @APP_DB, 'present', '08:00', '2024-10-14'),
  (UUID(), @ISTD, @SEA_007, @APP_EF, 'present', '08:02', '2024-10-14'),
  (UUID(), @ISTD, @SEA_007, @APP_LB, 'absent',  NULL,    '2024-10-14');

SET @ABS_NM_S2  = UUID();
SET @ABS_LB_S7  = UUID();

INSERT INTO `Absences` (`Id`, `TenantId`, `ApprenantId`, `SeanceId`, `DateAbsence`, `NbHeures`, `Statut`, `DateCreation`) VALUES
  (@ABS_NM_S2, @LBY,  @APP_NM, @SEA_002, '2024-09-10', 2, 'en_attente',   '2024-09-10'),
  (@ABS_LB_S7, @ISTD, @APP_LB, @SEA_007, '2024-10-14', 2, 'non_justifiee','2024-10-14');

INSERT INTO `Justificatifs` (`Id`, `TenantId`, `AbsenceId`, `ApprenantId`, `Motif`, `TypePiece`, `Statut`, `DateDepot`, `DateTraitement`, `TraiteParId`, `CommentaireRejet`, `DateCreation`) VALUES
  (UUID(), @LBY,  @ABS_NM_S2, @APP_NM, 'Maladie — fièvre',  'certificat_medical', 'accepte', '2024-09-12', '2024-09-13', @USR_SCOL, NULL,                                                   '2024-09-12'),
  (UUID(), @ISTD, @ABS_LB_S7, @APP_LB, 'Panne de voiture',  'autre',              'rejete',  '2024-10-15', '2024-10-16', @USR_PTC,  'Motif insuffisant — prévoir un document officiel', '2024-10-15');

-- ===========================================================================
-- 31. SESSIONS D'EXAMEN
-- ===========================================================================
INSERT INTO `SessionsExamen` (`Id`, `TenantId`, `AnneeAcademiqueId`, `PeriodeId`, `Libelle`, `Type`, `DateDebut`, `DateFin`, `Statut`, `DateCreation`) VALUES
  (@SES_LBY,  @LBY,  @AA_LBY_2425,  @P_LBY_T1,  'Session Examens T1 2024-2025',        'partiel', '2024-11-25', '2024-11-29', 'planifiee', '2024-11-01'),
  (@SES_ISTD, @ISTD, @AA_ISTD_2425, @P_ISTD_S1, 'Session Examens Semestre 1 2024-2025', 'session', '2025-01-20', '2025-02-07', 'en_cours',  '2025-01-05');

-- ===========================================================================
-- 32. ÉPREUVES
-- ===========================================================================
INSERT INTO `Epreuves` (`Id`, `TenantId`, `SessionExamenId`, `MatiereId`, `EnseignantId`, `SalleId`, `DateEpreuve`, `HeureDebut`, `HeureFin`, `Duree`, `NoteMax`, `DateCreation`) VALUES
  (@EPR_LBY_M,  @LBY,  @SES_LBY,  @MAT_MATH, @ENS_MULTI, @S_LBY_A1,   '2024-11-25', '07:30', '10:30', 180, 20, '2024-11-10'),
  (@EPR_LBY_F,  @LBY,  @SES_LBY,  @MAT_FRAN, @ENS_MBL,   @S_LBY_A2,   '2024-11-26', '07:30', '10:30', 180, 20, '2024-11-10'),
  (@EPR_ISTD_A, @ISTD, @SES_ISTD, @MAT_ALGO, @ENS_PTC,   @S_ISTD_1,   '2025-01-20', '08:00', '11:00', 180, 20, '2025-01-08');

-- ===========================================================================
-- 33. CONVOCATIONS
-- ===========================================================================
INSERT INTO `Convocations` (`Id`, `TenantId`, `SessionExamenId`, `EpreuveId`, `ApprenantId`, `Eligible`, `MotifIneligibilite`, `NumeroTable`, `DateCreation`) VALUES
  (UUID(), @LBY,  @SES_LBY,  @EPR_LBY_M,  @APP_KJ, 1, NULL,                                         101, '2024-11-18'),
  (UUID(), @LBY,  @SES_LBY,  @EPR_LBY_M,  @APP_NM, 1, NULL,                                         102, '2024-11-18'),
  (UUID(), @LBY,  @SES_LBY,  @EPR_LBY_M,  @APP_AT, 0, 'Scolarité non soldée — 35 000 XAF restant',  103, '2024-11-18'),
  (UUID(), @LBY,  @SES_LBY,  @EPR_LBY_F,  @APP_KJ, 1, NULL,                                         201, '2024-11-18'),
  (UUID(), @LBY,  @SES_LBY,  @EPR_LBY_F,  @APP_NM, 1, NULL,                                         202, '2024-11-18'),
  (UUID(), @ISTD, @SES_ISTD, @EPR_ISTD_A, @APP_DB, 1, NULL,                                         301, '2025-01-12'),
  (UUID(), @ISTD, @SES_ISTD, @EPR_ISTD_A, @APP_EF, 1, NULL,                                         302, '2025-01-12'),
  (UUID(), @ISTD, @SES_ISTD, @EPR_ISTD_A, @APP_LB, 1, NULL,                                         303, '2025-01-12');

-- ===========================================================================
-- 34. PV D'EXAMENS + CAS DE FRAUDE
-- ===========================================================================
SET @PV_ISTD = UUID();

INSERT INTO `PVExamens` (`Id`, `TenantId`, `EpreuveId`, `NbCandidatsInscrits`, `NbCandidatsPresents`, `NbCandidatsAbsents`, `NbCopiesAnonymes`, `Observations`, `SigneParId`, `DateSignature`, `DateCreation`) VALUES
  (@PV_ISTD, @ISTD, @EPR_ISTD_A, 3, 3, 0, 3, 'Examen s''est déroulé sans incident majeur. Un cas de fraude détecté (voir CasFraude).', @USR_PTC, '2025-01-20', '2025-01-20');

INSERT INTO `CasFraude` (`Id`, `TenantId`, `PVExamenId`, `ApprenantId`, `Description`, `Sanction`, `DateCreation`) VALUES
  (UUID(), @ISTD, @PV_ISTD, @APP_LB, 'Téléphone portable trouvé allumé sur le bureau de l''étudiant pendant l''épreuve. Note annulée.', 'Note 0 — avertissement écrit', '2025-01-20');

-- ===========================================================================
-- 35. BULLETINS
-- ===========================================================================
INSERT INTO `Bulletins` (`Id`, `TenantId`, `ApprenantId`, `AnneeAcademiqueId`, `PeriodeId`, `ClasseId`, `Statut`, `MoyenneGenerale`, `Rang`, `Appreciation`, `SigneParId`, `DateSignature`, `DatePublication`, `DateCreation`) VALUES
  (@BUL_KJ_T1, @LBY, @APP_KJ, @AA_LBY_2425, @P_LBY_T1, @CL_3A,  'signe',    15.20, 1, 'Élève sérieux et travailleur. Continue ainsi.',             @USR_MULTI, '2024-12-13', NULL,         '2024-12-10'),
  (@BUL_NM_T1, @LBY, @APP_NM, @AA_LBY_2425, @P_LBY_T1, @CL_3A,  'genere',   12.10, 2, 'Des efforts à fournir pour atteindre le potentiel.',        NULL,       NULL,         NULL,         '2024-12-10'),
  (@BUL_EO_T1, @LBY, @APP_EO, @AA_LBY_2425, @P_LBY_T1, @CL_TLS1,'publie',   13.80, 1, 'Bonne progression. Encouragements.',                        @USR_MULTI, '2024-12-13', '2024-12-15', '2024-12-10'),
  (@BUL_PN_T1, @LBY, @APP_PN, @AA_LBY_2425, @P_LBY_T1, @CL_TLS1,'brouillon',14.60, 1, NULL,                                                        NULL,       NULL,         NULL,         '2024-12-10');

INSERT INTO `BulletinLignes` (`Id`, `BulletinId`, `MatiereId`, `Moyenne`, `Coefficient`, `RangMatiere`, `AppreciationMatiere`, `DateCreation`) VALUES
  (UUID(), @BUL_KJ_T1, @MAT_MATH, 16.75, 4, 1, 'Excellent niveau en algèbre', '2024-12-10'),
  (UUID(), @BUL_KJ_T1, @MAT_FRAN, 13.50, 3, 2, 'Bonne maîtrise de la langue', '2024-12-10');

INSERT INTO `RelevesNotes` (`Id`, `TenantId`, `ApprenantId`, `AnneeAcademiqueId`, `PeriodeId`, `PromotionId`, `Credits`, `MoyenneGenerale`, `Statut`, `DateCreation`) VALUES
  (UUID(), @ISTD, @APP_DB, @AA_ISTD_2425, @P_ISTD_S1, @PRO_L1I, 10, 17.50, 'provisoire', '2025-02-10'),
  (UUID(), @ISTD, @APP_TF, @AA_ISTD_2425, @P_ISTD_S1, @PRO_L2I, 10, 15.00, 'provisoire', '2025-02-10');

-- ===========================================================================
-- 36. DÉLIBÉRATIONS
-- ===========================================================================
INSERT INTO `Deliberations` (`Id`, `TenantId`, `AnneeAcademiqueId`, `PeriodeId`, `ClasseId`, `PromotionId`, `Type`, `DateDeliberation`, `Statut`, `DateCreation`) VALUES
  (@DEL_LBY,  @LBY,  @AA_LBY_2425,  @P_LBY_T1,  @CL_3A,  NULL,     'conseil_classe', '2024-12-11', 'tenu', '2024-12-08'),
  (@DEL_ISTD, @ISTD, @AA_ISTD_2425, @P_ISTD_S1,  NULL,   @PRO_L1I, 'jury_exam',      '2025-02-10', 'tenu', '2025-02-07');

INSERT INTO `DeliberationLignes` (`Id`, `DeliberationId`, `ApprenantId`, `Moyenne`, `Rang`, `Decision`, `Observation`, `DateCreation`) VALUES
  (UUID(), @DEL_LBY,  @APP_KJ, 15.20, 1, 'admis',         'Félicitations du conseil',         '2024-12-11'),
  (UUID(), @DEL_LBY,  @APP_NM, 12.10, 2, 'admis',         NULL,                               '2024-12-11'),
  (UUID(), @DEL_LBY,  @APP_AT, 10.30, 3, 'admis_reserve', 'Doit améliorer les mathématiques', '2024-12-11'),
  (UUID(), @DEL_ISTD, @APP_DB, 17.50, 1, 'admis',         'Major de promotion S1',            '2025-02-10'),
  (UUID(), @DEL_ISTD, @APP_EF, 14.50, 2, 'admis',         NULL,                               '2025-02-10'),
  (UUID(), @DEL_ISTD, @APP_LB,  0.00, 3, 'ajourné',       'Fraude lors de l''examen ALGO',    '2025-02-10');

-- ===========================================================================
-- 37. COMMUNICATION
-- ===========================================================================
INSERT INTO `ModelesMessage` (`Id`, `TenantId`, `Nom`, `Sujet`, `Corps`, `Variables`, `DateCreation`) VALUES
  (@MOD_MSG_1, @LBY,  'Rappel paiement scolarité', 'Rappel : solde de scolarité',       'Bonjour {{prenom}}, votre solde de scolarité est de {{montant}} XAF.', '["prenom","montant"]', '2024-09-01'),
  (@MOD_MSG_2, @ISTD, 'Convocation examen',        'Convocation aux examens {{session}}','Étudiant(e) {{nom}}, vous êtes convoqué(e) pour la session {{session}}.','["nom","session"]',   '2025-01-05');

INSERT INTO `Annonces` (`Id`, `TenantId`, `Titre`, `Contenu`, `Auteur`, `Cible`, `DatePublication`, `DateExpiration`, `Priorite`, `DateCreation`) VALUES
  (UUID(), @LBY,  'Calendrier des examens T1',                  'Les examens du Trimestre 1 se tiendront du 25 au 29 novembre 2024. Tableau de salle affiché au secrétariat.', @USR_MULTI, 'tous',       '2024-11-01', '2024-11-30', 'haute',   '2024-11-01'),
  (UUID(), @LBY,  'Fermeture exceptionnelle jeudi 21 novembre', 'En raison de la Journée Nationale, l''établissement sera fermé le jeudi 21 novembre 2024.',                  @USR_MULTI, 'tous',       '2024-11-15', '2024-11-21', 'normale', '2024-11-15'),
  (UUID(), @ISTD, 'Résultats CC1 Algorithmique disponibles',    'Les résultats du premier contrôle continu d''algorithmique sont disponibles sur l''ENT.',                    @USR_PTC,   'apprenants', '2024-11-08', '2024-11-30', 'normale', '2024-11-08');

INSERT INTO `Notifications` (`Id`, `TenantId`, `UserId`, `Titre`, `Contenu`, `Type`, `Lu`, `DateCreation`) VALUES
  (UUID(), @LBY,  @USR_KJ,    'Bulletin T1 disponible',           'Votre bulletin du Trimestre 1 est disponible.',             'info',   0, '2024-12-15'),
  (UUID(), @LBY,  @USR_KE,    'Bulletin T1 de votre enfant',      'Le bulletin de Jean KAMGA pour le T1 est disponible.',      'info',   1, '2024-12-15'),
  (UUID(), @LBY,  @USR_MULTI, 'Absence non justifiée signalée',   'Un apprenant de 3ème A présente 4h d''absence non justifiée.','alerte',0, '2024-09-15'),
  (UUID(), @ISTD, @USR_PTC,   'Fraude détectée — action requise', 'Un cas de fraude a été enregistré. Veuillez signer le PV.', 'alerte', 0, '2025-01-20');

INSERT INTO `Messages` (`Id`, `TenantId`, `ExpediteurId`, `DestinataireId`, `Sujet`, `Corps`, `Lu`, `DateEnvoi`, `DateCreation`) VALUES
  (UUID(), @LBY,  @USR_KE,  @USR_MULTI, 'Question scolarité Jean',  'Bonjour, je souhaite des informations sur le solde de scolarité de mon fils Jean KAMGA.',      0, '2024-10-20', '2024-10-20'),
  (UUID(), @ISTD, @USR_PTC, @USR_AUDIT, 'Rapport pédagogique S1',   'Veuillez trouver ci-joint le résumé pédagogique du semestre 1 pour le département Info.',     1, '2025-02-12', '2025-02-12');

-- ===========================================================================
-- 38. FINANCE — Factures & Paiements
-- ===========================================================================
INSERT INTO `Factures` (`Id`, `TenantId`, `ApprenantId`, `InscriptionId`, `NumeroFacture`, `Libelle`, `MontantTotal`, `MontantPaye`, `Statut`, `DateEmission`, `DateEcheance`, `Devise`, `DateCreation`) VALUES
  (@FAC_KJ, @LBY,  @APP_KJ, @INS_KJ_3A, 'LBY-2025-F001',  'Scolarité 2024-2025 — KAMGA Jean',      85000,      85000, 'payee',     '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_NM, @LBY,  @APP_NM, @INS_NM_3A, 'LBY-2025-F002',  'Scolarité 2024-2025 — NGUEMO Marie',    85000,      50000, 'partielle', '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_AT, @LBY,  @APP_AT, @INS_AT_3A, 'LBY-2025-F003',  'Scolarité 2024-2025 — ATEBA Thomas',    85000,          0, 'emise',     '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_BK, @LBY,  @APP_BK, @INS_BK_3A, 'LBY-2025-F004',  'Scolarité 2024-2025 — BIYONG Karine',   85000,          0, 'brouillon', NULL,         NULL,         'XAF', '2024-09-03'),
  (@FAC_EO, @LBY,  @APP_EO, @INS_EO_TL, 'LBY-2025-F005',  'Scolarité 2024-2025 — EBA Olivier',     85000,          0, 'en_retard', '2024-09-02', '2024-10-15', 'XAF', '2024-09-02'),
  (@FAC_DB, @ISTD, @APP_DB, @INS_DB_L1, 'ISTD-2025-F001', 'Scolarité 2024-2025 — DJOUM Bertrand', 250000,     250000, 'payee',     '2024-10-07', '2024-11-15', 'XAF', '2024-10-07'),
  (@FAC_EF, @ISTD, @APP_EF, @INS_EF_L1, 'ISTD-2025-F002', 'Scolarité 2024-2025 — EKAMBI Fanta',   250000,          0, 'emise',     '2024-10-07', '2024-11-15', 'XAF', '2024-10-07'),
  (@FAC_TF, @ISTD, @APP_TF, @INS_TF_L2, 'ISTD-2025-F003', 'Scolarité 2024-2025 — TONYE Florian',  250000,     125000, 'partielle', '2024-10-07', '2024-11-15', 'XAF', '2024-10-07');

INSERT INTO `Paiements` (`Id`, `TenantId`, `FactureId`, `ApprenantId`, `Montant`, `ModePaiement`, `Reference`, `DatePaiement`, `EnregistreParId`, `DateCreation`) VALUES
  (UUID(), @LBY,  @FAC_KJ, @APP_KJ,  85000, 'especes',     'CASH-LBY-001',      '2024-09-05', @USR_COMPT, '2024-09-05'),
  (UUID(), @LBY,  @FAC_NM, @APP_NM,  30000, 'mobile_money','MTN-MM-20241005',   '2024-10-05', @USR_COMPT, '2024-10-05'),
  (UUID(), @LBY,  @FAC_NM, @APP_NM,  20000, 'mobile_money','MTN-MM-20241110',   '2024-11-10', @USR_COMPT, '2024-11-10'),
  (UUID(), @ISTD, @FAC_DB, @APP_DB, 250000, 'virement',    'VIR-SGBC-10142024', '2024-10-14', @USR_COMPT, '2024-10-14'),
  (UUID(), @ISTD, @FAC_TF, @APP_TF, 125000, 'cheque',      'CHQ-BICEC-0042',    '2024-10-10', @USR_COMPT, '2024-10-10');

-- ===========================================================================
-- 39. ÉVÉNEMENTS CALENDRIER
-- ===========================================================================
INSERT INTO `EvenementsCalendrier` (`Id`, `TenantId`, `AnneeAcademiqueId`, `Titre`, `Description`, `DateDebut`, `DateFin`, `Type`, `DateCreation`) VALUES
  (UUID(), @LBY,  @AA_LBY_2425,  'Rentrée scolaire 2024-2025',        'Rentrée officielle des classes',            '2024-09-02', '2024-09-02', 'administratif', '2024-08-01'),
  (UUID(), @LBY,  @AA_LBY_2425,  'Fête de la Jeunesse',               'Journée nationale — établissement fermé',  '2025-02-11', '2025-02-11', 'ferie',         '2024-08-01'),
  (UUID(), @LBY,  @AA_LBY_2425,  'Examens T1',                        'Session d''examens du premier trimestre',  '2024-11-25', '2024-11-29', 'examen',        '2024-11-01'),
  (UUID(), @ISTD, @AA_ISTD_2425, 'Rentrée universitaire 2024-2025',   'Rentrée officielle',                       '2024-10-07', '2024-10-07', 'administratif', '2024-09-01'),
  (UUID(), @ISTD, @AA_ISTD_2425, 'Semaine pédagogique S1',            'Ateliers et conférences pédagogiques',     '2024-12-02', '2024-12-06', 'pedagogique',   '2024-11-01'),
  (UUID(), @ISTD, @AA_ISTD_2425, 'Examens S1',                        'Session examens semestre 1',               '2025-01-20', '2025-02-07', 'examen',        '2025-01-05');

-- ===========================================================================
COMMIT;
-- ===========================================================================
-- Fin du seed MySQL — entités métier
-- Exécuter ensuite DbInitializer.cs pour les comptes utilisateurs
-- ===========================================================================
