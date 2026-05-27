import { Component, inject, OnInit } from '@angular/core';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EtablissementStateService } from '../../../etablissements/services/etablissement-state.service';
import { ApprenantStateService } from '../../../apprenants/services/apprenant-state.service';
import { InscriptionStateService } from '../../services/inscription-state.service';

@Component({
  selector: 'app-inscription-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatStepperModule, MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.type === 'nouvelle' ? 'assignment_ind' : 'autorenew' }}</mat-icon>
      {{ data.type === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <mat-stepper [linear]="true" #stepper>

        <!-- Étape 1 : Sélection de l'apprenant -->
        <mat-step [stepControl]="apprenantForm" label="Apprenant">
          <form [formGroup]="apprenantForm" class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rechercher un apprenant *</mat-label>
              <input matInput formControlName="search"
                     (input)="onSearchApprenant($event)"
                     placeholder="Nom, prénom ou numéro...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            @if (apprenantState.loading()) {
              <mat-spinner diameter="24" class="inline-spinner"></mat-spinner>
            }

            <div class="apprenants-results">
              @for (a of apprenantState.apprenants(); track a.id) {
                <div class="apprenant-item"
                     [class.selected]="apprenantForm.get('apprenantId')?.value === a.id"
                     (click)="selectApprenant(a.id)">
                  <div class="avatar-sm">{{ a.prenom[0] }}{{ a.nom[0] }}</div>
                  <div>
                    <div class="apprenant-nom">{{ a.prenom }} {{ a.nom }}</div>
                    <div class="apprenant-sub">{{ a.numeroInscription }} · {{ a.type === 'eleve' ? 'Élève' : 'Étudiant' }}</div>
                  </div>
                  @if (apprenantForm.get('apprenantId')?.value === a.id) {
                    <mat-icon class="check-icon">check_circle</mat-icon>
                  }
                </div>
              }
            </div>

            @if (data.type === 'reinscription' && apprenantForm.get('apprenantId')?.value) {
              @if (inscriptionState.loadingEligibilite()) {
                <mat-spinner diameter="24" class="inline-spinner"></mat-spinner>
              }
              @if (inscriptionState.eligibilite(); as eligibilite) {
                @if (eligibilite.eligible) {
                  <div class="eligibilite-ok">
                    <mat-icon>check_circle</mat-icon>
                    Éligible à la réinscription
                  </div>
                } @else {
                  <div class="eligibilite-ko">
                    <mat-icon>cancel</mat-icon>
                    Non éligible — {{ eligibilite.blocages.join(' · ') }}
                  </div>
                }
              }
            }

            <div class="step-actions">
              <button mat-raised-button color="primary" matStepperNext
                      [disabled]="!apprenantForm.get('apprenantId')?.value ||
                                  (data.type === 'reinscription' && inscriptionState.peutEtreReinscrit() === false)">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Étape 2 : Année académique & établissement -->
        <mat-step [stepControl]="anneeForm" label="Année académique">
          <form [formGroup]="anneeForm" class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Établissement *</mat-label>
              <mat-select formControlName="etablissementId"
                          (selectionChange)="onEtablissementChange($event.value)">
                @for (e of etablissementState.etablissements(); track e.id) {
                  <mat-option [value]="e.id">{{ e.nom }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Année académique *</mat-label>
              <mat-select formControlName="anneeAcademiqueId">
                @for (a of etablissementState.anneesAcademiques(); track a.id) {
                  <mat-option [value]="a.id">
                    {{ a.libelle }}
                    @if (a.active) { <span> (En cours)</span> }
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Commentaire</mat-label>
              <textarea matInput formControlName="commentaire" rows="3"
                        placeholder="Informations complémentaires..."></textarea>
            </mat-form-field>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-raised-button color="primary" matStepperNext
                      [disabled]="anneeForm.invalid">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Étape 3 : Récapitulatif -->
        <mat-step label="Confirmation">
          <div class="recapitulatif">
            <h3>Récapitulatif de l'inscription</h3>
            <div class="recap-item">
              <span class="recap-label">Type</span>
              <mat-chip [class]="'chip-' + data.type">
                {{ data.type === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription' }}
              </mat-chip>
            </div>
            <div class="recap-item">
              <span class="recap-label">Apprenant</span>
              <span>{{ apprenantSelectionne?.prenom }} {{ apprenantSelectionne?.nom }}</span>
            </div>
            <div class="recap-item">
              <span class="recap-label">Établissement</span>
              <span>{{ etablissementSelectionne }}</span>
            </div>
            <div class="recap-item">
              <span class="recap-label">Année académique</span>
              <span>{{ anneeSelectionnee }}</span>
            </div>
            @if (anneeForm.get('commentaire')?.value) {
              <div class="recap-item">
                <span class="recap-label">Commentaire</span>
                <span>{{ anneeForm.get('commentaire')?.value }}</span>
              </div>
            }
          </div>
          <div class="step-actions">
            <button mat-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon> Précédent
            </button>
            <button mat-raised-button color="primary" (click)="submit()">
              <mat-icon>check</mat-icon>
              Créer l'inscription
            </button>
          </div>
        </mat-step>

      </mat-stepper>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content { min-width: 580px; padding-top: 8px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .form-grid { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; }
    .full-width { width: 100%; }
    .inline-spinner { margin: 8px auto; display: block; }

    .apprenants-results { max-height: 240px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px; }
    .apprenant-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; transition: background .15s; }
    .apprenant-item:hover { background: #f5f5f5; }
    .apprenant-item.selected { background: #e3f2fd; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #bbdefb; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 14px; }
    .apprenant-sub { font-size: 12px; color: #757575; }
    .check-icon { margin-left: auto; color: #1565c0; }

    .eligibilite-ok { display: flex; align-items: center; gap: 8px; color: #2e7d32; background: #e8f5e9; padding: 10px 14px; border-radius: 8px; }
    .eligibilite-ko { display: flex; align-items: center; gap: 8px; color: #c62828; background: #fdecea; padding: 10px 14px; border-radius: 8px; }
    .eligibilite-ok mat-icon, .eligibilite-ko mat-icon { flex-shrink: 0; }

    .recapitulatif { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .recapitulatif h3 { margin: 0 0 16px; font-size: 15px; font-weight: 600; }
    .recap-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eeeeee; }
    .recap-item:last-child { border-bottom: none; }
    .recap-label { font-size: 13px; color: #757575; min-width: 140px; }

    .chip-nouvelle      { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-reinscription { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .step-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-bottom: 8px; }
  `]
})
export class InscriptionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly dialogRef         = inject(MatDialogRef<InscriptionFormDialogComponent>);
  readonly data: { type: 'nouvelle' | 'reinscription' } = inject(MAT_DIALOG_DATA);
  readonly etablissementState = inject(EtablissementStateService);
  readonly apprenantState     = inject(ApprenantStateService);
  readonly inscriptionState   = inject(InscriptionStateService);

  apprenantSelectionne: any = null;
  etablissementSelectionne = '';
  anneeSelectionnee        = '';

  apprenantForm = this.fb.group({
    search:      [''],
    apprenantId: ['', Validators.required],
  });

  anneeForm = this.fb.group({
    etablissementId:    ['', Validators.required],
    anneeAcademiqueId:  ['', Validators.required],
    commentaire:        [''],
  });

  ngOnInit(): void {
    this.etablissementState.loadEtablissements();
  }

  onSearchApprenant(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.length >= 2) {
      this.apprenantState.load({ search: value, limit: 10 });
    }
  }

  selectApprenant(id: string): void {
    this.apprenantForm.patchValue({ apprenantId: id });
    this.apprenantSelectionne = this.apprenantState.apprenants().find((a: any) => a.id === id);
    if (this.data.type === 'reinscription') {
      const anneeId = this.anneeForm.get('anneeAcademiqueId')?.value;
      if (anneeId) {
        this.inscriptionState.verifierEligibilite(id, anneeId);
      }
    }
  }

  onEtablissementChange(id: string): void {
    this.etablissementState.loadAnneesAcademiques(id);
    this.etablissementSelectionne =
      this.etablissementState.etablissements().find(e => e.id === id)?.nom ?? '';
  }

  submit(): void {
    if (!this.apprenantForm.get('apprenantId')?.value) return;
    this.dialogRef.close({
      apprenantId:        this.apprenantForm.value.apprenantId,
      etablissementId:    this.anneeForm.value.etablissementId,
      anneeAcademiqueId:  this.anneeForm.value.anneeAcademiqueId,
      type:               this.data.type,
      commentaire:        this.anneeForm.value.commentaire || undefined,
    });
  }
}
