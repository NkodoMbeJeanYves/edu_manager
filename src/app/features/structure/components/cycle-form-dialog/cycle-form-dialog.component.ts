import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Cycle } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-cycle-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.cycle ? 'edit' : 'add_circle' }}</mat-icon>
      {{ data.cycle ? 'Modifier le cycle' : 'Nouveau cycle' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: SEC1">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle" placeholder="Ex: Secondaire 1er cycle">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type de cycle *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="primaire">Primaire</mat-option>
              <mat-option value="secondaire">Secondaire</mat-option>
              <mat-option value="superieur">Supérieur</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type formation *</mat-label>
            <mat-select formControlName="typeFormation">
              <mat-option value="scolaire">Scolaire</mat-option>
              <mat-option value="universitaire">Universitaire</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Ordre d'affichage</mat-label>
          <input matInput formControlName="ordre" type="number" min="1">
        </mat-form-field>
        @if (data.cycle) {
          <mat-checkbox formControlName="actif">Cycle actif</mat-checkbox>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.cycle ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 460px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .half-width { width: 48%; }
  `]
})
export class CycleFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CycleFormDialogComponent>);
  readonly data: { cycle?: Cycle; etablissementId?: string; forceType?: string } = inject(MAT_DIALOG_DATA);

  private c = this.data.cycle;
  form = this.fb.group({
    code:          [this.c?.code          ?? '',              Validators.required],
    libelle:       [this.c?.libelle       ?? '',              Validators.required],
    type:          [this.c?.type          ?? 'secondaire',    Validators.required],
    typeFormation: [this.c?.typeFormation ?? (this.data?.forceType === 'universitaire' ? 'universitaire' : 'scolaire'), Validators.required],
    description:   [this.c?.description  ?? ''],
    ordre:         [this.c?.ordre        ?? 1],
    actif:         [this.c?.actif        ?? true],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        etablissementId: this.data?.etablissementId,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
