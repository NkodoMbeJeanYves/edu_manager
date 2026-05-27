import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Filiere } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-filiere-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './filiere-form-dialog.component.html',
  styleUrl: './filiere-form-dialog.component.scss'
})
export class FiliereFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<FiliereFormDialogComponent>);
  readonly data: { filiere?: Filiere; cycleId: string; etablissementId?: string; typeFormation: string } = inject(MAT_DIALOG_DATA);

  private f = this.data.filiere;
  form = this.fb.group({
    code:         [this.f?.code        ?? '', Validators.required],
    libelle:      [this.f?.libelle     ?? '', Validators.required],
    description:  [this.f?.description ?? ''],
    systemeLMD:   [this.f?.systemeLMD  ?? ''],
    dureeAnnees:  [this.f?.dureeAnnees ?? null],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        cycleId: this.data.cycleId,
        etablissementId: this.data.etablissementId,
        systemeLMD: this.form.value.systemeLMD || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
