import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signer-document-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>draw</mat-icon> {{ data.titre ?? 'Signer le document' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Signataire *</mat-label>
          <input matInput formControlName="signataire"
                 placeholder="Nom et prénom du signataire">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fonction *</mat-label>
          <input matInput formControlName="fonction"
                 placeholder="Ex: Chef d'établissement, Président du jury">
        </mat-form-field>
      </form>
      <div class="signature-info">
        <mat-icon>info</mat-icon>
        La signature est horodatée et archivée de façon définitive.
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>draw</mat-icon> Signer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 400px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .full-width { width: 100%; }
    .signature-info { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #555; margin-top: 12px; }
    .signature-info mat-icon { font-size: 16px; color: #1565c0; }
  `]
})
export class SignerDocumentDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<SignerDocumentDialogComponent>);
  readonly data: { titre?: string } = inject(MAT_DIALOG_DATA);
  form = this.fb.group({
    signataire: ['', Validators.required],
    fonction:   ['', Validators.required],
  });
  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
