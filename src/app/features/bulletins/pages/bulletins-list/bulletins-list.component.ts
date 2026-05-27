import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { GenererBulletinsDialogComponent } from '../../components/generer-bulletins-dialog/generer-bulletins-dialog.component';
import { SignerDocumentDialogComponent } from '../../components/signer-document-dialog/signer-document-dialog.component';
import { AppreciationDialogComponent } from '../../components/appreciation-dialog/appreciation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Bulletin, StatutDocument } from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-bulletins-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    MatPaginatorModule, MatCardModule, MatTabsModule,
  ],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Bulletins & Relevés</h1>
          <span class="total-badge">{{ state.total() }} document(s)</span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="primary" [routerLink]="['deliberations']">
            <mat-icon>gavel</mat-icon> Délibérations
          </button>
          <button mat-raised-button color="primary" (click)="openGenererDialog()">
            <mat-icon>description</mat-icon> Générer des bulletins
          </button>
        </div>
      </div>

      @if (state.statsBulletins(); as stats) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total</div>
          </mat-card>
          <mat-card class="stat-card stat-info">
            <div class="stat-value">{{ stats.generes }}</div>
            <div class="stat-label">Générés</div>
          </mat-card>
          <mat-card class="stat-card stat-success">
            <div class="stat-value">{{ stats.publies }}</div>
            <div class="stat-label">Publiés</div>
          </mat-card>
          <mat-card class="stat-card stat-warning">
            <div class="stat-value">{{ stats.enAttente }}</div>
            <div class="stat-label">En attente</div>
          </mat-card>
          <mat-card class="stat-card stat-accent">
            <div class="stat-value">{{ stats.tauxGeneration }}%</div>
            <div class="stat-label">Taux génération</div>
          </mat-card>
        </div>
      }

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" class="status-tabs">
        <mat-tab label="Tous"></mat-tab>
        <mat-tab label="Générés"></mat-tab>
        <mat-tab label="Validés"></mat-tab>
        <mat-tab label="Signés"></mat-tab>
        <mat-tab label="Publiés"></mat-tab>
      </mat-tab-group>

      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchApprenant"
                 placeholder="Nom apprenant...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="filterType" (ngModelChange)="onFilter()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="bulletin">Bulletins scolaires</mat-option>
            <mat-option value="releve">Relevés universitaires</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (state.loading() || state.loadingGeneration()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          @if (state.loadingGeneration()) {
            <p class="loading-label">Génération en cours...</p>
          }
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

      @if (!state.loading() && !state.loadingGeneration()) {
        <div class="table-container mat-elevation-z2">
          <table mat-table [dataSource]="state.bulletins()">

            <ng-container matColumnDef="apprenant">
              <th mat-header-cell *matHeaderCellDef>Apprenant</th>
              <td mat-cell *matCellDef="let b">
                <div class="apprenant-cell">
                  <div class="avatar-sm">
                    {{ b.apprenant?.prenom?.[0] }}{{ b.apprenant?.nom?.[0] }}
                  </div>
                  <div>
                    <div class="apprenant-nom">
                      {{ b.apprenant?.prenom }} {{ b.apprenant?.nom }}
                    </div>
                    <div class="apprenant-num">
                      {{ b.apprenant?.numeroInscription }}
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let b">
                <mat-chip [class]="'chip-type chip-doc-' + b.type">
                  <mat-icon>{{ b.type === 'bulletin' ? 'receipt_long' : 'school' }}</mat-icon>
                  {{ b.type === 'bulletin' ? 'Bulletin' : 'Relevé' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="periode">
              <th mat-header-cell *matHeaderCellDef>Période</th>
              <td mat-cell *matCellDef="let b">
                <div class="periode-cell">
                  {{ b.periode?.libelle ?? b.anneeAcademique?.libelle }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="resultat">
              <th mat-header-cell *matHeaderCellDef>Résultat</th>
              <td mat-cell *matCellDef="let b">
                <div class="resultat-cell">
                  @if (b.moyenneGenerale !== null) {
                    <span class="moyenne-val"
                          [class]="getMoyenneColor(b.moyenneGenerale)">
                      {{ b.moyenneGenerale | number:'1.2-2' }}/20
                    </span>
                  }
                  @if (b.rang) {
                    <span class="rang-badge">{{ b.rang }}e</span>
                  }
                  @if (b.mention) {
                    <mat-chip [class]="'chip-mention chip-' + b.mention">
                      {{ mentionLabel(b.mention) }}
                    </mat-chip>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="decision">
              <th mat-header-cell *matHeaderCellDef>Décision</th>
              <td mat-cell *matCellDef="let b">
                @if (b.decision) {
                  <mat-chip [class]="'chip-decision chip-dec-' + b.decision">
                    {{ decisionLabel(b.decision) }}
                  </mat-chip>
                } @else {
                  <span class="cell-secondary">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let b">
                <mat-chip [class]="'chip-statut chip-doc-statut-' + b.statut">
                  {{ statutLabel(b.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let b">
                <div class="actions-cell">
                  <button mat-icon-button [routerLink]="[b.id]"
                          matTooltip="Voir le bulletin">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="telecharger(b); $event.stopPropagation()"
                          matTooltip="Télécharger PDF">
                    <mat-icon>picture_as_pdf</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu"
                          (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @if (b.statut === 'genere') {
                      <button mat-menu-item (click)="valider(b)">
                        <mat-icon>check_circle</mat-icon> Valider
                      </button>
                    }
                    @if (b.statut === 'valide') {
                      <button mat-menu-item (click)="openSigner(b)">
                        <mat-icon>draw</mat-icon> Signer
                      </button>
                    }
                    @if (['genere', 'valide', 'signe'].includes(b.statut)) {
                      <button mat-menu-item (click)="openAppreciation(b)">
                        <mat-icon>rate_review</mat-icon> Appréciation
                      </button>
                    }
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="table-row" [routerLink]="[row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>description</mat-icon>
                <p>Aucun bulletin trouvé</p>
              </td>
            </tr>
          </table>

          <mat-paginator
            [length]="state.total()"
            [pageSize]="state.limit()"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </div>

        @if (state.bulletinsEnAttente().length > 0) {
          <div class="publication-bar">
            <span>
              <mat-icon>info</mat-icon>
              {{ state.bulletinsEnAttente().length }} bulletin(s) non encore publiés
            </span>
            <button mat-raised-button color="accent" (click)="publierTous()">
              <mat-icon>publish</mat-icon>
              Publier tous les bulletins signés
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-actions { display: flex; gap: 8px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .total-badge { background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { padding: 16px 20px; text-align: center; min-width: 90px; }
    .stat-value { font-size: 26px; font-weight: 700; }
    .stat-label { font-size: 12px; color: #757575; }
    .stat-info    .stat-value { color: #1565c0; }
    .stat-success .stat-value { color: #2e7d32; }
    .stat-warning .stat-value { color: #e65100; }
    .stat-accent  .stat-value { color: #00695c; }
    .status-tabs { margin-bottom: 16px; background: white; border-radius: 8px 8px 0 0; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 260px; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 12px; }
    .loading-label { color: #555; font-size: 14px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    .apprenant-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 34px; height: 34px; border-radius: 50%; background: #e3f2fd; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex-shrink: 0; }
    .apprenant-nom { font-weight: 500; font-size: 14px; }
    .apprenant-num { font-size: 11px; color: #9e9e9e; }
    .periode-cell { font-size: 13px; color: #555; }
    .resultat-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .moyenne-val { font-weight: 700; font-size: 15px; }
    .moyenne-success { color: #2e7d32; }
    .moyenne-warning { color: #e65100; }
    .moyenne-danger  { color: #c62828; }
    .rang-badge { font-size: 12px; color: #555; background: #f5f5f5; padding: 1px 6px; border-radius: 3px; }
    .cell-secondary { font-size: 12px; color: #9e9e9e; }
    .chip-type mat-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 3px; }
    .chip-doc-bulletin { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-doc-releve   { background: #e8eaf6 !important; color: #283593 !important; }
    .chip-doc-statut-brouillon { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-doc-statut-genere    { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-doc-statut-valide    { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-doc-statut-signe     { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-doc-statut-publie    { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-doc-statut-archive   { background: #fafafa !important; color: #9e9e9e !important; }
    .chip-mention { font-size: 11px !important; min-height: 22px !important; }
    .chip-tres_bien   { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-bien        { background: #e3f2fd !important; color: #0d47a1 !important; }
    .chip-assez_bien  { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-passable    { background: #fff3e0 !important; color: #bf360c !important; }
    .chip-insuffisant { background: #fdecea !important; color: #b71c1c !important; }
    .chip-decision { font-size: 11px !important; min-height: 22px !important; }
    .chip-dec-passage     { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-dec-admis       { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-dec-redoublement { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-dec-redoublant  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-dec-felicitations { background: #e8eaf6 !important; color: #1a237e !important; }
    .chip-dec-ajourne     { background: #fdecea !important; color: #c62828 !important; }
    .chip-dec-exclusion   { background: #fdecea !important; color: #b71c1c !important; }
    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }
    .no-data { text-align: center; padding: 48px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
    .publication-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding: 12px 16px; background: #fff8e1; border-radius: 8px; border: 1px solid #ffe082; }
    .publication-bar span { display: flex; align-items: center; gap: 8px; color: #e65100; font-size: 14px; }
    .publication-bar mat-icon { font-size: 18px; }
  `]
})
export class BulletinsListComponent implements OnInit {
  state = inject(BulletinStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'type', 'periode', 'resultat', 'decision', 'statut', 'actions'];
  searchApprenant = '';
  filterType = '';

  private tabStatuts: (StatutDocument | undefined)[] = [
    undefined, 'genere', 'valide', 'signe', 'publie',
  ];

  ngOnInit(): void {
    this.state.loadBulletins();
    this.state.loadStatsBulletins();
  }

  onTabChange(index: number): void {
    this.state.loadBulletins({ statut: this.tabStatuts[index] });
  }

  onFilter(): void {
    this.state.loadBulletins({
      type: (this.filterType as any) || undefined,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadBulletins({ page: e.pageIndex + 1 });
  }

  getMoyenneColor(m: number): string {
    if (m >= 14) return 'moyenne-success';
    if (m >= 10) return '';
    if (m >= 7)  return 'moyenne-warning';
    return 'moyenne-danger';
  }

  mentionLabel(mention: string): string {
    const map: Record<string, string> = {
      tres_bien: 'Très bien', bien: 'Bien', assez_bien: 'Assez bien',
      passable: 'Passable', insuffisant: 'Insuffisant',
    };
    return map[mention] ?? mention;
  }

  decisionLabel(decision: string): string {
    const map: Record<string, string> = {
      passage: 'Passage', redoublement: 'Redoublement',
      passage_conditionnel: 'Passage conditionnel',
      exclusion: 'Exclusion', felicitations: 'Félicitations',
      encouragements: 'Encouragements', mise_en_garde: 'Mise en garde',
      tableau_honneur: "Tableau d'honneur", admis: 'Admis',
      admis_rattrapage: 'Admis rattrapage', ajourne: 'Ajourné',
      redoublant: 'Redoublant', exclu: 'Exclu',
    };
    return map[decision] ?? decision;
  }

  statutLabel(statut: StatutDocument): string {
    const map: Record<StatutDocument, string> = {
      brouillon: 'Brouillon', genere: 'Généré', valide: 'Validé',
      signe: 'Signé', publie: 'Publié', archive: 'Archivé',
    };
    return map[statut] ?? statut;
  }

  openGenererDialog(): void {
    const ref = this.dialog.open(GenererBulletinsDialogComponent, { width: '560px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.genererBulletins(result, count => {
          this.snackBar.open(
            `${count} bulletin(s) généré(s) avec succès`,
            'Fermer', { duration: 4000 }
          );
          this.state.loadBulletins();
          this.state.loadStatsBulletins();
        });
      }
    });
  }

  valider(bulletin: Bulletin): void {
    this.state.validerBulletin(bulletin.id, {}, () =>
      this.snackBar.open('Bulletin validé', 'Fermer', { duration: 3000 })
    );
  }

  openSigner(bulletin: Bulletin): void {
    const ref = this.dialog.open(SignerDocumentDialogComponent, {
      width: '440px',
      data: { titre: 'Signer le bulletin', document: bulletin },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.signerBulletin(bulletin.id, result, () =>
          this.snackBar.open('Bulletin signé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAppreciation(bulletin: Bulletin): void {
    const ref = this.dialog.open(AppreciationDialogComponent, {
      width: '520px',
      data: { bulletin },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.apprecerBulletin({
          apprenantId: bulletin.apprenantId,
          periodeId:   bulletin.periodeId,
          ...result,
        }, () =>
          this.snackBar.open('Appréciation enregistrée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  telecharger(bulletin: Bulletin): void {
    const nom = `Bulletin_${bulletin.apprenant?.nom}_${bulletin.periode?.libelle ?? ''}.pdf`;
    this.state.telechargerBulletin(bulletin.id, nom);
  }

  publierTous(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Publier tous les bulletins',
        message: 'Publier tous les bulletins signés ? Ils seront visibles par les apprenants et parents.',
        confirmLabel: 'Publier', confirmColor: 'primary', icon: 'publish',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        const periodeId = this.state.bulletins()[0]?.periodeId ?? '';
        this.state.publierBulletins(periodeId, undefined, count => {
          this.snackBar.open(
            `${count} bulletin(s) publié(s)`,
            'Fermer', { duration: 4000 }
          );
        });
      }
    });
  }
}
