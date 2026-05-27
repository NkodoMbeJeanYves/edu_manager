import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Absence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-valider-justificatif-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>fact_check</mat-icon> Valider le justificatif
    </h2>
    <mat-dialog-content>
      @if (data.absence.justificatif; as j) {
        <div class="justif-recap">
          <div class="justif-row">
            <span class="justif-label">Type</span>
            <span>{{ typeLabel(j.type) }}</span>
          </div>
          <div class="justif-row">
            <span class="justif-label">Description</span>
            <span>{{ j.description }}</span>
          </div>
          <div class="justif-row">
            <span class="justif-label">Soumis le</span>
            <span>{{ j.dateSoumission | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          @if (j.fichierUrl) {
            <div class="justif-row">
              <span class="justif-label">Document</span>
              <a [href]="j.fichierUrl" target="_blank" class="doc-link">
                <mat-icon>open_in_new</mat-icon> Voir le document
              </a>
            </div>
          }
        </div>
        <mat-divider></mat-divider>
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Commentaire (optionnel)</mat-label>
            <textarea matInput formControlName="commentaire" rows="2"
                      placeholder="Motif d'acceptation ou de refus..."></textarea>
          </mat-form-field>
        </form>
        <div class="decision-btns">
          <button mat-raised-button color="primary"
                  (click)="submit('accepte')">
            <mat-icon>check_circle</mat-icon> Accepter
          </button>
          <button mat-raised-button color="warn"
                  (click)="submit('rejete')">
            <mat-icon>cancel</mat-icon> Rejeter
          </button>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 440px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .justif-recap { display: flex; flex-direction: column; gap: 8px; padding: 8px 0 12px; }
    .justif-row { display: flex; gap: 12px; font-size: 13px; }
    .justif-label { color: #757575; min-width: 100px; font-size: 12px; }
    .doc-link { display: flex; align-items: center; gap: 4px; color: #1565c0; text-decoration: none; }
    .doc-link mat-icon { font-size: 15px; }
    .form-grid { padding-top: 12px; }
    .full-width { width: 100%; }
    .decision-btns { display: flex; gap: 12px; margin-top: 12px; }
  `]
})
export class ValiderJustificatifDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<ValiderJustificatifDialogComponent>);
  readonly data: { absence: Absence } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    commentaire: [''],
  });

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      medical: 'Certificat médical', familial: 'Motif familial',
      administratif: 'Démarche administrative', transport: 'Problème de transport',
      autre: 'Autre',
    };
    return map[type] ?? type;
  }

  submit(statut: 'accepte' | 'rejete'): void {
    this.dialogRef.close({
      justificatifId: this.data.absence.justificatif!.id,
      statut,
      commentaire: this.form.value.commentaire || undefined,
    });
  }
}
