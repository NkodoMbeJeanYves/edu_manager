import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-create-deliberation-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './create-deliberation-dialog.component.html',
  styleUrl: './create-deliberation-dialog.component.scss'
})
export class CreateDeliberationDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CreateDeliberationDialogComponent>);
  form = this.fb.group({
    etablissementId:      ['', Validators.required],
    anneeAcademiqueId:    ['', Validators.required],
    periodeId:            ['', Validators.required],
    classeOuPromotionId:  ['', Validators.required],
    type:                 ['conseil_classe', Validators.required],
    session:              [''],
    dateDeliberation:     [null as Date | null],
    president:            [''],
    compensationActivee:  [false],
  });
  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        session: v.session || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
