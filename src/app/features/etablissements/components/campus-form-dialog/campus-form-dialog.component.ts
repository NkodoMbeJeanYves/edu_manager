import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Campus } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-campus-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule,
  ],
  templateUrl: './campus-form-dialog.component.html',
  styleUrl: './campus-form-dialog.component.scss'
})
export class CampusFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CampusFormDialogComponent>);
  readonly data: { campus?: Campus; etablissementId: string } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    nom:                [this.data.campus?.nom ?? '',                Validators.required],
    code:               [this.data.campus?.code ?? '',               Validators.required],
    adresse:            [this.data.campus?.adresse ?? '',            Validators.required],
    ville:              [this.data.campus?.ville ?? '',              Validators.required],
    telephoneDirecteur: [this.data.campus?.telephoneDirecteur ?? ''],
    principal:          [this.data.campus?.principal ?? false],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
