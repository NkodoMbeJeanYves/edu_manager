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
import { MatDividerModule } from '@angular/material/divider';
import { UE } from '../../../../core/models/referentiel.models';

@Component({
  selector: 'app-ue-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatDividerModule,
  ],
  templateUrl: './ue-form-dialog.component.html',
  styleUrl: './ue-form-dialog.component.scss'
})
export class UEFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<UEFormDialogComponent>);
  readonly data: { ue?: UE } = inject(MAT_DIALOG_DATA);

  private u = this.data.ue;

  form = this.fb.group({
    code:               [this.u?.code               ?? '',         Validators.required],
    libelle:            [this.u?.libelle             ?? '',         Validators.required],
    type:               [this.u?.type               ?? 'fondamentale', Validators.required],
    semestre:           [this.u?.semestre            ?? 1,          [Validators.required, Validators.min(1)]],
    credits:            [this.u?.credits             ?? 6,          [Validators.required, Validators.min(1)]],
    coefficient:        [this.u?.coefficient         ?? 1,          [Validators.required, Validators.min(0.5)]],
    volumeHoraireTotal: [this.u?.volumeHoraireTotal  ?? 0],
    natureEvaluation:   [this.u?.natureEvaluation    ?? 'cc_et_examen', Validators.required],
    ponderationCC:      [this.u?.ponderationCC       ?? 40,         [Validators.required, Validators.min(0), Validators.max(100)]],
    ponderationExamen:  [this.u?.ponderationExamen   ?? 60,         [Validators.required, Validators.min(0), Validators.max(100)]],
    seuilValidation:    [this.u?.seuilValidation      ?? 10,         [Validators.required, Validators.min(0), Validators.max(20)]],
    eliminatoire:       [this.u?.eliminatoire        ?? false],
    compensable:        [this.u?.compensable         ?? true],
    etablissementId:    [(this.u as any)?.etablissementId ?? '', Validators.required],
    filiereId:          [this.u?.filiereId           ?? '', Validators.required],
    niveauId:           [this.u?.niveauId            ?? '', Validators.required],
    anneeAcademiqueId:  [(this.u as any)?.anneeAcademiqueId ?? ''],
  });

  get ponderationsOk(): boolean {
    const cc = Number(this.form.get('ponderationCC')?.value ?? 0);
    const ex = Number(this.form.get('ponderationExamen')?.value ?? 0);
    return cc + ex === 100;
  }

  syncPonderations(changed: 'cc' | 'ex'): void {
    const cc = Number(this.form.get('ponderationCC')?.value ?? 0);
    const ex = Number(this.form.get('ponderationExamen')?.value ?? 0);
    if (changed === 'cc' && cc >= 0 && cc <= 100) {
      this.form.patchValue({ ponderationExamen: 100 - cc }, { emitEvent: false });
    } else if (changed === 'ex' && ex >= 0 && ex <= 100) {
      this.form.patchValue({ ponderationCC: 100 - ex }, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.valid && this.ponderationsOk) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        anneeAcademiqueId: v.anneeAcademiqueId || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
