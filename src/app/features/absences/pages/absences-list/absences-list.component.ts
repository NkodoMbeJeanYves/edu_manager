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
import { MatBadgeModule } from '@angular/material/badge';
import { AbsenceStateService } from '../../services/absence-state.service';
import { JustificatifDialogComponent } from '../../components/justificatif-dialog/justificatif-dialog.component';
import { ValiderJustificatifDialogComponent } from '../../components/valider-justificatif-dialog/valider-justificatif-dialog.component';
import { Absence, StatutAbsence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-absences-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatPaginatorModule,
    MatCardModule, MatTabsModule, MatBadgeModule,
  ],
  template: `
    <div class="page-container">

      <!-- En-tête -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Absences & Présences</h1>
          <span class="total-badge">{{ state.total() }} absence(s)</span>
        </div>
        <div class="header-actions">
          @if (state.nombreJustificatifsEnAttente() > 0) {
            <button mat-raised-button color="warn"
                    (click)="goToJustificatifs()"
                    [matBadge]="state.nombreJustificatifsEnAttente()"
                    matBadgeColor="warn">
              <mat-icon>pending_actions</mat-icon>
              Justificatifs à valider
            </button>
          }
          <button mat-stroked-button [routerLink]="['alertes']">
            <mat-icon>notification_important</mat-icon>
            Alertes absentéisme
            @if (state.apprenantsDessusSeui().length > 0) {
              <span class="alerte-count">{{ state.apprenantsDessusSeui().length }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Onglets -->
      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" class="status-tabs">
        <mat-tab label="Toutes"></mat-tab>
        <mat-tab label="Non justifiées"></mat-tab>
        <mat-tab label="En attente"></mat-tab>
        <mat-tab label="Justifiées"></mat-tab>
        <mat-tab label="Examens"></mat-tab>
      </mat-tab-group>

      <!-- Filtres -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher un apprenant</mat-label>
          <input matInput [(ngModel)]="searchQuery"
                 placeholder="Nom, prénom...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date début</mat-label>
          <input matInput type="date" [(ngModel)]="filterDateDebut"
                 (ngModelChange)="onFilter()">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Date fin</mat-label>
          <input matInput type="date" [(ngModel)]="filterDateFin"
                 (ngModelChange)="onFilter()">
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
          <table mat-table [dataSource]="state.absences()">

            <!-- Apprenant -->
            <ng-container matColumnDef="apprenant">
              <th mat-header-cell *matHeaderCellDef>Apprenant</th>
              <td mat-cell *matCellDef="let a">
                <div class="apprenant-cell">
                  <div class="avatar-sm">
                    {{ a.apprenant?.prenom?.[0] }}{{ a.apprenant?.nom?.[0] }}
                  </div>
                  <div>
                    <div class="apprenant-nom">
                      {{ a.apprenant?.prenom }} {{ a.apprenant?.nom }}
                    </div>
                    <div class="apprenant-num">{{ a.apprenant?.numeroInscription }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Date & Matière -->
            <ng-container matColumnDef="seance">
              <th mat-header-cell *matHeaderCellDef>Séance</th>
              <td mat-cell *matCellDef="let a">
                <div class="seance-cell">
                  <div class="seance-date">{{ a.date | date:'EEE d MMM' }}</div>
                  <div class="seance-horaire">
                    {{ a.heureDebut }} – {{ a.heureFin }}
                  </div>
                  <div class="seance-mat">{{ a.matiereLibelle }}</div>
                </div>
              </td>
            </ng-container>

            <!-- Durée -->
            <ng-container matColumnDef="duree">
              <th mat-header-cell *matHeaderCellDef>Durée</th>
              <td mat-cell *matCellDef="let a">
                <span class="duree-val">{{ a.dureeHeures }}h</span>
                @if (a.estExamen) {
                  <mat-chip class="chip-examen">Examen</mat-chip>
                }
              </td>
            </ng-container>

            <!-- Statut -->
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [class]="'chip-abs chip-abs-' + a.statut">
                  {{ statutLabel(a.statut) }}
                </mat-chip>
                @if (a.impactNote) {
                  <mat-chip class="chip-note0" matTooltip="Note 0 appliquée">
                    <mat-icon>grade</mat-icon> Note 0
                  </mat-chip>
                }
              </td>
            </ng-container>

            <!-- Notification parent -->
            <ng-container matColumnDef="notification">
              <th mat-header-cell *matHeaderCellDef>Notification</th>
              <td mat-cell *matCellDef="let a">
                @if (a.notifieeParent) {
                  <mat-chip class="chip-notif-ok">
                    <mat-icon>notifications_active</mat-icon> Envoyée
                  </mat-chip>
                } @else {
                  <button mat-stroked-button
                          (click)="notifierParent(a); $event.stopPropagation()"
                          class="btn-notif">
                    <mat-icon>send</mat-icon> Notifier
                  </button>
                }
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                <div class="actions-cell">
                  @if (a.statut === 'non_justifiee') {
                    <button mat-icon-button
                            (click)="ouvrirJustificatif(a); $event.stopPropagation()"
                            matTooltip="Soumettre justificatif">
                      <mat-icon>attach_file</mat-icon>
                    </button>
                  }
                  @if (a.statut === 'en_attente') {
                    <button mat-icon-button color="primary"
                            (click)="ouvrirValidation(a); $event.stopPropagation()"
                            matTooltip="Valider le justificatif">
                      <mat-icon>fact_check</mat-icon>
                    </button>
                  }
                  @if (a.justificatif?.fichierUrl) {
                    <button mat-icon-button
                            (click)="voirJustificatif(a.justificatif!.fichierUrl!); $event.stopPropagation()"
                            matTooltip="Voir le justificatif">
                      <mat-icon>open_in_new</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="table-row"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>event_available</mat-icon>
                <p>Aucune absence trouvée</p>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .alerte-count { background: #d32f2f; color: white; border-radius: 10px; padding: 1px 6px; font-size: 11px; margin-left: 4px; }
    .status-tabs { margin-bottom: 16px; background: white; border-radius: 8px 8px 0 0; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 220px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }

    .apprenant-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 13px; }
    .apprenant-num { font-size: 11px; color: #9e9e9e; }

    .seance-cell { display: flex; flex-direction: column; gap: 2px; }
    .seance-date { font-weight: 500; font-size: 13px; }
    .seance-horaire { font-size: 12px; color: #555; }
    .seance-mat { font-size: 11px; color: #9e9e9e; }

    .duree-val { font-weight: 600; font-size: 14px; color: #c62828; margin-right: 6px; }
    .chip-examen { background: #fce4ec !important; color: #880e4f !important; font-size: 11px !important; min-height: 20px !important; }

    .chip-abs { font-size: 11px !important; min-height: 22px !important; }
    .chip-abs-non_justifiee { background: #fdecea !important; color: #c62828 !important; }
    .chip-abs-en_attente    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-abs-justifiee     { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-abs-rejetee       { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-note0             { background: #b71c1c !important; color: white !important; font-size: 11px !important; min-height: 20px !important; margin-left: 4px; }
    .chip-note0 mat-icon    { font-size: 12px !important; width: 12px !important; height: 12px !important; }
    .chip-notif-ok          { background: #e8f5e9 !important; color: #2e7d32 !important; font-size: 11px !important; }
    .chip-notif-ok mat-icon { font-size: 12px !important; width: 12px !important; height: 12px !important; }
    .btn-notif { font-size: 11px; height: 28px; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .table-row { cursor: default; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class AbsencesListComponent implements OnInit {
  state = inject(AbsenceStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'seance', 'duree', 'statut', 'notification', 'actions'];
  searchQuery    = '';
  filterDateDebut = '';
  filterDateFin   = '';

  private tabStatuts: (StatutAbsence | undefined | 'examen')[] = [
    undefined, 'non_justifiee', 'en_attente', 'justifiee', 'examen',
  ];

  ngOnInit(): void {
    this.state.loadAbsences();
  }

  onTabChange(index: number): void {
    const statut = this.tabStatuts[index];
    if (statut === 'examen') {
      this.state.loadAbsences({ estExamen: true });
    } else {
      this.state.loadAbsences({ statut: statut as StatutAbsence | undefined });
    }
  }

  onFilter(): void {
    this.state.loadAbsences({
      dateDebut: this.filterDateDebut || undefined,
      dateFin:   this.filterDateFin   || undefined,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadAbsences({ page: e.pageIndex + 1 });
  }

  statutLabel(s: StatutAbsence): string {
    const map: Record<StatutAbsence, string> = {
      non_justifiee: 'Non justifiée',
      en_attente:    'En attente',
      justifiee:     'Justifiée',
      rejetee:       'Rejetée',
    };
    return map[s] ?? s;
  }

  notifierParent(absence: Absence): void {
    this.state.notifierParent(absence.id, () =>
      this.snackBar.open('Notification envoyée', 'Fermer', { duration: 3000 })
    );
  }

  ouvrirJustificatif(absence: Absence): void {
    const ref = this.dialog.open(JustificatifDialogComponent, {
      width: '520px', data: { absence },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.soumettreJustificatif(result, () =>
          this.snackBar.open('Justificatif soumis', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  ouvrirValidation(absence: Absence): void {
    const ref = this.dialog.open(ValiderJustificatifDialogComponent, {
      width: '480px', data: { absence },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.validerJustificatif(result, () => {
          const msg = result.statut === 'accepte'
            ? 'Justificatif accepté'
            : 'Justificatif rejeté';
          this.snackBar.open(msg, 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  voirJustificatif(url: string): void {
    window.open(url, '_blank');
  }

  goToJustificatifs(): void {
    this.state.loadAbsences({ statut: 'en_attente' });
  }
}
