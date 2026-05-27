import { Injectable, computed, signal, inject } from '@angular/core';
import { InscriptionApiService } from '../../../core/services/inscription-api.service';
import {
  Inscription, PeriodeInscription, HistoriqueStatut,
  CreateInscriptionDto, UpdateInscriptionDto,
  ValiderInscriptionDto, RejeterInscriptionDto,
  AffecterClasseDto, CreatePeriodeInscriptionDto,
  InscriptionFilters, InscriptionStats,
  StatutInscription,
} from '../../../core/models/inscription.models';

interface InscriptionState {
  inscriptions: Inscription[];
  selected: Inscription | null;
  historique: HistoriqueStatut[];
  periodes: PeriodeInscription[];
  stats: InscriptionStats | null;
  eligibilite: { eligible: boolean; blocages: string[] } | null;
  loading: boolean;
  loadingDetail: boolean;
  loadingPeriodes: boolean;
  loadingEligibilite: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: InscriptionFilters;
}

@Injectable({ providedIn: 'root' })
export class InscriptionStateService {
  private api = inject(InscriptionApiService);

  // ── état privé ──────────────────────────────────────────────────────────────
  private state = signal<InscriptionState>({
    inscriptions: [],
    selected: null,
    historique: [],
    periodes: [],
    stats: null,
    eligibilite: null,
    loading: false,
    loadingDetail: false,
    loadingPeriodes: false,
    loadingEligibilite: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
    filters: {},
  });

  // ── signaux publics ─────────────────────────────────────────────────────────
  readonly inscriptions        = computed(() => this.state().inscriptions);
  readonly selected            = computed(() => this.state().selected);
  readonly historique          = computed(() => this.state().historique);
  readonly periodes            = computed(() => this.state().periodes);
  readonly stats               = computed(() => this.state().stats);
  readonly eligibilite         = computed(() => this.state().eligibilite);
  readonly loading             = computed(() => this.state().loading);
  readonly loadingDetail       = computed(() => this.state().loadingDetail);
  readonly loadingPeriodes     = computed(() => this.state().loadingPeriodes);
  readonly loadingEligibilite  = computed(() => this.state().loadingEligibilite);
  readonly error               = computed(() => this.state().error);
  readonly total               = computed(() => this.state().total);
  readonly page                = computed(() => this.state().page);
  readonly limit               = computed(() => this.state().limit);

  // ── computed dérivés ────────────────────────────────────────────────────────
  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  readonly inscriptionsEnAttente = computed(() =>
    this.inscriptions().filter(i =>
      ['incomplete', 'complete', 'en_validation'].includes(i.statut)
    )
  );
  readonly inscriptionsValidees = computed(() =>
    this.inscriptions().filter(i => i.statut === 'validee')
  );
  readonly inscriptionsRejetees = computed(() =>
    this.inscriptions().filter(i => i.statut === 'rejetee')
  );
  readonly listeAttente = computed(() =>
    this.inscriptions().filter(i => i.listAttente)
  );
  readonly periodeOuverte = computed(() =>
    this.periodes().find(p => p.ouverte) ?? null
  );
  readonly peutEtreReinscrit = computed(() =>
    this.eligibilite()?.eligible ?? null
  );
  readonly blocagesReinscription = computed(() =>
    this.eligibilite()?.blocages ?? []
  );

