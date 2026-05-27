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
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.matiere ? 'edit' : 'menu_book' }}</mat-icon>
      {{ data.matiere ? 'Modifier la matière' : 'Nouvelle matière' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code"
                   placeholder="Ex: MATH101, PHYS-L1">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Obligatoire</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-2">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle"
                   placeholder="Ex: Mathématiques générales">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="cours_magistral">Cours magistral (CM)</mat-option>
              <mat-option value="td">Travaux dirigés (TD)</mat-option>
              <mat-option value="tp">Travaux pratiques (TP)</mat-option>
              <mat-option value="projet">Projet</mat-option>
              <mat-option value="stage">Stage</mat-option>
              <mat-option value="memoire">Mémoire / PFE</mat-option>
              <mat-option value="seminaire">Séminaire</mat-option>
              <mat-option value="sport">Sport</mat-option>
              <mat-option value="langue">Langue vivante</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Coefficient *</mat-label>
            <input matInput formControlName="coefficient"
                   type="number" min="0.5" step="0.5">
            <mat-hint>Pondération dans la moyenne</mat-hint>
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Volume horaire</p>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>CM (heures)</mat-label>
            <input matInput formControlName="volumeHoraireCM" type="number" min="0">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>TD (heures)</mat-label>
            <input matInput formControlName="volumeHoraireTD" type="number" min="0">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>TP (heures)</mat-label>
            <input matInput formControlName="volumeHoraireTP" type="number" min="0">
          </mat-form-field>
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Évaluation</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nature de l'évaluation *</mat-label>
          <mat-select formControlName="natureEvaluation">
            <mat-option value="cc_uniquement">Contrôle continu uniquement</mat-option>
            <mat-option value="examen_uniquement">Examen final uniquement</mat-option>
            <mat-option value="cc_et_examen">CC + Examen final</mat-option>
            <mat-option value="tp_et_examen">TP noté + Examen</mat-option>
            <mat-option value="projet_soutenance">Projet + Soutenance</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Pondération CC (%)*</mat-label>
            <input matInput formControlName="ponderationCC"
                   type="number" min="0" max="100"
                   (change)="syncPonderations('cc')">
            <mat-hint>CC + Examen = 100%</mat-hint>
            @if (!ponderationsOk) {
              <mat-error>Total ≠ 100%</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Pondération Examen (%)*</mat-label>
            <input matInput formControlName="ponderationExamen"
                   type="number" min="0" max="100"
                   (change)="syncPonderations('ex')">
            @if (!ponderationsOk) {
              <mat-error>Total ≠ 100%</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Note maximale</mat-label>
            <input matInput formControlName="noteMax" type="number" min="1">
          </mat-form-field>
        </div>

        <div class="pond-preview">
          <div class="pond-bar-preview">
            <div class="pond-cc-prev" [style.width.%]="form.get('ponderationCC')?.value">
              CC {{ form.get('ponderationCC')?.value }}%
            </div>
            <div class="pond-ex-prev" [style.width.%]="form.get('ponderationExamen')?.value">
              Ex. {{ form.get('ponderationExamen')?.value }}%
            </div>
          </div>
          @if (!ponderationsOk) {
            <span class="pond-warning">⚠ La somme doit être égale à 100%</span>
          } @else {
            <span class="pond-ok">✓ Pondérations valides</span>
          }
        </div>

        <mat-divider></mat-divider>

        <p class="section-label">Options</p>
        <div class="flags-row">
          <mat-checkbox formControlName="eliminatoire" color="warn">
            Matière éliminatoire
          </mat-checkbox>
          @if (form.get('eliminatoire')?.value) {
            <mat-form-field appearance="outline" class="seuil-field">
              <mat-label>Note minimale *</mat-label>
              <input matInput formControlName="seuilEliminatoire"
                     type="number" min="0" max="20" step="0.5">
              <mat-hint>Note en dessous de laquelle l'apprenant est éliminé</mat-hint>
            </mat-form-field>
          }
        </div>

        <mat-divider></mat-divider>
        <p class="section-label">Rattachement</p>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Établissement (ID) *</mat-label>
            <input matInput formControlName="etablissementId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Filière (ID)</mat-label>
            <input matInput formControlName="filiereId"
                   placeholder="Via M02">
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Niveau (ID)</mat-label>
            <input matInput formControlName="niveauId">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>UE de rattachement (ID)</mat-label>
            <input matInput formControlName="ueId"
                   placeholder="Universitaire seulement">
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid || !ponderationsOk">
        {{ data.matiere ? 'Enregistrer' : 'Créer la matière' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 600px; padding-top: 8px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; }
    .form-row { display: flex; gap: 16px; align-items: flex-start; }
    .form-row mat-form-field { flex: 1; }
    .flex-2 { flex: 2 !important; }
    .full-width { width: 100%; }
    .section-label { font-size: 13px; font-weight: 600; color: #555; margin: 4px 0 0; }
    .flags-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .seuil-field { max-width: 180px; }

    .pond-preview { display: flex; align-items: center; gap: 12px; }
    .pond-bar-preview { display: flex; width: 200px; height: 24px; border-radius: 4px; overflow: hidden; background: #f0f0f0; }
    .pond-cc-prev { background: #42a5f5; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: width .3s; }
    .pond-ex-prev { background: #ab47bc; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex: 1; transition: width .3s; }
    .pond-warning { font-size: 12px; color: #e65100; }
    .pond-ok { font-size: 12px; color: #2e7d32; }
  `]
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
