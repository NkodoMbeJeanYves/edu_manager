import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Promotion } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-promotion-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.promotion ? 'edit' : 'groups' }}</mat-icon>
      {{ data.promotion ? 'Modifier la promotion' : 'Nouvelle promotion' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: INFO-L2-2024">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle" placeholder="Ex: Licence 2 Informatique">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Filière (ID) *</mat-label>
          <input matInput formControlName="filiereId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Niveau (ID) *</mat-label>
          <input matInput formControlName="niveauId">
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Capacité maximale *</mat-label>
            <input matInput formControlName="capaciteMax" type="number" min="1">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Responsable (ID)</mat-label>
            <input matInput formControlName="responsableId">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Année académique (ID) *</mat-label>
          <input matInput formControlName="anneeAcademiqueId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
        </mat-form-field>
        @if (data.promotion) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut">
              <mat-option value="active">Active</mat-option>
              <mat-option value="archivee">Archivée</mat-option>
              <mat-option value="fermee">Fermée</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.promotion ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 500px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class PromotionFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<PromotionFormDialogComponent>);
  readonly data: { promotion?: Promotion } = inject(MAT_DIALOG_DATA);

  private p = this.data.promotion;
  form = this.fb.group({
    code:              [this.p?.code          ?? '', Validators.required],
    libelle:           [this.p?.libelle       ?? '', Validators.required],
    filiereId:         [this.p?.filiereId     ?? '', Validators.required],
    niveauId:          [this.p?.niveauId      ?? '', Validators.required],
    capaciteMax:       [this.p?.capaciteMax   ?? 50, [Validators.required, Validators.min(1)]],
    responsableId:     [this.p?.responsableId ?? ''],
    anneeAcademiqueId: [(this.p as any)?.anneeAcademiqueId ?? '', Validators.required],
    etablissementId:   [(this.p as any)?.etablissementId   ?? '', Validators.required],
    statut:            [this.p?.statut        ?? 'active'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({ ...v, responsableId: v.responsableId || undefined });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
