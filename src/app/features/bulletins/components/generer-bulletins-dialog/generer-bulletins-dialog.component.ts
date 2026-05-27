import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-generer-bulletins-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>description</mat-icon> Générer des bulletins
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
          <mat-hint>Sera remplacé par un sélecteur via M01</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Période (ID) *</mat-label>
          <input matInput formControlName="periodeId">
          <mat-hint>Trimestre ou semestre concerné</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Classe (ID) — optionnel</mat-label>
          <input matInput formControlName="classeId"
                 placeholder="Laisser vide pour toutes les classes">
        </mat-form-field>
        <mat-checkbox formControlName="regenerer">
          Régénérer les bulletins déjà existants
        </mat-checkbox>
      </form>
      <div class="warning-box">
        <mat-icon>info</mat-icon>
        <span>La génération nécessite que <strong>toutes les notes de la période soient clôturées</strong>.</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>play_arrow</mat-icon> Lancer la génération
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .full-width { width: 100%; }
    .warning-box { display: flex; align-items: flex-start; gap: 10px; background: #fff8e1; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 13px; color: #5d4037; }
    .warning-box mat-icon { color: #f57f17; flex-shrink: 0; }
  `]
})
export class GenererBulletinsDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<GenererBulletinsDialogComponent>);
  form = this.fb.group({
    etablissementId: ['', Validators.required],
    periodeId:       ['', Validators.required],
    classeId:        [''],
    regenerer:       [false],
  });
  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
