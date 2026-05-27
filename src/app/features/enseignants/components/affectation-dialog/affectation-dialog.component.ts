import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Enseignant } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-affectation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>book</mat-icon>
      Affecter une matière — {{ data.enseignant.prenom }} {{ data.enseignant.nom }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Matière (ID) *</mat-label>
          <input matInput formControlName="matiereId"
                 placeholder="Sera remplacé par sélecteur M03">
          <mat-hint>Sélecteur dynamique alimenté par ReferentielStateService</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Heures prévues *</mat-label>
          <input matInput formControlName="heuresPrevues" type="number" min="1">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Classe (ID)</mat-label>
          <input matInput formControlName="classeId"
                 placeholder="Via StructureStateService M02">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Promotion (ID)</mat-label>
          <input matInput formControlName="promotionId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Année académique (ID) *</mat-label>
          <input matInput formControlName="anneeAcademiqueId">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>check</mat-icon> Affecter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class AffectationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AffectationDialogComponent>);
  readonly data: { enseignant: Enseignant } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    matiereId:         ['', Validators.required],
    heuresPrevues:     [18, [Validators.required, Validators.min(1)]],
    classeId:          [''],
    promotionId:       [''],
    anneeAcademiqueId: ['', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        enseignantId: this.data.enseignant.id,
        ...this.form.value,
        classeId:    this.form.value.classeId    || undefined,
        promotionId: this.form.value.promotionId || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
