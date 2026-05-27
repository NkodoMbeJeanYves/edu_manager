import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Absence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-justificatif-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>attach_file</mat-icon> Soumettre un justificatif
    </h2>
    <mat-dialog-content>
      <div class="absence-info">
        Absence du <strong>{{ data.absence.date | date:'d MMM yyyy' }}</strong>
        · {{ data.absence.heureDebut }} – {{ data.absence.heureFin }}
        · <em>{{ data.absence.matiereLibelle }}</em>
      </div>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type de justificatif *</mat-label>
          <mat-select formControlName="type">
            <mat-option value="medical">Certificat médical</mat-option>
            <mat-option value="familial">Motif familial</mat-option>
            <mat-option value="administratif">Démarche administrative</mat-option>
            <mat-option value="transport">Problème de transport</mat-option>
            <mat-option value="autre">Autre</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description *</mat-label>
          <textarea matInput formControlName="description" rows="3"
                    placeholder="Expliquez le motif de l'absence..."></textarea>
          @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
            <mat-error>La description est obligatoire</mat-error>
          }
        </mat-form-field>
        <div class="upload-zone" (click)="fileInput.click()">
          <mat-icon>cloud_upload</mat-icon>
          <span>{{ fichierNom || 'Cliquer pour joindre un document (optionnel)' }}</span>
          <input #fileInput type="file" hidden accept=".pdf,.jpg,.jpeg,.png"
                 (change)="onFileChange($event)">
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>send</mat-icon> Soumettre
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 460px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .absence-info { background: #f5f5f5; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 13px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; }
    .full-width { width: 100%; }
    .upload-zone { border: 2px dashed #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; color: #757575; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: border-color .2s; }
    .upload-zone:hover { border-color: #1565c0; color: #1565c0; }
    .upload-zone mat-icon { font-size: 22px; }
  `]
})
export class JustificatifDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<JustificatifDialogComponent>);
  readonly data: { absence: Absence } = inject(MAT_DIALOG_DATA);

  fichier: File | undefined;
  fichierNom = '';

  form = this.fb.group({
    type:        ['medical', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fichier    = file;
      this.fichierNom = file.name;
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        absenceId:   this.data.absence.id,
        type:        this.form.value.type,
        description: this.form.value.description,
        fichier:     this.fichier,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
