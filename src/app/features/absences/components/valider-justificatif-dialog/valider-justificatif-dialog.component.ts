import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Absence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-valider-justificatif-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './valider-justificatif-dialog.component.html',
  styleUrl: './valider-justificatif-dialog.component.scss'
})
export class ValiderJustificatifDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ValiderJustificatifDialogComponent>);
  readonly data: { absence: Absence } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    commentaire: [''],
  });

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      medical: 'Certificat médical', familial: 'Motif familial',
      administratif: 'Démarche administrative', transport: 'Problème de transport',
      autre: 'Autre',
    };
    return map[type] ?? type;
  }

  submit(statut: 'accepte' | 'rejete'): void {
    this.dialogRef.close({
      justificatifId: this.data.absence.justificatif!.id,
      statut,
      commentaire: this.form.value.commentaire || undefined,
    });
  }
}
