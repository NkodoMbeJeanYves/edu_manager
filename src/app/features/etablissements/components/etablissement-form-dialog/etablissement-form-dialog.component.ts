import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Etablissement } from '../../../../core/models/etablissement.models';

interface DialogData { etablissement?: Etablissement; }

@Component({
  selector: 'app-etablissement-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
  ],
  templateUrl: './etablissement-form-dialog.component.html',
  styleUrl: './etablissement-form-dialog.component.scss'
})
export class EtablissementFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EtablissementFormDialogComponent>);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    nom:       [this.data.etablissement?.nom ?? '',       Validators.required],
    code:      [this.data.etablissement?.code ?? '',      Validators.required],
    type:      [this.data.etablissement?.type ?? 'scolaire', Validators.required],
    adresse:   [this.data.etablissement?.adresse ?? '',   Validators.required],
    ville:     [this.data.etablissement?.ville ?? '',     Validators.required],
    pays:      [this.data.etablissement?.pays ?? 'Maroc', Validators.required],
    telephone: [this.data.etablissement?.telephone ?? '', Validators.required],
    email:     [this.data.etablissement?.email ?? '',     [Validators.required, Validators.email]],
    siteWeb:   [this.data.etablissement?.siteWeb ?? ''],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
