import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Evaluation } from '../../../../core/models/note.models';

@Component({
  selector: 'app-evaluation-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.evaluation ? 'edit' : 'add_task' }}</mat-icon>
      {{ data.evaluation ? "Modifier l'évaluation" : "Nouvelle évaluation" }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Intitulé *</mat-label>
          <input matInput formControlName="intitule"
                 placeholder="Ex: Contrôle n°1 — Chapitre 3">
          @if (form.get('intitule')?.hasError('required') && form.get('intitule')?.touched) {
            <mat-error>L'intitulé est obligatoire</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type d'évaluation *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="cc">Contrôle continu</mat-option>
              <mat-option value="partiel">Partiel semestriel</mat-option>
              <mat-option value="examen_final">Examen final</mat-option>
              <mat-option value="tp">TP noté</mat-option>
              <mat-option value="oral">Épreuve orale</mat-option>
              <mat-option value="projet">Projet</mat-option>
              <mat-option value="devoir_maison">Devoir maison</mat-option>
              <mat-option value="rattrapage">Rattrapage</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date *</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dateEvaluation">
            <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Pondération (%) *</mat-label>
            <input matInput formControlName="ponderation" type="number" min="1" max="100">
            <mat-hint>Poids dans la moyenne finale</mat-hint>
            @if (form.get('ponderation')?.hasError('min') || form.get('ponderation')?.hasError('max')) {
              <mat-error>Entre 1 et 100</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Coefficient *</mat-label>
            <input matInput formControlName="coefficient" type="number" min="0.5" step="0.5">
            <mat-hint>Coefficient de la matière</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Note maximale</mat-label>
            <input matInput formControlName="noteMax" type="number" min="1">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Matière (ID) *</mat-label>
          <input matInput formControlName="matiereId"
                 placeholder="ID matière — remplacé par sélecteur via M03">
          <mat-hint>Ce champ sera un sélecteur une fois M03 implémenté</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Période (ID) *</mat-label>
          <input matInput formControlName="periodeId"
                 placeholder="ID période — remplacé par sélecteur via M01">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Enseignant (ID) *</mat-label>
          <input matInput formControlName="enseignantId"
                 placeholder="ID enseignant — remplacé par sélecteur via M05">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Classe (ID)</mat-label>
            <input matInput formControlName="classeId"
                   placeholder="Scolaire">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Promotion (ID)</mat-label>
            <input matInput formControlName="promotionId"
                   placeholder="Universitaire">
          </mat-form-field>
        </div>

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
        {{ data.evaluation ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 560px; padding-top: 8px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class EvaluationFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EvaluationFormDialogComponent>);
  readonly data: { evaluation?: Evaluation } = inject(MAT_DIALOG_DATA);

  private e = this.data.evaluation;

  form = this.fb.group({
    intitule:           [this.e?.intitule         ?? '',          Validators.required],
    type:               [this.e?.type             ?? 'cc',        Validators.required],
    dateEvaluation:     [this.e?.dateEvaluation   ?? null,        Validators.required],
    ponderation:        [this.e?.ponderation       ?? 40,          [Validators.required, Validators.min(1), Validators.max(100)]],
    coefficient:        [this.e?.coefficient       ?? 1,           [Validators.required, Validators.min(0.5)]],
    noteMax:            [this.e?.noteMax           ?? 20,          Validators.required],
    matiereId:          [this.e?.matiereId         ?? '',          Validators.required],
    periodeId:          [this.e?.periodeId         ?? '',          Validators.required],
    enseignantId:       [this.e?.enseignantId      ?? '',          Validators.required],
    anneeAcademiqueId:  [(this.e as any)?.anneeAcademiqueId ?? '', Validators.required],
    classeId:           [this.e?.classeId          ?? ''],
    promotionId:        [this.e?.promotionId       ?? ''],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
