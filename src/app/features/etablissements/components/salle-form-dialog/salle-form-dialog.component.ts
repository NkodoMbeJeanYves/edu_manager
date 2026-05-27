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
  template: `
    <h2 mat-dialog-title>{{ data.salle ? 'Modifier la salle' : 'Nouvelle salle' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Campus *</mat-label>
          <mat-select formControlName="campusId">
            @for (c of data.campus; track c.id) {
              <mat-option [value]="c.id">{{ c.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: B204">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Le code est obligatoire</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nom *</mat-label>
            <input matInput formControlName="nom" placeholder="Ex: Salle 204">
            @if (form.get('nom')?.hasError('required') && form.get('nom')?.touched) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="cours">Salle de cours</mat-option>
              <mat-option value="amphi">Amphithéâtre</mat-option>
              <mat-option value="laboratoire">Laboratoire</mat-option>
              <mat-option value="informatique">Salle informatique</mat-option>
              <mat-option value="sport">Salle de sport</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Capacité *</mat-label>
            <input matInput formControlName="capacite" type="number" min="1">
            @if (form.get('capacite')?.hasError('min') && form.get('capacite')?.touched) {
              <mat-error>Minimum 1 place</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Bâtiment</mat-label>
            <input matInput formControlName="batiment" placeholder="Ex: Bâtiment A">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Étage</mat-label>
            <input matInput formControlName="etage" type="number" placeholder="Ex: 2">
          </mat-form-field>
        </div>

        @if (data.salle) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut">
              <mat-option value="disponible">Disponible</mat-option>
              <mat-option value="maintenance">En maintenance</mat-option>
              <mat-option value="indisponible">Indisponible</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.salle ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
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
