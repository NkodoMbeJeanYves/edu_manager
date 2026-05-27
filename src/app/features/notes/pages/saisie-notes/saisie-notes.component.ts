import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { NoteStateService } from '../../services/note-state.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModifierNoteDialogComponent } from '../../components/modifier-note-dialog/modifier-note-dialog.component';
import { SaisieNoteMasse, TypeEvaluation } from '../../../../core/models/note.models';

interface LigneNote {
  apprenantId: string;
  prenom: string;
  nom: string;
  numeroInscription: string;
  noteId?: string;
  valeur: number | string;
  absent: boolean;
  dispense: boolean;
  commentaire: string;
  statut: string;
  modifie: boolean;
}

@Component({
  selector: 'app-saisie-notes',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatChipsModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatCardModule, MatSlideToggleModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/notes" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour aux évaluations
      </button>

      @if (state.loading()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (state.selectedEvaluation(); as evaluation) {
        <!-- En-tête évaluation -->
        <div class="detail-header">
          <div class="header-info">
            <div class="header-chips">
              <mat-chip [class]="'chip-type chip-' + evaluation.type">
                {{ typeLabel(evaluation.type) }}
              </mat-chip>
              <mat-chip [class]="'chip-statut chip-' + evaluation.statut">
                {{ statutLabel(evaluation.statut) }}
              </mat-chip>
            </div>
            <h1>{{ evaluation.intitule }}</h1>
            <div class="header-meta">
              <span><mat-icon>book</mat-icon> {{ evaluation.matiereLibelle }}</span>
              <span><mat-icon>class</mat-icon> {{ evaluation.classeLibelle ?? evaluation.promotionLibelle }}</span>
              <span><mat-icon>event</mat-icon> {{ evaluation.dateEvaluation | date:'dd/MM/yyyy' }}</span>
              <span><mat-icon>percent</mat-icon> Pondération : {{ evaluation.ponderation }}%</span>
              <span><mat-icon>calculate</mat-icon> Coefficient : {{ evaluation.coefficient }}</span>
            </div>
          </div>

          <!-- Progression -->
          <div class="progression-bloc">
            <div class="progression-label">
              Saisie : <strong>{{ state.progressionSaisie() }}%</strong>
              ({{ state.notesSaisies().length }} / {{ state.notes().length }})
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="state.progressionSaisie()"
              [color]="state.progressionSaisie() === 100 ? 'accent' : 'primary'"
              class="progression-bar">
            </mat-progress-bar>
          </div>
        </div>

        <!-- Statistiques rapides -->
        @if (state.statistiques(); as stats) {
          <div class="stats-inline">
            <div class="stat-item">
              <span class="stat-v">{{ stats.moyenne | number:'1.2-2' }}</span>
              <span class="stat-l">Moyenne</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{{ stats.noteMin }}</span>
              <span class="stat-l">Min</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{{ stats.noteMax }}</span>
              <span class="stat-l">Max</span>
            </div>
            <div class="stat-item stat-reussite">
              <span class="stat-v">{{ stats.tauxReussite }}%</span>
              <span class="stat-l">Réussite</span>
            </div>
            <div class="stat-item">
              <span class="stat-v">{{ stats.absents }}</span>
              <span class="stat-l">Absents</span>
            </div>
          </div>
        }

        <!-- Actions globales -->
        <div class="actions-bar">
          @if (lignesModifiees().length > 0) {
            <span class="modif-count">
              <mat-icon>pending</mat-icon>
              {{ lignesModifiees().length }} modification(s) non sauvegardée(s)
            </span>
          }
          <div class="actions-right">
            <button mat-stroked-button (click)="reinitialiser()"
                    [disabled]="lignesModifiees().length === 0">
              <mat-icon>undo</mat-icon> Annuler les modifications
            </button>
            <button mat-stroked-button color="primary"
                    (click)="sauvegarder()"
                    [disabled]="lignesModifiees().length === 0">
              <mat-icon>save</mat-icon> Sauvegarder
            </button>
            @if (evaluation.statut !== 'cloturee') {
              <button mat-raised-button color="primary"
                      (click)="soumettreNotes(evaluation.id)"
                      [disabled]="state.progressionSaisie() < 100">
                <mat-icon>send</mat-icon> Soumettre pour validation
              </button>
            }
            @if (evaluation.statut === 'en_cours' && !state.tousNotesValides()) {
              <button mat-raised-button color="accent"
                      (click)="validerNotes(evaluation.id)">
                <mat-icon>check_circle</mat-icon> Valider les notes
              </button>
            }
            @if (state.tousNotesValides()) {
              <button mat-raised-button color="accent"
                      (click)="publierNotes(evaluation.id)">
                <mat-icon>publish</mat-icon> Publier
              </button>
            }
          </div>
        </div>

        <!-- Grille de saisie -->
        @if (state.loadingNotes()) {
          <div class="loading-container"><mat-spinner diameter="32"></mat-spinner></div>
        } @else {
          <div class="grille-container mat-elevation-z2">
            <table class="grille-table">
              <thead>
                <tr>
                  <th class="th-rang">#</th>
                  <th class="th-apprenant">Apprenant</th>
                  <th class="th-note">Note / {{ evaluation.noteMax }}</th>
                  <th class="th-absent">Absent</th>
                  <th class="th-dispense">Dispensé</th>
                  <th class="th-commentaire">Commentaire</th>
                  <th class="th-statut">Statut</th>
                  <th class="th-actions"></th>
                </tr>
              </thead>
              <tbody>
                @for (ligne of lignes; track ligne.apprenantId; let i = $index) {
                  <tr [class.ligne-absent]="ligne.absent"
                      [class.ligne-dispense]="ligne.dispense"
                      [class.ligne-modifiee]="ligne.modifie"
                      [class.ligne-validee]="ligne.statut === 'validee' || ligne.statut === 'publiee'">

                    <td class="td-rang">{{ i + 1 }}</td>

                    <td class="td-apprenant">
                      <div class="apprenant-cell">
                        <div class="avatar-xs">
                          {{ ligne.prenom[0] }}{{ ligne.nom[0] }}
                        </div>
                        <div>
                          <div class="apprenant-nom">{{ ligne.prenom }} {{ ligne.nom }}</div>
                          <div class="apprenant-num">{{ ligne.numeroInscription }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="td-note">
                      <input
                        type="number"
                        class="note-input"
                        [class.note-input-valid]="isNoteValide(ligne)"
                        [class.note-input-error]="!isNoteValide(ligne) && ligne.valeur !== ''"
                        [(ngModel)]="ligne.valeur"
                        (ngModelChange)="onNoteChange(ligne)"
                        [disabled]="ligne.absent || ligne.dispense ||
                                    ligne.statut === 'validee' || ligne.statut === 'publiee'"
                        min="0"
                        [max]="evaluation.noteMax"
                        step="0.25"
                        placeholder="—">
                      @if (ligne.valeur !== '' && !isNoteValide(ligne)) {
                        <span class="note-error">0–{{ evaluation.noteMax }}</span>
                      }
                    </td>

                    <td class="td-absent">
                      <mat-slide-toggle
                        [(ngModel)]="ligne.absent"
                        (ngModelChange)="onAbsentChange(ligne)"
                        [disabled]="ligne.statut === 'validee' || ligne.statut === 'publiee'"
                        color="warn">
                      </mat-slide-toggle>
                    </td>

                    <td class="td-dispense">
                      <mat-slide-toggle
                        [(ngModel)]="ligne.dispense"
                        (ngModelChange)="onDispenseChange(ligne)"
                        [disabled]="ligne.statut === 'validee' || ligne.statut === 'publiee'"
                        color="accent">
                      </mat-slide-toggle>
                    </td>

                    <td class="td-commentaire">
                      <input
                        type="text"
                        class="comment-input"
                        [(ngModel)]="ligne.commentaire"
                        (ngModelChange)="ligne.modifie = true"
                        [disabled]="ligne.statut === 'validee' || ligne.statut === 'publiee'"
                        placeholder="Commentaire...">
                    </td>

                    <td class="td-statut">
                      <mat-chip [class]="'chip-note-statut chip-' + ligne.statut">
                        {{ noteStatutLabel(ligne.statut) }}
                      </mat-chip>
                    </td>

                    <td class="td-actions">
                      @if (ligne.statut === 'validee' || ligne.statut === 'publiee') {
                        <button mat-icon-button
                                (click)="openModifierNote(ligne)"
                                matTooltip="Modifier avec motif">
                          <mat-icon>edit</mat-icon>
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; color: #555; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px; padding: 20px 24px; background: white;
      border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      gap: 24px;
    }
    .header-chips { display: flex; gap: 8px; margin-bottom: 8px; }
    .detail-header h1 { margin: 4px 0 8px; font-size: 22px; font-weight: 600; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .header-meta span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .header-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .progression-bloc { min-width: 200px; }
    .progression-label { font-size: 13px; color: #555; margin-bottom: 6px; }
    .progression-bar { height: 8px; border-radius: 4px; }

    .stats-inline {
      display: flex; gap: 24px; padding: 16px 24px;
      background: white; border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .stat-item { text-align: center; }
    .stat-v { display: block; font-size: 22px; font-weight: 700; color: #1a1a1a; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-reussite .stat-v { color: #2e7d32; }

    .actions-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px; padding: 12px 16px;
      background: #f9f9f9; border-radius: 8px; gap: 8px; flex-wrap: wrap;
    }
    .actions-right { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
    .modif-count { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #e65100; font-weight: 500; }
    .modif-count mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .grille-container { border-radius: 8px; overflow: auto; background: white; }
    .grille-table { width: 100%; border-collapse: collapse; }
    .grille-table thead tr { background: #1565c0; }
    .grille-table th { padding: 12px 10px; text-align: left; color: white; font-weight: 600; font-size: 13px; white-space: nowrap; }
    .th-rang { width: 40px; }
    .th-note { width: 120px; }
    .th-absent, .th-dispense { width: 80px; }
    .th-statut { width: 110px; }
    .th-actions { width: 48px; }
    .grille-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    .grille-table tbody tr:hover { background: #f8f9ff; }
    .ligne-absent   { background: #fff3e0 !important; }
    .ligne-dispense { background: #f3e5f5 !important; }
    .ligne-modifiee td:first-child { border-left: 3px solid #e65100; }
    .ligne-validee  { background: #f9fff9; }

    .td-rang { color: #9e9e9e; font-size: 12px; text-align: center; }
    .apprenant-cell { display: flex; align-items: center; gap: 8px; }
    .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 10px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 13px; }
    .apprenant-num { font-size: 11px; color: #9e9e9e; }

    .note-input {
      width: 80px; padding: 6px 10px; border: 1.5px solid #e0e0e0;
      border-radius: 6px; font-size: 15px; font-weight: 600;
      text-align: center; outline: none; transition: border-color .2s;
    }
    .note-input:focus { border-color: #1565c0; }
    .note-input:disabled { background: #f5f5f5; color: #bdbdbd; }
    .note-input-valid { border-color: #81c784; }
    .note-input-error { border-color: #e57373; }
    .note-error { font-size: 10px; color: #c62828; display: block; margin-top: 2px; }

    .comment-input {
      width: 100%; padding: 5px 8px; border: 1px solid #e0e0e0;
      border-radius: 4px; font-size: 12px; outline: none;
    }
    .comment-input:focus { border-color: #1565c0; }
    .comment-input:disabled { background: #f5f5f5; }

    .chip-note-statut { font-size: 11px !important; min-height: 22px !important; }
    .chip-brouillon  { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-soumise    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-validee    { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-publiee    { background: #e8eaf6 !important; color: #283593 !important; }

    .chip-type { font-size: 12px !important; }
    .chip-cc          { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-partiel     { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-examen_final { background: #fce4ec !important; color: #880e4f !important; }
    .chip-tp          { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-oral        { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-projet      { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-rattrapage  { background: #fff8e1 !important; color: #f57f17 !important; }
    .chip-planifiee   { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-en_cours    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-cloturee    { background: #e8f5e9 !important; color: #2e7d32 !important; }
  `]
})
export class SaisieNotesComponent implements OnInit {
  state = inject(NoteStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  lignes: LigneNote[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectEvaluation(id);
    setTimeout(() => this.buildLignes(), 1500);
  }

  private buildLignes(): void {
    const notes = this.state.notes();
    this.lignes = notes.map(n => ({
      apprenantId:        n.apprenantId,
      prenom:             n.apprenant?.prenom ?? '',
      nom:                n.apprenant?.nom ?? '',
      numeroInscription:  n.apprenant?.numeroInscription ?? '',
      noteId:             n.id,
      valeur:             n.valeur !== null ? n.valeur : '',
      absent:             n.absent,
      dispense:           n.dispense,
      commentaire:        n.commentaire ?? '',
      statut:             n.statut,
      modifie:            false,
    }));
  }

  lignesModifiees(): LigneNote[] {
    return this.lignes.filter(l => l.modifie);
  }

  onNoteChange(ligne: LigneNote): void {
    ligne.modifie = true;
  }

  onAbsentChange(ligne: LigneNote): void {
    if (ligne.absent) {
      ligne.valeur  = '';
      ligne.dispense = false;
    }
    ligne.modifie = true;
  }

  onDispenseChange(ligne: LigneNote): void {
    if (ligne.dispense) {
      ligne.valeur = '';
      ligne.absent = false;
    }
    ligne.modifie = true;
  }

  isNoteValide(ligne: LigneNote): boolean {
    if (ligne.valeur === '' || ligne.absent || ligne.dispense) return true;
    const v = Number(ligne.valeur);
    const max = this.state.selectedEvaluation()?.noteMax ?? 20;
    return !isNaN(v) && v >= 0 && v <= max;
  }

  reinitialiser(): void {
    this.buildLignes();
  }

  sauvegarder(): void {
    const evaluation = this.state.selectedEvaluation();
    if (!evaluation) return;
    const modifiees = this.lignesModifiees();
    if (!modifiees.length) return;

    const dto: SaisieNoteMasse = {
      evaluationId: evaluation.id,
      notes: modifiees.map(l => ({
        apprenantId: l.apprenantId,
        valeur:      l.absent || l.dispense ? null : (l.valeur === '' ? null : Number(l.valeur)),
        absent:      l.absent,
        dispense:    l.dispense,
        commentaire: l.commentaire || undefined,
      })),
    };

    this.state.saisirNotesMasse(dto, () => {
      this.lignes.forEach(l => l.modifie = false);
      this.snackBar.open('Notes sauvegardées', 'Fermer', { duration: 3000 });
    });
  }

  soumettreNotes(evaluationId: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Soumettre les notes',
        message: 'Soumettre les notes pour validation par le responsable pédagogique ?',
        confirmLabel: 'Soumettre', confirmColor: 'primary', icon: 'send',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.soumettreNotes(evaluationId, () =>
          this.snackBar.open('Notes soumises pour validation', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  validerNotes(evaluationId: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Valider les notes',
        message: 'Valider définitivement les notes ? Elles ne pourront plus être modifiées sans motif.',
        confirmLabel: 'Valider', confirmColor: 'primary', icon: 'check_circle',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.validerNotes({ evaluationId }, () =>
          this.snackBar.open('Notes validées', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  publierNotes(evaluationId: string): void {
    this.state.publierNotes(evaluationId, () =>
      this.snackBar.open('Notes publiées — visibles aux apprenants', 'Fermer', { duration: 4000 })
    );
  }

  openModifierNote(ligne: LigneNote): void {
    if (!ligne.noteId) return;
    const ref = this.dialog.open(ModifierNoteDialogComponent, {
      width: '440px',
      data: { ligne, noteMax: this.state.selectedEvaluation()?.noteMax ?? 20 },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateNote(ligne.noteId!, result, () => {
          this.snackBar.open('Note modifiée', 'Fermer', { duration: 3000 });
          this.buildLignes();
        });
      }
    });
  }

  typeLabel(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'CC', partiel: 'Partiel', examen_final: 'Examen final',
      tp: 'TP', oral: 'Oral', projet: 'Projet',
      devoir_maison: 'Devoir maison', rattrapage: 'Rattrapage',
    };
    return map[type] ?? type;
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours',
      cloturee: 'Clôturée', annulee: 'Annulée',
    };
    return map[s] ?? s;
  }

  noteStatutLabel(s: string): string {
    const map: Record<string, string> = {
      brouillon: 'Brouillon', soumise: 'Soumise',
      validee: 'Validée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }
}
