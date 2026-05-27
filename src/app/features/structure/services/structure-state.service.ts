import { Injectable, computed, signal, inject } from '@angular/core';
import { StructureApiService } from '../../../core/services/structure-api.service';
import {
  Cycle, Filiere, Niveau, Classe, Promotion, Groupe, StatsStructure,
  CreateCycleDto, UpdateCycleDto,
  CreateFiliereDto, UpdateFiliereDto,
  CreateNiveauDto, UpdateNiveauDto,
  CreateClasseDto, UpdateClasseDto,
  CreatePromotionDto, UpdatePromotionDto,
  CreateGroupeDto, UpdateGroupeDto,
  ClasseFilters, PromotionFilters,
} from '../../../core/models/structure.models';

interface StructureState {
  cycles: Cycle[];
  filieres: Filiere[];
  niveaux: Niveau[];
  classes: Classe[];
  promotions: Promotion[];
  groupes: Groupe[];
  selectedClasse: Classe | null;
  selectedPromotion: Promotion | null;
  apprenants: any[];
  stats: StatsStructure | null;
  loading: boolean;
  loadingDetail: boolean;
  loadingApprenants: boolean;
  error: string | null;
  totalClasses: number;
  totalPromotions: number;
  pageClasses: number;
  pagePromotions: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class StructureStateService {
  private api = inject(StructureApiService);

  private state = signal<StructureState>({
    cycles: [],
    filieres: [],
    niveaux: [],
    classes: [],
    promotions: [],
    groupes: [],
    selectedClasse: null,
    selectedPromotion: null,
    apprenants: [],
    stats: null,
    loading: false,
    loadingDetail: false,
    loadingApprenants: false,
    error: null,
    totalClasses: 0,
    totalPromotions: 0,
    pageClasses: 1,
    pagePromotions: 1,
    limit: 20,
  });

  readonly cycles            = computed(() => this.state().cycles);
  readonly filieres          = computed(() => this.state().filieres);
  readonly niveaux           = computed(() => this.state().niveaux);
  readonly classes           = computed(() => this.state().classes);
  readonly promotions        = computed(() => this.state().promotions);
  readonly groupes           = computed(() => this.state().groupes);
  readonly selectedClasse    = computed(() => this.state().selectedClasse);
  readonly selectedPromotion = computed(() => this.state().selectedPromotion);
  readonly apprenants        = computed(() => this.state().apprenants);
  readonly stats             = computed(() => this.state().stats);
  readonly loading           = computed(() => this.state().loading);
  readonly loadingDetail     = computed(() => this.state().loadingDetail);
  readonly loadingApprenants = computed(() => this.state().loadingApprenants);
  readonly error             = computed(() => this.state().error);
  readonly totalClasses      = computed(() => this.state().totalClasses);
  readonly totalPromotions   = computed(() => this.state().totalPromotions);
  readonly limit             = computed(() => this.state().limit);

  readonly cyclesScolaires = computed(() =>
    this.cycles().filter(c => c.typeFormation === 'scolaire')
  );
  readonly cyclesUniversitaires = computed(() =>
    this.cycles().filter(c => c.typeFormation === 'universitaire')
  );
  readonly filieresByCycle = (cycleId: string) => computed(() =>
    this.filieres().filter(f => f.cycleId === cycleId)
  );
  readonly niveauxByFiliere = (filiereId: string) => computed(() =>
    this.niveaux().filter(n => n.filiereId === filiereId)
  );
  readonly classesActives = computed(() =>
    this.classes().filter(c => c.statut === 'active')
  );
  readonly promotionsActives = computed(() =>
    this.promotions().filter(p => p.statut === 'active')
  );
  readonly tauxRemplissageClasse = computed(() => {
    const c = this.selectedClasse();
    if (!c || !c.capaciteMax) return null;
    return Math.round((c.effectifActuel / c.capaciteMax) * 100);
  });
  readonly tauxRemplissagePromotion = computed(() => {
    const p = this.selectedPromotion();
    if (!p || !p.capaciteMax) return null;
    return Math.round((p.effectifActuel / p.capaciteMax) * 100);
  });
  readonly classeComplete = computed(() => {
    const c = this.selectedClasse();
    return c ? c.effectifActuel >= c.capaciteMax : false;
  });

  // ── Cycles ──────────────────────────────────────────────────────────────────
  loadCycles(etablissementId: string): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getCycles(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, cycles: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  createCycle(dto: CreateCycleDto, onSuccess?: () => void): void {
    this.api.createCycle(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, cycles: [...s.cycles, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateCycle(id: string, dto: UpdateCycleDto, onSuccess?: () => void): void {
    this.api.updateCycle(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, cycles: s.cycles.map(c => c.id === id ? res.data : c),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteCycle(id: string, onSuccess?: () => void): void {
    this.api.deleteCycle(id).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, cycles: s.cycles.filter(c => c.id !== id) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Filières ─────────────────────────────────────────────────────────────────
  loadFilieres(etablissementId?: string, cycleId?: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getFilieres(etablissementId, cycleId).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, filieres: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  createFiliere(dto: CreateFiliereDto, onSuccess?: () => void): void {
    this.api.createFiliere(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, filieres: [...s.filieres, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateFiliere(id: string, dto: UpdateFiliereDto, onSuccess?: () => void): void {
    this.api.updateFiliere(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, filieres: s.filieres.map(f => f.id === id ? res.data : f),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteFiliere(id: string, onSuccess?: () => void): void {
    this.api.deleteFiliere(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s, filieres: s.filieres.filter(f => f.id !== id),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Niveaux ──────────────────────────────────────────────────────────────────
  loadNiveaux(filiereId: string): void {
    this.api.getNiveaux(filiereId).subscribe({
      next: res => this.state.update(s => ({ ...s, niveaux: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  createNiveau(dto: CreateNiveauDto, onSuccess?: () => void): void {
    this.api.createNiveau(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, niveaux: [...s.niveaux, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateNiveau(id: string, dto: UpdateNiveauDto, onSuccess?: () => void): void {
    this.api.updateNiveau(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, niveaux: s.niveaux.map(n => n.id === id ? res.data : n),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteNiveau(id: string, onSuccess?: () => void): void {
    this.api.deleteNiveau(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s, niveaux: s.niveaux.filter(n => n.id !== id),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Classes ──────────────────────────────────────────────────────────────────
  loadClasses(filters?: ClasseFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getClasses(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        classes: res.data,
        totalClasses: res.total,
        pageClasses: res.page,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectClasse(id: string): void {
    this.state.update(s => ({ ...s, loadingDetail: true }));
    this.api.getClasse(id).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingDetail: false, selectedClasse: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingDetail: false, error: err.message,
      })),
    });
  }

  createClasse(dto: CreateClasseDto, onSuccess?: (c: Classe) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createClasse(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          classes: [res.data, ...s.classes],
          totalClasses: s.totalClasses + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  updateClasse(id: string, dto: UpdateClasseDto, onSuccess?: () => void): void {
    this.api.updateClasse(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          classes: s.classes.map(c => c.id === id ? res.data : c),
          selectedClasse: s.selectedClasse?.id === id ? res.data : s.selectedClasse,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteClasse(id: string, onSuccess?: () => void): void {
    this.api.deleteClasse(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          classes: s.classes.filter(c => c.id !== id),
          totalClasses: s.totalClasses - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadApprenantsByClasse(classeId: string): void {
    this.state.update(s => ({ ...s, loadingApprenants: true }));
    this.api.getApprenantsByClasse(classeId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingApprenants: false, apprenants: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingApprenants: false, error: err.message,
      })),
    });
  }

  // ── Promotions ───────────────────────────────────────────────────────────────
  loadPromotions(filters?: PromotionFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getPromotions(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        promotions: res.data,
        totalPromotions: res.total,
        pagePromotions: res.page,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectPromotion(id: string): void {
    this.state.update(s => ({ ...s, loadingDetail: true }));
    this.api.getPromotion(id).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingDetail: false, selectedPromotion: res.data,
        }));
        this.loadGroupesByPromotion(id);
      },
      error: err => this.state.update(s => ({
        ...s, loadingDetail: false, error: err.message,
      })),
    });
  }

  createPromotion(dto: CreatePromotionDto, onSuccess?: (p: Promotion) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createPromotion(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          promotions: [res.data, ...s.promotions],
          totalPromotions: s.totalPromotions + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  updatePromotion(id: string, dto: UpdatePromotionDto, onSuccess?: () => void): void {
    this.api.updatePromotion(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          promotions: s.promotions.map(p => p.id === id ? res.data : p),
          selectedPromotion: s.selectedPromotion?.id === id ? res.data : s.selectedPromotion,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deletePromotion(id: string, onSuccess?: () => void): void {
    this.api.deletePromotion(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          promotions: s.promotions.filter(p => p.id !== id),
          totalPromotions: s.totalPromotions - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadEtudiantsByPromotion(promotionId: string): void {
    this.state.update(s => ({ ...s, loadingApprenants: true }));
    this.api.getEtudiantsByPromotion(promotionId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingApprenants: false, apprenants: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingApprenants: false, error: err.message,
      })),
    });
  }

  // ── Groupes ──────────────────────────────────────────────────────────────────
  loadGroupesByPromotion(promotionId: string): void {
    this.api.getGroupesByPromotion(promotionId).subscribe({
      next: res => this.state.update(s => ({ ...s, groupes: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  createGroupe(dto: CreateGroupeDto, onSuccess?: () => void): void {
    this.api.createGroupe(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, groupes: [...s.groupes, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateGroupe(id: string, dto: UpdateGroupeDto, onSuccess?: () => void): void {
    this.api.updateGroupe(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, groupes: s.groupes.map(g => g.id === id ? res.data : g),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteGroupe(id: string, onSuccess?: () => void): void {
    this.api.deleteGroupe(id).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, groupes: s.groupes.filter(g => g.id !== id) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  loadStats(etablissementId: string, anneeId?: string): void {
    this.api.getStats(etablissementId, anneeId).subscribe({
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
      selectedClasse: null,
      selectedPromotion: null,
      apprenants: [],
      groupes: [],
    }));
  }
}
