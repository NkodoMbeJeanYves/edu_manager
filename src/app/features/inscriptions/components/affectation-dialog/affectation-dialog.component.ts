import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-affectation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './affectation-dialog.component.html',
  styleUrl: './affectation-dialog.component.scss'
})
export class AffectationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AffectationDialogComponent>);
  readonly data: { inscription: Inscription } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    typeAffectation: ['classe'],
    classeId:        [''],
    promotionId:     [''],
  });

  submit(): void {
    const v = this.form.value;
    const result = v.typeAffectation === 'classe'
      ? { classeId: v.classeId }
      : { promotionId: v.promotionId };
    this.dialogRef.close(result);
  }
}
