import { Injectable, computed, signal, inject } from '@angular/core';
import { ReportingApiService } from '../../../core/services/reporting-api.service';
import {
  TableauBordDirection, RapportPedagogique, RapportAbsenteisme,
  RapportFinancier, IndicateursTempsReel,
  FiltresRapport, ExporterRapportDto,
} from '../../../core/models/reporting.models';

@Injectable({ providedIn: 'root' })
export class ReportingStateService {
  private api = inject(ReportingApiService);

  private state = signal({
    tableauBord: null as TableauBordDirection | null,
    rapportPedagogique: null as RapportPedagogique | null,
    rapportAbsenteisme: null as RapportAbsenteisme | null,
    rapportFinancier: null as RapportFinancier | null,
    indicateursReel: null as IndicateursTempsReel | null,
    loading: false,
    loadingRapport: false,
    exportEnCours: false,
    error: null as string | null,
  });

  readonly tableauBord        = computed(() => this.state().tableauBord);
  readonly rapportPedagogique = computed(() => this.state().rapportPedagogique);
  readonly rapportAbsenteisme = computed(() => this.state().rapportAbsenteisme);
  readonly rapportFinancier   = computed(() => this.state().rapportFinancier);
  readonly indicateursReel    = computed(() => this.state().indicateursReel);
  readonly loading            = computed(() => this.state().loading);
  readonly loadingRapport     = computed(() => this.state().loadingRapport);
  readonly exportEnCours      = computed(() => this.state().exportEnCours);
  readonly error              = computed(() => this.state().error);

  // Computed dérivés
  readonly alertesCritiques = computed(() =>
    this.tableauBord()?.alertes.filter(a => a.niveau === 'critical') ?? []
  );
  readonly alertesWarning = computed(() =>
    this.tableauBord()?.alertes.filter(a => a.niveau === 'warning') ?? []
  );
  readonly tauxReussiteGlobal = computed(() =>
    this.tableauBord()?.pedagogique.tauxReussite ?? null
  );
  readonly tauxRecouvrementGlobal = computed(() =>
    this.tableauBord()?.financier.tauxRecouvrement ?? null
  );

  loadTableauBord(filtres: FiltresRapport): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getTableauBord(filtres).subscribe({
      next: res => this.state.update(s => ({ ...s, loading: false, tableauBord: res.data })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  loadIndicateursReel(etablissementId: string): void {
    this.api.getIndicateursTempsReel(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, indicateursReel: res.data })),
      error: () => {},
    });
  }

  loadRapportPedagogique(filtres: FiltresRapport): void {
    this.state.update(s => ({ ...s, loadingRapport: true }));
    this.api.getRapportClasse(filtres).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingRapport: false, rapportPedagogique: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingRapport: false, error: err.message })),
    });
  }

  loadRapportAbsenteisme(filtres: FiltresRapport): void {
    this.state.update(s => ({ ...s, loadingRapport: true }));
    this.api.getRapportAbsenteisme(filtres).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingRapport: false, rapportAbsenteisme: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingRapport: false, error: err.message })),
    });
  }

  loadRapportFinancier(filtres: FiltresRapport): void {
    this.state.update(s => ({ ...s, loadingRapport: true }));
    this.api.getRapportFinancier(filtres).subscribe({
      next: res => this.state.update(s => ({ ...s, loadingRapport: false, rapportFinancier: res.data })),
      error: err => this.state.update(s => ({ ...s, loadingRapport: false, error: err.message })),
    });
  }

  exporterRapport(dto: ExporterRapportDto, nomFichier?: string): void {
    this.state.update(s => ({ ...s, exportEnCours: true }));
    this.api.exporterRapport(dto).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier ?? `rapport_${dto.type}_${dto.format}`;
        a.click();
        URL.revokeObjectURL(url);
        this.state.update(s => ({ ...s, exportEnCours: false }));
      },
      error: err => this.state.update(s => ({ ...s, exportEnCours: false, error: err.message })),
    });
  }

  clearError(): void { this.state.update(s => ({ ...s, error: null })); }
}
