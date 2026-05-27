import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Etablissement } from '../../../../core/models/etablissement.models';

interface DialogData { etablissement?: Etablissement; }

@Component({
  selector: 'app-etablissement-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.etablissement ? 'edit' : 'add_business' }}</mat-icon>
      {{ data.etablissement ? "Modifier l'établissement" : "Nouvel établissement" }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom de l'établissement *</mat-label>
          <input matInput formControlName="nom" placeholder="Ex: Lycée Mohammed V">
          @if (form.get('nom')?.hasError('required') && form.get('nom')?.touched) {
            <mat-error>Le nom est obligatoire</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: LMV" style="text-transform:uppercase">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Le code est obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="scolaire">Scolaire</mat-option>
              <mat-option value="universitaire">Universitaire</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse *</mat-label>
          <input matInput formControlName="adresse" placeholder="Rue, numéro...">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Ville *</mat-label>
            <input matInput formControlName="ville">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Pays *</mat-label>
            <input matInput formControlName="pays">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Téléphone *</mat-label>
            <input matInput formControlName="telephone" type="tel">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email *</mat-label>
            <input matInput formControlName="email" type="email">
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Email invalide</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Site web</mat-label>
          <input matInput formControlName="siteWeb" placeholder="https://...">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.etablissement ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding-top: 8px; min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class EtablissementFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EtablissementFormDialogComponent>);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    nom:       [this.data.etablissement?.nom ?? '',       Validators.required],
    code:      [this.data.etablissement?.code ?? '',      Validators.required],
    type:      [this.data.etablissement?.type ?? 'scolaire', Validators.required],
    adresse:   [this.data.etablissement?.adresse ?? '',   Validators.required],
    ville:     [this.data.etablissement?.ville ?? '',     Validators.required],
    pays:      [this.data.etablissement?.pays ?? 'Maroc', Validators.required],
    telephone: [this.data.etablissement?.telephone ?? '', Validators.required],
    email:     [this.data.etablissement?.email ?? '',     [Validators.required, Validators.email]],
    siteWeb:   [this.data.etablissement?.siteWeb ?? ''],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
