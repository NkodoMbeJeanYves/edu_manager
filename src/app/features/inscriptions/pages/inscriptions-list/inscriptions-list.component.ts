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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { InscriptionFormDialogComponent } from '../../components/inscription-form-dialog/inscription-form-dialog.component';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { RejeterDialogComponent } from '../../components/rejeter-dialog/rejeter-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Inscription, StatutInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-inscriptions-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatPaginatorModule,
    MatCardModule, MatTabsModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">

      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Inscriptions</h1>
          <span class="total-badge">{{ state.total() }} résultat(s)</span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="openCreateDialog('reinscription')">
            <mat-icon>autorenew</mat-icon> Réinscription
          </button>
          <button mat-raised-button color="primary" (click)="openCreateDialog('nouvelle')">
            <mat-icon>add</mat-icon> Nouvelle inscription
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      @if (state.stats(); as stats) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total</div>
          </mat-card>
          <mat-card class="stat-card stat-warning">
            <div class="stat-value">{{ stats.enAttente }}</div>
            <div class="stat-label">En attente</div>
          </mat-card>
          <mat-card class="stat-card stat-success">
            <div class="stat-value">{{ stats.validees }}</div>
            <div class="stat-label">Validées</div>
          </mat-card>
          <mat-card class="stat-card stat-info">
            <div class="stat-value">{{ stats.tauxCompletion }}%</div>
            <div class="stat-label">Dossiers complets</div>
          </mat-card>
          <mat-card class="stat-card stat-purple">
            <div class="stat-value">{{ stats.reinscriptions }}</div>
            <div class="stat-label">Réinscriptions</div>
          </mat-card>
        </div>
      }

      <!-- Onglets par statut -->
      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" class="status-tabs">
        <mat-tab label="Toutes"></mat-tab>
        <mat-tab label="En attente"></mat-tab>
        <mat-tab label="Validées"></mat-tab>
        <mat-tab label="Rejetées"></mat-tab>
        <mat-tab label="Liste d'attente"></mat-tab>
      </mat-tab-group>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearch()"
                 placeholder="Nom apprenant, numéro inscription...">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchQuery) {
            <button matSuffix mat-icon-button (click)="searchQuery=''; onSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="filterType" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="nouvelle">Nouvelle</mat-option>
            <mat-option value="reinscription">Réinscription</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Frais</mat-label>
          <mat-select [(ngModel)]="filterFrais" (ngModelChange)="onFilter()">
            <mat-option [value]="null">Tous</mat-option>
            <mat-option [value]="true">Payés</mat-option>
            <mat-option [value]="false">Non payés</mat-option>
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
          <button mat-icon-button (click)="state.clearError()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <!-- Table -->
      @if (!state.loading()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.inscriptions()">

            <!-- Apprenant -->
            <ng-container matColumnDef="apprenant">
              <th mat-header-cell *matHeaderCellDef>Apprenant</th>
              <td mat-cell *matCellDef="let i">
                <div class="apprenant-cell">
                  <div class="avatar-sm">
                    {{ i.apprenant?.prenom?.[0] }}{{ i.apprenant?.nom?.[0] }}
                  </div>
                  <div>
                    <div class="apprenant-nom">
                      {{ i.apprenant?.prenom }} {{ i.apprenant?.nom }}
                    </div>
                    <div class="num-inscription">{{ i.numeroInscription }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let i">
                <mat-chip [class]="'chip-type chip-' + i.type">
                  {{ i.type === 'nouvelle' ? 'Nouvelle' : 'Réinscription' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Classe / Promotion -->
            <ng-container matColumnDef="affectation">
              <th mat-header-cell *matHeaderCellDef>Affectation</th>
              <td mat-cell *matCellDef="let i">
                @if (i.classeLibelle || i.promotionLibelle) {
                  <div class="affectation-badge">
                    <mat-icon>class</mat-icon>
                    {{ i.classeLibelle ?? i.promotionLibelle }}
                  </div>
                } @else {
                  <span class="non-affecte">Non affecté</span>
                }
              </td>
            </ng-container>

            <!-- Date -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let i">
                <div>{{ i.dateInscription | date:'dd/MM/yyyy' }}</div>
                @if (i.dateLimiteValidation) {
                  <div class="cell-limit"
                       [class.overdue]="isOverdue(i.dateLimiteValidation)">
                    Limite : {{ i.dateLimiteValidation | date:'dd/MM/yyyy' }}
                  </div>
                }
              </td>
            </ng-container>

            <!-- Frais -->
            <ng-container matColumnDef="frais">
              <th mat-header-cell *matHeaderCellDef>Frais</th>
              <td mat-cell *matCellDef="let i">
                @if (i.fraisInscription) {
                  <mat-chip [class]="i.fraisPayes ? 'chip-payes' : 'chip-impaye'">
                    <mat-icon>{{ i.fraisPayes ? 'check_circle' : 'warning' }}</mat-icon>
                    {{ i.fraisPayes ? 'Payés' : 'Non payés' }}
                  </mat-chip>
                } @else {
                  <span class="cell-secondary">—</span>
                }
              </td>
            </ng-container>

            <!-- Statut -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let i">
                <mat-chip [class]="'chip-statut chip-' + i.statut">
                  {{ statutLabel(i.statut) }}
                </mat-chip>
                @if (i.listAttente) {
                  <div class="liste-attente-badge">
                    <mat-icon>queue</mat-icon> #{{ i.positionListeAttente }}
                  </div>
                }
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let i">
                <div class="actions-cell">
                  <button mat-icon-button [routerLink]="[i.id]" matTooltip="Voir le dossier">
                    <mat-icon>folder_open</mat-icon>
                  </button>
                  @if (peutAffecter(i)) {
                    <button mat-icon-button (click)="openAffectation(i); $event.stopPropagation()"
                            matTooltip="Affecter une classe">
                      <mat-icon>class</mat-icon>
                    </button>
                  }
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @if (i.statut === 'complete' || i.statut === 'en_validation') {
                      <button mat-menu-item (click)="valider(i)">
                        <mat-icon>check_circle</mat-icon> Valider
                      </button>
                      <button mat-menu-item (click)="openRejeter(i)">
                        <mat-icon>cancel</mat-icon> Rejeter
                      </button>
                    }
                    @if (i.statut === 'brouillon' || i.statut === 'incomplete') {
                      <button mat-menu-item (click)="soumettre(i)">
                        <mat-icon>send</mat-icon> Soumettre
                      </button>
                    }
                    <mat-divider></mat-divider>
                    @if (!['annulee', 'validee'].includes(i.statut)) {
                      <button mat-menu-item (click)="confirmerAnnulation(i)" class="menu-warn">
                        <mat-icon>block</mat-icon> Annuler l'inscription
                      </button>
                    }
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="table-row" [routerLink]="[row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>assignment</mat-icon>
                <p>Aucune inscription trouvée</p>
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
    .header-actions { display: flex; gap: 8px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }

    .stats-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { padding: 16px 20px; text-align: center; min-width: 90px; }
    .stat-value { font-size: 26px; font-weight: 700; }
    .stat-label { font-size: 12px; color: #757575; margin-top: 4px; }
    .stat-warning .stat-value { color: #e65100; }
    .stat-success .stat-value { color: #2e7d32; }
    .stat-info    .stat-value { color: #1565c0; }
    .stat-purple  .stat-value { color: #6a1b9a; }

    .status-tabs { margin-bottom: 16px; background: white; border-radius: 8px 8px 0 0; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 260px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }

    .table-container { border-radius: 8px; overflow: hidden; }
    .apprenant-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 14px; }
    .num-inscription { font-size: 11px; background: #f5f5f5; padding: 1px 5px; border-radius: 3px; color: #555; }
    .cell-secondary { font-size: 12px; color: #9e9e9e; }
    .cell-limit { font-size: 11px; color: #e65100; margin-top: 2px; }
    .cell-limit.overdue { color: #c62828; font-weight: 600; }

    .affectation-badge { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #1565c0; }
    .affectation-badge mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .non-affecte { font-size: 12px; color: #9e9e9e; font-style: italic; }
    .liste-attente-badge { display: flex; align-items: center; gap: 2px; font-size: 11px; color: #e65100; margin-top: 2px; }
    .liste-attente-badge mat-icon { font-size: 13px; width: 13px; height: 13px; }

    .chip-nouvelle      { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-reinscription { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-brouillon     { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-incomplete    { background: #fff8e1 !important; color: #f57f17 !important; }
    .chip-complete      { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-en_validation { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-validee       { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-rejetee       { background: #fdecea !important; color: #c62828 !important; }
    .chip-annulee       { background: #f5f5f5 !important; color: #9e9e9e !important; }
    .chip-en_attente    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-payes   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-impaye  { background: #fdecea !important; color: #c62828 !important; }
    .chip-payes mat-icon, .chip-impaye mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-warn { color: #d32f2f !important; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class InscriptionsListComponent implements OnInit {
  state = inject(InscriptionStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'type', 'affectation', 'date', 'frais', 'statut', 'actions'];
  searchQuery  = '';
  filterType   = '';
  filterFrais: boolean | null = null;

  private tabStatuts: (StatutInscription | undefined)[] = [
    undefined,
    'en_validation',
    'validee',
    'rejetee',
    'en_attente',
  ];

  ngOnInit(): void {
    this.state.load();
    this.state.loadStats();
  }

  onSearch(): void {
    this.state.load({ search: this.searchQuery || undefined, page: 1 });
  }

  onFilter(): void {
    this.state.load({
      search:     this.searchQuery || undefined,
      type:       (this.filterType as any) || undefined,
      fraisPayes: this.filterFrais ?? undefined,
      page: 1,
    });
  }

  onTabChange(index: number): void {
    const statut = this.tabStatuts[index];
    const listAttente = index === 4 ? true : undefined;
    this.state.load({
      statut,
      listAttente,
      search: this.searchQuery || undefined,
      page: 1,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadPage(e.pageIndex + 1);
  }

  statutLabel(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      brouillon: 'Brouillon', incomplete: 'Incomplète', complete: 'Complète',
      en_validation: 'En validation', validee: 'Validée', rejetee: 'Rejetée',
      annulee: 'Annulée', en_attente: 'Liste d\'attente',
    };
    return map[statut] ?? statut;
  }

  peutAffecter(i: Inscription): boolean {
    return i.statut === 'validee' && !i.classeLibelle && !i.promotionLibelle;
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }

  openCreateDialog(type: 'nouvelle' | 'reinscription'): void {
    const ref = this.dialog.open(InscriptionFormDialogComponent, {
      width: '700px', data: { type },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.create(result, () => {
          this.snackBar.open('Inscription créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openAffectation(inscription: Inscription): void {
    const ref = this.dialog.open(AffectationDialogComponent, {
      width: '520px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.affecterClasse(
          { inscriptionId: inscription.id, ...result },
          () => this.snackBar.open('Affectation enregistrée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  valider(inscription: Inscription): void {
    this.state.valider(inscription.id, {}, () =>
      this.snackBar.open('Inscription validée', 'Fermer', { duration: 3000 })
    );
  }

  openRejeter(inscription: Inscription): void {
    const ref = this.dialog.open(RejeterDialogComponent, {
      width: '440px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.rejeter(inscription.id, result, () =>
          this.snackBar.open('Inscription rejetée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  soumettre(inscription: Inscription): void {
    this.state.soumettre(inscription.id, () =>
      this.snackBar.open('Dossier soumis pour validation', 'Fermer', { duration: 3000 })
    );
  }

  confirmerAnnulation(inscription: Inscription): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Annuler l\'inscription',
        message: `Annuler l'inscription de "${inscription.apprenant?.prenom} ${inscription.apprenant?.nom}" ? Cette action est irréversible.`,
        confirmLabel: 'Annuler l\'inscription',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.annuler(inscription.id, 'Annulation manuelle', () =>
          this.snackBar.open('Inscription annulée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
