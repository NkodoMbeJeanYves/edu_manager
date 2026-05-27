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
  template: `
    <h2 mat-dialog-title>
      <mat-icon>library_books</mat-icon>
      {{ data.ue ? "Modifier l'UE" : "Nouvelle Unité d'Enseignement" }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: UE-INFO-L1-S1">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-2">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle"
                   placeholder="Ex: Fondamentaux de l'informatique">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="fondamentale">Fondamentale (obligatoire)</mat-option>
              <mat-option value="complementaire">Complémentaire / Transversale</mat-option>
              <mat-option value="optionnelle">Optionnelle (au choix)</mat-option>
              <mat-option value="libre">Libre</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Semestre *</mat-label>
            <input matInput formControlName="semestre" type="number" min="1" max="10">
            <mat-hint>Ex: 1, 2, 3…</mat-hint>
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Crédits ECTS & coefficients</p>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Crédits ECTS *</mat-label>
            <input matInput formControlName="credits" type="number" min="1" max="30">
            <mat-hint>Accordés si UE validée</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Coefficient *</mat-label>
            <input matInput formControlName="coefficient" type="number" min="0.5" step="0.5">
            <mat-hint>Poids dans la moyenne semestre</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Volume horaire total</mat-label>
            <input matInput formControlName="volumeHoraireTotal" type="number" min="0">
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Modalités d'évaluation</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nature de l'évaluation *</mat-label>
          <mat-select formControlName="natureEvaluation">
            <mat-option value="cc_et_examen">CC + Examen final</mat-option>
            <mat-option value="cc_uniquement">Contrôle continu uniquement</mat-option>
            <mat-option value="examen_uniquement">Examen final uniquement</mat-option>
            <mat-option value="tp_et_examen">TP noté + Examen</mat-option>
            <mat-option value="projet_soutenance">Projet + Soutenance</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Pondération CC (%) *</mat-label>
            <input matInput formControlName="ponderationCC"
                   type="number" min="0" max="100"
                   (change)="syncPonderations('cc')">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Pondération Examen (%) *</mat-label>
            <input matInput formControlName="ponderationExamen"
                   type="number" min="0" max="100"
                   (change)="syncPonderations('ex')">
          </mat-form-field>
        </div>

        @if (!ponderationsOk) {
          <p class="pond-warning">⚠ Pondération CC + Examen doit être égale à 100%</p>
        }

        <mat-divider></mat-divider>

        <p class="section-label">Règles de validation</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Seuil de validation (note min.) *</mat-label>
          <input matInput formControlName="seuilValidation"
                 type="number" min="0" max="20" step="0.5">
          <mat-hint>Note minimale pour valider l'UE (généralement 10/20)</mat-hint>
        </mat-form-field>

        <div class="flags-row">
          <mat-checkbox formControlName="eliminatoire" color="warn">
            UE éliminatoire (bloque validation même si moy. générale suffisante)
          </mat-checkbox>
          <mat-checkbox formControlName="compensable">
            UE compensable entre UE du même semestre
          </mat-checkbox>
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Rattachement</p>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Établissement (ID) *</mat-label>
            <input matInput formControlName="etablissementId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Filière (ID) *</mat-label>
            <input matInput formControlName="filiereId">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Niveau (ID) *</mat-label>
          <input matInput formControlName="niveauId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Année académique (ID)</mat-label>
          <input matInput formControlName="anneeAcademiqueId">
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()"
              [disabled]="form.invalid || !ponderationsOk">
        {{ data.ue ? "Enregistrer" : "Créer l'UE" }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 580px; padding-top: 8px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .flex-2 { flex: 2 !important; }
    .full-width { width: 100%; }
    .section-label { font-size: 13px; font-weight: 600; color: #555; margin: 4px 0 0; }
    .flags-row { display: flex; flex-direction: column; gap: 8px; }
    .pond-warning { font-size: 12px; color: #e65100; margin: 0; }
  `]
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