  // ── actions : Inscriptions ──────────────────────────────────────────────────
  load(filters?: InscriptionFilters): void {
    const f = filters ?? this.state().filters;
    this.state.update(s => ({ ...s, loading: true, error: null, filters: f }));
    this.api.getInscriptions(f).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        inscriptions: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  loadPage(page: number): void {
    this.load({ ...this.state().filters, page });
  }

  select(id: string): void {
    this.state.update(s => ({ ...s, loadingDetail: true, error: null }));
    this.api.getInscription(id).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingDetail: false, selected: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingDetail: false, error: err.message })),
    });
  }

  loadByApprenant(apprenantId: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getInscriptionsByApprenant(apprenantId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, inscriptions: res.data, total: res.data.length,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  create(dto: CreateInscriptionDto, onSuccess?: (i: Inscription) => void): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.createInscription(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          inscriptions: [res.data, ...s.inscriptions],
          total: s.total + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  update(id: string, dto: UpdateInscriptionDto, onSuccess?: () => void): void {
    this.api.updateInscription(id, dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s,
          inscriptions: s.inscriptions.map(i => i.id === id ? res.data : i),
          selected: s.selected?.id === id ? res.data : s.selected,
        }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  soumettre(id: string, onSuccess?: () => void): void {
    this.api.soumettre(id).subscribe({
      next: res => {
        this.updateLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  valider(id: string, dto: ValiderInscriptionDto, onSuccess?: () => void): void {
    this.api.valider(id, dto).subscribe({
      next: res => {
        this.updateLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  rejeter(id: string, dto: RejeterInscriptionDto, onSuccess?: () => void): void {
    this.api.rejeter(id, dto).subscribe({
      next: res => {
        this.updateLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  annuler(id: string, motif: string, onSuccess?: () => void): void {
    this.api.annuler(id, motif).subscribe({
      next: res => {
        this.updateLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  affecterClasse(dto: AffecterClasseDto, onSuccess?: () => void): void {
    this.api.affecterClasse(dto).subscribe({
      next: res => {
        this.updateLocal(dto.inscriptionId, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadHistorique(id: string): void {
    this.api.getHistorique(id).subscribe({
      next: res => this.state.update(s => ({ ...s, historique: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadStats(etablissementId?: string, anneeId?: string): void {
    this.api.getStats(etablissementId, anneeId).subscribe({
      next: res => this.state.update(s => ({ ...s, stats: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── actions : Réinscription ─────────────────────────────────────────────────
  verifierEligibilite(apprenantId: string, anneeAcademiqueId: string): void {
    this.state.update(s => ({ ...s, loadingEligibilite: true, eligibilite: null }));
    this.api.verifierEligibiliteReinscription(apprenantId, anneeAcademiqueId).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingEligibilite: false, eligibilite: res.data,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingEligibilite: false, error: err.message,
      })),
    });
  }

  initierReinscription(
    apprenantId: string,
    anneeAcademiqueId: string,
    onSuccess?: (i: Inscription) => void
  ): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.initierReinscription(apprenantId, anneeAcademiqueId).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loading: false,
          inscriptions: [res.data, ...s.inscriptions],
          total: s.total + 1,
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  // ── actions : Périodes ──────────────────────────────────────────────────────
  loadPeriodes(etablissementId: string): void {
    this.state.update(s => ({ ...s, loadingPeriodes: true }));
    this.api.getPeriodes(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingPeriodes: false, periodes: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingPeriodes: false, error: err.message })),
    });
  }

  createPeriode(dto: CreatePeriodeInscriptionDto, onSuccess?: () => void): void {
    this.api.createPeriode(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, periodes: [...s.periodes, res.data] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  ouvrirPeriode(id: string): void {
    this.api.ouvrirPeriode(id).subscribe({
      next: res => this.state.update(s => ({
        ...s, periodes: s.periodes.map(p => ({ ...p, ouverte: p.id === id ? true : false })),
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  fermerPeriode(id: string): void {
    this.api.fermerPeriode(id).subscribe({
      next: () => this.state.update(s => ({
        ...s, periodes: s.periodes.map(p => p.id === id ? { ...p, ouverte: false } : p),
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deletePeriode(id: string): void {
    this.api.deletePeriode(id).subscribe({
      next: () => this.state.update(s => ({
        ...s, periodes: s.periodes.filter(p => p.id !== id),
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  // ── utilitaires ─────────────────────────────────────────────────────────────
  private updateLocal(id: string, data: Inscription): void {
    this.state.update(s => ({
      ...s,
      inscriptions: s.inscriptions.map(i => i.id === id ? data : i),
      selected: s.selected?.id === id ? data : s.selected,
    }));
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearSelection(): void {
    this.state.update(s => ({ ...s, selected: null, historique: [], eligibilite: null }));
  }
}
