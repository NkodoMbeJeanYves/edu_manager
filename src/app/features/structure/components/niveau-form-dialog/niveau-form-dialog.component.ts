import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Filiere, Niveau } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-niveau-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './niveau-form-dialog.component.html',
  styleUrl: './niveau-form-dialog.component.scss'
})
export class NiveauFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<NiveauFormDialogComponent>);
  readonly data: { niveau?: Niveau; filiere: Filiere } = inject(MAT_DIALOG_DATA);

  private n = this.data.niveau;
  form = this.fb.group({
    code:          [this.n?.code    ?? '', Validators.required],
    libelle:       [this.n?.libelle ?? '', Validators.required],
    ordre:         [this.n?.ordre   ?? 1,  [Validators.required, Validators.min(1)]],
    typeFormation: [this.n?.typeFormation ?? (this.data.filiere.cycle?.typeFormation ?? 'scolaire')],
  });

  submit(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
    else this.form.markAllAsTouched();
  }
}
