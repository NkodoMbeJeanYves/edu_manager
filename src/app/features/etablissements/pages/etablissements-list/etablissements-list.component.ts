import { Component, OnInit, inject, signal } from '@angular/core';
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
import { EtablissementStateService } from '../../services/etablissement-state.service';
import { Etablissement } from '../../../../core/models/etablissement.models';
import { EtablissementFormDialogComponent } from '../../components/etablissement-form-dialog/etablissement-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-etablissements-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Établissements</h1>
          <span class="total-badge">{{ state.total() }} établissement(s)</span>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nouvel établissement
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Nom, code, ville...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="filterType" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="scolaire">Scolaire</mat-option>
            <mat-option value="universitaire">Universitaire</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="filterActif" (ngModelChange)="onFilter()">
            <mat-option [value]="null">Tous</mat-option>
            <mat-option [value]="true">Actifs</mat-option>
            <mat-option [value]="false">Inactifs</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Spinner -->
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }

      <!-- Erreur -->
      @if (state.error()) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ state.error() }}</span>
          <button mat-icon-button (click)="state.clearError()"><mat-icon>close</mat-icon></button>
        </div>
      }

      <!-- Table -->
      @if (!state.loading()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.etablissements()" class="full-width">

            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Établissement</th>
              <td mat-cell *matCellDef="let e">
                <div class="cell-primary">
                  <span class="etab-code">{{ e.code }}</span>
                  <span class="etab-nom">{{ e.nom }}</span>
                </div>
                <div class="cell-secondary">{{ e.ville }}, {{ e.pays }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class]="'chip-type chip-' + e.type">
                  {{ e.type === 'scolaire' ? 'Scolaire' : 'Universitaire' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let e">
                <div class="cell-secondary">{{ e.email }}</div>
                <div class="cell-secondary">{{ e.telephone }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class]="e.actif ? 'chip-actif' : 'chip-inactif'">
                  {{ e.actif ? 'Actif' : 'Inactif' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <div class="actions-cell">
                  <button mat-icon-button [routerLink]="[e.id]" matTooltip="Voir les détails">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="openEditDialog(e)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Plus d'actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="toggleActif(e)">
                      <mat-icon>{{ e.actif ? 'block' : 'check_circle' }}</mat-icon>
                      {{ e.actif ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button mat-menu-item class="menu-delete" (click)="confirmDelete(e)">
                      <mat-icon>delete</mat-icon>
                      Supprimer
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
                <mat-icon>business</mat-icon>
                <p>Aucun établissement trouvé</p>
              </td>
            </tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 240px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    .full-width { width: 100%; }
    .cell-primary { display: flex; align-items: center; gap: 8px; }
    .etab-code { font-size: 11px; font-weight: 600; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; color: #555; }
    .etab-nom { font-weight: 500; }
    .cell-secondary { font-size: 12px; color: #757575; margin-top: 2px; }
    .chip-type, .chip-actif, .chip-inactif { font-size: 12px !important; min-height: 24px !important; }
    .chip-scolaire { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-universitaire { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-actif { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactif { background: #fafafa !important; color: #757575 !important; }
    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-delete { color: #d32f2f; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class EtablissementsListComponent implements OnInit {
  state = inject(EtablissementStateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nom', 'type', 'contact', 'statut', 'actions'];
  searchQuery = '';
  filterType = '';
  filterActif: boolean | null = null;

  ngOnInit(): void {
    this.state.loadEtablissements();
  }

  onSearch(): void {
    this.state.loadEtablissements({ search: this.searchQuery, type: this.filterType || undefined });
  }

  onFilter(): void {
    this.state.loadEtablissements({
      search: this.searchQuery || undefined,
      type: this.filterType || undefined,
      actif: this.filterActif ?? undefined,
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EtablissementFormDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEtablissement(result, () => {
          this.snackBar.open('Établissement créé avec succès', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openEditDialog(etablissement: Etablissement): void {
    const ref = this.dialog.open(EtablissementFormDialogComponent, {
      width: '600px',
      data: { etablissement }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEtablissement(etablissement.id, result, () => {
          this.snackBar.open('Établissement mis à jour', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  toggleActif(etablissement: Etablissement): void {
    this.state.updateEtablissement(etablissement.id, { actif: !etablissement.actif }, () => {
      this.snackBar.open(
        etablissement.actif ? 'Établissement désactivé' : 'Établissement activé',
        'Fermer', { duration: 3000 }
      );
    });
  }

  confirmDelete(etablissement: Etablissement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'établissement',
        message: `Êtes-vous sûr de vouloir supprimer "${etablissement.nom}" ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.state.deleteEtablissement(etablissement.id, () => {
          this.snackBar.open('Établissement supprimé', 'Fermer', { duration: 3000 });
        });
      }
    });
  }
}
