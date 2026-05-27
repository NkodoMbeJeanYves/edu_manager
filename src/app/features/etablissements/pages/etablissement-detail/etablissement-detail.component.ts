import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EtablissementStateService } from '../../services/etablissement-state.service';
import { EtablissementFormDialogComponent } from '../../components/etablissement-form-dialog/etablissement-form-dialog.component';
import { CampusFormDialogComponent } from '../../components/campus-form-dialog/campus-form-dialog.component';
import { AnneeAcademiqueFormDialogComponent } from '../../components/annee-academique-form-dialog/annee-academique-form-dialog.component';
import { SalleFormDialogComponent } from '../../components/salle-form-dialog/salle-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AnneeAcademique, Campus, Salle } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-etablissement-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTabsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    MatSnackBarModule, MatTableModule, MatMenuModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <!-- Retour -->
      <button mat-button routerLink="/etablissements" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Retour aux établissements
      </button>

      @if (state.loading()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
      }

      @if (state.selectedEtablissement(); as etab) {
        <!-- En-tête établissement -->
        <div class="detail-header">
          <div class="header-info">
            <span class="etab-code-large">{{ etab.code }}</span>
            <h1>{{ etab.nom }}</h1>
            <div class="header-meta">
              <mat-chip [class]="'chip-type chip-' + etab.type">
                {{ etab.type === 'scolaire' ? 'Scolaire' : 'Universitaire' }}
              </mat-chip>
              <mat-chip [class]="etab.actif ? 'chip-actif' : 'chip-inactif'">
                {{ etab.actif ? 'Actif' : 'Inactif' }}
              </mat-chip>
              <span class="meta-text"><mat-icon>location_on</mat-icon> {{ etab.ville }}, {{ etab.pays }}</span>
              <span class="meta-text"><mat-icon>email</mat-icon> {{ etab.email }}</span>
              <span class="meta-text"><mat-icon>phone</mat-icon> {{ etab.telephone }}</span>
            </div>
          </div>
          <button mat-raised-button color="primary" (click)="openEditDialog()">
            <mat-icon>edit</mat-icon> Modifier
          </button>
        </div>

        <!-- Onglets -->
        <mat-tab-group animationDuration="200ms" class="detail-tabs">

          <!-- Onglet Campus -->
          <mat-tab label="Campus ({{ state.campus().length }})">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Campus rattachés</h3>
                <button mat-raised-button color="primary" (click)="openCampusDialog()">
                  <mat-icon>add</mat-icon> Ajouter un campus
                </button>
              </div>
              @if (state.loadingCampus()) {
                <mat-spinner diameter="32"></mat-spinner>
              } @else {
                <div class="cards-grid">
                  @for (campus of state.campus(); track campus.id) {
                    <mat-card class="campus-card" [class.campus-principal]="campus.principal">
                      <mat-card-header>
                        <mat-card-title>{{ campus.nom }}</mat-card-title>
                        <mat-card-subtitle>{{ campus.code }}</mat-card-subtitle>
                        @if (campus.principal) {
                          <mat-chip class="chip-principal">Principal</mat-chip>
                        }
                      </mat-card-header>
                      <mat-card-content>
                        <p class="campus-adresse">
                          <mat-icon>location_on</mat-icon> {{ campus.adresse }}, {{ campus.ville }}
                        </p>
                        @if (campus.telephoneDirecteur) {
                          <p><mat-icon>phone</mat-icon> {{ campus.telephoneDirecteur }}</p>
                        }
                      </mat-card-content>
                      <mat-card-actions>
                        <button mat-icon-button (click)="openCampusDialog(campus)" matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="confirmDeleteCampus(campus)" matTooltip="Supprimer" color="warn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  }
                  @empty {
                    <div class="empty-state">
                      <mat-icon>location_city</mat-icon>
                      <p>Aucun campus rattaché</p>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Onglet Années académiques -->
          <mat-tab label="Années académiques">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Années académiques</h3>
                <button mat-raised-button color="primary" (click)="openAnneeDialog()">
                  <mat-icon>add</mat-icon> Nouvelle année
                </button>
              </div>
              @if (state.loadingAnnees()) {
                <mat-spinner diameter="32"></mat-spinner>
              } @else {
                <table mat-table [dataSource]="state.anneesAcademiques()" class="full-width mat-elevation-z1">
                  <ng-container matColumnDef="libelle">
                    <th mat-header-cell *matHeaderCellDef>Année</th>
                    <td mat-cell *matCellDef="let a">
                      <strong>{{ a.libelle }}</strong>
                      @if (a.active) {
                        <mat-chip class="chip-active-small">En cours</mat-chip>
                      }
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="periode">
                    <th mat-header-cell *matHeaderCellDef>Périodicité</th>
                    <td mat-cell *matCellDef="let a">
                      {{ a.typePeriode === 'semestre' ? 'Semestres' : 'Trimestres' }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="dates">
                    <th mat-header-cell *matHeaderCellDef>Période</th>
                    <td mat-cell *matCellDef="let a">
                      {{ a.dateDebut | date:'dd/MM/yyyy' }} → {{ a.dateFin | date:'dd/MM/yyyy' }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let a">
                      <mat-chip [class]="'chip-statut chip-' + a.statut">{{ a.statut | titlecase }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let a">
                      <button mat-icon-button [matMenuTriggerFor]="anneeMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #anneeMenu="matMenu">
                        <button mat-menu-item (click)="state.activerAnneeAcademique(a.id)" [disabled]="a.active">
                          <mat-icon>play_circle</mat-icon> Activer
                        </button>
                        <button mat-menu-item (click)="state.cloturerAnneeAcademique(a.id)" [disabled]="!a.active">
                          <mat-icon>lock</mat-icon> Clôturer
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="anneeColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: anneeColumns;"></tr>
                </table>
              }
            </div>
          </mat-tab>

          <!-- Onglet Salles -->
          <mat-tab label="Salles ({{ state.salles().length }})">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Salles et espaces</h3>
                <button mat-raised-button color="primary" (click)="openSalleDialog()">
                  <mat-icon>add</mat-icon> Ajouter une salle
                </button>
              </div>
              @if (state.loadingSalles()) {
                <mat-spinner diameter="32"></mat-spinner>
              } @else {
                <table mat-table [dataSource]="state.salles()" class="full-width mat-elevation-z1">
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let s"><strong>{{ s.code }}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let s">{{ s.nom }}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let s">{{ s.type | titlecase }}</td>
                  </ng-container>
                  <ng-container matColumnDef="capacite">
                    <th mat-header-cell *matHeaderCellDef>Capacité</th>
                    <td mat-cell *matCellDef="let s"><mat-icon>people</mat-icon> {{ s.capacite }}</td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let s">
                      <mat-chip [class]="'chip-salle-' + s.statut">{{ s.statut | titlecase }}</mat-chip>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let s">
                      <button mat-icon-button (click)="openSalleDialog(s)" matTooltip="Modifier">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="confirmDeleteSalle(s)" color="warn" matTooltip="Supprimer">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="salleColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: salleColumns;"></tr>
                </table>
              }
            </div>
          </mat-tab>

        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; color: #555; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px; padding: 24px; background: white;
      border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .etab-code-large {
      font-size: 11px; font-weight: 700; background: #e3f2fd;
      color: #1565c0; padding: 3px 8px; border-radius: 4px; letter-spacing: 1px;
    }
    .detail-header h1 { margin: 8px 0; font-size: 26px; font-weight: 600; }
    .header-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
    .meta-text { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #757575; }
    .meta-text mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .detail-tabs { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .tab-content { padding: 24px; }
    .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .tab-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .campus-card { border: 1px solid #e0e0e0; }
    .campus-principal { border-color: #1565c0; }
    .campus-adresse { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555; }
    .campus-adresse mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty-state { text-align: center; padding: 40px; color: #9e9e9e; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .full-width { width: 100%; }
    .chip-principal { background: #e3f2fd !important; color: #1565c0 !important; font-size: 11px !important; }
    .chip-active-small {
      background: #e8f5e9 !important; color: #2e7d32 !important;
      font-size: 11px !important; min-height: 20px !important; margin-left: 8px;
    }
    .chip-en_cours   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-cloturee   { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-archivee   { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-planifiee  { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-salle-disponible   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-salle-maintenance  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-salle-indisponible { background: #fdecea !important; color: #c62828 !important; }
    .chip-type          { font-size: 12px !important; }
    .chip-scolaire      { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-universitaire { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-actif         { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactif       { background: #f5f5f5 !important; color: #757575 !important; }
  `]
})
export class EtablissementDetailComponent implements OnInit {
  state  = inject(EtablissementStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  anneeColumns = ['libelle', 'periode', 'dates', 'statut', 'actions'];
  salleColumns = ['code', 'nom', 'type', 'capacite', 'statut', 'actions'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectEtablissement(id);
    this.state.loadCampus(id);
    this.state.loadAnneesAcademiques(id);
    this.state.loadSalles({});
  }

  openEditDialog(): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(EtablissementFormDialogComponent, {
      width: '600px',
      data: { etablissement: etab },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEtablissement(etab.id, result, () =>
          this.snackBar.open('Établissement mis à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openCampusDialog(campus?: Campus): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(CampusFormDialogComponent, {
      width: '520px',
      data: { campus, etablissementId: etab.id },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (campus) {
        this.state.updateCampus(campus.id, result, () =>
          this.snackBar.open('Campus mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createCampus({ ...result, etablissementId: etab.id }, () =>
          this.snackBar.open('Campus ajouté', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAnneeDialog(annee?: AnneeAcademique): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(AnneeAcademiqueFormDialogComponent, {
      width: '520px',
      data: { annee, etablissementId: etab.id },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (annee) {
        this.state.updateAnneeAcademique(annee.id, result, () =>
          this.snackBar.open('Année mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createAnneeAcademique({ ...result, etablissementId: etab.id }, () =>
          this.snackBar.open('Année académique créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openSalleDialog(salle?: Salle): void {
    const ref = this.dialog.open(SalleFormDialogComponent, {
      width: '560px',
      data: { salle, campus: this.state.campus() },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (salle) {
        this.state.updateSalle(salle.id, result, () =>
          this.snackBar.open('Salle mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createSalle(result, () =>
          this.snackBar.open('Salle créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDeleteCampus(campus: Campus): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le campus',
        message: `Supprimer "${campus.nom}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deleteCampus(campus.id, () =>
          this.snackBar.open('Campus supprimé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDeleteSalle(salle: Salle): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la salle',
        message: `Supprimer "${salle.nom}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteSalle(salle.id);
    });
  }
}
