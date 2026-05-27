import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { Matiere } from '../../../../core/models/referentiel.models';

@Component({
  selector: 'app-matiere-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatSliderModule, MatDividerModule,
  ],
  templateUrl: './matiere-form-dialog.component.html',
  styleUrl: './matiere-form-dialog.component.scss'
})
export class MatiereFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<MatiereFormDialogComponent>);
  readonly data: { matiere?: Matiere } = inject(MAT_DIALOG_DATA);

  private m = this.data.matiere;

  form = this.fb.group({
    code:               [this.m?.code               ?? '',              Validators.required],
    libelle:            [this.m?.libelle             ?? '',              Validators.required],
    type:               [this.m?.type               ?? 'cours_magistral', Validators.required],
    coefficient:        [this.m?.coefficient         ?? 1,               [Validators.required, Validators.min(0.5)]],
    volumeHoraireCM:    [this.m?.volumeHoraireCM     ?? 0],
    volumeHoraireTD:    [this.m?.volumeHoraireTD     ?? 0],
    volumeHoraireTP:    [this.m?.volumeHoraireTP     ?? 0],
    natureEvaluation:   [this.m?.natureEvaluation    ?? 'cc_et_examen',  Validators.required],
    ponderationCC:      [this.m?.ponderationCC       ?? 40,              [Validators.required, Validators.min(0), Validators.max(100)]],
    ponderationExamen:  [this.m?.ponderationExamen   ?? 60,              [Validators.required, Validators.min(0), Validators.max(100)]],
    noteMax:            [this.m?.noteMax             ?? 20,              Validators.required],
    eliminatoire:       [this.m?.eliminatoire        ?? false],
    seuilEliminatoire:  [this.m?.seuilEliminatoire   ?? null],
    etablissementId:    [(this.m as any)?.etablissementId ?? '', Validators.required],
    filiereId:          [this.m?.filiereId           ?? ''],
    niveauId:           [this.m?.niveauId            ?? ''],
    ueId:               [this.m?.ueId               ?? ''],
  });

  get ponderationsOk(): boolean {
    const cc = Number(this.form.get('ponderationCC')?.value ?? 0);
    const ex = Number(this.form.get('ponderationExamen')?.value ?? 0);
    return cc + ex === 100;
  }

  ngOnInit(): void {}

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
        filiereId:         v.filiereId         || undefined,
        niveauId:          v.niveauId          || undefined,
        ueId:              v.ueId              || undefined,
        seuilEliminatoire: v.eliminatoire ? v.seuilEliminatoire : undefined,
        volumeHoraireTotal: (v.volumeHoraireCM ?? 0) +
                            (v.volumeHoraireTD ?? 0) +
                            (v.volumeHoraireTP ?? 0),
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
