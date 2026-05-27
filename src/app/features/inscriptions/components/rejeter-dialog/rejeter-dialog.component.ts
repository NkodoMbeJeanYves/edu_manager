import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-rejeter-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">cancel</mat-icon>
      Rejeter l'inscription
    </h2>
    <mat-dialog-content>
      <p class="apprenant-label">
        Inscription de <strong>{{ data.inscription.apprenant?.prenom }} {{ data.inscription.apprenant?.nom }}</strong>
      </p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motif du rejet *</mat-label>
          <textarea matInput formControlName="motifRejet" rows="4"
                    placeholder="Expliquez la raison du rejet..."></textarea>
          @if (form.get('motifRejet')?.hasError('required') && form.get('motifRejet')?.touched) {
            <mat-error>Le motif est obligatoire</mat-error>
          }
          @if (form.get('motifRejet')?.hasError('minlength') && form.get('motifRejet')?.touched) {
            <mat-error>Minimum 10 caractères</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="warn" (click)="submit()" [disabled]="form.invalid">
        <mat-icon>cancel</mat-icon> Confirmer le rejet
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 400px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .apprenant-label { color: #555; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `]
})
export class RejeterDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<RejeterDialogComponent>);
  readonly data: { inscription: Inscription } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    motifRejet: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
