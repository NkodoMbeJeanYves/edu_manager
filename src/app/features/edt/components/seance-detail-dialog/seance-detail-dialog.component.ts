import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EdtStateService } from '../../services/edt-state.service';

@Component({
  selector: 'app-seance-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event</mat-icon> Détail de la séance
    </h2>
    <mat-dialog-content>
      @if (state.loading()) {
        <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
      }
      @if (state.selectedSeance(); as seance) {
        <div class="seance-info">
          <div class="info-row">
            <mat-icon>book</mat-icon>
            <span class="info-label">Matière</span>
            <span>{{ seance.matiereLibelle ?? seance.matiereId }}</span>
          </div>
          <div class="info-row">
            <mat-icon>person</mat-icon>
            <span class="info-label">Enseignant</span>
            <span>{{ seance.enseignantNom ?? seance.enseignantId }}</span>
          </div>
          <div class="info-row">
            <mat-icon>room</mat-icon>
            <span class="info-label">Salle</span>
            <span>{{ seance.salleLibelle ?? seance.salleCode }}</span>
          </div>
          <div class="info-row">
            <mat-icon>schedule</mat-icon>
            <span class="info-label">Horaire</span>
            <span>{{ seance.date | date:'EEE d MMM' }} · {{ seance.heureDebut }} – {{ seance.heureFin }}</span>
          </div>
          <div class="info-row">
            <mat-icon>class</mat-icon>
            <span class="info-label">Groupe</span>
            <span>{{ seance.classeLibelle ?? seance.promotionLibelle ?? seance.groupeLibelle ?? '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Statut</span>
            <mat-chip [class]="'chip-statut-seance chip-' + seance.statut">
              {{ statutLabel(seance.statut) }}
            </mat-chip>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="cahier-section">
          <h4><mat-icon>edit_note</mat-icon> Cahier de texte</h4>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contenu enseigné</mat-label>
            <textarea matInput [(ngModel)]="contenu" rows="3"
                      [disabled]="seance.statut === 'annulee'"
                      placeholder="Décrire le contenu du cours..."></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Travaux demandés</mat-label>
            <textarea matInput [(ngModel)]="travaux" rows="2"
                      [disabled]="seance.statut === 'annulee'"
                      placeholder="Exercices, DM, TP à préparer..."></textarea>
          </mat-form-field>
          @if (seance.statut !== 'annulee') {
            <button mat-stroked-button color="primary"
                    (click)="sauvegarderCahier(seance.id)">
              <mat-icon>save</mat-icon> Sauvegarder
            </button>
          }
        </div>

        <mat-divider></mat-divider>

        <div class="seance-actions">
          @if (seance.statut === 'planifiee' || seance.statut === 'en_cours') {
            <button mat-raised-button color="primary"
                    (click)="dialogRef.close({ type: 'realiser' })">
              <mat-icon>check_circle</mat-icon> Marquer réalisée
            </button>
            <button mat-stroked-button color="warn"
                    (click)="ouvrirAnnulation()">
              <mat-icon>cancel</mat-icon> Annuler
            </button>
          }
        </div>

        @if (showAnnulation) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motif d'annulation *</mat-label>
            <input matInput [(ngModel)]="motifAnnulation"
                   placeholder="Raison de l'annulation...">
          </mat-form-field>
          <button mat-raised-button color="warn"
                  [disabled]="!motifAnnulation"
                  (click)="dialogRef.close({ type: 'annuler', motif: motifAnnulation })">
            Confirmer l'annulation
          </button>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 480px; }
    h2 mat-icon { vertical-align: middle; margin-right: 8px; }
    .loading { display: flex; justify-content: center; padding: 32px; }
    .seance-info { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .info-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
    .info-row mat-icon { font-size: 18px; color: #757575; }
    .info-label { color: #757575; min-width: 90px; font-size: 12px; }
    .cahier-section { padding: 12px 0; }
    .cahier-section h4 { display: flex; align-items: center; gap: 6px; margin: 0 0 12px; font-size: 14px; }
    .full-width { width: 100%; }
    .seance-actions { display: flex; gap: 8px; padding: 8px 0; flex-wrap: wrap; }
    .chip-planifiee  { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-realisee   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-annulee    { background: #fdecea !important; color: #c62828 !important; }
    .chip-reportee   { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-en_cours   { background: #fff8e1 !important; color: #f57f17 !important; }
  `]
})
export class SeanceDetailDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SeanceDetailDialogComponent>);
  readonly data: { seanceId: string } = inject(MAT_DIALOG_DATA);
  state = inject(EdtStateService);

  contenu          = '';
  travaux          = '';
  motifAnnulation  = '';
  showAnnulation   = false;

  constructor() {
    // Synchronise les champs locaux quand la séance est chargée
    effect(() => {
      const s = this.state.selectedSeance();
      if (s && s.id === this.data.seanceId) {
        this.contenu = s.contenuEnseignant ?? '';
        this.travaux = s.travauxDemandes  ?? '';
      }
    });
  }

  ngOnInit(): void {
    this.state.selectSeance(this.data.seanceId);
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours', realisee: 'Réalisée',
      annulee: 'Annulée', reportee: 'Reportée', suspendue: 'Suspendue',
    };
    return map[s] ?? s;
  }

  sauvegarderCahier(seanceId: string): void {
    this.state.saisirCahierTexte({
      seanceId,
      contenuEnseignant: this.contenu,
      travauxDemandes: this.travaux || undefined,
    });
  }

  ouvrirAnnulation(): void {
    this.showAnnulation = !this.showAnnulation;
  }
}
