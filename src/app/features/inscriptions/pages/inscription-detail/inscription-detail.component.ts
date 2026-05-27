import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { RejeterDialogComponent } from '../../components/rejeter-dialog/rejeter-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatutInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatDividerModule,
    MatListModule, MatStepperModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <button mat-button routerLink="/inscriptions" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour aux inscriptions
      </button>

      @if (state.loadingDetail()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (state.selected(); as inscription) {
        <!-- En-tête -->
        <div class="detail-header">
          <div class="header-info">
            <div class="header-chips">
              <mat-chip [class]="'chip-type chip-' + inscription.type">
                {{ inscription.type === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription' }}
              </mat-chip>
              <mat-chip [class]="'chip-statut chip-' + inscription.statut">
                {{ statutLabel(inscription.statut) }}
              </mat-chip>
              @if (inscription.fraisInscription) {
                <mat-chip [class]="inscription.fraisPayes ? 'chip-payes' : 'chip-impaye'">
                  <mat-icon>{{ inscription.fraisPayes ? 'check_circle' : 'warning' }}</mat-icon>
                  Frais {{ inscription.fraisPayes ? 'payés' : 'non payés' }}
                </mat-chip>
              }
            </div>
            <h1>
              {{ inscription.apprenant?.prenom }} {{ inscription.apprenant?.nom }}
            </h1>
            <div class="header-meta">
              <span>
                <mat-icon>badge</mat-icon> {{ inscription.numeroInscription }}
              </span>
              <span>
                <mat-icon>event</mat-icon>
                Inscrit le {{ inscription.dateInscription | date:'dd/MM/yyyy' }}
              </span>
              @if (inscription.classeLibelle || inscription.promotionLibelle) {
                <span>
                  <mat-icon>class</mat-icon>
                  {{ inscription.classeLibelle ?? inscription.promotionLibelle }}
                </span>
              }
              @if (inscription.anneeAcademique) {
                <span>
                  <mat-icon>school</mat-icon>
                  {{ inscription.anneeAcademique.libelle }}
                </span>
              }
            </div>
          </div>
          <div class="header-actions">
            @if (inscription.statut === 'complete' || inscription.statut === 'en_validation') {
              <button mat-raised-button color="primary" (click)="valider(inscription.id)">
                <mat-icon>check_circle</mat-icon> Valider
              </button>
              <button mat-stroked-button color="warn" (click)="openRejeter()">
                <mat-icon>cancel</mat-icon> Rejeter
              </button>
            }
            @if (inscription.statut === 'validee' && !inscription.classeLibelle && !inscription.promotionLibelle) {
              <button mat-stroked-button color="primary" (click)="openAffectation()">
                <mat-icon>class</mat-icon> Affecter une classe
              </button>
            }
            @if (inscription.statut === 'brouillon' || inscription.statut === 'incomplete') {
              <button mat-stroked-button (click)="soumettre(inscription.id)">
                <mat-icon>send</mat-icon> Soumettre
              </button>
            }
          </div>
        </div>

        <!-- Workflow de progression -->
        <mat-card class="workflow-card">
          <mat-card-content>
            <mat-stepper [selectedIndex]="getStepIndex(inscription.statut)">
              <mat-step label="Brouillon" state="number"></mat-step>
              <mat-step label="Dossier complété" state="number"></mat-step>
              <mat-step label="En validation" state="number"></mat-step>
              <mat-step label="Validée" state="number"></mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>

        <!-- Contenu principal : 2 colonnes -->
        <div class="detail-grid">

          <!-- Infos inscription -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>assignment</mat-icon> Détails de l'inscription
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list dense>
                <mat-list-item>
                  <span class="info-label">Numéro</span>
                  <strong>{{ inscription.numeroInscription }}</strong>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <span class="info-label">Type</span>
                  <span>{{ inscription.type === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription' }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <span class="info-label">Date d'inscription</span>
                  <span>{{ inscription.dateInscription | date:'dd/MM/yyyy HH:mm' }}</span>
                </mat-list-item>
                @if (inscription.dateLimiteValidation) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span class="info-label">Date limite</span>
                    <span [class.overdue]="isOverdue(inscription.dateLimiteValidation)">
                      {{ inscription.dateLimiteValidation | date:'dd/MM/yyyy' }}
                    </span>
                  </mat-list-item>
                }
                @if (inscription.dateValidation) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span class="info-label">Validée le</span>
                    <span>{{ inscription.dateValidation | date:'dd/MM/yyyy' }}</span>
                  </mat-list-item>
                }
                @if (inscription.validePar) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span class="info-label">Validée par</span>
                    <span>{{ inscription.validePar }}</span>
                  </mat-list-item>
                }
                @if (inscription.motifRejet) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span class="info-label">Motif rejet</span>
                    <span class="motif-rejet">{{ inscription.motifRejet }}</span>
                  </mat-list-item>
                }
                @if (inscription.commentaire) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span class="info-label">Commentaire</span>
                    <span>{{ inscription.commentaire }}</span>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Apprenant + Documents manquants -->
          <div class="right-column">
            <mat-card class="apprenant-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon> Apprenant
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="apprenant-identity">
                  <div class="avatar-medium">
                    {{ inscription.apprenant?.prenom?.[0] }}{{ inscription.apprenant?.nom?.[0] }}
                  </div>
                  <div>
                    <div class="apprenant-nom">
                      {{ inscription.apprenant?.prenom }} {{ inscription.apprenant?.nom }}
                    </div>
                    <div class="apprenant-sub">{{ inscription.apprenant?.numeroInscription }}</div>
                    <button mat-stroked-button class="btn-voir-dossier"
                            [routerLink]="['/apprenants', inscription.apprenantId]">
                      <mat-icon>open_in_new</mat-icon> Voir le dossier
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            @if (inscription.documentsManquants?.length) {
              <mat-card class="docs-manquants-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon color="warn">warning</mat-icon>
                    Documents manquants
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-list dense>
                    @for (doc of inscription.documentsManquants; track doc) {
                      <mat-list-item>
                        <mat-icon matListItemIcon color="warn">radio_button_unchecked</mat-icon>
                        <span>{{ doc }}</span>
                      </mat-list-item>
                    }
                  </mat-list>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>

        <!-- UE inscrites (universitaire) -->
        @if (inscription.ueInscrites?.length) {
          <mat-card class="ue-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>library_books</mat-icon>
                Unités d'enseignement inscrites
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="ue-grid">
                @for (ue of inscription.ueInscrites; track ue.ueId) {
                  <div class="ue-item">
                    <div class="ue-code">{{ ue.ueCode }}</div>
                    <div class="ue-libelle">{{ ue.ueLibelle }}</div>
                    <div class="ue-credits">{{ ue.credits }} ECTS</div>
                    <mat-chip [class]="ue.obligatoire ? 'chip-obligatoire' : 'chip-optionnel'">
                      {{ ue.obligatoire ? 'Obligatoire' : 'Optionnelle' }}
                    </mat-chip>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Historique des statuts -->
        <mat-card class="historique-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon> Historique
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (state.historique().length === 0) {
              <p class="no-historique">Aucun historique disponible</p>
            } @else {
              <div class="historique-list">
                @for (h of state.historique(); track h.date) {
                  <div class="historique-item">
                    <mat-chip [class]="'chip-statut chip-' + h.statut" class="chip-sm">
                      {{ statutLabel(h.statut) }}
                    </mat-chip>
                    <div class="historique-detail">
                      <span class="historique-date">{{ h.date | date:'dd/MM/yyyy HH:mm' }}</span>
                      <span class="historique-par">par {{ h.par }}</span>
                      @if (h.commentaire) {
                        <span class="historique-comment">{{ h.commentaire }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; color: #555; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px; padding: 24px; background: white;
      border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .header-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .detail-header h1 { margin: 6px 0 8px; font-size: 24px; font-weight: 600; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .header-meta span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .header-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .header-actions { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }

    .workflow-card { margin-bottom: 20px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 16px; }
    .right-column { display: flex; flex-direction: column; gap: 16px; }

    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .info-label { color: #757575; font-size: 13px; min-width: 140px; }
    .motif-rejet { color: #c62828; font-style: italic; }
    .overdue { color: #c62828; font-weight: 600; }

    .apprenant-identity { display: flex; gap: 12px; align-items: flex-start; }
    .avatar-medium { width: 48px; height: 48px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 600; font-size: 15px; margin-bottom: 2px; }
    .apprenant-sub { font-size: 12px; color: #757575; margin-bottom: 8px; }
    .btn-voir-dossier { font-size: 12px; }

    .docs-manquants-card { border: 1px solid #ffcdd2; background: #fff8f8; }

    .ue-card { margin-bottom: 16px; }
    .ue-grid { display: flex; flex-direction: column; gap: 8px; }
    .ue-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .ue-code { font-size: 11px; font-weight: 700; background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; }
    .ue-libelle { flex: 1; font-size: 13px; }
    .ue-credits { font-size: 12px; color: #555; min-width: 55px; }
    .chip-obligatoire { background: #fce4ec !important; color: #880e4f !important; font-size: 11px !important; }
    .chip-optionnel   { background: #e8f5e9 !important; color: #2e7d32 !important; font-size: 11px !important; }

    .historique-card { margin-bottom: 16px; }
    .no-historique { color: #9e9e9e; font-style: italic; }
    .historique-list { display: flex; flex-direction: column; gap: 12px; }
    .historique-item { display: flex; align-items: flex-start; gap: 12px; }
    .chip-sm { min-height: 24px !important; font-size: 11px !important; }
    .historique-detail { display: flex; flex-direction: column; gap: 2px; }
    .historique-date { font-size: 13px; font-weight: 500; }
    .historique-par { font-size: 12px; color: #757575; }
    .historique-comment { font-size: 12px; color: #555; font-style: italic; }

    .chip-type { font-size: 12px !important; }
    .chip-nouvelle      { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-reinscription { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-brouillon     { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-incomplete    { background: #fff8e1 !important; color: #f57f17 !important; }
    .chip-complete      { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-en_validation { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-validee       { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-rejetee       { background: #fdecea !important; color: #c62828 !important; }
    .chip-annulee       { background: #f5f5f5 !important; color: #9e9e9e !important; }
    .chip-en_attente    { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-payes   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-impaye  { background: #fdecea !important; color: #c62828 !important; }
    .chip-payes mat-icon, .chip-impaye mat-icon { font-size: 14px; width: 14px; height: 14px; }
  `]
})
export class InscriptionDetailComponent implements OnInit {
  state = inject(InscriptionStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.select(id);
    this.state.loadHistorique(id);
  }

  statutLabel(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      brouillon: 'Brouillon', incomplete: 'Incomplète', complete: 'Complète',
      en_validation: 'En validation', validee: 'Validée', rejetee: 'Rejetée',
      annulee: 'Annulée', en_attente: 'Liste d\'attente',
    };
    return map[statut] ?? statut;
  }

  getStepIndex(statut: StatutInscription): number {
    const steps: Record<StatutInscription, number> = {
      brouillon: 0, incomplete: 0, complete: 1,
      en_validation: 2, validee: 3, rejetee: 2,
      annulee: 0, en_attente: 1,
    };
    return steps[statut] ?? 0;
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }

  valider(id: string): void {
    this.state.valider(id, {}, () =>
      this.snackBar.open('Inscription validée', 'Fermer', { duration: 3000 })
    );
  }

  openRejeter(): void {
    const inscription = this.state.selected();
    if (!inscription) return;
    const ref = this.dialog.open(RejeterDialogComponent, {
      width: '440px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.rejeter(inscription.id, result, () =>
          this.snackBar.open('Inscription rejetée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAffectation(): void {
    const inscription = this.state.selected();
    if (!inscription) return;
    const ref = this.dialog.open(AffectationDialogComponent, {
      width: '520px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.affecterClasse(
          { inscriptionId: inscription.id, ...result },
          () => this.snackBar.open('Affectation enregistrée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  soumettre(id: string): void {
    this.state.soumettre(id, () =>
      this.snackBar.open('Dossier soumis pour validation', 'Fermer', { duration: 3000 })
    );
  }
}
