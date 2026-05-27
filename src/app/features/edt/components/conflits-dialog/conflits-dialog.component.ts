import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ConflitEDT } from '../../../../core/models/edt.models';

@Component({
  selector: 'app-conflits-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatListModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Conflits détectés ({{ data.conflits.length }})
    </h2>
    <mat-dialog-content>
      <mat-list>
        @for (conflit of data.conflits; track $index) {
          <mat-list-item>
            <mat-icon matListItemIcon color="warn">
              {{ conflitIcon(conflit.type) }}
            </mat-icon>
            <div matListItemTitle>{{ conflitLabel(conflit.type) }}</div>
            <div matListItemLine>{{ conflit.message }}</div>
          </mat-list-item>

          @if (conflit.sallesAlternatives?.length) {
            <div class="alternatives">
              <span class="alt-label">Salles disponibles :</span>
              @for (salle of conflit.sallesAlternatives; track salle.id) {
                <mat-chip class="chip-salle-alt">
                  {{ salle.code }} ({{ salle.capacite }} places)
                </mat-chip>
              }
            </div>
          }
          <mat-divider></mat-divider>
        }
      </mat-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
      <button mat-raised-button color="warn"
              (click)="dialogRef.close('forcer')">
        <mat-icon>warning</mat-icon> Forcer la création
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .alternatives { padding: 6px 16px 10px 56px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .alt-label { font-size: 12px; color: #555; }
    .chip-salle-alt { background: #e8f5e9 !important; color: #2e7d32 !important; font-size: 11px !important; }
  `]
})
export class ConflitsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConflitsDialogComponent>);
  readonly data: { conflits: ConflitEDT[] } = inject(MAT_DIALOG_DATA);

  conflitLabel(type: string): string {
    const map: Record<string, string> = {
      enseignant_double: 'Enseignant déjà occupé',
      salle_double:      'Salle déjà réservée',
      groupe_double:     'Groupe déjà en cours',
      hors_periode:      'Hors période académique',
    };
    return map[type] ?? type;
  }

  conflitIcon(type: string): string {
    const map: Record<string, string> = {
      enseignant_double: 'person_off',
      salle_double:      'meeting_room',
      groupe_double:     'group_off',
      hors_periode:      'event_busy',
    };
    return map[type] ?? 'warning';
  }
}
