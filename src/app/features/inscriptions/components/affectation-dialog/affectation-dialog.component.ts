import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-affectation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>class</mat-icon>
      Affecter une classe / promotion
    </h2>
    <mat-dialog-content>
      <p class="apprenant-label">
        <strong>{{ data.inscription.apprenant?.prenom }} {{ data.inscription.apprenant?.nom }}</strong>
      </p>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type d'apprenant</mat-label>
          <mat-select formControlName="typeAffectation">
            <mat-option value="classe">Classe (scolaire)</mat-option>
            <mat-option value="promotion">Promotion (universitaire)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>
            {{ form.get('typeAffectation')?.value === 'classe' ? 'ID de la classe *' : 'ID de la promotion *' }}
          </mat-label>
          <input matInput [formControlName]="form.get('typeAffectation')?.value === 'classe' ? 'classeId' : 'promotionId'"
                 placeholder="Identifiant de la classe ou promotion">
          <mat-hint>Ce champ sera remplacé par un sélecteur une fois M02 implémenté</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        <mat-icon>save</mat-icon> Affecter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 440px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .apprenant-label { color: #555; margin-bottom: 16px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
  `]
})
export class AffectationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AffectationDialogComponent>);
  readonly data: { inscription: Inscription } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    typeAffectation: ['classe'],
    classeId:        [''],
    promotionId:     [''],
  });

  submit(): void {
    const v = this.form.value;
    const result = v.typeAffectation === 'classe'
      ? { classeId: v.classeId }
      : { promotionId: v.promotionId };
    this.dialogRef.close(result);
  }
}
