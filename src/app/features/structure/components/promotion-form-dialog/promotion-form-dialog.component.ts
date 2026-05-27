import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Promotion } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-promotion-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './promotion-form-dialog.component.html',
  styleUrl: './promotion-form-dialog.component.scss'
})
export class PromotionFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<PromotionFormDialogComponent>);
  readonly data: { promotion?: Promotion } = inject(MAT_DIALOG_DATA);

  private p = this.data.promotion;
  form = this.fb.group({
    code:              [this.p?.code          ?? '', Validators.required],
    libelle:           [this.p?.libelle       ?? '', Validators.required],
    filiereId:         [this.p?.filiereId     ?? '', Validators.required],
    niveauId:          [this.p?.niveauId      ?? '', Validators.required],
    capaciteMax:       [this.p?.capaciteMax   ?? 50, [Validators.required, Validators.min(1)]],
    responsableId:     [this.p?.responsableId ?? ''],
    anneeAcademiqueId: [(this.p as any)?.anneeAcademiqueId ?? '', Validators.required],
    etablissementId:   [(this.p as any)?.etablissementId   ?? '', Validators.required],
    statut:            [this.p?.statut        ?? 'active'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({ ...v, responsableId: v.responsableId || undefined });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
