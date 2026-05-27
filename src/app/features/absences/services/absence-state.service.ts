import { Injectable, computed, signal, inject } from '@angular/core';
import { AbsenceApiService } from '../../../core/services/absence-api.service';
import {
  Absence, Presence, FeuillePresence, Justificatif,
  AbsenceEnseignant, StatsAbsenteisme, StatsAbsenteismeClasse,
  ParametresAbsenteisme,
  SaisirPresencesDto, UpdatePresenceDto,
  SoumettreJustificatifDto, ValiderJustificatifDto,
  CreateAbsenceEnseignantDto,
  AbsenceFilters, StatutPresence,
} from '../../../core/models/absence.models';

interface AbsenceState {
  absences: Absence[];
  selectedAbsence: Absence | null;
  feuillePresence: FeuillePresence | null;
  presencesApprenant: Presence[];
  justificatifsEnAttente: Justificatif[];
  absencesEnseignant: AbsenceEnseignant[];
  statsApprenant: StatsAbsenteisme | null;
  statsClasse: StatsAbsenteismeClasse | null;
  apprenantsDessusSeui: StatsAbsenteisme[];
  parametres: ParametresAbsenteisme | null;
  loading: boolean;
  loadingFeuille: boolean;
  loadingStats: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AbsenceStateService {
  private api = inject(AbsenceApiService);

  // ── état privé ──────────────────────────────────────────────────────────────
  private state = signal<AbsenceState>({
    absences: [],
    selectedAbsence: null,
    feuillePresence: null,
    presencesApprenant: [],
    justificatifsEnAttente: [],
    absencesEnseignant: [],
    statsApprenant: null,
    statsClasse: null,
    apprenantsDessusSeui: [],
    parametres: null,
    loading: false,
    loadingFeuille: false,
    loadingStats: false,
    error: null,
    total: 0,
    page: 1,
    limit: 30,
  });

  // ── signaux publics ─────────────────────────────────────────────────────────
  readonly absences               = computed(() => this.state().absences);
  readonly selectedAbsence        = computed(() => this.state().selectedAbsence);
  readonly feuillePresence        = computed(() => this.state().feuillePresence);
  readonly presencesApprenant     = computed(() => this.state().presencesApprenant);
  readonly justificatifsEnAttente = computed(() => this.state().justificatifsEnAttente);
  readonly absencesEnseignant     = computed(() => this.state().absencesEnseignant);
  readonly statsApprenant         = computed(() => this.state().statsApprenant);
  readonly statsClasse            = computed(() => this.state().statsClasse);
  readonly apprenantsDessusSeui   = computed(() => this.state().apprenantsDessusSeui);
  readonly parametres             = computed(() => this.state().parametres);
  readonly loading                = computed(() => this.state().loading);
  readonly loadingFeuille         = computed(() => this.state().loadingFeuille);
  readonly loadingStats           = computed(() => this.state().loadingStats);
  readonly error                  = computed(() => this.state().error);
  readonly total                  = computed(() => this.state().total);
  readonly page                   = computed(() => this.state().page);
  readonly limit                  = computed(() => this.state().limit);

  // ── computed dérivés ────────────────────────────────────────────────────────
  readonly absencesNonJustifiees = computed(() =>
    this.absences().filter(a => a.statut === 'non_justifiee')
  );
  readonly absencesEnAttente = computed(() =>
    this.absences().filter(a => a.statut === 'en_attente')
  );
  readonly absencesExamen = computed(() =>
    this.absences().filter(a => a.estExamen)
  );
  readonly nombreJustificatifsEnAttente = computed(() =>
    this.justificatifsEnAttente().length
  );
  readonly alerteDepassee = computed(() =>
    this.statsApprenant()?.alerteDepassee ?? false
  );
  readonly tauxAbsenteisme = computed(() =>
    this.statsApprenant()?.tauxAbsenteisme ?? 0
  );
  readonly presentsCount = computed(() =>
    this.feuillePresence()?.totalPresents ?? 0
  );
  readonly absentsCount = computed(() =>
    this.feuillePresence()?.totalAbsents ?? 0
  );
  readonly feuilleComplete = computed(() =>
    this.feuillePresence()?.saisieComplete ?? false
  );
  readonly seuil = computed(() =>
    this.parametres()?.seuilAlerte ?? 10
  );

  // ── actions : Feuille de présence ───────────────────────────────────────────
  loadFeuillePresence(seanceId: string): void {
    this.state.update(s => ({ ...s, loadingFeuille: true, error: null }));
    this.api.getFeuillePresence(seanceId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingFeuille: false, feuillePresence: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingFeuille: false, error: err.message,
      })),
    });
  }

  saisirPresences(dto: SaisirPresencesDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingFeuille: true, error: null }));
    this.api.saisirPresences(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingFeuille: false, feuillePresence: res.data,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({
        ...s, loadingFeuille: false, error: err.message,
      })),
    });
  }

  updatePresence(id: string, dto: UpdatePresenceDto, onSuccess?: () => void): void {
    this.api.updatePresence(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          feuillePresence: s.feuillePresence ? {
            ...s.feuillePresence,
            presences: s.feuillePresence.presences.map(p =>
              p.id === id ? res.data : p
            ),
          } : null,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Absences ──────────────────────────────────────────────────────
  loadAbsences(filters?: AbsenceFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getAbsences(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        absences: res.data,
        total: res.total,
        page: res.page,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  loadAbsencesApprenant(apprenantId: string, anneeId?: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getAbsencesApprenant(apprenantId, anneeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, absences: res.data, total: res.data.length,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  notifierParent(absenceId: string, onSuccess?: () => void): void {
    this.api.notifierParent(absenceId).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          absences: s.absences.map(a =>
            a.id === absenceId ? { ...a, notifieeParent: true } : a
          ),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Justificatifs ─────────────────────────────────────────────────
  soumettreJustificatif(
    dto: SoumettreJustificatifDto,
    onSuccess?: () => void
  ): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.soumettreJustificatif(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          absences: s.absences.map(a =>
            a.id === dto.absenceId
              ? { ...a, statut: 'en_attente' as const, justificatif: res.data }
              : a
          ),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  validerJustificatif(
    dto: ValiderJustificatifDto,
    onSuccess?: () => void
  ): void {
    this.api.validerJustificatif(dto).subscribe({
      next: res => {
        const nouveauStatutAbsence = res.data.statut === 'accepte'
          ? 'justifiee' as const
          : 'rejetee' as const;
        this.state.update(s => ({
          ...s,
          absences: s.absences.map(a =>
            a.justificatif?.id === dto.justificatifId
              ? { ...a, statut: nouveauStatutAbsence }
              : a
          ),
          justificatifsEnAttente: s.justificatifsEnAttente.filter(
            j => j.id !== dto.justificatifId
          ),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadJustificatifsEnAttente(etablissementId: string): void {
    this.api.getJustificatifsEnAttente(etablissementId).subscribe({
      next: res => this.state.update(s => ({
        ...s, justificatifsEnAttente: res.data,
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Statistiques ──────────────────────────────────────────────────
  loadStatsApprenant(
    apprenantId: string,
    anneeId?: string,
    periodeId?: string
  ): void {
    this.state.update(s => ({ ...s, loadingStats: true }));
    this.api.getStatsApprenant(apprenantId, anneeId, periodeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingStats: false, statsApprenant: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingStats: false, error: err.message,
      })),
    });
  }

  loadStatsClasse(classeOuPromotionId: string, periodeId?: string): void {
    this.state.update(s => ({ ...s, loadingStats: true }));
    this.api.getStatsClasse(classeOuPromotionId, periodeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingStats: false, statsClasse: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingStats: false, error: err.message,
      })),
    });
  }

  loadApprenantsDessusSeui(etablissementId: string, anneeId: string): void {
    this.api.getApprenantsDessusSeui(etablissementId, anneeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, apprenantsDessusSeui: res.data,
      })),
      error: () => {},
    });
  }

  // ── actions : Absences enseignants ─────────────────────────────────────────
  loadAbsencesEnseignant(enseignantId: string): void {
    this.api.getAbsencesEnseignant(enseignantId).subscribe({
      next: res => this.state.update(s => ({
        ...s, absencesEnseignant: res.data,
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  createAbsenceEnseignant(
    dto: CreateAbsenceEnseignantDto,
    onSuccess?: () => void
  ): void {
    this.api.createAbsenceEnseignant(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          absencesEnseignant: [res.data, ...s.absencesEnseignant],
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteAbsenceEnseignant(id: string, onSuccess?: () => void): void {
    this.api.deleteAbsenceEnseignant(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          absencesEnseignant: s.absencesEnseignant.filter(a => a.id !== id),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Paramètres ────────────────────────────────────────────────────
  loadParametres(etablissementId: string): void {
    this.api.getParametres(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, parametres: res.data })),
      error: () => {},
    });
  }

  updateParametres(
    etablissementId: string,
    dto: Partial<ParametresAbsenteisme>,
    onSuccess?: () => void
  ): void {
    this.api.updateParametres(etablissementId, dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, parametres: res.data }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── utilitaires ─────────────────────────────────────────────────────────────
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearFeuille(): void {
    this.state.update(s => ({ ...s, feuillePresence: null }));
  }
}
