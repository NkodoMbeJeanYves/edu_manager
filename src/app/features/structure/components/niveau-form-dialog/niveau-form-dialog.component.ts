import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Filiere, Niveau } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-niveau-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.niveau ? 'edit' : 'add' }}</mat-icon>
      {{ data.niveau ? 'Modifier le niveau' : 'Nouveau niveau' }}
      <span class="filiere-badge">{{ data.filiere.libelle }}</span>
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code"
                   [placeholder]="data.filiere.cycle?.typeFormation === 'universitaire' ? 'Ex: L1, M2' : 'Ex: 6EME, TLE'">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle"
                   [placeholder]="data.filiere.cycle?.typeFormation === 'universitaire' ? 'Ex: Licence 1' : 'Ex: 6ème'">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Ordre dans la filière *</mat-label>
          <input matInput formControlName="ordre" type="number" min="1">
          <mat-hint>1 = premier niveau</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.niveau ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 420px; }
    h2 { display: flex; align-items: center; gap: 8px; }
    h2 mat-icon { vertical-align: middle; }
    .filiere-badge { font-size: 13px; font-weight: 400; color: #757575; margin-left: 4px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .half-width { width: 48%; }
  `]
})
export class NiveauFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<NiveauFormDialogComponent>);
  readonly data: { niveau?: Niveau; filiere: Filiere } = inject(MAT_DIALOG_DATA);

  private n = this.data.niveau;
  form = this.fb.group({
    code:          [this.n?.code    ?? '', Validators.required],
    libelle:       [this.n?.libelle ?? '', Validators.required],
    ordre:         [this.n?.ordre   ?? 1,  [Validators.required, Validators.min(1)]],
    typeFormation: [this.n?.typeFormation ?? (this.data.filiere.cycle?.typeFormation ?? 'scolaire')],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
