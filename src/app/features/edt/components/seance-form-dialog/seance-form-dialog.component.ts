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

@Component({
  selector: 'app-seance-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_circle</mat-icon> Nouvelle séance
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Matière (ID) *</mat-label>
          <input matInput formControlName="matiereId"
                 placeholder="Sera remplacé par sélecteur M03">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Enseignant (ID) *</mat-label>
          <input matInput formControlName="enseignantId"
                 placeholder="Sera remplacé par sélecteur M05">
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Classe (ID)</mat-label>
            <input matInput formControlName="classeId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Promotion (ID)</mat-label>
            <input matInput formControlName="promotionId">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Groupe TD/TP (ID)</mat-label>
          <input matInput formControlName="groupeId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Salle (ID) *</mat-label>
          <input matInput formControlName="salleId"
                 placeholder="Sera remplacé par sélecteur M01">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type de cours *</mat-label>
          <mat-select formControlName="typeCours">
            <mat-option value="cm">Cours magistral</mat-option>
            <mat-option value="td">TD</mat-option>
            <mat-option value="tp">TP</mat-option>
            <mat-option value="examen">Examen</mat-option>
            <mat-option value="rattrapage">Rattrapage</mat-option>
            <mat-option value="projet">Projet</mat-option>
            <mat-option value="autre">Autre</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date *</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="date">
          <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Heure début *</mat-label>
            <input matInput formControlName="heureDebut"
                   type="time" placeholder="08:00">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Heure fin *</mat-label>
            <input matInput formControlName="heureFin"
                   type="time" placeholder="09:30">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>check</mat-icon> Vérifier & Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 520px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class SeanceFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<SeanceFormDialogComponent>);
  readonly data: { prefill?: any; vueMode?: string; entityId?: string } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    matiereId:     ['', Validators.required],
    enseignantId:  ['', Validators.required],
    classeId:      [this.data?.vueMode === 'classe'    ? (this.data.entityId ?? '') : ''],
    promotionId:   [this.data?.vueMode === 'promotion' ? (this.data.entityId ?? '') : ''],
    groupeId:      [''],
    salleId:       [this.data?.vueMode === 'salle'     ? (this.data.entityId ?? '') : '', Validators.required],
    typeCours:     ['cm', Validators.required],
    date:          [this.data?.prefill?.date ?? null, Validators.required],
    heureDebut:    [this.data?.prefill?.heureDebut ?? '08:00', Validators.required],
    heureFin:      [this.data?.prefill?.heureFin   ?? '09:30', Validators.required],
    etablissementId: ['', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        classeId:    v.classeId    || undefined,
        promotionId: v.promotionId || undefined,
        groupeId:    v.groupeId    || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
