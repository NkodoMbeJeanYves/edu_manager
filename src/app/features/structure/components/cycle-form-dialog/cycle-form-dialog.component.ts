import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Cycle } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-cycle-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './cycle-form-dialog.component.html',
  styleUrl: './cycle-form-dialog.component.scss'
})
export class CycleFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CycleFormDialogComponent>);
  readonly data: { cycle?: Cycle; etablissementId?: string; forceType?: string } = inject(MAT_DIALOG_DATA);

  private c = this.data.cycle;
  form = this.fb.group({
    code:          [this.c?.code          ?? '',              Validators.required],
    libelle:       [this.c?.libelle       ?? '',              Validators.required],
    type:          [this.c?.type          ?? 'secondaire',    Validators.required],
    typeFormation: [this.c?.typeFormation ?? (this.data?.forceType === 'universitaire' ? 'universitaire' : 'scolaire'), Validators.required],
    description:   [this.c?.description  ?? ''],
    ordre:         [this.c?.ordre        ?? 1],
    actif:         [this.c?.actif        ?? true],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        etablissementId: this.data?.etablissementId,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
