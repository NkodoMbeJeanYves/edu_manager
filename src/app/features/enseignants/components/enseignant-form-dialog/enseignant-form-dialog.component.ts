import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Enseignant } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-enseignant-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.enseignant ? 'edit' : 'person_add' }}</mat-icon>
      {{ data.enseignant ? 'Modifier l\'enseignant' : 'Nouvel enseignant' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">

        <p class="section-label">Identité</p>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Prénom *</mat-label>
            <input matInput formControlName="prenom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nom *</mat-label>
            <input matInput formControlName="nom">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Genre *</mat-label>
            <mat-select formControlName="genre">
              <mat-option value="M">Masculin</mat-option>
              <mat-option value="F">Féminin</mat-option>
              <mat-option value="autre">Autre</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-2">
            <mat-label>Email *</mat-label>
            <input matInput formControlName="email" type="email">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse</mat-label>
          <input matInput formControlName="adresse">
        </mat-form-field>

        <mat-divider></mat-divider>
        <p class="section-label">Contrat & Qualifications</p>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type de contrat *</mat-label>
            <mat-select formControlName="typeContrat">
              <mat-option value="titulaire">Titulaire</mat-option>
              <mat-option value="vacataire">Vacataire</mat-option>
              <mat-option value="contractuel">Contractuel</mat-option>
              <mat-option value="fonctionnaire">Fonctionnaire</mat-option>
              <mat-option value="detache">Détaché</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Niveau de diplôme</mat-label>
            <mat-select formControlName="niveauDiplome">
              <mat-option value="">—</mat-option>
              <mat-option value="licence">Licence</mat-option>
              <mat-option value="master">Master</mat-option>
              <mat-option value="doctorat">Doctorat</mat-option>
              <mat-option value="bts">BTS</mat-option>
              <mat-option value="hdr">HDR</mat-option>
              <mat-option value="agregation">Agrégation</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Date d'entrée *</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dateEntree">
            <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Charge max (h/semaine)</mat-label>
            <input matInput formControlName="chargeHoraireMax" type="number" min="1" max="60">
          </mat-form-field>
          @if (form.get('typeContrat')?.value === 'vacataire') {
            <mat-form-field appearance="outline">
              <mat-label>Taux horaire</mat-label>
              <input matInput formControlName="tauxHoraire" type="number" min="0">
            </mat-form-field>
          }
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
        </mat-form-field>

        @if (data.enseignant) {
          <mat-divider></mat-divider>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut">
              <mat-option value="actif">Actif</mat-option>
              <mat-option value="inactif">Inactif</mat-option>
              <mat-option value="suspendu">Suspendu</mat-option>
              <mat-option value="retraite">Retraité</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary"
              (click)="submit()" [disabled]="form.invalid">
        {{ data.enseignant ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 600px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
    .section-label { font-size: 13px; font-weight: 600; color: #555; margin: 4px 0 0; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .flex-2 { flex: 2 !important; }
    .full-width { width: 100%; }
  `]
})
export class EnseignantFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EnseignantFormDialogComponent>);
  readonly data: { enseignant?: Enseignant } = inject(MAT_DIALOG_DATA);

  private e = this.data.enseignant;

  form = this.fb.group({
    prenom:            [this.e?.prenom          ?? '', Validators.required],
    nom:               [this.e?.nom             ?? '', Validators.required],
    email:             [this.e?.email           ?? '', [Validators.required, Validators.email]],
    telephone:         [this.e?.telephone       ?? ''],
    genre:             [this.e?.genre           ?? 'M', Validators.required],
    adresse:           [this.e?.adresse         ?? ''],
    typeContrat:       [this.e?.typeContrat      ?? 'titulaire', Validators.required],
    niveauDiplome:     [this.e?.niveauDiplome    ?? ''],
    dateEntree:        [this.e?.dateEntree       ?? null, Validators.required],
    chargeHoraireMax:  [this.e?.chargeHoraireMax ?? 18],
    tauxHoraire:       [this.e?.tauxHoraire      ?? null],
    etablissementId:   [this.e?.etablissementId  ?? '', Validators.required],
    statut:            [this.e?.statut          ?? 'actif'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        telephone:     v.telephone     || undefined,
        adresse:       v.adresse       || undefined,
        niveauDiplome: v.niveauDiplome || undefined,
        tauxHoraire:   v.tauxHoraire   || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
