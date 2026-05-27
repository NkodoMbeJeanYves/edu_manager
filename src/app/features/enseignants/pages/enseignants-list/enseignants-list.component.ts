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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EnseignantStateService } from '../../services/enseignant-state.service';
import { EnseignantFormDialogComponent } from '../../components/enseignant-form-dialog/enseignant-form-dialog.component';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Enseignant, StatutEnseignant, TypeContrat } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-enseignants-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    MatPaginatorModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">

      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Enseignants</h1>
          <span class="total-badge">{{ state.total() }} enseignant(s)</span>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>person_add</mat-icon> Nouvel enseignant
        </button>
      </div>

      <!-- Stats rapides -->
      @if (state.stats(); as stats) {
        <div class="stats-row">
          <mat-card class="stat-card stat-actif">
            <div class="stat-v">{{ stats.actifs }}</div>
            <div class="stat-l">Actifs</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-v">{{ stats.titulaires }}</div>
            <div class="stat-l">Titulaires</div>
          </mat-card>
          <mat-card class="stat-card stat-vac">
            <div class="stat-v">{{ stats.vacataires }}</div>
            <div class="stat-l">Vacataires</div>
          </mat-card>
          @if (state.enseignantsEnSurcharge().length > 0) {
            <mat-card class="stat-card stat-warn">
              <div class="stat-v">{{ state.enseignantsEnSurcharge().length }}</div>
              <div class="stat-l">En surcharge</div>
            </mat-card>
          }
        </div>
      }

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onFilter()"
                 placeholder="Nom, prénom, matricule...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select [(ngModel)]="filterStatut" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="actif">Actif</mat-option>
            <mat-option value="inactif">Inactif</mat-option>
            <mat-option value="suspendu">Suspendu</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Contrat</mat-label>
          <mat-select [(ngModel)]="filterContrat" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="titulaire">Titulaire</mat-option>
            <mat-option value="vacataire">Vacataire</mat-option>
            <mat-option value="contractuel">Contractuel</mat-option>
            <mat-option value="fonctionnaire">Fonctionnaire</mat-option>
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

      <!-- Table -->
      @if (!state.loading()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.enseignants()">

            <!-- Enseignant -->
            <ng-container matColumnDef="enseignant">
              <th mat-header-cell *matHeaderCellDef>Enseignant</th>
              <td mat-cell *matCellDef="let e">
                <div class="ens-cell">
                  <div class="avatar-ens" [class]="'avatar-' + e.genre">
                    @if (e.photoUrl) {
                      <img [src]="e.photoUrl" [alt]="e.prenom">
                    } @else {
                      {{ e.prenom[0] }}{{ e.nom[0] }}
                    }
                  </div>
                  <div>
                    <div class="ens-nom">{{ e.prenom }} {{ e.nom }}</div>
                    <div class="ens-meta">
                      <span class="matricule">{{ e.matricule }}</span>
                      <span class="ens-email">{{ e.email }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Contrat & Spécialité -->
            <ng-container matColumnDef="contrat">
              <th mat-header-cell *matHeaderCellDef>Contrat</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [class]="'chip-contrat chip-' + e.typeContrat">
                  {{ contratLabel(e.typeContrat) }}
                </mat-chip>
                @if (e.niveauDiplome) {
                  <div class="diplome-label">{{ diplomeLabel(e.niveauDiplome) }}</div>
                }
              </td>
            </ng-container>

            <!-- Matières -->
            <ng-container matColumnDef="matieres">
              <th mat-header-cell *matHeaderCellDef>Matières</th>
              <td mat-cell *matCellDef="let e">
                <div class="matieres-chips">
                  @for (m of e.matieres?.slice(0, 3); track m.id) {
                    <span class="mat-chip-sm">{{ m.code }}</span>
                  }
                  @if ((e.matieres?.length ?? 0) > 3) {
                    <span class="mat-more">+{{ (e.matieres?.length ?? 0) - 3 }}</span>
                  }
                  @if (!e.matieres?.length) {
                    <span class="cell-secondary">Aucune</span>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Charge horaire -->
            <ng-container matColumnDef="charge">
              <th mat-header-cell *matHeaderCellDef>Charge horaire</th>
              <td mat-cell *matCellDef="let e">
                @if (e.chargeHoraireMax) {
                  <div class="charge-cell">
                    <span class="charge-val"
                          [class.charge-ok]="(e.chargeHoraireReelle ?? 0) <= e.chargeHoraireMax"
                          [class.charge-warn]="(e.chargeHoraireReelle ?? 0) > e.chargeHoraireMax">
                      {{ e.chargeHoraireReelle ?? 0 }}h / {{ e.chargeHoraireMax }}h
                    </span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="((e.chargeHoraireReelle ?? 0) / e.chargeHoraireMax) * 100"
                      [color]="(e.chargeHoraireReelle ?? 0) > e.chargeHoraireMax ? 'warn' : 'primary'">
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
                <mat-chip [class]="'chip-statut-ens chip-' + e.statut">
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
                          matTooltip="Voir le dossier">
                    <mat-icon>person</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="openAffectationDialog(e); $event.stopPropagation()"
                          matTooltip="Gérer les affectations matières">
                    <mat-icon>book</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openEditDialog(e)">
                      <mat-icon>edit</mat-icon> Modifier
                    </button>
                    <button mat-menu-item (click)="toggleStatut(e)">
                      <mat-icon>{{ e.statut === 'actif' ? 'pause' : 'play_arrow' }}</mat-icon>
                      {{ e.statut === 'actif' ? 'Désactiver' : 'Activer' }}
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="menu-delete" (click)="confirmDelete(e)">
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
                <mat-icon>school</mat-icon>
                <p>Aucun enseignant trouvé</p>
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
    .stats-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { padding: 14px 18px; text-align: center; min-width: 80px; }
    .stat-v { font-size: 24px; font-weight: 700; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-actif .stat-v { color: #2e7d32; }
    .stat-vac   .stat-v { color: #e65100; }
    .stat-warn  .stat-v { color: #c62828; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 220px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }

    .ens-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-ens { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; overflow: hidden; }
    .avatar-ens img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-M { background: #bbdefb; color: #1565c0; }
    .avatar-F { background: #f8bbd9; color: #880e4f; }
    .avatar-autre { background: #e8eaf6; color: #283593; }
    .ens-nom { font-weight: 600; font-size: 14px; }
    .ens-meta { display: flex; gap: 8px; align-items: center; }
    .matricule { font-family: monospace; font-size: 11px; background: #f0f0f0; padding: 1px 5px; border-radius: 3px; }
    .ens-email { font-size: 11px; color: #757575; }

    .chip-contrat { font-size: 11px !important; min-height: 22px !important; }
    .chip-titulaire     { background: #e8eaf6 !important; color: #283593 !important; }
    .chip-vacataire     { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-contractuel   { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-fonctionnaire { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-detache       { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .diplome-label { font-size: 11px; color: #757575; margin-top: 2px; }

    .matieres-chips { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .mat-chip-sm { font-size: 11px; font-weight: 600; background: #ede7f6; color: #4527a0; padding: 1px 6px; border-radius: 3px; }
    .mat-more { font-size: 11px; color: #9e9e9e; }
    .cell-secondary { font-size: 12px; color: #9e9e9e; }

    .charge-cell { display: flex; flex-direction: column; gap: 3px; min-width: 110px; }
    .charge-val { font-size: 12px; font-weight: 500; }
    .charge-ok   { color: #2e7d32; }
    .charge-warn { color: #c62828; font-weight: 700; }

    .chip-statut-ens { font-size: 11px !important; min-height: 22px !important; }
    .chip-actif    { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactif  { background: #f5f5f5 !important; color: #9e9e9e !important; }
    .chip-suspendu { background: #fdecea !important; color: #c62828 !important; }
    .chip-retraite { background: #f3e5f5 !important; color: #6a1b9a !important; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-delete { color: #d32f2f !important; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class EnseignantsListComponent implements OnInit {
  state = inject(EnseignantStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['enseignant', 'contrat', 'matieres', 'charge', 'statut', 'actions'];
  searchQuery   = '';
  filterStatut  = '';
  filterContrat = '';

  ngOnInit(): void {
    this.state.loadEnseignants();
    this.state.loadStats('');
  }

  onFilter(): void {
    this.state.loadEnseignants({
      search:       this.searchQuery   || undefined,
      statut:       (this.filterStatut  as StatutEnseignant) || undefined,
      typeContrat:  (this.filterContrat as TypeContrat)      || undefined,
      page: 1,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadEnseignants({ page: e.pageIndex + 1 });
  }

  statutLabel(s: StatutEnseignant): string {
    return { actif: 'Actif', inactif: 'Inactif', suspendu: 'Suspendu', retraite: 'Retraité' }[s] ?? s;
  }

  contratLabel(c: TypeContrat): string {
    const map: Record<TypeContrat, string> = {
      titulaire: 'Titulaire', vacataire: 'Vacataire',
      contractuel: 'Contractuel', fonctionnaire: 'Fonctionnaire', detache: 'Détaché',
    };
    return map[c] ?? c;
  }

  diplomeLabel(d: string): string {
    const map: Record<string, string> = {
      licence: 'Licence', master: 'Master', doctorat: 'Doctorat',
      bts: 'BTS', hdr: 'HDR', agregation: 'Agrégation', autre: 'Autre',
    };
    return map[d] ?? d;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EnseignantFormDialogComponent, { width: '680px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEnseignant(result, () =>
          this.snackBar.open('Enseignant créé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openEditDialog(e: Enseignant): void {
    const ref = this.dialog.open(EnseignantFormDialogComponent, {
      width: '680px', data: { enseignant: e },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEnseignant(e.id, result, () =>
          this.snackBar.open('Enseignant mis à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAffectationDialog(e: Enseignant): void {
    const ref = this.dialog.open(AffectationDialogComponent, {
      width: '580px',
      data: { enseignant: e },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.affecterMatiere(result, () =>
          this.snackBar.open('Matière affectée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  toggleStatut(e: Enseignant): void {
    const statut = e.statut === 'actif' ? 'inactif' : 'actif';
    this.state.updateEnseignant(e.id, { statut }, () =>
      this.snackBar.open(
        statut === 'actif' ? 'Enseignant réactivé' : 'Enseignant désactivé',
        'Fermer', { duration: 3000 }
      )
    );
  }

  confirmDelete(e: Enseignant): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'enseignant',
        message: `Supprimer "${e.prenom} ${e.nom}" ? Ses affectations seront supprimées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteEnseignant(e.id, () =>
        this.snackBar.open('Enseignant supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }
}
