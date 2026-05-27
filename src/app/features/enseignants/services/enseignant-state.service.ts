import { Injectable, computed, signal, inject } from '@angular/core';
import { EnseignantApiService } from '../../../core/services/enseignant-api.service';
import {
  Enseignant, AffectationMatiere, ChargeHoraire, StatsEnseignant,
  CreateEnseignantDto, UpdateEnseignantDto,
  AffecterMatiereDto, UpdateAffectationDto,
  EnseignantFilters,
} from '../../../core/models/enseignant.models';

interface EnseignantState {
  enseignants: Enseignant[];
  selectedEnseignant: Enseignant | null;
  affectations: AffectationMatiere[];
  chargeHoraire: ChargeHoraire | null;
  stats: StatsEnseignant | null;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class EnseignantStateService {
  private api = inject(EnseignantApiService);

  private state = signal<EnseignantState>({
    enseignants: [],
    selectedEnseignant: null,
    affectations: [],
    chargeHoraire: null,
    stats: null,
    loading: false,
    loadingDetail: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  // ── signaux publics ─────────────────────────────────────────────────────────
  readonly enseignants         = computed(() => this.state().enseignants);
  readonly selectedEnseignant  = computed(() => this.state().selectedEnseignant);
  readonly affectations        = computed(() => this.state().affectations);
  readonly chargeHoraire       = computed(() => this.state().chargeHoraire);
  readonly stats               = computed(() => this.state().stats);
  readonly loading             = computed(() => this.state().loading);
  readonly loadingDetail       = computed(() => this.state().loadingDetail);
  readonly error               = computed(() => this.state().error);
  readonly total               = computed(() => this.state().total);
  readonly page                = computed(() => this.state().page);
  readonly limit               = computed(() => this.state().limit);

  // ── computed dérivés ────────────────────────────────────────────────────────
  readonly enseignantsActifs = computed(() =>
    this.enseignants().filter(e => e.statut === 'actif')
  );
  readonly enseignantsTitulaires = computed(() =>
    this.enseignants().filter(e => e.typeContrat === 'titulaire')
  );
  readonly enseignantsVacataires = computed(() =>
    this.enseignants().filter(e => e.typeContrat === 'vacataire')
  );
  readonly enseignantsEnSurcharge = computed(() =>
    this.enseignants().filter(e =>
      e.chargeHoraireMax && e.chargeHoraireReelle &&
      e.chargeHoraireReelle > e.chargeHoraireMax
    )
  );
  readonly affectationsActives = computed(() =>
    this.affectations().filter(a => a.actif)
  );
  readonly tauxRealisationCharge = computed(() =>
    this.chargeHoraire()?.tauxRealisation ?? null
  );

  // ── actions : Enseignants ────────────────────────────────────────────────────
  loadEnseignants(filters?: EnseignantFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getEnseignants(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        enseignants: res.data,
        total: res.total,
        page: res.page,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  selectEnseignant(id: string): void {
    this.state.update(s => ({ ...s, loadingDetail: true }));
    this.api.getEnseignant(id).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingDetail: false, selectedEnseignant: res.data,
        }));
        this.loadAffectations(id);
      },
      error: err => this.state.update(s => ({
        ...s, loadingDetail: false, error: err.message,
      })),
    });
  }

  createEnseignant(dto: CreateEnseignantDto, onSuccess?: (e: Enseignant) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createEnseignant(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          enseignants: [res.data, ...s.enseignants],
          total: s.total + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  updateEnseignant(id: string, dto: UpdateEnseignantDto, onSuccess?: () => void): void {
    this.api.updateEnseignant(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          enseignants: s.enseignants.map(e => e.id === id ? res.data : e),
          selectedEnseignant: s.selectedEnseignant?.id === id ? res.data : s.selectedEnseignant,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteEnseignant(id: string, onSuccess?: () => void): void {
    this.api.deleteEnseignant(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          enseignants: s.enseignants.filter(e => e.id !== id),
          total: s.total - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Affectations ───────────────────────────────────────────────────
  loadAffectations(enseignantId: string, anneeId?: string): void {
    this.api.getAffectations(enseignantId, anneeId).subscribe({
      next: res => this.state.update(s => ({ ...s, affectations: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  affecterMatiere(dto: AffecterMatiereDto, onSuccess?: () => void): void {
    this.api.affecterMatiere(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, affectations: [res.data, ...s.affectations],
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateAffectation(id: string, dto: UpdateAffectationDto, onSuccess?: () => void): void {
    this.api.updateAffectation(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          affectations: s.affectations.map(a => a.id === id ? res.data : a),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  supprimerAffectation(id: string, onSuccess?: () => void): void {
    this.api.supprimerAffectation(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s, affectations: s.affectations.filter(a => a.id !== id),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Charge horaire & Stats ────────────────────────────────────────
  loadChargeHoraire(enseignantId: string, anneeId: string): void {
    this.api.getChargeHoraire(enseignantId, anneeId).subscribe({
      next: res => this.state.update(s => ({ ...s, chargeHoraire: res.data })),
      error: () => {},
    });
  }

  loadStats(etablissementId: string): void {
    this.api.getStats(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, stats: res.data })),
      error: () => {},
    });
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearSelection(): void {
    this.state.update(s => ({
      ...s, selectedEnseignant: null, affectations: [], chargeHoraire: null,
    }));
  }
}
