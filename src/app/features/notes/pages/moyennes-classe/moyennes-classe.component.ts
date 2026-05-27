import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteStateService } from '../../services/note-state.service';
import { MoyenneGenerale } from '../../../../core/models/note.models';

@Component({
  selector: 'app-moyennes-classe',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatChipsModule, MatCardModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/notes" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour
      </button>

      <div class="page-header">
        <h1 class="page-title">Moyennes de classe</h1>
        <div class="header-actions">
          <button mat-stroked-button color="primary"
                  (click)="calculerMoyennes()"
                  [disabled]="!periodeId || state.calculEnCours()">
            @if (state.calculEnCours()) {
              <mat-spinner diameter="18" class="inline-spin"></mat-spinner>
            } @else {
              <mat-icon>calculate</mat-icon>
            }
            Recalculer les moyennes
          </button>
        </div>
      </div>

      <!-- Sélecteurs -->
      <div class="filters-bar">
        <mat-form-field appearance="outline">
          <mat-label>Classe / Promotion</mat-label>
          <mat-select [(ngModel)]="classeId" (ngModelChange)="onClasseChange()">
            <mat-option value="">Sélectionner une classe</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Période</mat-label>
          <mat-select [(ngModel)]="periodeId" (ngModelChange)="onPeriodeChange()">
            <mat-option value="">Sélectionner une période</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (state.loadingMoyennes()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (!state.loadingMoyennes() && state.moyennesClasse().length > 0) {
        <!-- Résumé statistiques classe -->
        <div class="classe-stats">
          <mat-card class="stat-card">
            <div class="stat-v">{{ moyenneClasse() | number:'1.2-2' }}</div>
            <div class="stat-l">Moyenne de classe</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-v">{{ state.moyennesClasse().length }}</div>
            <div class="stat-l">Apprenants</div>
          </mat-card>
          <mat-card class="stat-card stat-success">
            <div class="stat-v">{{ tauxReussite() }}%</div>
            <div class="stat-l">Taux de réussite</div>
          </mat-card>
        </div>

        <!-- Tableau des moyennes -->
        <div class="tableau-moyennes mat-elevation-z2">
          <table class="moyennes-table">
            <thead>
              <tr>
                <th class="th-rang">Rang</th>
                <th class="th-apprenant">Apprenant</th>
                @for (mm of colonnesMatieres(); track mm) {
                  <th class="th-matiere" [matTooltip]="mm">
                    {{ abrev(mm) }}
                  </th>
                }
                <th class="th-moy-gen">Moy. Générale</th>
                <th class="th-mention">Mention</th>
              </tr>
            </thead>
            <tbody>
              @for (moy of state.moyennesClasse(); track moy.apprenantId; let i = $index) {
                <tr [class.top-trois]="i < 3">
                  <td class="td-rang">
                    <span class="rang-badge" [class]="'rang-' + (i + 1)">
                      {{ moy.rang ?? i + 1 }}
                    </span>
                  </td>
                  <td class="td-apprenant">
                    <div class="apprenant-cell">
                      <div class="avatar-xs">
                        {{ moy.apprenant?.prenom?.[0] }}{{ moy.apprenant?.nom?.[0] }}
                      </div>
                      <span>{{ moy.apprenant?.prenom }} {{ moy.apprenant?.nom }}</span>
                    </div>
                  </td>
                  @for (mm of colonnesMatieres(); track mm) {
                    <td class="td-note-mat" [class]="getNoteColor(getMoyMatiere(moy, mm))">
                      {{ getMoyMatiere(moy, mm) !== null ? (getMoyMatiere(moy, mm) | number:'1.2-2') : '—' }}
                    </td>
                  }
                  <td class="td-moy-gen" [class]="getNoteColor(moy.moyenne)">
                    <strong>{{ moy.moyenne !== null ? (moy.moyenne | number:'1.2-2') : '—' }}</strong>
                  </td>
                  <td class="td-mention">
                    @if (moy.mention) {
                      <mat-chip [class]="'chip-mention chip-mention-' + moy.mention.toLowerCase().replace(' ', '_')">
                        {{ moy.mention }}
                      </mat-chip>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (!state.loadingMoyennes() && state.moyennesClasse().length === 0 && classeId && periodeId) {
        <div class="empty-state">
          <mat-icon>bar_chart</mat-icon>
          <p>Aucune moyenne disponible pour cette sélection</p>
          <button mat-raised-button color="primary" (click)="calculerMoyennes()">
            <mat-icon>calculate</mat-icon> Calculer les moyennes
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; color: #555; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .header-actions { display: flex; gap: 8px; }
    .inline-spin { display: inline-block; margin-right: 6px; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; }
    .filters-bar mat-form-field { min-width: 240px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .classe-stats { display: flex; gap: 16px; margin-bottom: 20px; }
    .stat-card { padding: 16px 24px; text-align: center; }
    .stat-v { font-size: 26px; font-weight: 700; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-success .stat-v { color: #2e7d32; }

    .tableau-moyennes { border-radius: 8px; overflow: auto; }
    .moyennes-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
    .moyennes-table thead tr { background: #1565c0; }
    .moyennes-table th { padding: 10px 12px; text-align: center; color: white; font-size: 12px; font-weight: 600; }
    .th-rang { width: 50px; }
    .th-apprenant { text-align: left; min-width: 180px; }
    .th-matiere { min-width: 60px; max-width: 80px; }
    .th-moy-gen { min-width: 100px; background: #0d47a1; }
    .th-mention { min-width: 100px; }
    .moyennes-table td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 13px; }
    .td-apprenant { text-align: left; }
    .td-rang { text-align: center; }
    .top-trois { background: #fffde7 !important; }

    .rang-badge { width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; background: #e0e0e0; }
    .rang-1 { background: #ffd700; color: #6d4c00; }
    .rang-2 { background: #c0c0c0; color: #3e3e3e; }
    .rang-3 { background: #cd7f32; color: #fff; }

    .apprenant-cell { display: flex; align-items: center; gap: 8px; }
    .avatar-xs { width: 26px; height: 26px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 10px; flex-shrink: 0; }

    .note-success { color: #2e7d32; font-weight: 600; }
    .note-warning { color: #e65100; }
    .note-danger  { color: #c62828; font-weight: 600; }

    .td-moy-gen { background: #e8f0fe !important; font-size: 14px !important; }
    .td-moy-gen.note-success { background: #e8f5e9 !important; }
    .td-moy-gen.note-danger  { background: #fdecea !important; }

    .chip-mention { font-size: 11px !important; min-height: 22px !important; }
    .chip-mention-tres_bien { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-mention-bien      { background: #e3f2fd !important; color: #0d47a1 !important; }
    .chip-mention-assez_bien { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-mention-passable  { background: #fff3e0 !important; color: #bf360c !important; }
    .chip-mention-insuffisant { background: #fdecea !important; color: #b71c1c !important; }

    .empty-state { text-align: center; padding: 60px; color: #9e9e9e; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
  `]
})
export class MoyennesClasseComponent implements OnInit {
  state    = inject(NoteStateService);
  private snackBar = inject(MatSnackBar);

  classeId = '';
  periodeId = '';

  ngOnInit(): void {}

  onClasseChange(): void {
    if (this.classeId && this.periodeId) {
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    }
  }

  onPeriodeChange(): void {
    if (this.classeId && this.periodeId) {
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    }
  }

  calculerMoyennes(): void {
    if (!this.periodeId) return;
    this.state.calculerMoyennes(this.periodeId, this.classeId || undefined, () => {
      this.snackBar.open('Moyennes calculées', 'Fermer', { duration: 3000 });
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    });
  }

  moyenneClasse(): number {
    const moyennes = this.state.moyennesClasse()
      .map(m => m.moyenne)
      .filter((m): m is number => m !== null);
    if (!moyennes.length) return 0;
    return moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
  }

  tauxReussite(): number {
    const total = this.state.moyennesClasse().length;
    if (!total) return 0;
    const reussis = this.state.moyennesClasse()
      .filter(m => (m.moyenne ?? 0) >= 10).length;
    return Math.round((reussis / total) * 100);
  }

  colonnesMatieres(): string[] {
    const first = this.state.moyennesClasse()[0];
    if (!first?.moyennesMatiere) return [];
    return first.moyennesMatiere.map(mm => mm.matiereLibelle);
  }

  getMoyMatiere(moy: MoyenneGenerale, matiereLibelle: string): number | null {
    return moy.moyennesMatiere?.find(mm => mm.matiereLibelle === matiereLibelle)?.moyenne ?? null;
  }

  abrev(libelle: string): string {
    return libelle.length > 8 ? libelle.substring(0, 6) + '…' : libelle;
  }

  getNoteColor(note: number | null | undefined): string {
    if (note === null || note === undefined) return '';
    if (note >= 14) return 'note-success';
    if (note >= 10) return '';
    if (note >= 7)  return 'note-warning';
    return 'note-danger';
  }
}
