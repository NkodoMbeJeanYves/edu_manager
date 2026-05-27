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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { CreateDeliberationDialogComponent } from '../../components/create-deliberation-dialog/create-deliberation-dialog.component';

@Component({
  selector: 'app-deliberations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-button routerLink="/bulletins" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Délibérations</h1>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> Nouvelle délibération
        </button>
      </div>

      @if (state.loadingDeliberation()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (!state.loadingDeliberation()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.deliberations()">

            <ng-container matColumnDef="classe">
              <th mat-header-cell *matHeaderCellDef>Classe / Promotion</th>
              <td mat-cell *matCellDef="let d">
                <strong>{{ d.classeOuPromotionLibelle }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let d">
                <mat-chip [class]="'chip-delib-' + d.type">
                  {{ d.type === 'conseil_classe' ? 'Conseil de classe' : 'Jury universitaire' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="session">
              <th mat-header-cell *matHeaderCellDef>Session</th>
              <td mat-cell *matCellDef="let d">
                {{ d.session ?? '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let d">
                {{ d.dateDeliberation ? (d.dateDeliberation | date:'dd/MM/yyyy') : '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="president">
              <th mat-header-cell *matHeaderCellDef>Président</th>
              <td mat-cell *matCellDef="let d">
                <span class="cell-secondary">{{ d.president ?? '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let d">
                <mat-chip [class]="'chip-delib-statut-' + d.statut">
                  {{ statutLabel(d.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let d">
                <button mat-icon-button [routerLink]="[d.id]" matTooltip="Ouvrir">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"
                class="table-row" [routerLink]="[row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="cols.length">
                <mat-icon>gavel</mat-icon>
                <p>Aucune délibération</p>
              </td>
            </tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 4px; }
    .back-btn { min-width: 40px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    .cell-secondary { font-size: 12px; color: #757575; }
    .chip-delib-conseil_classe  { background: #e3f2fd !important; color: #1565c0 !important; font-size: 12px !important; }
    .chip-delib-jury_universitaire { background: #e8eaf6 !important; color: #283593 !important; font-size: 12px !important; }
    .chip-delib-statut-preparation { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-delib-statut-en_cours    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-delib-statut-terminee    { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-delib-statut-signee      { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-delib-statut-publiee     { background: #e8eaf6 !important; color: #1a237e !important; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
  `]
})
export class DeliberationsListComponent implements OnInit {
  state = inject(BulletinStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['classe', 'type', 'session', 'date', 'president', 'statut', 'actions'];

  ngOnInit(): void {
    this.state.loadDeliberations();
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      preparation: 'En préparation', en_cours: 'En cours',
      terminee: 'Terminée', signee: 'Signée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateDeliberationDialogComponent, { width: '580px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createDeliberation(result, () => {
          this.snackBar.open('Délibération créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }
}
