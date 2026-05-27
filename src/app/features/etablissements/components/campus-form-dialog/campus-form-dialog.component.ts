import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Campus } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-campus-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.campus ? 'Modifier le campus' : 'Nouveau campus' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nom *</mat-label>
            <input matInput formControlName="nom">
            @if (form.get('nom')?.hasError('required') && form.get('nom')?.touched) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Le code est obligatoire</mat-error>
            }
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse *</mat-label>
          <input matInput formControlName="adresse">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ville *</mat-label>
          <input matInput formControlName="ville">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Téléphone directeur</mat-label>
          <input matInput formControlName="telephoneDirecteur" type="tel">
        </mat-form-field>
        <mat-checkbox formControlName="principal">Campus principal</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.campus ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 420px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class CampusFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CampusFormDialogComponent>);
  readonly data: { campus?: Campus; etablissementId: string } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    nom:                [this.data.campus?.nom ?? '',                Validators.required],
    code:               [this.data.campus?.code ?? '',               Validators.required],
    adresse:            [this.data.campus?.adresse ?? '',            Validators.required],
    ville:              [this.data.campus?.ville ?? '',              Validators.required],
    telephoneDirecteur: [this.data.campus?.telephoneDirecteur ?? ''],
    principal:          [this.data.campus?.principal ?? false],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
