import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-rejeter-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './rejeter-dialog.component.html',
  styleUrl: './rejeter-dialog.component.scss'
})
export class RejeterDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<RejeterDialogComponent>);
  readonly data: { inscription: Inscription } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    motifRejet: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
