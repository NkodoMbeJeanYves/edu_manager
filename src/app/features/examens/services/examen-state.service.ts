import { Injectable, computed, signal, inject } from '@angular/core';
import { ExamenApiService } from '../../../core/services/examen-api.service';
import {
  SessionExamen, Epreuve, Convocation,
  CreateSessionDto, CreateEpreuveDto, GenererConvocationsDto,
  SessionFilters,
} from '../../../core/models/examen.models';

interface ExamenState {
  sessions: SessionExamen[];
  selectedSession: SessionExamen | null;
  epreuves: Epreuve[];
  convocations: Convocation[];
  loading: boolean;
  loadingEpreuves: boolean;
  error: string | null;
  total: number;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class ExamenStateService {
  private api = inject(ExamenApiService);

  private state = signal<ExamenState>({
    sessions: [], selectedSession: null, epreuves: [],
    convocations: [], loading: false, loadingEpreuves: false,
    error: null, total: 0, page: 1,
  });

  readonly sessions           = computed(() => this.state().sessions);
  readonly selectedSession    = computed(() => this.state().selectedSession);
  readonly epreuves           = computed(() => this.state().epreuves);
  readonly convocations       = computed(() => this.state().convocations);
  readonly loading            = computed(() => this.state().loading);
  readonly loadingEpreuves    = computed(() => this.state().loadingEpreuves);
  readonly error              = computed(() => this.state().error);
  readonly total              = computed(() => this.state().total);

  readonly sessionsActives    = computed(() => this.state().sessions.filter(s => s.statut === 'planifiee' || s.statut === 'en_cours'));
  readonly sessionsRattrapage = computed(() => this.state().sessions.filter(s => s.type === 'rattrapage'));
  readonly convocationsIneligibles = computed(() => this.state().convocations.filter(c => !c.eligible));

  loadSessions(filters?: SessionFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getSessions(filters).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, sessions: res.data, total: res.total })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectSession(id: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getSession(id).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loading: false, selectedSession: res.data }));
        this.loadEpreuves(id);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  createSession(dto: CreateSessionDto, onSuccess?: (s: SessionExamen) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createSession(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, loading: false, sessions: [res.data, ...s.sessions] }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  cloturerSession(id: string, onSuccess?: () => void): void {
    this.api.cloturerSession(id).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, sessions: s.sessions.map(se => se.id === id ? res.data : se) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadEpreuves(sessionId: string): void {
    this.state.update(s => ({ ...s, loadingEpreuves: true }));
    this.api.getEpreuves(sessionId).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingEpreuves: false, epreuves: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingEpreuves: false, error: err.message })),
    });
  }

  createEpreuve(dto: CreateEpreuveDto, onSuccess?: () => void): void {
    this.api.createEpreuve(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, epreuves: [res.data, ...s.epreuves] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteEpreuve(id: string, onSuccess?: () => void): void {
    this.api.deleteEpreuve(id).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, epreuves: s.epreuves.filter(e => e.id !== id) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  genererConvocations(dto: GenererConvocationsDto, onSuccess?: (count: number) => void): void {
    this.api.genererConvocations(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, convocations: res.data.convocations }));
        onSuccess?.(res.data.count);
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadConvocations(epreuveId: string): void {
    this.api.getConvocationsEpreuve(epreuveId).subscribe({
      next: res => this.state.update(s => ({ ...s, convocations: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  telechargerConvocation(id: string): void {
    this.api.telechargerConvocation(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `convocation_${id}.pdf`; a.click();
        URL.revokeObjectURL(url);
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  clearError(): void { this.state.update(s => ({ ...s, error: null })); }
}
