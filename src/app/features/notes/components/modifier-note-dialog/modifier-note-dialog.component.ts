import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modifier-note-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">edit</mat-icon>
      Modifier une note validée
    </h2>
    <mat-dialog-content>
      <div class="note-actuelle">
        Note actuelle : <strong>{{ data.ligne.valeur !== '' ? data.ligne.valeur : 'ABS' }} / {{ data.noteMax }}</strong>
        — <em>{{ data.ligne.prenom }} {{ data.ligne.nom }}</em>
      </div>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nouvelle valeur</mat-label>
          <input matInput formControlName="valeur" type="number"
                 [min]="0" [max]="data.noteMax" step="0.25">
          <mat-hint>0 – {{ data.noteMax }} · Laisser vide si absent</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motif de modification *</mat-label>
          <textarea matInput formControlName="motifModification" rows="3"
                    placeholder="Expliquez la raison de la modification..."></textarea>
          @if (form.get('motifModification')?.hasError('required') && form.get('motifModification')?.touched) {
            <mat-error>Le motif est obligatoire pour toute modification de note validée</mat-error>
          }
          @if (form.get('motifModification')?.hasError('minlength') && form.get('motifModification')?.touched) {
            <mat-error>Minimum 10 caractères</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="warn" (click)="submit()" [disabled]="form.invalid">
        <mat-icon>save</mat-icon> Enregistrer la modification
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 400px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .note-actuelle { background: #fff8e1; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
  `]
})
export class ModifierNoteDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ModifierNoteDialogComponent>);
  readonly data: { ligne: any; noteMax: number } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    valeur:             [this.data.ligne.valeur],
    motifModification:  ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
