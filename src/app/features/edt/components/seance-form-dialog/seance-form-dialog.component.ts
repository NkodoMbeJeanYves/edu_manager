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
  templateUrl: './seance-form-dialog.component.html',
  styleUrl: './seance-form-dialog.component.scss'
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
