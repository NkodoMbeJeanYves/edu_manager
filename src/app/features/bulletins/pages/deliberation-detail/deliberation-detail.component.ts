import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { SignerDocumentDialogComponent } from '../../components/signer-document-dialog/signer-document-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  LigneDeliberation, MentionGenerale,
} from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-deliberation-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, MatDividerModule, MatMenuModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/bulletins/deliberations" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour aux délibérations
      </button>

      @if (state.loadingDeliberation()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (state.selectedDeliberation(); as delib) {

        <div class="detail-header">
          <div class="header-info">
            <div class="header-chips">
              <mat-chip [class]="'chip-type chip-delib-' + delib.type">
                {{ delib.type === 'conseil_classe' ? 'Conseil de classe' : 'Jury universitaire' }}
              </mat-chip>
              <mat-chip [class]="'chip-statut chip-delib-statut-' + delib.statut">
                {{ statutDelibLabel(delib.statut) }}
              </mat-chip>
              @if (delib.session) {
                <mat-chip class="chip-session">Session {{ delib.session }}</mat-chip>
              }
            </div>
            <h1>{{ delib.classeOuPromotionLibelle }}</h1>
            <div class="header-meta">
              <span><mat-icon>event</mat-icon>
                {{ delib.dateDeliberation ? (delib.dateDeliberation | date:'dd/MM/yyyy') : 'Date à définir' }}
              </span>
              @if (delib.president) {
                <span><mat-icon>person</mat-icon> Président : {{ delib.president }}</span>
              }
              @if (delib.compensationActivee) {
                <mat-chip class="chip-compensation">
                  <mat-icon>balance</mat-icon> Compensation activée
                </mat-chip>
              }
            </div>
          </div>

          <div class="header-actions">
            @if (delib.statut === 'preparation') {
              <button mat-raised-button color="primary"
                      (click)="preparer(delib.id)">
                <mat-icon>calculate</mat-icon> Préparer & Calculer
              </button>
            }
            @if (delib.statut === 'en_cours' && delib.compensationActivee) {
              <button mat-stroked-button color="accent"
                      (click)="appliquerCompensation(delib.id)">
                <mat-icon>balance</mat-icon> Appliquer compensation
              </button>
            }
            @if (delib.statut === 'en_cours') {
              <button mat-raised-button color="primary"
                      (click)="cloturer(delib.id)">
                <mat-icon>lock</mat-icon> Clôturer
              </button>
            }
            @if (delib.statut === 'terminee') {
              <button mat-raised-button color="primary"
                      (click)="openSigner(delib.id)">
                <mat-icon>draw</mat-icon> Signer le PV
              </button>
            }
            @if (delib.statut === 'signee') {
              <button mat-raised-button color="accent"
                      (click)="publier(delib.id)">
                <mat-icon>publish</mat-icon> Publier les résultats
              </button>
            }
            <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionsMenu="matMenu">
              <button mat-menu-item (click)="state.telechargerPV(delib.id)">
                <mat-icon>picture_as_pdf</mat-icon> Télécharger le PV
              </button>
            </mat-menu>
          </div>
        </div>

        @if (state.statsDeliberation(); as stats) {
          <div class="stats-delib">
            <mat-card class="stat-card">
              <div class="stat-v">{{ stats.total }}</div>
              <div class="stat-l">Apprenants</div>
            </mat-card>
            <mat-card class="stat-card stat-success">
              <div class="stat-v">{{ stats.admis }}</div>
              <div class="stat-l">Admis / Passage</div>
            </mat-card>
            <mat-card class="stat-card stat-warning">
              <div class="stat-v">{{ stats.admisRattrapage }}</div>
              <div class="stat-l">Rattrapage</div>
            </mat-card>
            <mat-card class="stat-card stat-danger">
              <div class="stat-v">{{ stats.ajournes + stats.redoublants }}</div>
              <div class="stat-l">Ajournés / Redoublants</div>
            </mat-card>
            <mat-card class="stat-card stat-info">
              <div class="stat-v">{{ stats.tauxReussite }}%</div>
              <div class="stat-l">Taux de réussite</div>
            </mat-card>
            @if (stats.moyennePromotion !== null) {
              <mat-card class="stat-card">
                <div class="stat-v">{{ stats.moyennePromotion | number:'1.2-2' }}</div>
                <div class="stat-l">Moyenne promotion</div>
              </mat-card>
            }
          </div>
        }

        <div class="decisions-summary">
          <div class="dec-card dec-admis">
            <mat-icon>check_circle</mat-icon>
            <span class="dec-count">{{ state.lignesAdmis().length }}</span>
            <span class="dec-label">Admis</span>
          </div>
          <div class="dec-card dec-ajourne">
            <mat-icon>schedule</mat-icon>
            <span class="dec-count">{{ state.lignesAjournes().length }}</span>
            <span class="dec-label">Rattrapages</span>
          </div>
          <div class="dec-card dec-redoublant">
            <mat-icon>replay</mat-icon>
            <span class="dec-count">{{ state.lignesRedoublants().length }}</span>
            <span class="dec-label">Redoublants</span>
          </div>
          @if (state.tauxReussiteDeliberation() !== null) {
            <div class="dec-card dec-taux">
              <mat-icon>analytics</mat-icon>
              <span class="dec-count">{{ state.tauxReussiteDeliberation() }}%</span>
              <span class="dec-label">Réussite</span>
            </div>
          }
        </div>

        <mat-card class="grille-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>table_view</mat-icon>
              Tableau de délibération
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grille-wrapper">
              <table class="grille-delib">
                <thead>
                  <tr>
                    <th class="th-rang">#</th>
                    <th class="th-apprenant">Apprenant</th>
                    <th class="th-moy">Moyenne</th>
                    @if (delib.type === 'jury_universitaire') {
                      <th class="th-ects">ECTS</th>
                      <th class="th-valid">Semestre</th>
                    }
                    <th class="th-decision">Décision</th>
                    <th class="th-mention">Mention</th>
                    <th class="th-commentaire">Commentaire</th>
                    <th class="th-cas">Cas spécial</th>
                    <th class="th-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (ligne of delib.lignes; track ligne.apprenantId; let i = $index) {
                    <tr [class]="getLigneClass(ligne)">
                      <td class="td-rang">{{ i + 1 }}</td>
                      <td class="td-apprenant">
                        <div class="apprenant-cell">
                          <div class="avatar-xs">
                            {{ ligne.apprenantPrenom[0] }}{{ ligne.apprenantNom[0] }}
                          </div>
                          <div>
                            <div class="apprenant-nom">
                              {{ ligne.apprenantPrenom }} {{ ligne.apprenantNom }}
                            </div>
                            <div class="apprenant-num">{{ ligne.numeroInscription }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="td-moy" [class]="getMoyColor(ligne.moyenneGenerale)">
                        <strong>
                          {{ ligne.moyenneGenerale !== null ? (ligne.moyenneGenerale | number:'1.2-2') : '—' }}
                        </strong>
                      </td>
                      @if (delib.type === 'jury_universitaire') {
                        <td class="td-ects">
                          {{ ligne.ectsAcquis ?? '—' }}
                        </td>
                        <td class="td-valid">
                          @if (ligne.semestreValide !== undefined) {
                            <mat-chip [class]="ligne.semestreValide ? 'chip-valide-small' : 'chip-non-valide-small'">
                              {{ ligne.semestreValide ? '✓' : '✗' }}
                            </mat-chip>
                          }
                        </td>
                      }
                      <td class="td-decision">
                        @if (delib.statut === 'en_cours') {
                          <mat-form-field appearance="outline" class="select-decision">
                            <mat-select
                              [value]="ligne.decision"
                              (selectionChange)="onDecisionChange(delib.id, ligne, $event.value)">
                              @for (opt of getDecisionOptions(delib.type); track opt.value) {
                                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                        } @else {
                          @if (ligne.decision) {
                            <mat-chip [class]="'chip-dec chip-dec-' + ligne.decision">
                              {{ decisionLabel(ligne.decision) }}
                            </mat-chip>
                          } @else {
                            <span class="cell-nd">—</span>
                          }
                        }
                      </td>
                      <td class="td-mention">
                        @if (delib.statut === 'en_cours') {
                          <mat-form-field appearance="outline" class="select-mention">
                            <mat-select
                              [value]="ligne.mention"
                              (selectionChange)="onMentionChange(delib.id, ligne, $event.value)">
                              <mat-option value="">—</mat-option>
                              <mat-option value="tres_bien">Très bien</mat-option>
                              <mat-option value="bien">Bien</mat-option>
                              <mat-option value="assez_bien">Assez bien</mat-option>
                              <mat-option value="passable">Passable</mat-option>
                              <mat-option value="insuffisant">Insuffisant</mat-option>
                            </mat-select>
                          </mat-form-field>
                        } @else if (ligne.mention) {
                          <mat-chip [class]="'chip-mention chip-' + ligne.mention">
                            {{ mentionLabel(ligne.mention) }}
                          </mat-chip>
                        }
                      </td>
                      <td class="td-commentaire">
                        @if (delib.statut === 'en_cours') {
                          <input type="text" class="comment-input"
                                 [value]="ligne.commentaire ?? ''"
                                 (blur)="onCommentaireChange(delib.id, ligne, $event)"
                                 placeholder="Commentaire...">
                        } @else {
                          <span class="cell-comment">{{ ligne.commentaire }}</span>
                        }
                      </td>
                      <td class="td-cas">
                        @if (ligne.casSpecial) {
                          <mat-chip class="chip-cas">{{ casLabel(ligne.casSpecial) }}</mat-chip>
                        }
                        @if (ligne.modifieeManuel) {
                          <mat-icon matTooltip="Décision modifiée manuellement" class="icon-modif">
                            edit_note
                          </mat-icon>
                        }
                      </td>
                      <td class="td-actions">
                        @if (ligne.uesNonValidees?.length) {
                          <button mat-icon-button
                                  [matTooltip]="'UE non validées : ' + ligne.uesNonValidees!.join(', ')">
                            <mat-icon color="warn">info</mat-icon>
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1500px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; color: #555; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding: 20px 24px; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .detail-header h1 { margin: 4px 0 8px; font-size: 22px; font-weight: 600; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .header-meta span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .header-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .header-actions { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }
    .stats-delib { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { padding: 14px 20px; text-align: center; }
    .stat-v { font-size: 24px; font-weight: 700; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-success .stat-v { color: #2e7d32; }
    .stat-warning .stat-v { color: #e65100; }
    .stat-danger  .stat-v { color: #c62828; }
    .stat-info    .stat-v { color: #1565c0; }
    .decisions-summary { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .dec-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 20px; border-radius: 8px; min-width: 80px; }
    .dec-card mat-icon { font-size: 22px; }
    .dec-count { font-size: 22px; font-weight: 700; }
    .dec-label { font-size: 11px; color: #757575; }
    .dec-admis    { background: #e8f5e9; color: #2e7d32; }
    .dec-ajourne  { background: #fff3e0; color: #e65100; }
    .dec-redoublant { background: #fde8d8; color: #bf360c; }
    .dec-taux     { background: #e3f2fd; color: #1565c0; }
    .grille-card { margin-top: 0; }
    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .grille-wrapper { overflow-x: auto; }
    .grille-delib { width: 100%; border-collapse: collapse; white-space: nowrap; }
    .grille-delib thead tr { background: #1565c0; }
    .grille-delib th { padding: 10px 10px; text-align: left; color: white; font-size: 12px; font-weight: 600; }
    .th-rang { width: 40px; }
    .th-moy  { width: 80px; }
    .th-ects, .th-valid { width: 60px; }
    .th-decision { min-width: 160px; }
    .th-mention  { min-width: 140px; }
    .th-commentaire { min-width: 160px; }
    .th-cas { width: 100px; }
    .th-actions { width: 48px; }
    .grille-delib td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 13px; }
    .ligne-admis    { background: #f9fff9; }
    .ligne-ajourne  { background: #fff8f0; }
    .ligne-redoublant { background: #fff5f0; }
    .ligne-exclu    { background: #fff0f0; }
    .apprenant-cell { display: flex; align-items: center; gap: 8px; }
    .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 10px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 13px; }
    .apprenant-num { font-size: 11px; color: #9e9e9e; }
    .moy-success { color: #2e7d32; }
    .moy-warning { color: #e65100; }
    .moy-danger  { color: #c62828; font-weight: 700; }
    .cell-nd { color: #9e9e9e; font-size: 12px; }
    .cell-comment { font-size: 12px; color: #555; font-style: italic; }
    .select-decision { width: 150px; font-size: 12px; }
    .select-mention  { width: 120px; font-size: 12px; }
    .comment-input { width: 150px; padding: 4px 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 12px; }
    .chip-valide-small    { background: #e8f5e9 !important; color: #2e7d32 !important; font-size: 11px !important; min-height: 20px !important; }
    .chip-non-valide-small { background: #fdecea !important; color: #c62828 !important; font-size: 11px !important; min-height: 20px !important; }
    .chip-dec { font-size: 11px !important; min-height: 22px !important; }
    .chip-dec-admis       { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-dec-passage     { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-dec-admis_rattrapage { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-dec-ajourne     { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-dec-redoublant  { background: #fde8d8 !important; color: #bf360c !important; }
    .chip-dec-redoublement { background: #fde8d8 !important; color: #bf360c !important; }
    .chip-dec-exclu       { background: #fdecea !important; color: #b71c1c !important; }
    .chip-dec-exclusion   { background: #fdecea !important; color: #b71c1c !important; }
    .chip-cas { background: #f3e5f5 !important; color: #6a1b9a !important; font-size: 11px !important; }
    .icon-modif { font-size: 16px; color: #e65100; vertical-align: middle; }
    .chip-mention { font-size: 11px !important; min-height: 22px !important; }
    .chip-tres_bien   { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-bien        { background: #e3f2fd !important; color: #0d47a1 !important; }
    .chip-assez_bien  { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-passable    { background: #fff3e0 !important; color: #bf360c !important; }
    .chip-insuffisant { background: #fdecea !important; color: #b71c1c !important; }
    .chip-delib-conseil_classe  { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-delib-jury_universitaire { background: #e8eaf6 !important; color: #283593 !important; }
    .chip-delib-statut-preparation { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-delib-statut-en_cours    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-delib-statut-terminee    { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-delib-statut-signee      { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-delib-statut-publiee     { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-session      { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-compensation { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-compensation mat-icon { font-size: 14px; }
  `]
})
export class DeliberationDetailComponent implements OnInit {
  state = inject(BulletinStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectDeliberation(id);
  }

  getDecisionOptions(type: string) {
    if (type === 'jury_universitaire') {
      return [
        { value: 'admis',             label: 'Admis' },
        { value: 'admis_rattrapage',  label: 'Admis — Rattrapage' },
        { value: 'ajourne',           label: 'Ajourné' },
        { value: 'redoublant',        label: 'Redoublant' },
        { value: 'exclu',             label: 'Exclu' },
        { value: 'dispense',          label: 'Dispensé' },
        { value: 'en_attente',        label: 'En attente' },
      ];
    }
    return [
      { value: 'passage',             label: 'Passage' },
      { value: 'passage_conditionnel', label: 'Passage conditionnel' },
      { value: 'redoublement',        label: 'Redoublement' },
      { value: 'felicitations',       label: 'Félicitations' },
      { value: 'encouragements',      label: 'Encouragements' },
      { value: 'mise_en_garde',       label: 'Mise en garde' },
      { value: 'tableau_honneur',     label: "Tableau d'honneur" },
      { value: 'exclusion',           label: 'Exclusion' },
    ];
  }

  getLigneClass(ligne: LigneDeliberation): string {
    const map: Record<string, string> = {
      admis: 'ligne-admis', passage: 'ligne-admis',
      admis_rattrapage: 'ligne-ajourne', ajourne: 'ligne-ajourne',
      redoublant: 'ligne-redoublant', redoublement: 'ligne-redoublant',
      exclu: 'ligne-exclu', exclusion: 'ligne-exclu',
    };
    return map[ligne.decision ?? ''] ?? '';
  }

  getMoyColor(moy: number | null): string {
    if (moy === null) return '';
    if (moy >= 14) return 'moy-success';
    if (moy >= 10) return '';
    if (moy >= 7)  return 'moy-warning';
    return 'moy-danger';
  }

  decisionLabel(d: string): string {
    const map: Record<string, string> = {
      admis: 'Admis', passage: 'Passage',
      admis_rattrapage: 'Rattrapage', ajourne: 'Ajourné',
      redoublant: 'Redoublant', redoublement: 'Redoublement',
      exclu: 'Exclu', exclusion: 'Exclusion',
      dispense: 'Dispensé', en_attente: 'En attente',
      felicitations: 'Félicitations', encouragements: 'Encouragements',
      mise_en_garde: 'Mise en garde', tableau_honneur: "Tableau d'honneur",
      passage_conditionnel: 'Passage conditionnel',
    };
    return map[d] ?? d;
  }

  mentionLabel(m: string): string {
    const map: Record<string, string> = {
      tres_bien: 'Très bien', bien: 'Bien', assez_bien: 'Assez bien',
      passable: 'Passable', insuffisant: 'Insuffisant',
    };
    return map[m] ?? m;
  }

  casLabel(cas: string): string {
    const map: Record<string, string> = {
      fraude: 'Fraude', dispense: 'Dispensé',
      vae: 'VAE', eliminatoire: 'Éliminatoire',
    };
    return map[cas] ?? cas;
  }

  statutDelibLabel(s: string): string {
    const map: Record<string, string> = {
      preparation: 'En préparation', en_cours: 'En cours',
      terminee: 'Terminée', signee: 'Signée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }

  onDecisionChange(deliberationId: string, ligne: LigneDeliberation, decision: string): void {
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: decision as any,
      mention: ligne.mention,
      commentaire: ligne.commentaire,
    });
  }

  onMentionChange(deliberationId: string, ligne: LigneDeliberation, mention: string): void {
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: ligne.decision as any,
      mention: (mention || undefined) as MentionGenerale | undefined,
    });
  }

  onCommentaireChange(deliberationId: string, ligne: LigneDeliberation, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: ligne.decision as any,
      commentaire: val || undefined,
    });
  }

  preparer(id: string): void {
    this.state.preparerDeliberation(id, () =>
      this.snackBar.open('Délibération préparée — décisions calculées', 'Fermer', { duration: 3000 })
    );
  }

  appliquerCompensation(id: string): void {
    this.state.appliquerCompensation(id, () =>
      this.snackBar.open('Compensation inter-UE appliquée', 'Fermer', { duration: 3000 })
    );
  }

  cloturer(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Clôturer la délibération',
        message: 'Clôturer la délibération ? Les décisions ne pourront plus être modifiées.',
        confirmLabel: 'Clôturer', confirmColor: 'primary', icon: 'lock',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.cloturerDeliberation(id, () =>
          this.snackBar.open('Délibération clôturée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openSigner(id: string): void {
    const ref = this.dialog.open(SignerDocumentDialogComponent, {
      width: '440px',
      data: { titre: 'Signer le PV de délibération' },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.signerDeliberation(id, result, () =>
          this.snackBar.open('PV signé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  publier(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Publier les résultats',
        message: 'Publier les résultats sur les portails apprenants ? Action visible immédiatement.',
        confirmLabel: 'Publier', confirmColor: 'accent', icon: 'publish',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.publierDeliberation(id, () =>
          this.snackBar.open('Résultats publiés', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
