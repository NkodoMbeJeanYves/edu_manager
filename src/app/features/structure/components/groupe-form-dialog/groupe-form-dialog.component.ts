import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Groupe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-groupe-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './groupe-form-dialog.component.html',
  styleUrl: './groupe-form-dialog.component.scss'
})
export class GroupeFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<GroupeFormDialogComponent>);
  readonly data: { groupe?: Groupe; promotionId: string } = inject(MAT_DIALOG_DATA);

  private g = this.data.groupe;
  form = this.fb.group({
    code:        [this.g?.code        ?? '', Validators.required],
    libelle:     [this.g?.libelle     ?? '', Validators.required],
    type:        [this.g?.type        ?? 'td', Validators.required],
    capaciteMax: [this.g?.capaciteMax ?? 25, [Validators.required, Validators.min(1)]],
    enseignantId:[this.g?.enseignantId ?? ''],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        promotionId: this.data.promotionId,
        enseignantId: this.form.value.enseignantId || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
