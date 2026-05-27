import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Absence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-justificatif-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './justificatif-dialog.component.html',
  styleUrl: './justificatif-dialog.component.scss'
})
export class JustificatifDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<JustificatifDialogComponent>);
  readonly data: { absence: Absence } = inject(MAT_DIALOG_DATA);

  fichier: File | undefined;
  fichierNom = '';

  form = this.fb.group({
    type:        ['medical', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fichier    = file;
      this.fichierNom = file.name;
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        absenceId:   this.data.absence.id,
        type:        this.form.value.type,
        description: this.form.value.description,
        fichier:     this.fichier,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
