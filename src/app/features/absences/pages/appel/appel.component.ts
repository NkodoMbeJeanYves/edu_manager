import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { AbsenceStateService } from '../../services/absence-state.service';
import { StatutPresence, SaisirPresencesDto } from '../../../../core/models/absence.models';

interface LigneAppel {
  apprenantId: string;
  prenom: string;
  nom: string;
  numeroInscription: string;
  presenceId?: string;
  statut: StatutPresence;
  minutesRetard: number;
  remarque: string;
  modifie: boolean;
}

@Component({
  selector: 'app-appel',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatSnackBarModule, MatTooltipModule,
    MatCardModule, MatInputModule, MatFormFieldModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="appel-header">
        <button mat-button routerLink="/absences" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="seance-info">
          @if (state.feuillePresence(); as feuille) {
            <h2>{{ feuille.matiereLibelle }}</h2>
            <div class="seance-meta">
              <span><mat-icon>person</mat-icon> {{ feuille.enseignantNom }}</span>
              <span><mat-icon>class</mat-icon> {{ feuille.classeOuGroupeLibelle }}</span>
              <span><mat-icon>schedule</mat-icon> {{ feuille.heureDebut }} – {{ feuille.heureFin }}</span>
              <span><mat-icon>event</mat-icon> {{ feuille.date | date:'EEE d MMMM yyyy' }}</span>
            </div>
          }
        </div>

        <!-- Compteurs temps réel -->
        <div class="compteurs">
          <div class="compteur compteur-present">
            <span class="compteur-val">{{ state.presentsCount() }}</span>
            <span class="compteur-label">Présents</span>
          </div>
          <div class="compteur compteur-absent">
            <span class="compteur-val">{{ state.absentsCount() }}</span>
            <span class="compteur-label">Absents</span>
          </div>
          <div class="compteur compteur-retard">
            <span class="compteur-val">{{ retardsCount() }}</span>
            <span class="compteur-label">Retards</span>
          </div>
          <div class="compteur compteur-total">
            <span class="compteur-val">{{ lignes.length }}</span>
            <span class="compteur-label">Total</span>
          </div>
        </div>
      </div>

      <!-- Barre de progression -->
      <mat-progress-bar
        mode="determinate"
        [value]="progression()"
        [color]="progression() === 100 ? 'accent' : 'primary'"
        class="prog-bar">
      </mat-progress-bar>
      <div class="prog-label">
        {{ progression() }}% de l'appel complété
        @if (progression() === 100) {
          <mat-icon class="check-icon">check_circle</mat-icon>
        }
      </div>

      @if (state.loadingFeuille()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      <!-- Actions groupées -->
      <div class="actions-groupees">
        <button mat-stroked-button (click)="tousPresents()">
          <mat-icon>done_all</mat-icon> Tous présents
        </button>
        <button mat-stroked-button color="warn" (click)="tousAbsents()">
          <mat-icon>do_not_disturb</mat-icon> Tous absents
        </button>
        <div class="spacer"></div>
        @if (lignesModifiees().length > 0) {
          <span class="modif-indicator">
            <mat-icon>pending</mat-icon>
            {{ lignesModifiees().length }} modification(s) non sauvegardée(s)
          </span>
        }
        <button mat-raised-button color="primary"
                (click)="sauvegarder()"
                [disabled]="lignesModifiees().length === 0 || state.loadingFeuille()">
          <mat-icon>save</mat-icon> Sauvegarder l'appel
        </button>
      </div>

      <!-- Grille d'appel -->
      @if (!state.loadingFeuille()) {
        <div class="grille-appel mat-elevation-z2">
          <table class="appel-table">
            <thead>
              <tr>
                <th class="th-rang">#</th>
                <th class="th-apprenant">Apprenant</th>
                <th class="th-statut">Statut</th>
                <th class="th-retard">Retard (min.)</th>
                <th class="th-remarque">Remarque</th>
              </tr>
            </thead>
            <tbody>
              @for (ligne of lignes; track ligne.apprenantId; let i = $index) {
                <tr [class]="'ligne-' + ligne.statut"
                    [class.ligne-modifiee]="ligne.modifie">
                  <td class="td-rang">{{ i + 1 }}</td>
                  <td class="td-apprenant">
                    <div class="apprenant-row">
                      <div class="avatar-xs"
                           [class]="'avatar-' + (i % 2 === 0 ? 'masc' : 'fem')">
                        {{ ligne.prenom[0] }}{{ ligne.nom[0] }}
                      </div>
                      <div>
                        <div class="apprenant-nom">{{ ligne.prenom }} {{ ligne.nom }}</div>
                        <div class="apprenant-num">{{ ligne.numeroInscription }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="td-statut">
                    <div class="statut-btns">
                      <button class="statut-btn"
                              [class.active-present]="ligne.statut === 'present'"
                              (click)="setStatut(ligne, 'present')"
                              matTooltip="Présent">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button class="statut-btn"
                              [class.active-absent]="ligne.statut === 'absent'"
                              (click)="setStatut(ligne, 'absent')"
                              matTooltip="Absent">
                        <mat-icon>close</mat-icon>
                      </button>
                      <button class="statut-btn"
                              [class.active-retard]="ligne.statut === 'retard'"
                              (click)="setStatut(ligne, 'retard')"
                              matTooltip="En retard">
                        <mat-icon>schedule</mat-icon>
                      </button>
                      <button class="statut-btn"
                              [class.active-dispense]="ligne.statut === 'dispense'"
                              (click)="setStatut(ligne, 'dispense')"
                              matTooltip="Dispensé">
                        <mat-icon>medical_services</mat-icon>
                      </button>
                    </div>
                  </td>
                  <td class="td-retard">
                    @if (ligne.statut === 'retard') {
                      <input type="number" class="retard-input"
                             [(ngModel)]="ligne.minutesRetard"
                             (ngModelChange)="ligne.modifie = true"
                             min="1" max="90" placeholder="min.">
                    } @else {
                      <span class="cell-na">—</span>
                    }
                  </td>
                  <td class="td-remarque">
                    <input type="text" class="remarque-input"
                           [(ngModel)]="ligne.remarque"
                           (ngModelChange)="ligne.modifie = true"
                           placeholder="Facultatif...">
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (state.error()) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ state.error() }}</span>
          <button mat-icon-button (click)="state.clearError()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 20px 24px; max-width: 1200px; margin: 0 auto; }

    .appel-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
    .back-btn { min-width: 40px; flex-shrink: 0; }
    .seance-info { flex: 1; }
    .seance-info h2 { margin: 0 0 6px; font-size: 20px; font-weight: 600; }
    .seance-meta { display: flex; flex-wrap: wrap; gap: 14px; }
    .seance-meta span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .seance-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .compteurs { display: flex; gap: 12px; }
    .compteur { text-align: center; padding: 10px 16px; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .compteur-val { display: block; font-size: 24px; font-weight: 700; }
    .compteur-label { font-size: 11px; color: #757575; }
    .compteur-present .compteur-val { color: #2e7d32; }
    .compteur-absent  .compteur-val { color: #c62828; }
    .compteur-retard  .compteur-val { color: #e65100; }
    .compteur-total   .compteur-val { color: #1565c0; }

    .prog-bar { height: 8px; border-radius: 4px; margin-bottom: 4px; }
    .prog-label { font-size: 12px; color: #555; display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
    .check-icon { font-size: 16px; width: 16px; height: 16px; color: #2e7d32; }

    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .actions-groupees { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .spacer { flex: 1; }
    .modif-indicator { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #e65100; font-weight: 500; }
    .modif-indicator mat-icon { font-size: 16px; }

    .grille-appel { border-radius: 8px; overflow: hidden; }
    .appel-table { width: 100%; border-collapse: collapse; }
    .appel-table thead tr { background: #1565c0; }
    .appel-table th { padding: 12px 10px; text-align: left; color: white; font-size: 13px; font-weight: 600; }
    .th-rang { width: 48px; }
    .th-statut { width: 180px; }
    .th-retard { width: 110px; }
    .appel-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    .appel-table tbody tr:hover { background: #fafafa; }

    .ligne-present  { background: #f9fff9; }
    .ligne-absent   { background: #fff5f5; }
    .ligne-retard   { background: #fff8f0; }
    .ligne-dispense { background: #f5f5ff; }
    .ligne-modifiee td:first-child { border-left: 3px solid #e65100; }

    .apprenant-row { display: flex; align-items: center; gap: 10px; }
    .avatar-xs { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px; flex-shrink: 0; }
    .avatar-masc { background: #bbdefb; color: #1565c0; }
    .avatar-fem  { background: #f8bbd9; color: #880e4f; }
    .apprenant-nom { font-weight: 500; font-size: 13px; }
    .apprenant-num { font-size: 11px; color: #9e9e9e; }

    .statut-btns { display: flex; gap: 4px; }
    .statut-btn {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid #e0e0e0;
      background: white; cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: all .15s;
    }
    .statut-btn mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9e9e9e; }
    .statut-btn:hover { border-color: #1565c0; }
    .active-present { border-color: #2e7d32 !important; background: #e8f5e9 !important; }
    .active-present mat-icon { color: #2e7d32 !important; }
    .active-absent  { border-color: #c62828 !important; background: #fdecea !important; }
    .active-absent  mat-icon { color: #c62828 !important; }
    .active-retard  { border-color: #e65100 !important; background: #fff3e0 !important; }
    .active-retard  mat-icon { color: #e65100 !important; }
    .active-dispense { border-color: #4527a0 !important; background: #ede7f6 !important; }
    .active-dispense mat-icon { color: #4527a0 !important; }

    .retard-input {
      width: 70px; padding: 5px 8px; border: 1px solid #e0e0e0;
      border-radius: 4px; font-size: 13px; text-align: center;
    }
    .remarque-input {
      width: 100%; padding: 5px 8px; border: 1px solid #e0e0e0;
      border-radius: 4px; font-size: 12px;
    }
    .cell-na { color: #d0d0d0; font-size: 12px; }

    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 10px 14px; border-radius: 8px; margin-top: 12px; }
  `]
})
export class AppelComponent implements OnInit {
  state    = inject(AbsenceStateService);
  private route    = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  seanceId = '';
  lignes: LigneAppel[] = [];

  constructor() {
    // Rebuild lines reactively whenever the feuille signal changes.
    effect(() => {
      const feuille = this.state.feuillePresence();
      if (feuille) this.buildLignes(feuille);
    });
  }

  ngOnInit(): void {
    this.seanceId = this.route.snapshot.paramMap.get('seanceId') ?? '';
    if (this.seanceId) {
      this.state.loadFeuillePresence(this.seanceId);
    }
  }

  private buildLignes(feuille: NonNullable<ReturnType<AbsenceStateService['feuillePresence']>>): void {
    this.lignes = feuille.presences.map(p => ({
      apprenantId:       p.apprenantId,
      prenom:            p.apprenant?.prenom ?? '',
      nom:               p.apprenant?.nom    ?? '',
      numeroInscription: p.apprenant?.numeroInscription ?? '',
      presenceId:        p.id,
      statut:            p.statut,
      minutesRetard:     p.minutesRetard ?? 0,
      remarque:          p.remarque      ?? '',
      modifie:           false,
    }));
  }

  lignesModifiees(): LigneAppel[] {
    return this.lignes.filter(l => l.modifie);
  }

  progression(): number {
    if (!this.lignes.length) return 0;
    const renseignees = this.lignes.filter(
      l => l.modifie || l.statut !== 'present'
    ).length;
    return Math.round((renseignees / this.lignes.length) * 100);
  }

  retardsCount(): number {
    return this.lignes.filter(l => l.statut === 'retard').length;
  }

  setStatut(ligne: LigneAppel, statut: StatutPresence): void {
    ligne.statut  = statut;
    ligne.modifie = true;
    if (statut !== 'retard') ligne.minutesRetard = 0;
  }

  tousPresents(): void {
    this.lignes.forEach(l => {
      l.statut  = 'present';
      l.modifie = true;
    });
  }

  tousAbsents(): void {
    this.lignes.forEach(l => {
      l.statut  = 'absent';
      l.modifie = true;
    });
  }

  sauvegarder(): void {
    const dto: SaisirPresencesDto = {
      seanceId: this.seanceId,
      presences: this.lignes.map(l => ({
        apprenantId:   l.apprenantId,
        statut:        l.statut,
        minutesRetard: l.statut === 'retard' ? l.minutesRetard : undefined,
        remarque:      l.remarque || undefined,
      })),
    };
    this.state.saisirPresences(dto, () => {
      this.lignes.forEach(l => l.modifie = false);
      this.snackBar.open('Appel sauvegardé', 'Fermer', { duration: 3000 });
    });
  }
}
