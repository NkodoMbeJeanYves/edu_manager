import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NoteStateService } from '../../services/note-state.service';
import { EvaluationFormDialogComponent } from '../../components/evaluation-form-dialog/evaluation-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Evaluation, TypeEvaluation, StatutEvaluation } from '../../../../core/models/note.models';

@Component({
  selector: 'app-evaluations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatPaginatorModule,
    MatCardModule, MatProgressBarModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">

      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Évaluations & Notes</h1>
          <span class="total-badge">{{ state.total() }} évaluation(s)</span>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Nouvelle évaluation
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery"
                 placeholder="Intitulé, matière, classe...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="filterType" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="cc">Contrôle continu</mat-option>
            <mat-option value="partiel">Partiel</mat-option>
            <mat-option value="examen_final">Examen final</mat-option>
            <mat-option value="tp">TP noté</mat-option>
            <mat-option value="oral">Oral</mat-option>
            <mat-option value="projet">Projet</mat-option>
            <mat-option value="rattrapage">Rattrapage</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="filterStatut" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="planifiee">Planifiée</mat-option>
            <mat-option value="en_cours">En cours</mat-option>
            <mat-option value="cloturee">Clôturée</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

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

      @if (!state.loading()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.evaluations()">

            <!-- Évaluation -->
            <ng-container matColumnDef="evaluation">
              <th mat-header-cell *matHeaderCellDef>Évaluation</th>
              <td mat-cell *matCellDef="let e">
                <div class="eval-nom">{{ e.intitule }}</div>
                <div class="eval-meta">
                  <span class="matiere-badge">{{ e.matiereLibelle }}</span>
                  <span class="cell-secondary">{{ e.dateEvaluation | date:'dd/MM/yyyy' }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class]="'chip-type chip-' + e.type">
                  <mat-icon>{{ typeIcon(e.type) }}</mat-icon>
                  {{ typeLabel(e.type) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Pondération -->
            <ng-container matColumnDef="ponderation">
              <th mat-header-cell *matHeaderCellDef>Pondération</th>
              <td mat-cell *matCellDef="let e">
                <div class="ponderation-cell">
                  <span class="ponder-val">{{ e.ponderation }}%</span>
                  <mat-progress-bar mode="determinate"
                                    [value]="e.ponderation"
                                    class="ponder-bar">
                  </mat-progress-bar>
                </div>
              </td>
            </ng-container>

            <!-- Classe / Promotion -->
            <ng-container matColumnDef="groupe">
              <th mat-header-cell *matHeaderCellDef>Classe / Promotion</th>
              <td mat-cell *matCellDef="let e">
                <div class="cell-secondary">
                  {{ e.classeLibelle ?? e.promotionLibelle ?? '—' }}
                </div>
              </td>
            </ng-container>

            <!-- Progression saisie -->
            <ng-container matColumnDef="progression">
              <th mat-header-cell *matHeaderCellDef>Notes saisies</th>
              <td mat-cell *matCellDef="let e">
                @if (e.totalApprenants) {
                  <div class="progression-cell">
                    <span class="prog-text">
                      {{ e.noteSaisieCount ?? 0 }} / {{ e.totalApprenants }}
                    </span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="((e.noteSaisieCount ?? 0) / e.totalApprenants) * 100"
                      [color]="progressColor(e)">
                    </mat-progress-bar>
                  </div>
                } @else {
                  <span class="cell-secondary">—</span>
                }
              </td>
            </ng-container>

            <!-- Statut -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class]="'chip-statut chip-' + e.statut">
                  {{ statutLabel(e.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <div class="actions-cell">
                  <button mat-icon-button [routerLink]="[e.id]"
                          matTooltip="Saisir les notes">
                    <mat-icon>edit_note</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEditDialog(e)">
                      <mat-icon>edit</mat-icon> Modifier
                    </button>
                    @if (e.statut !== 'cloturee') {
                      <button mat-menu-item (click)="cloturer(e)">
                        <mat-icon>lock</mat-icon> Clôturer
                      </button>
                    }
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="menu-delete"
                            (click)="confirmDelete(e)">
                      <mat-icon>delete</mat-icon> Supprimer
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="table-row" [routerLink]="[row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>grading</mat-icon>
                <p>Aucune évaluation trouvée</p>
              </td>
            </tr>
          </table>

          <mat-paginator
            [length]="state.total()"
            [pageSize]="state.limit()"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 260px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }

    .eval-nom { font-weight: 500; }
    .eval-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
    .matiere-badge { font-size: 11px; font-weight: 600; background: #ede7f6; color: #4527a0; padding: 1px 6px; border-radius: 3px; }
    .cell-secondary { font-size: 12px; color: #757575; }

    .chip-type mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 3px; }
    .chip-cc          { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-partiel     { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-examen_final { background: #fce4ec !important; color: #880e4f !important; }
    .chip-tp          { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-oral        { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-projet      { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-rattrapage  { background: #fff8e1 !important; color: #f57f17 !important; }
    .chip-devoir_maison { background: #e8eaf6 !important; color: #283593 !important; }

    .chip-planifiee { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-en_cours  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-cloturee  { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-annulee   { background: #f5f5f5 !important; color: #9e9e9e !important; }

    .ponderation-cell { display: flex; align-items: center; gap: 8px; }
    .ponder-val { font-weight: 600; font-size: 13px; min-width: 36px; }
    .ponder-bar { flex: 1; min-width: 60px; height: 6px; border-radius: 3px; }

    .progression-cell { display: flex; flex-direction: column; gap: 3px; }
    .prog-text { font-size: 12px; color: #555; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-delete { color: #d32f2f !important; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class EvaluationsListComponent implements OnInit {
  state = inject(NoteStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['evaluation', 'type', 'ponderation', 'groupe', 'progression', 'statut', 'actions'];
  searchQuery  = '';
  filterType   = '';
  filterStatut = '';

  ngOnInit(): void {
    this.state.loadEvaluations();
  }

  onFilter(): void {
    this.state.loadEvaluations({
      type:   (this.filterType   as TypeEvaluation)   || undefined,
      statut: (this.filterStatut as StatutEvaluation) || undefined,
      page: 1,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadEvaluations({ ...this.state.currentFilters(), page: e.pageIndex + 1 });
  }

  typeLabel(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'CC', partiel: 'Partiel', examen_final: 'Examen final',
      tp: 'TP', oral: 'Oral', projet: 'Projet',
      devoir_maison: 'Devoir maison', rattrapage: 'Rattrapage',
    };
    return map[type] ?? type;
  }

  typeIcon(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'quiz', partiel: 'description', examen_final: 'assignment_turned_in',
      tp: 'science', oral: 'record_voice_over', projet: 'work',
      devoir_maison: 'home', rattrapage: 'replay',
    };
    return map[type] ?? 'edit';
  }

  statutLabel(statut: StatutEvaluation): string {
    const map: Record<StatutEvaluation, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours',
      cloturee: 'Clôturée', annulee: 'Annulée',
    };
    return map[statut] ?? statut;
  }

  progressColor(e: Evaluation): 'primary' | 'warn' | 'accent' {
    if (!e.totalApprenants) return 'primary';
    const pct = ((e.noteSaisieCount ?? 0) / e.totalApprenants) * 100;
    if (pct === 100) return 'accent';
    if (pct >= 50)   return 'primary';
    return 'warn';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EvaluationFormDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEvaluation(result, () => {
          this.snackBar.open('Évaluation créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openEditDialog(evaluation: Evaluation): void {
    const ref = this.dialog.open(EvaluationFormDialogComponent, {
      width: '640px', data: { evaluation },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEvaluation(evaluation.id, result, () => {
          this.snackBar.open('Évaluation mise à jour', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  cloturer(evaluation: Evaluation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Clôturer l\'évaluation',
        message: `Clôturer "${evaluation.intitule}" ? Les notes ne pourront plus être modifiées sans motif.`,
        confirmLabel: 'Clôturer', confirmColor: 'primary', icon: 'lock',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.updateEvaluation(evaluation.id, { statut: 'cloturee' }, () =>
          this.snackBar.open('Évaluation clôturée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDelete(evaluation: Evaluation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'évaluation',
        message: `Supprimer "${evaluation.intitule}" et toutes ses notes ? Action irréversible.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deleteEvaluation(evaluation.id, () =>
          this.snackBar.open('Évaluation supprimée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
