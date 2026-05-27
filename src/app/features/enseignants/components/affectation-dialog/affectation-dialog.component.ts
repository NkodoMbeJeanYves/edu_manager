import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Enseignant } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-affectation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './affectation-dialog.component.html',
  styleUrl: './affectation-dialog.component.scss',
})
export class AffectationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AffectationDialogComponent>);
  readonly data: { enseignant: Enseignant } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    matiereId:         ['', Validators.required],
    heuresPrevues:     [18, [Validators.required, Validators.min(1)]],
    classeId:          [''],
    promotionId:       [''],
    anneeAcademiqueId: ['', Validators.required],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        enseignantId: this.data.enseignant.id,
        ...this.form.value,
        classeId:    this.form.value.classeId    || undefined,
        promotionId: this.form.value.promotionId || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
