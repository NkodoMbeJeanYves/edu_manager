import { Injectable, computed, signal, inject } from '@angular/core';
import { BulletinApiService } from '../../../core/services/bulletin-api.service';
import {
  Bulletin, ReleverNotes, Deliberation,
  GenererBulletinsDto, GenererReleveDto,
  ValiderDocumentDto, SignerDocumentDto,
  CreateDeliberationDto, UpdateDecisionDto, ApprecierBulletinDto,
  BulletinFilters, DeliberationFilters,
  StatsBulletins, StatsDeliberation,
} from '../../../core/models/bulletin.models';

interface BulletinState {
  bulletins: Bulletin[];
  selectedBulletin: Bulletin | null;
  releveApprenant: ReleverNotes[];
  deliberations: Deliberation[];
  selectedDeliberation: Deliberation | null;
  statsDeliberation: StatsDeliberation | null;
  statsBulletins: StatsBulletins | null;
  loading: boolean;
  loadingGeneration: boolean;
  loadingDeliberation: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class BulletinStateService {
  private api = inject(BulletinApiService);

  private state = signal<BulletinState>({
    bulletins: [],
    selectedBulletin: null,
    releveApprenant: [],
    deliberations: [],
    selectedDeliberation: null,
    statsDeliberation: null,
    statsBulletins: null,
    loading: false,
    loadingGeneration: false,
    loadingDeliberation: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  readonly bulletins             = computed(() => this.state().bulletins);
  readonly selectedBulletin      = computed(() => this.state().selectedBulletin);
  readonly releveApprenant       = computed(() => this.state().releveApprenant);
  readonly deliberations         = computed(() => this.state().deliberations);
  readonly selectedDeliberation  = computed(() => this.state().selectedDeliberation);
  readonly statsDeliberation     = computed(() => this.state().statsDeliberation);
  readonly statsBulletins        = computed(() => this.state().statsBulletins);
  readonly loading               = computed(() => this.state().loading);
  readonly loadingGeneration     = computed(() => this.state().loadingGeneration);
  readonly loadingDeliberation   = computed(() => this.state().loadingDeliberation);
  readonly error                 = computed(() => this.state().error);
  readonly total                 = computed(() => this.state().total);
  readonly page                  = computed(() => this.state().page);
  readonly limit                 = computed(() => this.state().limit);

  readonly bulletinsPublies = computed(() =>
    this.bulletins().filter(b => b.statut === 'publie')
  );
  readonly bulletinsEnAttente = computed(() =>
    this.bulletins().filter(b => ['brouillon', 'genere'].includes(b.statut))
  );
  readonly deliberationEnCours = computed(() =>
    this.deliberations().find(d => d.statut === 'en_cours') ?? null
  );
  readonly lignesAdmis = computed(() =>
    this.selectedDeliberation()?.lignes.filter(l =>
      l.decision === 'admis' || l.decision === 'passage'
    ) ?? []
  );
  readonly lignesAjournes = computed(() =>
    this.selectedDeliberation()?.lignes.filter(l =>
      l.decision === 'ajourne' || l.decision === 'admis_rattrapage'
    ) ?? []
  );
  readonly lignesRedoublants = computed(() =>
    this.selectedDeliberation()?.lignes.filter(l =>
      l.decision === 'redoublant' || l.decision === 'redoublement'
    ) ?? []
  );
  readonly tauxReussiteDeliberation = computed(() => {
    const lignes = this.selectedDeliberation()?.lignes ?? [];
    if (!lignes.length) return null;
    const admis = lignes.filter(l =>
      ['admis', 'passage', 'admis_rattrapage'].includes(l.decision ?? '')
    ).length;
    return Math.round((admis / lignes.length) * 100);
  });

  loadBulletins(filters?: BulletinFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getBulletins(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false,
        bulletins: res.data,
        total: res.total,
        page: res.page,
        limit: res.limit,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  selectBulletin(id: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getBulletin(id).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, selectedBulletin: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  genererBulletins(dto: GenererBulletinsDto, onSuccess?: (count: number) => void): void {
    this.state.update(s => ({ ...s, loadingGeneration: true, error: null }));
    this.api.genererBulletins(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingGeneration: false,
          bulletins: [...res.data.bulletins, ...s.bulletins.filter(b =>
            !res.data.bulletins.some(nb => nb.id === b.id)
          )],
        }));
        onSuccess?.(res.data.count);
      },
      error: err => this.state.update(s => ({
        ...s, loadingGeneration: false, error: err.message,
      })),
    });
  }

  validerBulletin(id: string, dto: ValiderDocumentDto, onSuccess?: () => void): void {
    this.api.validerBulletin(id, dto).subscribe({
      next: res => {
        this.updateBulletinLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  signerBulletin(id: string, dto: SignerDocumentDto, onSuccess?: () => void): void {
    this.api.signerBulletin(id, dto).subscribe({
      next: res => {
        this.updateBulletinLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  publierBulletins(periodeId: string, classeId?: string, onSuccess?: (count: number) => void): void {
    this.state.update(s => ({ ...s, loadingGeneration: true }));
    this.api.publierBulletins({ periodeId, classeOuPromotionId: classeId }).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingGeneration: false,
          bulletins: s.bulletins.map(b =>
            b.periodeId === periodeId ? { ...b, statut: 'publie' as const } : b
          ),
        }));
        onSuccess?.(res.data.count);
      },
      error: err => this.state.update(s => ({
        ...s, loadingGeneration: false, error: err.message,
      })),
    });
  }

  telechargerBulletin(id: string, nomFichier: string): void {
    this.api.telechargerBulletin(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  apprecerBulletin(dto: ApprecierBulletinDto, onSuccess?: () => void): void {
    this.api.apprecerBulletin(dto).subscribe({
      next: res => {
        this.updateBulletinLocal(res.data.id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadStatsBulletins(etablissementId?: string, periodeId?: string): void {
    this.api.getStatsBulletins(etablissementId, periodeId).subscribe({
      next: res => this.state.update(s => ({ ...s, statsBulletins: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadReleveApprenant(apprenantId: string, anneeId?: string, periodeId?: string): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getReleveApprenant(apprenantId, anneeId, periodeId).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, releveApprenant: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  genererRelevePromotion(dto: GenererReleveDto, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingGeneration: true, error: null }));
    this.api.genererReleve(dto).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, loadingGeneration: false }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({
        ...s, loadingGeneration: false, error: err.message,
      })),
    });
  }

  telechargerReleve(id: string, nomFichier: string): void {
    this.api.telechargerReleve(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadDeliberations(filters?: DeliberationFilters): void {
    this.state.update(s => ({ ...s, loadingDeliberation: true, error: null }));
    this.api.getDeliberations(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loadingDeliberation: false,
        deliberations: res.data,
        total: res.total,
      })),
      error: err => this.state.update(s => ({
        ...s, loadingDeliberation: false, error: err.message,
      })),
    });
  }

  selectDeliberation(id: string): void {
    this.state.update(s => ({ ...s, loadingDeliberation: true }));
    this.api.getDeliberation(id).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingDeliberation: false, selectedDeliberation: res.data,
        }));
        this.loadStatsDeliberation(id);
      },
      error: err => this.state.update(s => ({
        ...s, loadingDeliberation: false, error: err.message,
      })),
    });
  }

  createDeliberation(dto: CreateDeliberationDto, onSuccess?: (d: Deliberation) => void): void {
    this.state.update(s => ({ ...s, loadingDeliberation: true, error: null }));
    this.api.createDeliberation(dto).subscribe({
      next: res => {
        this.state.update(s => ({
          ...s, loadingDeliberation: false,
          deliberations: [res.data, ...s.deliberations],
        }));
        onSuccess?.(res.data);
      },
      error: err => this.state.update(s => ({
        ...s, loadingDeliberation: false, error: err.message,
      })),
    });
  }

  preparerDeliberation(id: string, onSuccess?: () => void): void {
    this.api.preparerDeliberation(id).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  appliquerCompensation(id: string, onSuccess?: () => void): void {
    this.state.update(s => ({ ...s, loadingDeliberation: true }));
    this.api.appliquerCompensation(id).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        this.state.update(s => ({ ...s, loadingDeliberation: false }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({
        ...s, loadingDeliberation: false, error: err.message,
      })),
    });
  }

  updateDecision(id: string, dto: UpdateDecisionDto, onSuccess?: () => void): void {
    this.api.updateDecision(id, dto).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  cloturerDeliberation(id: string, onSuccess?: () => void): void {
    this.api.cloturerDeliberation(id).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  signerDeliberation(id: string, dto: SignerDocumentDto, onSuccess?: () => void): void {
    this.api.signerDeliberation(id, dto).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  publierDeliberation(id: string, onSuccess?: () => void): void {
    this.api.publierDeliberation(id).subscribe({
      next: res => {
        this.updateDeliberationLocal(id, res.data);
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  telechargerPV(id: string): void {
    this.api.telechargerPV(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PV_deliberation_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadStatsDeliberation(id: string): void {
    this.api.getStatsDeliberation(id).subscribe({
      next: res => this.state.update(s => ({ ...s, statsDeliberation: res.data })),
      error: () => {},
    });
  }

  private updateBulletinLocal(id: string, data: Bulletin): void {
    this.state.update(s => ({
      ...s,
      bulletins: s.bulletins.map(b => b.id === id ? data : b),
      selectedBulletin: s.selectedBulletin?.id === id ? data : s.selectedBulletin,
    }));
  }

  private updateDeliberationLocal(id: string, data: Deliberation): void {
    this.state.update(s => ({
      ...s,
      deliberations: s.deliberations.map(d => d.id === id ? data : d),
      selectedDeliberation: s.selectedDeliberation?.id === id ? data : s.selectedDeliberation,
    }));
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  clearSelection(): void {
    this.state.update(s => ({
      ...s,
      selectedBulletin: null,
      selectedDeliberation: null,
      statsDeliberation: null,
    }));
  }
}
