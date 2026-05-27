import { Injectable, computed, signal, inject } from '@angular/core';
import { EtablissementApiService, EtablissementFilters, SalleFilters } from '../../../core/services/etablissement-api.service';
import {
  Etablissement, Campus, AnneeAcademique, Periode, Salle,
  CreateEtablissementDto, UpdateEtablissementDto,
  CreateCampusDto, UpdateCampusDto,
  CreateAnneeAcademiqueDto, UpdateAnneeAcademiqueDto,
  CreatePeriodeDto, CreateSalleDto, UpdateSalleDto
} from '../../../core/models/etablissement.models';

interface EtablissementState {
  etablissements: Etablissement[];
  selectedEtablissement: Etablissement | null;
  campus: Campus[];
  anneesAcademiques: AnneeAcademique[];
  periodes: Periode[];
  salles: Salle[];
  loading: boolean;
  loadingCampus: boolean;
  loadingAnnees: boolean;
  loadingSalles: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class EtablissementStateService {
  private api = inject(EtablissementApiService);

  // ── état privé ──────────────────────────────────────────────────────────────
  private state = signal<EtablissementState>({
    etablissements: [],
    selectedEtablissement: null,
    campus: [],
    anneesAcademiques: [],
    periodes: [],
    salles: [],
    loading: false,
    loadingCampus: false,
    loadingAnnees: false,
    loadingSalles: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  // ── signaux publics en lecture seule ────────────────────────────────────────
  readonly etablissements       = computed(() => this.state().etablissements);
  readonly selectedEtablissement = computed(() => this.state().selectedEtablissement);
  readonly campus               = computed(() => this.state().campus);
  readonly anneesAcademiques    = computed(() => this.state().anneesAcademiques);
  readonly periodes             = computed(() => this.state().periodes);
  readonly salles               = computed(() => this.state().salles);
  readonly loading              = computed(() => this.state().loading);
  readonly loadingCampus        = computed(() => this.state().loadingCampus);
  readonly loadingAnnees        = computed(() => this.state().loadingAnnees);
  readonly loadingSalles        = computed(() => this.state().loadingSalles);
  readonly error                = computed(() => this.state().error);
  readonly total                = computed(() => this.state().total);
  readonly page                 = computed(() => this.state().page);
  readonly limit                = computed(() => this.state().limit);

  // ── computed dérivés ────────────────────────────────────────────────────────
  readonly etablissementsScolaires    = computed(() =>
    this.etablissements().filter(e => e.type === 'scolaire')
  );
  readonly etablissementsUniversitaires = computed(() =>
    this.etablissements().filter(e => e.type === 'universitaire')
  );
  readonly anneeActive = computed(() =>
    this.anneesAcademiques().find(a => a.active) ?? null
  );
  readonly campusPrincipal = computed(() =>
    this.campus().find(c => c.principal) ?? null
  );
  readonly sallesDisponibles = computed(() =>
    this.salles().filter(s => s.statut === 'disponible')
  );

  // ── actions : Établissements ────────────────────────────────────────────────
  loadEtablissements(filters?: EtablissementFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getEtablissements(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        etablissements: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectEtablissement(id: string): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getEtablissement(id).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, selectedEtablissement: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  createEtablissement(dto: CreateEtablissementDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createEtablissement(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          etablissements: [...s.etablissements, res.data],
          total: s.total + 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  updateEtablissement(id: string, dto: UpdateEtablissementDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.updateEtablissement(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          etablissements: s.etablissements.map(e => e.id === id ? res.data : e),
          selectedEtablissement: s.selectedEtablissement?.id === id ? res.data : s.selectedEtablissement,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  deleteEtablissement(id: string, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.deleteEtablissement(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s, loading: false,
          etablissements: s.etablissements.filter(e => e.id !== id),
          total: s.total - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  // ── actions : Campus ────────────────────────────────────────────────────────
  loadCampus(etablissementId: string): void {
    this.state.update(s => ({ ...s, loadingCampus: true, error: null }));
    this.api.getCampusByEtablissement(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingCampus: false, campus: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingCampus: false, error: err.message })),
    });
  }

  createCampus(dto: CreateCampusDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingCampus: true, error: null }));
    this.api.createCampus(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loadingCampus: false, campus: [...s.campus, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loadingCampus: false, error: err.message })),
    });
  }

  updateCampus(id: string, dto: UpdateCampusDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingCampus: true, error: null }));
    this.api.updateCampus(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingCampus: false,
          campus: s.campus.map(c => c.id === id ? res.data : c),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loadingCampus: false, error: err.message })),
    });
  }

  deleteCampus(id: string, onSuccess?: () => void): void {
    this.api.deleteCampus(id).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, campus: s.campus.filter(c => c.id !== id) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Années académiques ────────────────────────────────────────────
  loadAnneesAcademiques(etablissementId: string): void {
    this.state.update(s => ({ ...s, loadingAnnees: true, error: null }));
    this.api.getAnneesAcademiques(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingAnnees: false, anneesAcademiques: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingAnnees: false, error: err.message })),
    });
  }

  createAnneeAcademique(dto: CreateAnneeAcademiqueDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingAnnees: true, error: null }));
    this.api.createAnneeAcademique(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loadingAnnees: false, anneesAcademiques: [...s.anneesAcademiques, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loadingAnnees: false, error: err.message })),
    });
  }

  updateAnneeAcademique(id: string, dto: UpdateAnneeAcademiqueDto, onSuccess?: () => void): void {
    this.api.updateAnneeAcademique(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          anneesAcademiques: s.anneesAcademiques.map(a => a.id === id ? res.data : a),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  activerAnneeAcademique(id: string): void {
    this.api.activerAnneeAcademique(id).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          anneesAcademiques: s.anneesAcademiques.map(a => ({
            ...a,
            active: a.id === id,
            statut: a.id === id ? 'en_cours' as const : a.statut,
          })),
        }));
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  cloturerAnneeAcademique(id: string): void {
    this.api.cloturerAnneeAcademique(id).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          anneesAcademiques: s.anneesAcademiques.map(a =>
            a.id === id ? { ...a, active: false, statut: 'cloturee' as const } : a
          ),
        }));
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Périodes ──────────────────────────────────────────────────────
  loadPeriodes(anneeAcademiqueId: string): void {
    this.api.getPeriodes(anneeAcademiqueId).subscribe({
      next: res => this.state.update(s => ({ ...s, periodes: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  createPeriode(dto: CreatePeriodeDto, onSuccess?: () => void): void {
    this.api.createPeriode(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, periodes: [...s.periodes, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deletePeriode(id: string): void {
    this.api.deletePeriode(id).subscribe({
      next: () => this.state.update(s => ({ ...s, periodes: s.periodes.filter(p => p.id !== id) })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Salles ────────────────────────────────────────────────────────
  loadSalles(filters?: SalleFilters): void {
    this.state.update(s => ({ ...s, loadingSalles: true, error: null }));
    this.api.getSalles(filters).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingSalles: false, salles: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingSalles: false, error: err.message })),
    });
  }

  createSalle(dto: CreateSalleDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingSalles: true, error: null }));
    this.api.createSalle(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loadingSalles: false, salles: [...s.salles, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loadingSalles: false, error: err.message })),
    });
  }

  updateSalle(id: string, dto: UpdateSalleDto, onSuccess?: () => void): void {
    this.api.updateSalle(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          salles: s.salles.map(sl => sl.id === id ? res.data : sl),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteSalle(id: string): void {
    this.api.deleteSalle(id).subscribe({
      next: () => this.state.update(s => ({ ...s, salles: s.salles.filter(sl => sl.id !== id) })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── utilitaire ──────────────────────────────────────────────────────────────
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearSelection(): void {
    this.state.update(s => ({ ...s, selectedEtablissement: null, campus: [], anneesAcademiques: [], periodes: [] }));
  }
}
