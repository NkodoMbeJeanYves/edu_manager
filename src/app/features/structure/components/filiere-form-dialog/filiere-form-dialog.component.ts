import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Filiere } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-filiere-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.filiere ? 'edit' : 'add' }}</mat-icon>
      {{ data.filiere ? 'Modifier la filière' : 'Nouvelle filière' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: INFO, GC, SVT">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle" placeholder="Ex: Informatique">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        @if (data.typeFormation === 'universitaire') {
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Système LMD</mat-label>
              <mat-select formControlName="systemeLMD">
                <mat-option value="">—</mat-option>
                <mat-option value="licence">Licence (Bac+3)</mat-option>
                <mat-option value="master">Master (Bac+5)</mat-option>
                <mat-option value="doctorat">Doctorat (Bac+8)</mat-option>
                <mat-option value="bts">BTS (Bac+2)</mat-option>
                <mat-option value="dut">DUT (Bac+2)</mat-option>
                <mat-option value="autre">Autre</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Durée (années)</mat-label>
              <input matInput formControlName="dureeAnnees" type="number" min="1" max="8">
            </mat-form-field>
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.filiere ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 460px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class FiliereFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<FiliereFormDialogComponent>);
  readonly data: { filiere?: Filiere; cycleId: string; etablissementId?: string; typeFormation: string } = inject(MAT_DIALOG_DATA);

  private f = this.data.filiere;
  form = this.fb.group({
    code:         [this.f?.code        ?? '', Validators.required],
    libelle:      [this.f?.libelle     ?? '', Validators.required],
    description:  [this.f?.description ?? ''],
    systemeLMD:   [this.f?.systemeLMD  ?? ''],
    dureeAnnees:  [this.f?.dureeAnnees ?? null],
  });

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        cycleId: this.data.cycleId,
        etablissementId: this.data.etablissementId,
        systemeLMD: this.form.value.systemeLMD || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
