import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { StructureStateService } from '../../services/structure-state.service';
import { ClasseFormDialogComponent } from '../../components/classe-form-dialog/classe-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Classe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatDialogModule, MatSnackBarModule, MatPaginatorModule,
    MatTooltipModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-button routerLink="/structure" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Classes</h1>
          <span class="total-badge">{{ state.totalClasses() }} classe(s)</span>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Nouvelle classe
        </button>
      </div>

      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="search" (ngModelChange)="onFilter()"
                 placeholder="Code, libellé, filière...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="filterStatut" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="active">Actives</mat-option>
            <mat-option value="archivee">Archivées</mat-option>
            <mat-option value="fermee">Fermées</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (state.loading()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (!state.loading()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.classes()">

            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Classe</th>
              <td mat-cell *matCellDef="let c">
                <div class="classe-cell">
                  <span class="classe-code">{{ c.code }}</span>
                  <div>
                    <div class="classe-nom">{{ c.libelle }}</div>
                    <div class="classe-filiere">
                      {{ c.filiere?.libelle ?? '—' }} · {{ c.niveau?.libelle ?? '—' }}
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="prof">
              <th mat-header-cell *matHeaderCellDef>Professeur principal</th>
              <td mat-cell *matCellDef="let c">
                <span class="cell-secondary">
                  {{ c.professeurPrincipalNom ?? '—' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="effectif">
              <th mat-header-cell *matHeaderCellDef>Effectif</th>
              <td mat-cell *matCellDef="let c">
                <div class="effectif-cell">
                  <span class="effectif-val"
                        [class.effectif-plein]="c.effectifActuel >= c.capaciteMax">
                    {{ c.effectifActuel }} / {{ c.capaciteMax }}
                  </span>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="(c.effectifActuel / c.capaciteMax) * 100"
                    [color]="c.effectifActuel >= c.capaciteMax ? 'warn' : 'primary'">
                  </mat-progress-bar>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="annee">
              <th mat-header-cell *matHeaderCellDef>Année académique</th>
              <td mat-cell *matCellDef="let c">
                <span class="cell-secondary">
                  {{ c.anneeAcademique?.libelle ?? '—' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let c">
                <mat-chip [class]="'chip-statut-classe chip-' + c.statut">
                  {{ statutLabel(c.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <div class="actions-cell">
                  <button mat-icon-button [routerLink]="[c.id]" matTooltip="Voir la classe">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="openEditDialog(c); $event.stopPropagation()"
                          matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="toggleArchiver(c)">
                      <mat-icon>{{ c.statut === 'active' ? 'archive' : 'unarchive' }}</mat-icon>
                      {{ c.statut === 'active' ? 'Archiver' : 'Réactiver' }}
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="menu-delete" (click)="confirmDelete(c)">
                      <mat-icon>delete</mat-icon> Supprimer
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"
                class="table-row" [routerLink]="[row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="cols.length">
                <mat-icon>class</mat-icon>
                <p>Aucune classe trouvée</p>
              </td>
            </tr>
          </table>

          <mat-paginator
            [length]="state.totalClasses()"
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
    .header-left { display: flex; align-items: center; gap: 8px; }
    .back-btn { min-width: 40px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 240px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    .classe-cell { display: flex; align-items: center; gap: 10px; }
    .classe-code { font-size: 11px; font-weight: 700; background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
    .classe-nom { font-weight: 500; }
    .classe-filiere { font-size: 12px; color: #757575; }
    .cell-secondary { font-size: 12px; color: #757575; }
    .effectif-cell { display: flex; flex-direction: column; gap: 3px; min-width: 100px; }
    .effectif-val { font-size: 12px; font-weight: 500; }
    .effectif-plein { color: #d32f2f; font-weight: 700; }
    .chip-active   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-archivee { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-fermee   { background: #fdecea !important; color: #c62828 !important; }
    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-delete { color: #d32f2f !important; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class ClassesListComponent implements OnInit {
  state = inject(StructureStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['code', 'prof', 'effectif', 'annee', 'statut', 'actions'];
  search       = '';
  filterStatut = '';

  ngOnInit(): void {
    const niveauId = this.route.snapshot.queryParamMap.get('niveauId');
    this.state.loadClasses({ niveauId: niveauId ?? undefined });
  }

  onFilter(): void {
    this.state.loadClasses({
      search:  this.search || undefined,
      statut:  (this.filterStatut as any) || undefined,
      page: 1,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadClasses({ page: e.pageIndex + 1 });
  }

  statutLabel(s: string): string {
    return { active: 'Active', archivee: 'Archivée', fermee: 'Fermée' }[s] ?? s;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ClasseFormDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createClasse(result, () =>
          this.snackBar.open('Classe créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openEditDialog(classe: Classe): void {
    const ref = this.dialog.open(ClasseFormDialogComponent, {
      width: '600px', data: { classe },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateClasse(classe.id, result, () =>
          this.snackBar.open('Classe mise à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  toggleArchiver(classe: Classe): void {
    const statut = classe.statut === 'active' ? 'archivee' : 'active';
    this.state.updateClasse(classe.id, { statut }, () =>
      this.snackBar.open(
        statut === 'archivee' ? 'Classe archivée' : 'Classe réactivée',
        'Fermer', { duration: 3000 }
      )
    );
  }

  confirmDelete(classe: Classe): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la classe',
        message: `Supprimer "${classe.libelle}" ? Les apprenants affectés seront désaffectés.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteClasse(classe.id, () =>
        this.snackBar.open('Classe supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }
}
