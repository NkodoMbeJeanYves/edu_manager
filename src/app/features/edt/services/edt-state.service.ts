import { Injectable, computed, signal, inject } from '@angular/core';
import { EdtApiService } from '../../../core/services/edt-api.service';
import {
  CoursPlanifie, Seance, ConflitEDT, CreneauHoraire,
  EventCalendrier, StatsEDT, CouvertureMatiere,
  CreateCoursPlanifieDto, UpdateCoursPlanifieDto,
  CreateSeanceDto, UpdateSeanceDto,
  SaisirCahierTexteDto, GenererSeancesDto,
  SeanceFilters, EdtViewFilters,
} from '../../../core/models/edt.models';

interface EdtState {
  coursPlanifies: CoursPlanifie[];
  selectedCours: CoursPlanifie | null;
  seances: Seance[];
  selectedSeance: Seance | null;
  eventsCalendrier: EventCalendrier[];
  conflits: ConflitEDT[];
  creneaux: CreneauHoraire[];
  couverture: CouvertureMatiere[];
  stats: StatsEDT | null;
  vueActive: 'classe' | 'enseignant' | 'salle' | 'promotion';
  entityIdActive: string;
  semaineCourante: string;
  loading: boolean;
  loadingSeances: boolean;
  loadingCalendrier: boolean;
  loadingConflits: boolean;
  error: string | null;
  totalSeances: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class EdtStateService {
  private api = inject(EdtApiService);

  private state = signal<EdtState>({
    coursPlanifies: [],
    selectedCours: null,
    seances: [],
    selectedSeance: null,
    eventsCalendrier: [],
    conflits: [],
    creneaux: [],
    couverture: [],
    stats: null,
    vueActive: 'classe',
    entityIdActive: '',
    semaineCourante: this.lundiSemaineCourante(),
    loading: false,
    loadingSeances: false,
    loadingCalendrier: false,
    loadingConflits: false,
    error: null,
    totalSeances: 0,
    page: 1,
    limit: 50,
  });

  readonly coursPlanifies    = computed(() => this.state().coursPlanifies);
  readonly selectedCours     = computed(() => this.state().selectedCours);
  readonly seances           = computed(() => this.state().seances);
  readonly selectedSeance    = computed(() => this.state().selectedSeance);
  readonly eventsCalendrier  = computed(() => this.state().eventsCalendrier);
  readonly conflits          = computed(() => this.state().conflits);
  readonly creneaux          = computed(() => this.state().creneaux);
  readonly couverture        = computed(() => this.state().couverture);
  readonly stats             = computed(() => this.state().stats);
  readonly vueActive         = computed(() => this.state().vueActive);
  readonly entityIdActive    = computed(() => this.state().entityIdActive);
  readonly semaineCourante   = computed(() => this.state().semaineCourante);
  readonly loading           = computed(() => this.state().loading);
  readonly loadingSeances    = computed(() => this.state().loadingSeances);
  readonly loadingCalendrier = computed(() => this.state().loadingCalendrier);
  readonly loadingConflits   = computed(() => this.state().loadingConflits);
  readonly error             = computed(() => this.state().error);
  readonly totalSeances      = computed(() => this.state().totalSeances);

  readonly aConflits = computed(() => this.conflits().length > 0);

  readonly seancesParJour = computed(() => {
    const jours: Record<string, EventCalendrier[]> = {
      lundi: [], mardi: [], mercredi: [],
      jeudi: [], vendredi: [], samedi: [],
    };
    this.eventsCalendrier().forEach(ev => {
      const jour = this.jourFromDate(ev.date);
      if (jour && jours[jour]) jours[jour].push(ev);
    });
    return jours;
  });

  readonly seancesRealisees = computed(() =>
    this.seances().filter(s => s.statut === 'realisee')
  );
  readonly seancesAnnulees = computed(() =>
    this.seances().filter(s => s.statut === 'annulee')
  );
  readonly seancesEnAttente = computed(() =>
    this.seances().filter(s => s.statut === 'planifiee')
  );
  readonly tauxRealisation = computed(() => {
    const total = this.seances().length;
    if (!total) return 0;
    return Math.round((this.seancesRealisees().length / total) * 100);
  });
  readonly matieresSousCouverte = computed(() =>
    this.couverture().filter(c => c.taux < 50)
  );
  readonly joursDisponibles = computed((): string[] => {
    const lundi = new Date(this.semaineCourante());
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  });

  // ── Cours planifiés ─────────────────────────────────────────────────────────
  loadCoursPlanifies(
    etablissementId: string,
    anneeId: string,
    classeId?: string,
    promotionId?: string
  ): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getCoursPlanifies(etablissementId, anneeId, classeId, promotionId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, coursPlanifies: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  createCoursPlanifie(dto: CreateCoursPlanifieDto, onSuccess?: (c: CoursPlanifie) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createCoursPlanifie(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          coursPlanifies: [res.data, ...s.coursPlanifies],
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  updateCoursPlanifie(id: string, dto: UpdateCoursPlanifieDto, onSuccess?: () => void): void {
    this.api.updateCoursPlanifie(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          coursPlanifies: s.coursPlanifies.map(c => c.id === id ? res.data : c),
          selectedCours: s.selectedCours?.id === id ? res.data : s.selectedCours,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteCoursPlanifie(id: string, onSuccess?: () => void): void {
    this.api.deleteCoursPlanifie(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          coursPlanifies: s.coursPlanifies.filter(c => c.id !== id),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  genererSeances(dto: GenererSeancesDto, onSuccess?: (count: number) => void): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.genererSeances(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          seances: [...s.seances, ...res.data.seances],
        }));
        onSuccess?.(res.data.count);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  // ── Séances ──────────────────────────────────────────────────────────────────
  loadSeances(filters: SeanceFilters): void {
    this.state.update(s => ({ ...s, loadingSeances: true, error: null }));
    this.api.getSeances(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingSeances: false,
        seances: res.data,
        totalSeances: res.total,
        page: res.page,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingSeances: false, error: err.message,
      })),
    });
  }

  selectSeance(id: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getSeance(id).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, selectedSeance: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loading: false, error: err.message,
      })),
    });
  }

  createSeance(dto: CreateSeanceDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingConflits: true, error: null }));
    this.api.verifierConflits(dto).subscribe({
      next: conflitsRes => {
        this.state.update(s => ({
          ...s, loadingConflits: false, conflits: conflitsRes.data,
        }));
        if (conflitsRes.data.length === 0) {
          this.api.createSeance(dto).subscribe({
            next: res => {
              this.state.update(s => ({
                ...s, seances: [res.data, ...s.seances],
              }));
              onSuccess?.();
            },
            error: err => this.state.update(s => ({ ...s, error: err.message })),
          });
        }
      },
      error: err => this.state.update(s => ({
        ...s, loadingConflits: false, error: err.message,
      })),
    });
  }

  forceCreateSeance(dto: CreateSeanceDto, onSuccess?: () => void): void {
    this.api.createSeance(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, seances: [res.data, ...s.seances], conflits: [],
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  updateSeance(id: string, dto: UpdateSeanceDto, onSuccess?: () => void): void {
    this.api.updateSeance(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          seances: s.seances.map(se => se.id === id ? res.data : se),
          selectedSeance: s.selectedSeance?.id === id ? res.data : s.selectedSeance,
        }));
        this.refreshCalendrier();
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  annulerSeance(id: string, motif: string, onSuccess?: () => void): void {
    this.api.annulerSeance(id, motif).subscribe({
      next: res => {
        this.updateSeanceLocal(id, res.data);
        this.refreshCalendrier();
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  marquerRealisee(id: string, onSuccess?: () => void): void {
    this.api.marquerRealisee(id).subscribe({
      next: res => {
        this.updateSeanceLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  saisirCahierTexte(dto: SaisirCahierTexteDto, onSuccess?: () => void): void {
    this.api.saisirCahierTexte(dto).subscribe({
      next: res => {
        this.updateSeanceLocal(dto.seanceId, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  remplacerEnseignant(seanceId: string, remplacantId: string, onSuccess?: () => void): void {
    this.api.remplacerEnseignant(seanceId, remplacantId).subscribe({
      next: res => {
        this.updateSeanceLocal(seanceId, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Vue calendrier ────────────────────────────────────────────────────────
  loadCalendrier(filters: EdtViewFilters): void {
    this.state.update(s => ({
      ...s, loadingCalendrier: true, error: null,
      vueActive: filters.vue,
      entityIdActive: filters.entityId,
      semaineCourante: filters.semaine,
    }));
    this.api.getEdtView(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingCalendrier: false, eventsCalendrier: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingCalendrier: false, error: err.message,
      })),
    });
  }

  changerSemaine(delta: number): void {
    const lundi = new Date(this.semaineCourante());
    lundi.setDate(lundi.getDate() + delta * 7);
    const nouvelleSemaine = lundi.toISOString().split('T')[0];
    this.loadCalendrier({
      vue: this.vueActive(),
      entityId: this.entityIdActive(),
      semaine: nouvelleSemaine,
      anneeAcademiqueId: '',
    });
  }

  // ── Créneaux ─────────────────────────────────────────────────────────────────
  loadCreneaux(etablissementId: string): void {
    this.api.getCreneaux(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, creneaux: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── Stats & couverture ───────────────────────────────────────────────────────
  loadStats(etablissementId: string, anneeId: string, classeId?: string): void {
    this.api.getStats(etablissementId, anneeId, classeId).subscribe({
      next: res => this.state.update(s => ({ ...s, stats: res.data })),
      error: () => {},
    });
  }

  loadCouverture(classeOuPromotionId: string, periodeId?: string): void {
    this.api.getCouvertureParMatiere(classeOuPromotionId, periodeId).subscribe({
      next: res => this.state.update(s => ({ ...s, couverture: res.data })),
      error: () => {},
    });
  }

  // ── utilitaires ─────────────────────────────────────────────────────────────
  clearConflits(): void {
    this.state.update(s => ({ ...s, conflits: [] }));
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  private updateSeanceLocal(id: string, data: Seance): void {
    this.state.update(s => ({
      ...s,
      seances: s.seances.map(se => se.id === id ? data : se),
      selectedSeance: s.selectedSeance?.id === id ? data : s.selectedSeance,
    }));
  }

  private refreshCalendrier(): void {
    const s = this.state();
    if (s.entityIdActive) {
      this.loadCalendrier({
        vue: s.vueActive,
        entityId: s.entityIdActive,
        semaine: s.semaineCourante,
        anneeAcademiqueId: '',
      });
    }
  }

  private lundiSemaineCourante(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const lundi = new Date(now.setDate(diff));
    return lundi.toISOString().split('T')[0];
  }

  private jourFromDate(dateStr: string): string | null {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const d = new Date(dateStr);
    return jours[d.getDay()] ?? null;
  }
}
