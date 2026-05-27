import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AnneeAcademique } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-annee-academique-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './annee-academique-form-dialog.component.html',
  styleUrl: './annee-academique-form-dialog.component.scss'
})
export class AnneeAcademiqueFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AnneeAcademiqueFormDialogComponent>);
  readonly data: { annee?: AnneeAcademique; etablissementId: string } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    libelle:     [this.data.annee?.libelle     ?? '',          Validators.required],
    typePeriode: [this.data.annee?.typePeriode ?? 'semestre',  Validators.required],
    dateDebut:   [this.data.annee?.dateDebut   ?? null,        Validators.required],
    dateFin:     [this.data.annee?.dateFin     ?? null,        Validators.required],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
