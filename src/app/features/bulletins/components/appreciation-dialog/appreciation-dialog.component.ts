import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Bulletin } from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-appreciation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './appreciation-dialog.component.html',
  styleUrl: './appreciation-dialog.component.scss'
})
export class AppreciationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AppreciationDialogComponent>);
  readonly data: { bulletin: Bulletin } = inject(MAT_DIALOG_DATA);
  form = this.fb.group({
    appreciationGenerale:      [this.data.bulletin.appreciationGenerale ?? ''],
    appreciationProfPrincipal: [this.data.bulletin.appreciationProfPrincipal ?? ''],
    decision:                  [this.data.bulletin.decision ?? ''],
  });
  submit(): void {
    const v = this.form.value;
    this.dialogRef.close({
      ...v,
      decision: v.decision || undefined,
    });
  }
}
