import { Injectable, computed, signal, inject } from '@angular/core';
import { ReferentielApiService } from '../../../core/services/referentiel-api.service';
import {
  Matiere, UE, Programme, StatsReferentiel,
  CreateMatiereDto, UpdateMatiereDto,
  CreateUEDto, UpdateUEDto,
  RattacherMatiereUEDto, DupliquerReferentielDto,
  MatiereFilters, UEFilters,
} from '../../../core/models/referentiel.models';

interface ReferentielState {
  matieres: Matiere[];
  selectedMatiere: Matiere | null;
  ues: UE[];
  selectedUE: UE | null;
  matieresUE: Matiere[];
  programme: Programme | null;
  stats: StatsReferentiel | null;
  loading: boolean;
  loadingUE: boolean;
  loadingMatieres: boolean;
  error: string | null;
  totalMatieres: number;
  totalUE: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class ReferentielStateService {
  private api = inject(ReferentielApiService);

  private state = signal<ReferentielState>({
    matieres: [],
    selectedMatiere: null,
    ues: [],
    selectedUE: null,
    matieresUE: [],
    programme: null,
    stats: null,
    loading: false,
    loadingUE: false,
    loadingMatieres: false,
    error: null,
    totalMatieres: 0,
    totalUE: 0,
    page: 1,
    limit: 30,
  });

  readonly matieres        = computed(() => this.state().matieres);
  readonly selectedMatiere = computed(() => this.state().selectedMatiere);
  readonly ues             = computed(() => this.state().ues);
  readonly selectedUE      = computed(() => this.state().selectedUE);
  readonly matieresUE      = computed(() => this.state().matieresUE);
  readonly programme       = computed(() => this.state().programme);
  readonly stats           = computed(() => this.state().stats);
  readonly loading         = computed(() => this.state().loading);
  readonly loadingUE       = computed(() => this.state().loadingUE);
  readonly loadingMatieres = computed(() => this.state().loadingMatieres);
  readonly error           = computed(() => this.state().error);
  readonly totalMatieres   = computed(() => this.state().totalMatieres);
  readonly totalUE         = computed(() => this.state().totalUE);
  readonly page            = computed(() => this.state().page);
  readonly limit           = computed(() => this.state().limit);

  readonly matieresEliminatoires = computed(() =>
    this.matieres().filter(m => m.eliminatoire)
  );
  readonly totalVolumeHoraire = computed(() =>
    this.matieres().reduce((sum, m) => sum + (m.volumeHoraireTotal ?? 0), 0)
  );
  readonly totalCreditsUE = computed(() =>
    this.ues().reduce((sum, u) => sum + u.credits, 0)
  );
  readonly uesBySemestre = (semestre: number) => computed(() =>
    this.ues().filter(u => u.semestre === semestre)
  );
  readonly uesEliminatoires = computed(() =>
    this.ues().filter(u => u.eliminatoire)
  );
  readonly uesCompensables = computed(() =>
    this.ues().filter(u => u.compensable)
  );
  readonly sommePonderations = computed(() => {
    const m = this.selectedMatiere();
    if (!m) return null;
    return m.ponderationCC + m.ponderationExamen;
  });
  readonly ponderationsValides = computed(() => {
    const s = this.sommePonderations();
    return s === null || s === 100;
  });

  // ── Matières ────────────────────────────────────────────────────────────────
  loadMatieres(filters?: MatiereFilters): void {
    this.state.update(s => ({ ...s, loadingMatieres: true, error: null }));
    this.api.getMatieres(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingMatieres: false,
        matieres: res.data,
        totalMatieres: res.total,
        page: res.page,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingMatieres: false, error: err.message,
      })),
    });
  }

  loadMatieresByNiveau(niveauId: string, anneeId?: string): void {
    this.state.update(s => ({ ...s, loadingMatieres: true }));
    this.api.getMatieresByNiveau(niveauId, anneeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingMatieres: false, matieres: res.data,
        totalMatieres: res.data.length,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingMatieres: false, error: err.message,
      })),
    });
  }

  selectMatiere(id: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getMatiere(id).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, selectedMatiere: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  createMatiere(dto: CreateMatiereDto, onSuccess?: (m: Matiere) => void): void {
    this.state.update(s => ({ ...s, loadingMatieres: true, error: null }));
    this.api.createMatiere(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingMatieres: false,
          matieres: [res.data, ...s.matieres],
          totalMatieres: s.totalMatieres + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({
        ...s, loadingMatieres: false, error: err.message,
      })),
    });
  }

  updateMatiere(id: string, dto: UpdateMatiereDto, onSuccess?: () => void): void {
    this.api.updateMatiere(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          matieres: s.matieres.map(m => m.id === id ? res.data : m),
          selectedMatiere: s.selectedMatiere?.id === id ? res.data : s.selectedMatiere,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteMatiere(id: string, onSuccess?: () => void): void {
    this.api.deleteMatiere(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          matieres: s.matieres.filter(m => m.id !== id),
          totalMatieres: s.totalMatieres - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  rattacherMatiereUE(dto: RattacherMatiereUEDto, onSuccess?: () => void): void {
    this.api.rattacherMatiereUE(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          matieres: s.matieres.map(m => m.id === dto.matiereId ? res.data : m),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  detacherMatiereUE(matiereId: string, onSuccess?: () => void): void {
    this.api.detacherMatiereUE(matiereId).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          matieres: s.matieres.map(m => m.id === matiereId ? res.data : m),
          matieresUE: s.matieresUE.filter(m => m.id !== matiereId),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── UE ───────────────────────────────────────────────────────────────────────
  loadUEs(filters?: UEFilters): void {
    this.state.update(s => ({ ...s, loadingUE: true, error: null }));
    this.api.getUEs(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingUE: false,
        ues: res.data,
        totalUE: res.total,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingUE: false, error: err.message,
      })),
    });
  }

  loadUEByNiveau(niveauId: string, semestre?: number, anneeId?: string): void {
    this.state.update(s => ({ ...s, loadingUE: true }));
    this.api.getUEByNiveau(niveauId, semestre, anneeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingUE: false, ues: res.data, totalUE: res.data.length,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingUE: false, error: err.message,
      })),
    });
  }

  selectUE(id: string): void {
    this.state.update(s => ({ ...s, loadingUE: true }));
    this.api.getUE(id).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loadingUE: false, selectedUE: res.data }));
        this.loadMatieresByUE(id);
      },
      error: err => this.state.update(s => ({
        ...s, loadingUE: false, error: err.message,
      })),
    });
  }

  createUE(dto: CreateUEDto, onSuccess?: (ue: UE) => void): void {
    this.state.update(s => ({ ...s, loadingUE: true, error: null }));
    this.api.createUE(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingUE: false,
          ues: [res.data, ...s.ues],
          totalUE: s.totalUE + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({
        ...s, loadingUE: false, error: err.message,
      })),
    });
  }

  updateUE(id: string, dto: UpdateUEDto, onSuccess?: () => void): void {
    this.api.updateUE(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          ues: s.ues.map(u => u.id === id ? res.data : u),
          selectedUE: s.selectedUE?.id === id ? res.data : s.selectedUE,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteUE(id: string, onSuccess?: () => void): void {
    this.api.deleteUE(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          ues: s.ues.filter(u => u.id !== id),
          totalUE: s.totalUE - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  private loadMatieresByUE(ueId: string): void {
    this.api.getMatieresByUE(ueId).subscribe({
      next: res => this.state.update(s => ({ ...s, matieresUE: res.data })),
      error: () => {},
    });
  }

  // ── Programme & stats ────────────────────────────────────────────────────────
  loadProgramme(niveauId: string, anneeId: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getProgramme(niveauId, anneeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, programme: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  dupliquerReferentiel(dto: DupliquerReferentielDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.dupliquerReferentiel(dto).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, loading: false }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
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
      ...s,
      selectedMatiere: null,
      selectedUE: null,
      matieresUE: [],
    }));
  }
}
