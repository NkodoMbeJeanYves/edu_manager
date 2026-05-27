import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { AbsenceStateService } from '../../services/absence-state.service';
import { StatsAbsenteisme } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-alertes-absenteisme',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatTooltipModule, MatTableModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-button routerLink="/absences" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="page-title">Alertes absentéisme</h1>
            <p class="page-sub">
              Seuil actuel : <strong>{{ state.seuil() }}h</strong> d'absences injustifiées
            </p>
          </div>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="seuil-field">
            <mat-label>Nouveau seuil (heures)</mat-label>
            <input matInput type="number" [(ngModel)]="nouveauSeuil" min="1">
          </mat-form-field>
          <button mat-stroked-button (click)="updateSeuil()">
            <mat-icon>tune</mat-icon> Appliquer
          </button>
        </div>
      </div>

      <!-- Compteur global -->
      @if (state.apprenantsDessusSeui().length > 0) {
        <div class="alerte-globale">
          <mat-icon>warning</mat-icon>
          <div>
            <strong>{{ state.apprenantsDessusSeui().length }} apprenant(s)</strong>
            ont dépassé le seuil de {{ state.seuil() }}h d'absences injustifiées.
          </div>
        </div>
      } @else {
        <div class="ok-globale">
          <mat-icon>check_circle</mat-icon>
          <span>Aucun apprenant ne dépasse le seuil d'alerte actuellement.</span>
        </div>
      }

      <!-- Table des apprenants en alerte -->
      @if (state.loadingStats()) {
        <div class="loading-container"><mat-spinner diameter="36"></mat-spinner></div>
      } @else {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.apprenantsDessusSeui()">

            <ng-container matColumnDef="apprenant">
              <th mat-header-cell *matHeaderCellDef>Apprenant</th>
              <td mat-cell *matCellDef="let s">
                <div class="apprenant-cell">
                  <div class="avatar-sm alert-avatar">
                    {{ s.apprenantNom?.[0] ?? '?' }}
                  </div>
                  <span class="apprenant-nom">{{ s.apprenantNom }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="heuresTotal">
              <th mat-header-cell *matHeaderCellDef>Total absences</th>
              <td mat-cell *matCellDef="let s">
                <span class="h-val">{{ s.totalHeures }}h</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="heuresInjust">
              <th mat-header-cell *matHeaderCellDef>Non justifiées</th>
              <td mat-cell *matCellDef="let s">
                <span class="h-val h-danger">{{ s.heuresInjustifiees }}h</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="taux">
              <th mat-header-cell *matHeaderCellDef>Taux absentéisme</th>
              <td mat-cell *matCellDef="let s">
                <div class="taux-cell">
                  <span [class]="getTauxClass(s.tauxAbsenteisme)">
                    {{ s.tauxAbsenteisme }}%
                  </span>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="s.tauxAbsenteisme"
                    [color]="s.tauxAbsenteisme > 30 ? 'warn' : 'primary'"
                    class="taux-bar">
                  </mat-progress-bar>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="examens">
              <th mat-header-cell *matHeaderCellDef>Absences examen</th>
              <td mat-cell *matCellDef="let s">
                @if (s.absencesExamen > 0) {
                  <mat-chip class="chip-examen-alerte">
                    <mat-icon>grade</mat-icon> {{ s.absencesExamen }}
                  </mat-chip>
                } @else {
                  <span class="cell-ok">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button mat-stroked-button
                        [routerLink]="['/absences', 'apprenant', s.apprenantId]"
                        class="btn-detail">
                  <mat-icon>folder_open</mat-icon> Dossier
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"
                class="alerte-row"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="cols.length">
                <mat-icon>check_circle</mat-icon>
                <p>Aucune alerte</p>
              </td>
            </tr>
          </table>
        </div>
      }

      <!-- Stats par matière (si apprenant sélectionné) -->
      @if (state.statsApprenant()?.parMatiere?.length) {
        <div class="matieres-section">
          <h3>Répartition par matière</h3>
          <div class="matieres-grid">
            @for (m of state.statsApprenant()!.parMatiere!; track m.matiereId) {
              <mat-card class="matiere-card"
                        [class.matiere-alerte]="m.taux > 30">
                <mat-card-header>
                  <mat-card-title>{{ m.matiereLibelle }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ m.heuresAbsence }}h / {{ m.totalHeures }}h
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="m.taux"
                    [color]="m.taux > 30 ? 'warn' : 'primary'">
                  </mat-progress-bar>
                  <span [class]="getTauxClass(m.taux)">{{ m.taux }}%</span>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: flex-start; gap: 8px; }
    .back-btn { min-width: 40px; margin-top: 4px; }
    .page-title { margin: 0; font-size: 22px; font-weight: 600; }
    .page-sub { margin: 4px 0 0; font-size: 13px; color: #757575; }
    .header-actions { display: flex; align-items: flex-end; gap: 8px; }
    .seuil-field { width: 160px; }

    .alerte-globale { display: flex; align-items: center; gap: 12px; background: #fff3e0; border: 1px solid #ffcc80; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; color: #e65100; font-size: 14px; }
    .alerte-globale mat-icon { font-size: 24px; color: #e65100; }
    .ok-globale { display: flex; align-items: center; gap: 10px; background: #e8f5e9; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; color: #2e7d32; font-size: 14px; }
    .ok-globale mat-icon { color: #2e7d32; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .table-container { border-radius: 8px; overflow: hidden; margin-bottom: 24px; }

    .apprenant-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .alert-avatar { background: #fdecea; color: #c62828; }
    .apprenant-nom { font-weight: 500; }
    .h-val { font-weight: 600; font-size: 14px; }
    .h-danger { color: #c62828; }
    .taux-cell { display: flex; flex-direction: column; gap: 4px; min-width: 120px; }
    .taux-bar { height: 6px; border-radius: 3px; }
    .taux-ok   { color: #2e7d32; font-weight: 600; }
    .taux-warn { color: #e65100; font-weight: 600; }
    .taux-danger { color: #c62828; font-weight: 700; }
    .chip-examen-alerte { background: #fdecea !important; color: #c62828 !important; font-size: 11px !important; }
    .chip-examen-alerte mat-icon { font-size: 12px !important; }
    .cell-ok { color: #9e9e9e; font-size: 12px; }
    .btn-detail { font-size: 12px; }
    .alerte-row { background: #fff8f5; }
    .no-data { text-align: center; padding: 40px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }

    .matieres-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .matieres-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .matiere-card { border: 1px solid #e0e0e0; }
    .matiere-alerte { border-color: #ffb74d; }
  `]
})
export class AlertesAbsenteismeComponent implements OnInit {
  state    = inject(AbsenceStateService);
  private snackBar = inject(MatSnackBar);

  nouveauSeuil = 10;
  cols = ['apprenant', 'heuresTotal', 'heuresInjust', 'taux', 'examens', 'actions'];

  ngOnInit(): void {
    this.nouveauSeuil = this.state.seuil();
  }

  getTauxClass(taux: number): string {
    if (taux > 30) return 'taux-danger';
    if (taux > 15) return 'taux-warn';
    return 'taux-ok';
  }

  updateSeuil(): void {
    const params = this.state.parametres();
    if (!params) return;
    this.state.updateParametres(params.etablissementId, {
      seuilAlerte: this.nouveauSeuil,
    }, () =>
      this.snackBar.open('Seuil mis à jour', 'Fermer', { duration: 3000 })
    );
  }
}
