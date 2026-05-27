import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Groupe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-groupe-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.groupe ? 'edit' : 'group_add' }}</mat-icon>
      {{ data.groupe ? 'Modifier le groupe' : 'Nouveau groupe TD/TP' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: TD1, TP-A">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle" placeholder="Ex: Groupe TD 1">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="td">TD — Travaux dirigés</mat-option>
              <mat-option value="tp">TP — Travaux pratiques</mat-option>
              <mat-option value="langue">Langue vivante</mat-option>
              <mat-option value="option">Option / Électif</mat-option>
              <mat-option value="sport">Sport</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Capacité maximale *</mat-label>
            <input matInput formControlName="capaciteMax" type="number" min="1">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Enseignant responsable (ID)</mat-label>
          <input matInput formControlName="enseignantId"
                 placeholder="Sera remplacé par sélecteur via M05">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.groupe ? 'Enregistrer' : 'Créer' }}
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
  `]
})
export class GroupeFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<GroupeFormDialogComponent>);
  readonly data: { groupe?: Groupe; promotionId: string } = inject(MAT_DIALOG_DATA);

  private g = this.data.groupe;
  form = this.fb.group({
    code:        [this.g?.code        ?? '', Validators.required],
    libelle:     [this.g?.libelle     ?? '', Validators.required],
    type:        [this.g?.type        ?? 'td', Validators.required],
    capaciteMax: [this.g?.capaciteMax ?? 25, [Validators.required, Validators.min(1)]],
    enseignantId:[this.g?.enseignantId ?? ''],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        promotionId: this.data.promotionId,
        enseignantId: this.form.value.enseignantId || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
