import { Injectable, computed, signal } from '@angular/core';
import { Apprenant, ApprenantFilters } from '../../../core/models/apprenant.models';

interface ApprenantState {
  apprenants: Apprenant[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Stub minimal — sera remplacé par l'implémentation complète du module M04.
 * Fournit juste les signals et méthodes utilisés par les autres modules
 * (inscriptions, notes, bulletins) pour éviter les erreurs de compilation.
 */
@Injectable({ providedIn: 'root' })
export class ApprenantStateService {
  private state = signal<ApprenantState>({
    apprenants: [],
    loading: false,
    error: null,
    total: 0,
  });

  readonly apprenants = computed(() => this.state().apprenants);
  readonly loading    = computed(() => this.state().loading);
  readonly error      = computed(() => this.state().error);
  readonly total      = computed(() => this.state().total);

  load(_filters?: ApprenantFilters): void {
    // No-op stub. À implémenter dans M04 (Apprenants).
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }
}
