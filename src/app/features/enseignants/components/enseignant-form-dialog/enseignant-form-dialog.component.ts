import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Enseignant } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-enseignant-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatDividerModule,
  ],
  templateUrl: './enseignant-form-dialog.component.html',
  styleUrl: './enseignant-form-dialog.component.scss',
})
export class EnseignantFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EnseignantFormDialogComponent>);
  readonly data: { enseignant?: Enseignant } = inject(MAT_DIALOG_DATA);

  private e = this.data.enseignant;

  form = this.fb.group({
    prenom:            [this.e?.prenom          ?? '', Validators.required],
    nom:               [this.e?.nom             ?? '', Validators.required],
    email:             [this.e?.email           ?? '', [Validators.required, Validators.email]],
    telephone:         [this.e?.telephone       ?? ''],
    genre:             [this.e?.genre           ?? 'M', Validators.required],
    adresse:           [this.e?.adresse         ?? ''],
    typeContrat:       [this.e?.typeContrat      ?? 'titulaire', Validators.required],
    niveauDiplome:     [this.e?.niveauDiplome    ?? ''],
    dateEntree:        [this.e?.dateEntree       ?? null, Validators.required],
    chargeHoraireMax:  [this.e?.chargeHoraireMax ?? 18],
    tauxHoraire:       [this.e?.tauxHoraire      ?? null],
    etablissementId:   [this.e?.etablissementId  ?? '', Validators.required],
    statut:            [this.e?.statut          ?? 'actif'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        telephone:     v.telephone     || undefined,
        adresse:       v.adresse       || undefined,
        niveauDiplome: v.niveauDiplome || undefined,
        tauxHoraire:   v.tauxHoraire   || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
