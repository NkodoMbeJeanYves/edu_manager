import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Classe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-classe-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.classe ? 'edit' : 'class' }}</mat-icon>
      {{ data.classe ? 'Modifier la classe' : 'Nouvelle classe' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="Ex: 6A, TleS2">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Libellé *</mat-label>
            <input matInput formControlName="libelle" placeholder="Ex: Terminale S2">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Filière (ID) *</mat-label>
          <input matInput formControlName="filiereId"
                 placeholder="Sera remplacé par un sélecteur via M02">
          <mat-hint>Sélecteur dynamique disponible une fois l'arbre chargé</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Niveau (ID) *</mat-label>
          <input matInput formControlName="niveauId">
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Capacité maximale *</mat-label>
            <input matInput formControlName="capaciteMax" type="number" min="1">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Salle attribuée</mat-label>
            <input matInput formControlName="salle" placeholder="Ex: B204">
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Année académique (ID) *</mat-label>
          <input matInput formControlName="anneeAcademiqueId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Établissement (ID) *</mat-label>
          <input matInput formControlName="etablissementId">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Professeur principal (ID)</mat-label>
          <input matInput formControlName="professeurPrincipalId"
                 placeholder="Sera remplacé par sélecteur via M05">
        </mat-form-field>
        @if (data.classe) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="statut">
              <mat-option value="active">Active</mat-option>
              <mat-option value="archivee">Archivée</mat-option>
              <mat-option value="fermee">Fermée</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.classe ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 520px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class ClasseFormDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ClasseFormDialogComponent>);
  readonly data: { classe?: Classe } = inject(MAT_DIALOG_DATA);

  private c = this.data.classe;
  form = this.fb.group({
    code:                  [this.c?.code                  ?? '', Validators.required],
    libelle:               [this.c?.libelle               ?? '', Validators.required],
    filiereId:             [this.c?.filiereId             ?? '', Validators.required],
    niveauId:              [this.c?.niveauId              ?? '', Validators.required],
    capaciteMax:           [this.c?.capaciteMax           ?? 35, [Validators.required, Validators.min(1)]],
    salle:                 [this.c?.salle                 ?? ''],
    anneeAcademiqueId:     [(this.c as any)?.anneeAcademiqueId ?? '', Validators.required],
    etablissementId:       [(this.c as any)?.etablissementId   ?? '', Validators.required],
    professeurPrincipalId: [this.c?.professeurPrincipalId ?? ''],
    statut:                [this.c?.statut                ?? 'active'],
  });

  submit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.dialogRef.close({
        ...v,
        professeurPrincipalId: v.professeurPrincipalId || undefined,
        salle: v.salle || undefined,
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
