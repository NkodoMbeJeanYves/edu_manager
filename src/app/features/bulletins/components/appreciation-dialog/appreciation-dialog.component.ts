import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Bulletin } from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-appreciation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>rate_review</mat-icon> Appréciation du bulletin
    </h2>
    <mat-dialog-content>
      <p class="apprenant-label">
        <strong>{{ data.bulletin.apprenant?.prenom }} {{ data.bulletin.apprenant?.nom }}</strong>
        — {{ data.bulletin.periode?.libelle }}
      </p>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Appréciation générale</mat-label>
          <textarea matInput formControlName="appreciationGenerale" rows="3"
                    placeholder="Appréciation du conseil de classe..."></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Appréciation du professeur principal</mat-label>
          <textarea matInput formControlName="appreciationProfPrincipal" rows="3"
                    placeholder="Appréciation du professeur principal..."></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Décision</mat-label>
          <mat-select formControlName="decision">
            <mat-option value="">— Aucune —</mat-option>
            <mat-option value="passage">Passage en classe supérieure</mat-option>
            <mat-option value="passage_conditionnel">Passage conditionnel</mat-option>
            <mat-option value="redoublement">Redoublement</mat-option>
            <mat-option value="felicitations">Félicitations</mat-option>
            <mat-option value="encouragements">Encouragements</mat-option>
            <mat-option value="mise_en_garde">Mise en garde</mat-option>
            <mat-option value="tableau_honneur">Tableau d'honneur</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()">
        <mat-icon>save</mat-icon> Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .apprenant-label { color: #555; margin-bottom: 12px; font-size: 14px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
  `]
})
export class AppreciationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AppreciationDialogComponent>);
  readonly data: { bulletin: Bulletin } = inject(MAT_DIALOG_DATA);
  form = this.fb.group({
    appreciationGenerale:      [this.data.bulletin.appreciationGenerale ?? ''],
    appreciationProfPrincipal: [this.data.bulletin.appreciationProfPrincipal ?? ''],
    decision:                  [this.data.bulletin.decision ?? ''],
  });
  submit(): void {
    const v = this.form.value;
    this.dialogRef.close({
      ...v,
      decision: v.decision || undefined,
    });
  }
}
