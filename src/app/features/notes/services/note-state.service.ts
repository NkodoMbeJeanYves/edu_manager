import { Injectable, computed, signal, inject } from '@angular/core';
import { NoteApiService } from '../../../core/services/note-api.service';
import {
  Evaluation, Note, MoyenneGenerale, MoyenneUE, StatistiquesEvaluation,
  CreateEvaluationDto, UpdateEvaluationDto,
  CreateNoteDto, UpdateNoteDto,
  SaisieNoteMasse, ValiderNotesDto, ApprecierMatiereDto,
  EvaluationFilters, NoteFilters,
} from '../../../core/models/note.models';

interface NoteState {
  evaluations: Evaluation[];
  selectedEvaluation: Evaluation | null;
  notes: Note[];
  moyennesClasse: MoyenneGenerale[];
  moyennesApprenant: MoyenneGenerale | null;
  moyennesUE: MoyenneUE[];
  statistiques: StatistiquesEvaluation | null;
  loading: boolean;
  loadingNotes: boolean;
  loadingMoyennes: boolean;
  calculEnCours: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: EvaluationFilters;
}

@Injectable({ providedIn: 'root' })
export class NoteStateService {
  private api = inject(NoteApiService);

  // ── état privé ──────────────────────────────────────────────────────────────
  private state = signal<NoteState>({
    evaluations: [],
    selectedEvaluation: null,
    notes: [],
    moyennesClasse: [],
    moyennesApprenant: null,
    moyennesUE: [],
    statistiques: null,
    loading: false,
    loadingNotes: false,
    loadingMoyennes: false,
    calculEnCours: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
    filters: {},
  });

  // ── signaux publics ─────────────────────────────────────────────────────────
  readonly evaluations         = computed(() => this.state().evaluations);
  readonly selectedEvaluation  = computed(() => this.state().selectedEvaluation);
  readonly notes               = computed(() => this.state().notes);
  readonly moyennesClasse      = computed(() => this.state().moyennesClasse);
  readonly moyennesApprenant   = computed(() => this.state().moyennesApprenant);
  readonly moyennesUE          = computed(() => this.state().moyennesUE);
  readonly statistiques        = computed(() => this.state().statistiques);
  readonly loading             = computed(() => this.state().loading);
  readonly loadingNotes        = computed(() => this.state().loadingNotes);
  readonly loadingMoyennes     = computed(() => this.state().loadingMoyennes);
  readonly calculEnCours       = computed(() => this.state().calculEnCours);
  readonly error               = computed(() => this.state().error);
  readonly total               = computed(() => this.state().total);
  readonly page                = computed(() => this.state().page);
  readonly limit               = computed(() => this.state().limit);
  readonly currentFilters      = computed(() => this.state().filters);

  // ── computed dérivés ────────────────────────────────────────────────────────
  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  readonly evaluationsEnBrouillon = computed(() =>
    this.evaluations().filter(e => e.statut === 'planifiee' || e.statut === 'en_cours')
  );
  readonly evaluationsValidees = computed(() =>
    this.evaluations().filter(e => e.statut === 'cloturee')
  );
  readonly notesSaisies = computed(() =>
    this.notes().filter(n => n.valeur !== null && !n.absent)
  );
  readonly notesAbsents = computed(() =>
    this.notes().filter(n => n.absent)
  );
  readonly notesMoyenne = computed(() => {
    const saisies = this.notesSaisies();
    if (!saisies.length) return null;
    const sum = saisies.reduce((acc, n) => acc + (n.valeur ?? 0), 0);
    return Math.round((sum / saisies.length) * 100) / 100;
  });
  readonly progressionSaisie = computed(() => {
    const total = this.notes().length;
    if (!total) return 0;
    const saisies = this.notes().filter(n => n.valeur !== null || n.absent || n.dispense).length;
    return Math.round((saisies / total) * 100);
  });
  readonly tousNotesValides = computed(() =>
    this.notes().length > 0 &&
    this.notes().every(n => n.statut === 'validee' || n.statut === 'publiee')
  );

