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
  template: `
    <h2 mat-dialog-title>
      {{ data.annee ? "Modifier l'année académique" : "Nouvelle année académique" }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Libellé *</mat-label>
          <input matInput formControlName="libelle" placeholder="Ex: 2024-2025">
          @if (form.get('libelle')?.hasError('required') && form.get('libelle')?.touched) {
            <mat-error>Le libellé est obligatoire</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Périodicité *</mat-label>
          <mat-select formControlName="typePeriode">
            <mat-option value="semestre">Semestres (universitaire)</mat-option>
            <mat-option value="trimestre">Trimestres (scolaire)</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Date de début *</mat-label>
            <input matInput [matDatepicker]="dpDebut" formControlName="dateDebut">
            <mat-datepicker-toggle matSuffix [for]="dpDebut"></mat-datepicker-toggle>
            <mat-datepicker #dpDebut></mat-datepicker>
            @if (form.get('dateDebut')?.hasError('required') && form.get('dateDebut')?.touched) {
              <mat-error>Date requise</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de fin *</mat-label>
            <input matInput [matDatepicker]="dpFin" formControlName="dateFin">
            <mat-datepicker-toggle matSuffix [for]="dpFin"></mat-datepicker-toggle>
            <mat-datepicker #dpFin></mat-datepicker>
            @if (form.get('dateFin')?.hasError('required') && form.get('dateFin')?.touched) {
              <mat-error>Date requise</mat-error>
            }
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.annee ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 460px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
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
