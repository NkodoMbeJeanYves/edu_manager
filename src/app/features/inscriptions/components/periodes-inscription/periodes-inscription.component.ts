import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PeriodeInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-periodes-inscription',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="periodes-container">
      <div class="section-header">
        <h3>Périodes d'inscription</h3>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Annuler' : 'Nouvelle période' }}
        </button>
      </div>

      <!-- Formulaire création période -->
      @if (showForm) {
        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="form" class="periode-form">
              <mat-form-field appearance="outline">
                <mat-label>Libellé *</mat-label>
                <input matInput formControlName="libelle"
                       placeholder="Ex: Inscriptions 2024-2025">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Type *</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="nouvelle">Nouvelles inscriptions</mat-option>
                  <mat-option value="reinscription">Réinscriptions</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ouverture *</mat-label>
                <input matInput [matDatepicker]="dpOuverture"
                       formControlName="dateOuverture">
                <mat-datepicker-toggle matSuffix [for]="dpOuverture">
                </mat-datepicker-toggle>
                <mat-datepicker #dpOuverture></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Clôture *</mat-label>
                <input matInput [matDatepicker]="dpCloture"
                       formControlName="dateCloture">
                <mat-datepicker-toggle matSuffix [for]="dpCloture">
                </mat-datepicker-toggle>
                <mat-datepicker #dpCloture></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Capacité max.</mat-label>
                <input matInput formControlName="capaciteMax" type="number" min="1">
                <mat-hint>Laisser vide = illimité</mat-hint>
              </mat-form-field>

              <button mat-raised-button color="primary"
                      (click)="creerPeriode()" [disabled]="form.invalid">
                <mat-icon>save</mat-icon> Créer la période
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Spinner -->
      @if (state.loadingPeriodes()) {
        <div class="loading-periodes"><mat-spinner diameter="32"></mat-spinner></div>
      }

      <!-- Liste des périodes -->
      <div class="periodes-list">
        @for (periode of state.periodes(); track periode.id) {
          <mat-card class="periode-card" [class.periode-ouverte]="periode.ouverte">
            <mat-card-content>
              <div class="periode-header">
                <div>
                  <div class="periode-nom">{{ periode.libelle }}</div>
                  <div class="periode-type">
                    {{ periode.type === 'nouvelle' ? 'Nouvelles inscriptions' : 'Réinscriptions' }}
                  </div>
                </div>
                <mat-chip [class]="periode.ouverte ? 'chip-ouverte' : 'chip-fermee'">
                  <mat-icon>{{ periode.ouverte ? 'lock_open' : 'lock' }}</mat-icon>
                  {{ periode.ouverte ? 'Ouverte' : 'Fermée' }}
                </mat-chip>
              </div>
              <div class="periode-dates">
                <mat-icon>event</mat-icon>
                {{ periode.dateOuverture | date:'dd/MM/yyyy' }} →
                {{ periode.dateCloture   | date:'dd/MM/yyyy' }}
              </div>
              @if (periode.capaciteMax) {
                <div class="periode-capacite">
                  <mat-icon>people</mat-icon>
                  {{ periode.inscritsCount ?? 0 }} / {{ periode.capaciteMax }} inscrits
                </div>
              }
            </mat-card-content>
            <mat-card-actions>
              @if (!periode.ouverte) {
                <button mat-button color="primary"
                        (click)="state.ouvrirPeriode(periode.id)">
                  <mat-icon>lock_open</mat-icon> Ouvrir
                </button>
              } @else {
                <button mat-button color="warn"
                        (click)="state.fermerPeriode(periode.id)">
                  <mat-icon>lock</mat-icon> Fermer
                </button>
              }
              <button mat-icon-button color="warn"
                      (click)="confirmerSuppression(periode)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        }
        @empty {
          <div class="empty-periodes">
            <mat-icon>event_busy</mat-icon>
            <p>Aucune période d'inscription configurée</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .periodes-container { padding: 8px 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
    .form-card { margin-bottom: 20px; background: #f9f9f9; }
    .periode-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }
    .periode-form mat-form-field { min-width: 200px; }
    .loading-periodes { display: flex; justify-content: center; padding: 24px; }
    .periodes-list { display: flex; flex-direction: column; gap: 12px; }
    .periode-card { border: 1px solid #e0e0e0; }
    .periode-ouverte { border-color: #2e7d32; background: #f9fff9; }
    .periode-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .periode-nom { font-weight: 600; font-size: 14px; }
    .periode-type { font-size: 12px; color: #757575; }
    .periode-dates, .periode-capacite { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; margin-top: 4px; }
    .periode-dates mat-icon, .periode-capacite mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .chip-ouverte { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-fermee  { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-ouverte mat-icon, .chip-fermee mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .empty-periodes { text-align: center; padding: 32px; color: #9e9e9e; }
    .empty-periodes mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
  `]
})
export class PeriodesinscriptionComponent implements OnInit {
  @Input() etablissementId!: string;
  @Input() anneeAcademiqueId!: string;

  state    = inject(InscriptionStateService);
  private fb       = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog   = inject(MatDialog);

  showForm = false;

  form = this.fb.group({
    libelle:       ['', Validators.required],
    type:          ['nouvelle', Validators.required],
    dateOuverture: [null as Date | null, Validators.required],
    dateCloture:   [null as Date | null, Validators.required],
    capaciteMax:   [null as number | null],
  });

  ngOnInit(): void {
    if (this.etablissementId) {
      this.state.loadPeriodes(this.etablissementId);
    }
  }

  creerPeriode(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.state.createPeriode({
      ...this.form.value as any,
      etablissementId:   this.etablissementId,
      anneeAcademiqueId: this.anneeAcademiqueId,
    }, () => {
      this.snackBar.open('Période créée', 'Fermer', { duration: 3000 });
      this.form.reset({ type: 'nouvelle' });
      this.showForm = false;
    });
  }

  confirmerSuppression(periode: PeriodeInscription): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la période',
        message: `Supprimer "${periode.libelle}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deletePeriode(periode.id);
        this.snackBar.open('Période supprimée', 'Fermer', { duration: 3000 });
      }
    });
  }
}
