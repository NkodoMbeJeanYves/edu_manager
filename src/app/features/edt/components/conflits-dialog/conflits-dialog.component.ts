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
  templateUrl: './conflits-dialog.component.html',
  styleUrl: './conflits-dialog.component.scss'
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
