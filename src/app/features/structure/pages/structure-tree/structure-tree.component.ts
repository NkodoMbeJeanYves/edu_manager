import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { StructureStateService } from '../../services/structure-state.service';
import { CycleFormDialogComponent } from '../../components/cycle-form-dialog/cycle-form-dialog.component';
import { FiliereFormDialogComponent } from '../../components/filiere-form-dialog/filiere-form-dialog.component';
import { NiveauFormDialogComponent } from '../../components/niveau-form-dialog/niveau-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EtablissementStateService } from '../../../etablissements/services/etablissement-state.service';
import { Cycle, Filiere, Niveau } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-structure-tree',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatCardModule, MatTooltipModule, MatMenuModule, MatExpansionModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Structure académique</h1>
          <p class="page-sub">Cycles · Filières · Niveaux</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button [routerLink]="['classes']">
            <mat-icon>class</mat-icon> Classes
          </button>
          <button mat-stroked-button [routerLink]="['promotions']">
            <mat-icon>groups</mat-icon> Promotions
          </button>
          <button mat-raised-button color="primary" (click)="openCycleDialog()">
            <mat-icon>add</mat-icon> Nouveau cycle
          </button>
        </div>
      </div>

      @if (state.stats(); as stats) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-v">{{ stats.totalCycles }}</div>
            <div class="stat-l">Cycles</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-v">{{ stats.totalFilieres }}</div>
            <div class="stat-l">Filières</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-v">{{ stats.totalNiveaux }}</div>
            <div class="stat-l">Niveaux</div>
          </mat-card>
          <mat-card class="stat-card stat-scolaire">
            <div class="stat-v">{{ stats.totalClasses }}</div>
            <div class="stat-l">Classes</div>
          </mat-card>
          <mat-card class="stat-card stat-univ">
            <div class="stat-v">{{ stats.totalPromotions }}</div>
            <div class="stat-l">Promotions</div>
          </mat-card>
          <mat-card class="stat-card stat-effectif">
            <div class="stat-v">{{ stats.effectifTotal }}</div>
            <div class="stat-l">Apprenants</div>
          </mat-card>
        </div>
      }

      @if (state.loading()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (state.error()) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ state.error() }}</span>
          <button mat-icon-button (click)="state.clearError()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <div class="tree-sections">

        <!-- Section Scolaire -->
        <div class="section-block">
          <div class="section-title">
            <mat-icon>school</mat-icon>
            <span>Formation scolaire</span>
            <mat-chip class="chip-scolaire">Secondaire</mat-chip>
          </div>

          @for (cycle of state.cyclesScolaires(); track cycle.id) {
            <mat-expansion-panel class="cycle-panel" [expanded]="expandedCycles.has(cycle.id)"
                                 (opened)="onCycleOpen(cycle)"
                                 (closed)="expandedCycles.delete(cycle.id)">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="cycle-header">
                    <span class="cycle-code">{{ cycle.code }}</span>
                    <span class="cycle-nom">{{ cycle.libelle }}</span>
                    <mat-chip [class]="'chip-type-cycle chip-' + cycle.type">
                      {{ cyclTypeLabel(cycle.type) }}
                    </mat-chip>
                    @if (!cycle.actif) {
                      <mat-chip class="chip-inactif">Inactif</mat-chip>
                    }
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  {{ state.filieresByCycle(cycle.id)().length }} filière(s)
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="cycle-actions">
                <button mat-stroked-button (click)="openFiliereDialog(cycle.id, 'scolaire')">
                  <mat-icon>add</mat-icon> Ajouter une filière
                </button>
                <button mat-icon-button (click)="openCycleDialog(cycle)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="confirmDeleteCycle(cycle)" color="warn" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div class="filieres-list">
                @for (filiere of state.filieresByCycle(cycle.id)(); track filiere.id) {
                  <mat-card class="filiere-card">
                    <div class="filiere-header">
                      <div class="filiere-info">
                        <span class="filiere-code">{{ filiere.code }}</span>
                        <span class="filiere-nom">{{ filiere.libelle }}</span>
                      </div>
                      <div class="filiere-actions">
                        <button mat-icon-button (click)="openNiveauDialog(filiere)"
                                matTooltip="Ajouter un niveau">
                          <mat-icon>add</mat-icon>
                        </button>
                        <button mat-icon-button
                                (click)="openFiliereDialog(cycle.id, 'scolaire', filiere)"
                                matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button
                                (click)="confirmDeleteFiliere(filiere)"
                                color="warn" matTooltip="Supprimer">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>

                    <div class="niveaux-chips">
                      @for (niv of state.niveauxByFiliere(filiere.id)(); track niv.id) {
                        <div class="niveau-item">
                          <mat-chip class="chip-niveau">{{ niv.libelle }}</mat-chip>
                          <div class="niveau-actions">
                            <button mat-icon-button
                                    [routerLink]="['classes']"
                                    [queryParams]="{ niveauId: niv.id }"
                                    matTooltip="Voir les classes">
                              <mat-icon>class</mat-icon>
                            </button>
                            <button mat-icon-button
                                    (click)="openNiveauDialog(filiere, niv)"
                                    matTooltip="Modifier">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button
                                    (click)="confirmDeleteNiveau(niv)"
                                    color="warn" matTooltip="Supprimer">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </div>
                      }
                      @empty {
                        <span class="no-niveaux">Aucun niveau — cliquer sur + pour en ajouter</span>
                      }
                    </div>
                  </mat-card>
                }
                @empty {
                  <div class="empty-filieres">
                    <mat-icon>info</mat-icon>
                    Aucune filière dans ce cycle
                  </div>
                }
              </div>
            </mat-expansion-panel>
          }

          @if (state.cyclesScolaires().length === 0 && !state.loading()) {
            <div class="empty-section">
              <mat-icon>school</mat-icon>
              <p>Aucun cycle scolaire défini</p>
              <button mat-raised-button color="primary"
                      (click)="openCycleDialog(undefined, 'scolaire')">
                Créer un cycle scolaire
              </button>
            </div>
          }
        </div>

        <!-- Section Universitaire -->
        <div class="section-block">
          <div class="section-title">
            <mat-icon>account_balance</mat-icon>
            <span>Formation universitaire / supérieure</span>
            <mat-chip class="chip-univ">Supérieur</mat-chip>
          </div>

          @for (cycle of state.cyclesUniversitaires(); track cycle.id) {
            <mat-expansion-panel class="cycle-panel univ-panel"
                                 [expanded]="expandedCycles.has(cycle.id)"
                                 (opened)="onCycleOpen(cycle)"
                                 (closed)="expandedCycles.delete(cycle.id)">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="cycle-header">
                    <span class="cycle-code">{{ cycle.code }}</span>
                    <span class="cycle-nom">{{ cycle.libelle }}</span>
                    <mat-chip class="chip-univ-sm">{{ cyclTypeLabel(cycle.type) }}</mat-chip>
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  {{ state.filieresByCycle(cycle.id)().length }} filière(s)
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="cycle-actions">
                <button mat-stroked-button (click)="openFiliereDialog(cycle.id, 'universitaire')">
                  <mat-icon>add</mat-icon> Ajouter une filière
                </button>
                <button mat-icon-button (click)="openCycleDialog(cycle)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>

              <div class="filieres-list">
                @for (filiere of state.filieresByCycle(cycle.id)(); track filiere.id) {
                  <mat-card class="filiere-card filiere-univ">
                    <div class="filiere-header">
                      <div class="filiere-info">
                        <span class="filiere-code">{{ filiere.code }}</span>
                        <span class="filiere-nom">{{ filiere.libelle }}</span>
                        @if (filiere.dureeAnnees) {
                          <span class="filiere-duree">{{ filiere.dureeAnnees }} ans</span>
                        }
                        @if (filiere.systemeLMD) {
                          <mat-chip class="chip-lmd">{{ filiere.systemeLMD | uppercase }}</mat-chip>
                        }
                      </div>
                      <div class="filiere-actions">
                        <button mat-icon-button (click)="openNiveauDialog(filiere)"
                                matTooltip="Ajouter un niveau (L1, M1…)">
                          <mat-icon>add</mat-icon>
                        </button>
                        <button mat-icon-button
                                (click)="openFiliereDialog(cycle.id, 'universitaire', filiere)"
                                matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="confirmDeleteFiliere(filiere)" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="niveaux-chips">
                      @for (niv of state.niveauxByFiliere(filiere.id)(); track niv.id) {
                        <div class="niveau-item">
                          <mat-chip class="chip-niveau-univ">{{ niv.libelle }}</mat-chip>
                          <div class="niveau-actions">
                            <button mat-icon-button
                                    [routerLink]="['promotions']"
                                    [queryParams]="{ niveauId: niv.id }"
                                    matTooltip="Voir les promotions">
                              <mat-icon>groups</mat-icon>
                            </button>
                            <button mat-icon-button
                                    (click)="openNiveauDialog(filiere, niv)"
                                    matTooltip="Modifier">
                              <mat-icon>edit</mat-icon>
                            </button>
                          </div>
                        </div>
                      }
                      @empty {
                        <span class="no-niveaux">Aucun niveau (L1, M1…)</span>
                      }
                    </div>
                  </mat-card>
                }
              </div>
            </mat-expansion-panel>
          }

          @if (state.cyclesUniversitaires().length === 0 && !state.loading()) {
            <div class="empty-section">
              <mat-icon>account_balance</mat-icon>
              <p>Aucun cycle universitaire défini</p>
              <button mat-raised-button color="primary"
                      (click)="openCycleDialog(undefined, 'universitaire')">
                Créer un cycle universitaire
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .page-sub { margin: 4px 0 0; font-size: 13px; color: #757575; }
    .stats-row { display: flex; gap: 12px; margin-bottom: 24px; margin-top: 16px; flex-wrap: wrap; }
    .stat-card { padding: 14px 18px; text-align: center; min-width: 80px; }
    .stat-v { font-size: 24px; font-weight: 700; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-scolaire  .stat-v { color: #1565c0; }
    .stat-univ      .stat-v { color: #4527a0; }
    .stat-effectif  .stat-v { color: #2e7d32; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }

    .tree-sections { display: flex; flex-direction: column; gap: 32px; }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 600; margin-bottom: 16px; color: #333; }
    .section-title mat-icon { font-size: 22px; }
    .chip-scolaire { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-univ     { background: #e8eaf6 !important; color: #283593 !important; }

    .cycle-panel { margin-bottom: 8px; border-radius: 8px !important; overflow: hidden; }
    .cycle-header { display: flex; align-items: center; gap: 10px; }
    .cycle-code { font-size: 11px; font-weight: 700; background: #e3f2fd; color: #1565c0; padding: 2px 7px; border-radius: 4px; }
    .cycle-nom { font-weight: 600; font-size: 15px; }
    .chip-type-cycle { font-size: 11px !important; min-height: 20px !important; }
    .chip-primaire   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-secondaire { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-superieur  { background: #e8eaf6 !important; color: #283593 !important; }
    .chip-inactif    { background: #f5f5f5 !important; color: #9e9e9e !important; font-size: 11px !important; }
    .chip-univ-sm    { background: #e8eaf6 !important; color: #283593 !important; font-size: 11px !important; }
    .chip-lmd        { background: #ede7f6 !important; color: #4527a0 !important; font-size: 11px !important; min-height: 20px !important; }

    .cycle-actions { display: flex; gap: 8px; padding: 8px 0 12px; }
    .filieres-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; padding-top: 4px; }
    .filiere-card { border: 1px solid #e0e0e0; padding: 12px; }
    .filiere-univ  { border-color: #c5cae9; background: #fafafa; }
    .filiere-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .filiere-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .filiere-code { font-size: 11px; font-weight: 700; background: #ede7f6; color: #4527a0; padding: 1px 6px; border-radius: 3px; }
    .filiere-nom { font-weight: 600; font-size: 14px; }
    .filiere-duree { font-size: 11px; color: #757575; }

    .niveaux-chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .niveau-item { display: flex; align-items: center; gap: 2px; }
    .chip-niveau     { background: #e3f2fd !important; color: #1565c0 !important; font-size: 12px !important; }
    .chip-niveau-univ { background: #ede7f6 !important; color: #4527a0 !important; font-size: 12px !important; }
    .no-niveaux { font-size: 12px; color: #9e9e9e; font-style: italic; }
    .empty-filieres { display: flex; align-items: center; gap: 8px; padding: 12px; color: #9e9e9e; font-size: 13px; }
    .empty-section { text-align: center; padding: 32px; color: #9e9e9e; background: #fafafa; border-radius: 8px; border: 2px dashed #e0e0e0; }
    .empty-section mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
    .empty-section p { margin-bottom: 16px; }
  `]
})
export class StructureTreeComponent implements OnInit {
  state                      = inject(StructureStateService);
  private etablissementState = inject(EtablissementStateService);
  private dialog             = inject(MatDialog);
  private snackBar           = inject(MatSnackBar);

  expandedCycles = new Set<string>();

  ngOnInit(): void {
    const etab = this.etablissementState.selectedEtablissement();
    if (etab) {
      this.state.loadCycles(etab.id);
      this.state.loadFilieres(etab.id);
      this.state.loadStats(etab.id);
    }
  }

  onCycleOpen(cycle: Cycle): void {
    this.expandedCycles.add(cycle.id);
    this.state.loadFilieres(undefined, cycle.id);
    this.state.filieresByCycle(cycle.id)().forEach(f => {
      this.state.loadNiveaux(f.id);
    });
  }

  cyclTypeLabel(type: string): string {
    const map: Record<string, string> = {
      primaire: 'Primaire', secondaire: 'Secondaire', superieur: 'Supérieur',
    };
    return map[type] ?? type;
  }

  openCycleDialog(cycle?: Cycle, forceType?: string): void {
    const ref = this.dialog.open(CycleFormDialogComponent, {
      width: '520px',
      data: { cycle, etablissementId: this.etablissementState.selectedEtablissement()?.id, forceType },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (cycle) {
        this.state.updateCycle(cycle.id, result, () =>
          this.snackBar.open('Cycle mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createCycle(result, () =>
          this.snackBar.open('Cycle créé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openFiliereDialog(cycleId: string, typeFormation: string, filiere?: Filiere): void {
    const ref = this.dialog.open(FiliereFormDialogComponent, {
      width: '520px',
      data: {
        filiere,
        cycleId,
        etablissementId: this.etablissementState.selectedEtablissement()?.id,
        typeFormation,
      },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (filiere) {
        this.state.updateFiliere(filiere.id, result, () =>
          this.snackBar.open('Filière mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createFiliere(result, () => {
          this.snackBar.open('Filière créée', 'Fermer', { duration: 3000 });
          this.state.loadFilieres(undefined, cycleId);
        });
      }
    });
  }

  openNiveauDialog(filiere: Filiere, niveau?: Niveau): void {
    const ref = this.dialog.open(NiveauFormDialogComponent, {
      width: '480px',
      data: { niveau, filiere },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (niveau) {
        this.state.updateNiveau(niveau.id, result, () =>
          this.snackBar.open('Niveau mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createNiveau({ ...result, filiereId: filiere.id }, () => {
          this.snackBar.open('Niveau créé', 'Fermer', { duration: 3000 });
          this.state.loadNiveaux(filiere.id);
        });
      }
    });
  }

  confirmDeleteCycle(cycle: Cycle): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le cycle',
        message: `Supprimer "${cycle.libelle}" et toutes ses filières/niveaux ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteCycle(cycle.id, () =>
        this.snackBar.open('Cycle supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteFiliere(filiere: Filiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la filière',
        message: `Supprimer "${filiere.libelle}" et tous ses niveaux ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteFiliere(filiere.id, () =>
        this.snackBar.open('Filière supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteNiveau(niveau: Niveau): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le niveau',
        message: `Supprimer "${niveau.libelle}" ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteNiveau(niveau.id, () =>
        this.snackBar.open('Niveau supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }
}
