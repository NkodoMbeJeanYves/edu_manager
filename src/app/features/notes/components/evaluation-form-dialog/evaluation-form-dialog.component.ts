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
  templateUrl: './evaluation-form-dialog.component.html',
  styleUrl: './evaluation-form-dialog.component.scss'
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
