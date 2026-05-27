import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Classe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-classe-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './classe-form-dialog.component.html',
  styleUrl: './classe-form-dialog.component.scss'
})
export class ClasseFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ClasseFormDialogComponent>);
  readonly data: { classe?: Classe } = inject(MAT_DIALOG_DATA);

  private c = this.data.classe;
  form = this.fb.group({
    code:                  [this.c?.code                  ?? '', Validators.required],
    libelle:               [this.c?.libelle               ?? '', Validators.required],
    filiereId:             [this.c?.filiereId             ?? '', Validators.required],
    niveauId:              [this.c?.niveauId              ?? '', Validators.required],
    capaciteMax:           [this.c?.capaciteMax           ?? 35, [Validators.required, Validators.min(1)]],
    salle:                 [this.c?.salle                 ?? ''],
    anneeAcademiqueId:     [(this.c as any)?.anneeAcademiqueId ?? '', Validators.required],
    etablissementId:       [(this.c as any)?.etablissementId   ?? '', Validators.required],
    professeurPrincipalId: [this.c?.professeurPrincipalId ?? ''],
    statut:                [this.c?.statut                ?? 'active'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        professeurPrincipalId: v.professeurPrincipalId || undefined,
        salle: v.salle || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
