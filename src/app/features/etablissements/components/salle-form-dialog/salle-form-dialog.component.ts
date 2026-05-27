import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Campus, Salle } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-salle-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  templateUrl: './salle-form-dialog.component.html',
  styleUrl: './salle-form-dialog.component.scss'
})
export class SalleFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<SalleFormDialogComponent>);
  readonly data: { salle?: Salle; campus: Campus[] } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    campusId:  [this.data.salle?.campusId ?? (this.data.campus[0]?.id ?? ''), Validators.required],
    code:      [this.data.salle?.code     ?? '',     Validators.required],
    nom:       [this.data.salle?.nom      ?? '',     Validators.required],
    type:      [this.data.salle?.type     ?? 'cours', Validators.required],
    capacite:  [this.data.salle?.capacite ?? 30,     [Validators.required, Validators.min(1)]],
    batiment:  [this.data.salle?.batiment ?? ''],
    etage:     [this.data.salle?.etage    ?? null],
    statut:    [this.data.salle?.statut   ?? 'disponible'],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