  // ── actions : Évaluations ───────────────────────────────────────────────────
  loadEvaluations(filters?: EvaluationFilters): void {
    const f = filters ?? this.state().filters;
    this.state.update(s => ({ ...s, loading: true, error: null, filters: f }));
    this.api.getEvaluations(f).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        evaluations: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectEvaluation(id: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getEvaluation(id).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loading: false, selectedEvaluation: res.data }));
        this.loadNotesByEvaluation(id);
        this.loadStatistiques(id);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  createEvaluation(dto: CreateEvaluationDto, onSuccess?: (e: Evaluation) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createEvaluation(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          evaluations: [res.data, ...s.evaluations],
          total: s.total + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  updateEvaluation(id: string, dto: UpdateEvaluationDto, onSuccess?: () => void): void {
    this.api.updateEvaluation(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          evaluations: s.evaluations.map(e => e.id === id ? res.data : e),
          selectedEvaluation: s.selectedEvaluation?.id === id ? res.data : s.selectedEvaluation,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteEvaluation(id: string, onSuccess?: () => void): void {
    this.api.deleteEvaluation(id).subscribe({
      next: () => {
        this.state.update(s => ({
          ...s,
          evaluations: s.evaluations.filter(e => e.id !== id),
          total: s.total - 1,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Notes ─────────────────────────────────────────────────────────
  loadNotesByEvaluation(evaluationId: string): void {
    this.state.update(s => ({ ...s, loadingNotes: true }));
    this.api.getNotesByEvaluation(evaluationId).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingNotes: false, notes: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingNotes: false, error: err.message })),
    });
  }

  saisirNotesMasse(dto: SaisieNoteMasse, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingNotes: true, error: null }));
    this.api.saisirNotesMasse(dto).subscribe({
      next: res => {
        this.state.update(s => {
          const updated = s.notes.map(n => {
            const newNote = res.data.find(nn => nn.apprenantId === n.apprenantId);
            return newNote ?? n;
          });
          const added = res.data.filter(n => !s.notes.some(existing => existing.apprenantId === n.apprenantId));
          return { ...s, loadingNotes: false, notes: [...updated, ...added] };
        });
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, loadingNotes: false, error: err.message })),
    });
  }

  updateNote(id: string, dto: UpdateNoteDto, onSuccess?: () => void): void {
    this.api.updateNote(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          notes: s.notes.map(n => n.id === id ? res.data : n),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Workflow ──────────────────────────────────────────────────────
  soumettreNotes(evaluationId: string, onSuccess?: () => void): void {
    this.api.soumettreNotes(evaluationId).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          evaluations: s.evaluations.map(e => e.id === evaluationId ? res.data : e),
          selectedEvaluation: s.selectedEvaluation?.id === evaluationId
            ? res.data
            : s.selectedEvaluation,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  validerNotes(dto: ValiderNotesDto, onSuccess?: () => void): void {
    this.api.validerNotes(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          evaluations: s.evaluations.map(e => e.id === dto.evaluationId ? res.data : e),
          selectedEvaluation: s.selectedEvaluation?.id === dto.evaluationId
            ? res.data
            : s.selectedEvaluation,
          notes: s.notes.map(n => ({ ...n, statut: 'validee' as const })),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  publierNotes(evaluationId: string, onSuccess?: () => void): void {
    this.api.publierNotes({ evaluationId }).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          evaluations: s.evaluations.map(e => e.id === evaluationId ? res.data : e),
          notes: s.notes.map(n => ({ ...n, statut: 'publiee' as const })),
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Moyennes ──────────────────────────────────────────────────────
  loadMoyennesClasse(
    classeOuPromotionId: string,
    periodeId: string,
    type: 'classe' | 'promotion' = 'classe'
  ): void {
    this.state.update(s => ({ ...s, loadingMoyennes: true }));
    this.api.getMoyennesClasse(classeOuPromotionId, periodeId, type).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingMoyennes: false, moyennesClasse: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingMoyennes: false, error: err.message,
      })),
    });
  }

  loadMoyennesApprenant(apprenantId: string, anneeId: string): void {
    this.api.getMoyennesApprenant(apprenantId, anneeId).subscribe({
      next: res => this.state.update(s => ({ ...s, moyennesApprenant: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  calculerMoyennes(periodeId: string, classeId?: string, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, calculEnCours: true, error: null }));
    this.api.calculerMoyennes(periodeId, classeId).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, calculEnCours: false }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, calculEnCours: false, error: err.message })),
    });
  }

  loadMoyennesUE(apprenantId: string, semestreId: string): void {
    this.api.getMoyennesUE(apprenantId, semestreId).subscribe({
      next: res => this.state.update(s => ({ ...s, moyennesUE: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadStatistiques(evaluationId: string): void {
    this.api.getStatistiques(evaluationId).subscribe({
      next: res => this.state.update(s => ({ ...s, statistiques: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  saisirAppreciation(dto: ApprecierMatiereDto, onSuccess?: () => void): void {
    this.api.saisirAppreciation(dto).subscribe({
      next: () => onSuccess?.(),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── utilitaires ─────────────────────────────────────────────────────────────
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearSelection(): void {
    this.state.update(s => ({
      ...s,
      selectedEvaluation: null,
      notes: [],
      statistiques: null,
    }));
  }
}
