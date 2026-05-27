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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-create-deliberation-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>gavel</mat-icon> Nouvelle délibération
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Année académique (ID) *</mat-label>
          <input matInput formControlName="anneeAcademiqueId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Période (ID) *</mat-label>
          <input matInput formControlName="periodeId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Classe / Promotion (ID) *</mat-label>
          <input matInput formControlName="classeOuPromotionId">
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="conseil_classe">Conseil de classe</mat-option>
              <mat-option value="jury_universitaire">Jury universitaire</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Session</mat-label>
            <mat-select formControlName="session">
              <mat-option value="">—</mat-option>
              <mat-option value="S1">Session 1</mat-option>
              <mat-option value="S2">Session 2 (rattrapage)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date de délibération</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="dateDeliberation">
          <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Président du jury / Prof. principal</mat-label>
          <input matInput formControlName="president">
        </mat-form-field>
        @if (form.get('type')?.value === 'jury_universitaire') {
          <mat-checkbox formControlName="compensationActivee">
            Activer la compensation inter-UE
          </mat-checkbox>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        <mat-icon>add</mat-icon> Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 520px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class CreateDeliberationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CreateDeliberationDialogComponent>);
  form = this.fb.group({
    etablissementId:      ['', Validators.required],
    anneeAcademiqueId:    ['', Validators.required],
    periodeId:            ['', Validators.required],
    classeOuPromotionId:  ['', Validators.required],
    type:                 ['conseil_classe', Validators.required],
    session:              [''],
    dateDeliberation:     [null as Date | null],
    president:            [''],
    compensationActivee:  [false],
  });
  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        session: v.session || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
