import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ReferentielStateService } from '../../services/referentiel-state.service';
import { MatiereFormDialogComponent } from '../../components/matiere-form-dialog/matiere-form-dialog.component';
import { UEFormDialogComponent } from '../../components/ue-form-dialog/ue-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Matiere, UE, TypeMatiere } from '../../../../core/models/referentiel.models';

@Component({
  selector: 'app-referentiel-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    MatPaginatorModule, MatCardModule, MatSlideToggleModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Référentiel pédagogique</h1>
          <p class="page-sub">Matières · Unités d'Enseignement · Coefficients · ECTS</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="openDupliquerDialog()">
            <mat-icon>content_copy</mat-icon> Dupliquer vers année suivante
          </button>
        </div>
      </div>

      @if (state.stats(); as stats) {
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-v">{{ stats.totalMatieres }}</div>
            <div class="stat-l">Matières</div>
          </mat-card>
          <mat-card class="stat-card stat-univ">
            <div class="stat-v">{{ stats.totalUE }}</div>
            <div class="stat-l">UE</div>
          </mat-card>
          <mat-card class="stat-card stat-warn">
            <div class="stat-v">{{ stats.matieresEliminatoires }}</div>
            <div class="stat-l">Éliminatoires</div>
          </mat-card>
          <mat-card class="stat-card stat-info">
            <div class="stat-v">{{ state.totalVolumeHoraire() }}h</div>
            <div class="stat-l">Volume horaire</div>
          </mat-card>
        </div>
      }

      <mat-tab-group animationDuration="150ms" class="ref-tabs">

        <mat-tab label="Matières ({{ state.totalMatieres() }})">
          <div class="tab-content">
            <div class="tab-toolbar">
              <div class="filters-inline">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher</mat-label>
                  <input matInput [(ngModel)]="searchMatiere"
                         (ngModelChange)="onFilterMatieres()"
                         placeholder="Code, libellé...">
                  <mat-icon matPrefix>search</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select [(ngModel)]="filterTypeMat" (ngModelChange)="onFilterMatieres()">
                    <mat-option value="">Tous</mat-option>
                    <mat-option value="cours_magistral">Cours magistral</mat-option>
                    <mat-option value="td">TD</mat-option>
                    <mat-option value="tp">TP</mat-option>
                    <mat-option value="projet">Projet</mat-option>
                    <mat-option value="langue">Langue</mat-option>
                    <mat-option value="sport">Sport</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-slide-toggle [(ngModel)]="filterEliminatoire"
                                  (ngModelChange)="onFilterMatieres()"
                                  color="warn">
                  Éliminatoires only
                </mat-slide-toggle>
              </div>
              <button mat-raised-button color="primary" (click)="openMatiereDialog()">
                <mat-icon>add</mat-icon> Nouvelle matière
              </button>
            </div>

            @if (state.loadingMatieres()) {
              <div class="loading-container"><mat-spinner diameter="36"></mat-spinner></div>
            } @else {
              <div class="table-container mat-elevation-z1">
                <table mat-table [dataSource]="state.matieres()">

                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Matière</th>
                    <td mat-cell *matCellDef="let m">
                      <div class="mat-cell-main">
                        <span class="code-badge">{{ m.code }}</span>
                        <div>
                          <div class="mat-nom">{{ m.libelle }}</div>
                          <div class="mat-meta">
                            {{ m.filiere?.libelle }} · {{ m.niveau?.libelle }}
                            @if (m.ueId) {
                              · <span class="ue-badge">{{ m.ueId }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let m">
                      <mat-chip [class]="'chip-type-mat chip-' + m.type">
                        {{ typeMatLabel(m.type) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="coefficient">
                    <th mat-header-cell *matHeaderCellDef>Coeff.</th>
                    <td mat-cell *matCellDef="let m">
                      <span class="coeff-badge">{{ m.coefficient }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="volume">
                    <th mat-header-cell *matHeaderCellDef>Volume horaire</th>
                    <td mat-cell *matCellDef="let m">
                      <div class="volume-cell">
                        <span class="vol-total">{{ m.volumeHoraireTotal }}h</span>
                        <div class="vol-detail">
                          @if (m.volumeHoraireCM) { <span>CM: {{ m.volumeHoraireCM }}h</span> }
                          @if (m.volumeHoraireTD) { <span>TD: {{ m.volumeHoraireTD }}h</span> }
                          @if (m.volumeHoraireTP) { <span>TP: {{ m.volumeHoraireTP }}h</span> }
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="ponderation">
                    <th mat-header-cell *matHeaderCellDef>Pondération</th>
                    <td mat-cell *matCellDef="let m">
                      <div class="pond-cell">
                        <div class="pond-bar-wrap">
                          <div class="pond-cc" [style.width.%]="m.ponderationCC"
                               [matTooltip]="'CC : ' + m.ponderationCC + '%'">
                            {{ m.ponderationCC }}%
                          </div>
                          <div class="pond-ex" [style.width.%]="m.ponderationExamen"
                               [matTooltip]="'Examen : ' + m.ponderationExamen + '%'">
                            {{ m.ponderationExamen }}%
                          </div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="flags">
                    <th mat-header-cell *matHeaderCellDef>Flags</th>
                    <td mat-cell *matCellDef="let m">
                      @if (m.eliminatoire) {
                        <mat-chip class="chip-eliminatoire" [matTooltip]="'Note mini : ' + m.seuilEliminatoire">
                          <mat-icon>warning</mat-icon> Élim. {{ m.seuilEliminatoire }}
                        </mat-chip>
                      }
                      @if (!m.actif) {
                        <mat-chip class="chip-inactif">Inactif</mat-chip>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let m">
                      <div class="actions-cell">
                        <button mat-icon-button (click)="openMatiereDialog(m)"
                                matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button [matMenuTriggerFor]="matMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #matMenu="matMenu">
                          <button mat-menu-item (click)="toggleActifMatiere(m)">
                            <mat-icon>{{ m.actif ? 'visibility_off' : 'visibility' }}</mat-icon>
                            {{ m.actif ? 'Désactiver' : 'Activer' }}
                          </button>
                          @if (m.ueId) {
                            <button mat-menu-item (click)="detacherUE(m)">
                              <mat-icon>link_off</mat-icon> Détacher de l'UE
                            </button>
                          }
                          <mat-divider></mat-divider>
                          <button mat-menu-item class="menu-delete"
                                  (click)="confirmDeleteMatiere(m)">
                            <mat-icon>delete</mat-icon> Supprimer
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="colsMatieres"></tr>
                  <tr mat-row *matRowDef="let row; columns: colsMatieres;"
                      class="table-row"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell no-data" [attr.colspan]="colsMatieres.length">
                      <mat-icon>menu_book</mat-icon>
                      <p>Aucune matière trouvée</p>
                    </td>
                  </tr>
                </table>

                <mat-paginator
                  [length]="state.totalMatieres()"
                  [pageSize]="state.limit()"
                  [pageSizeOptions]="[10, 20, 50]"
                  (page)="onPageMatieres($event)"
                  showFirstLastButtons>
                </mat-paginator>
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="UE / ECTS ({{ state.totalUE() }})">
          <div class="tab-content">
            <div class="tab-toolbar">
              <div class="filters-inline">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher une UE</mat-label>
                  <input matInput [(ngModel)]="searchUE"
                         (ngModelChange)="onFilterUE()"
                         placeholder="Code, libellé...">
                  <mat-icon matPrefix>search</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Semestre</mat-label>
                  <mat-select [(ngModel)]="filterSemestre" (ngModelChange)="onFilterUE()">
                    <mat-option value="">Tous</mat-option>
                    @for (s of [1,2,3,4,5,6,7,8,9,10]; track s) {
                      <mat-option [value]="s">S{{ s }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type UE</mat-label>
                  <mat-select [(ngModel)]="filterTypeUE" (ngModelChange)="onFilterUE()">
                    <mat-option value="">Tous</mat-option>
                    <mat-option value="fondamentale">Fondamentale</mat-option>
                    <mat-option value="complementaire">Complémentaire</mat-option>
                    <mat-option value="optionnelle">Optionnelle</mat-option>
                    <mat-option value="libre">Libre</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <button mat-raised-button color="primary" (click)="openUEDialog()">
                <mat-icon>add</mat-icon> Nouvelle UE
              </button>
            </div>

            @if (state.loadingUE()) {
              <div class="loading-container"><mat-spinner diameter="36"></mat-spinner></div>
            } @else {
              @for (semestre of semestresDisponibles(); track semestre) {
                <div class="semestre-bloc">
                  <div class="semestre-header">
                    <span class="semestre-titre">Semestre {{ semestre }}</span>
                    <span class="semestre-credits">
                      {{ totalCreditsSemestre(semestre) }} crédits ECTS
                    </span>
                  </div>
                  <div class="ue-grid">
                    @for (ue of state.uesBySemestre(semestre)(); track ue.id) {
                      <mat-card class="ue-card"
                                [class.ue-eliminatoire]="ue.eliminatoire"
                                [class.ue-inactif]="!ue.actif">
                        <mat-card-header>
                          <div mat-card-avatar class="ue-avatar"
                               [class]="'ue-avatar-' + ue.type">
                            {{ ue.credits }}
                          </div>
                          <mat-card-title>{{ ue.code }}</mat-card-title>
                          <mat-card-subtitle>{{ ue.libelle }}</mat-card-subtitle>
                        </mat-card-header>

                        <mat-card-content>
                          <div class="ue-details">
                            <div class="ue-detail-row">
                              <mat-icon>school</mat-icon>
                              <span>{{ ue.credits }} ECTS · Coeff. {{ ue.coefficient }}</span>
                            </div>
                            <div class="ue-detail-row">
                              <mat-icon>access_time</mat-icon>
                              <span>{{ ue.volumeHoraireTotal }}h</span>
                            </div>
                            <div class="ue-detail-row pond-row">
                              <div class="pond-mini-cc"
                                   [style.width.%]="ue.ponderationCC">
                                CC {{ ue.ponderationCC }}%
                              </div>
                              <div class="pond-mini-ex"
                                   [style.width.%]="ue.ponderationExamen">
                                Ex. {{ ue.ponderationExamen }}%
                              </div>
                            </div>
                          </div>

                          <div class="ue-flags">
                            <mat-chip [class]="'chip-ue-type chip-ue-' + ue.type">
                              {{ ueTypeLabel(ue.type) }}
                            </mat-chip>
                            @if (ue.eliminatoire) {
                              <mat-chip class="chip-eliminatoire-sm">
                                Élim. ≥ {{ ue.seuilValidation }}/20
                              </mat-chip>
                            }
                            @if (ue.compensable) {
                              <mat-chip class="chip-compensable">Compensable</mat-chip>
                            }
                          </div>

                          @if (ue.matieres?.length) {
                            <div class="matieres-rattachees">
                              <span class="mat-label">Matières :</span>
                              @for (m of ue.matieres; track m.id) {
                                <span class="mat-chip-sm">{{ m.code }}</span>
                              }
                            </div>
                          }
                        </mat-card-content>

                        <mat-card-actions>
                          <button mat-icon-button (click)="selectUEDetail(ue)"
                                  matTooltip="Voir les matières">
                            <mat-icon>list</mat-icon>
                          </button>
                          <button mat-icon-button (click)="openUEDialog(ue)"
                                  matTooltip="Modifier">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button (click)="confirmDeleteUE(ue)"
                                  color="warn" matTooltip="Supprimer">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </mat-card-actions>
                      </mat-card>
                    }
                  </div>
                </div>
              }

              @if (state.ues().length === 0) {
                <div class="empty-ue">
                  <mat-icon>library_books</mat-icon>
                  <p>Aucune UE définie pour ce référentiel</p>
                  <button mat-raised-button color="primary" (click)="openUEDialog()">
                    Créer la première UE
                  </button>
                </div>
              }
            }
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .page-title { margin: 0; font-size: 24px; font-weight: 600; }
    .page-sub { margin: 4px 0 16px; font-size: 13px; color: #757575; }
    .stats-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { padding: 14px 18px; text-align: center; min-width: 80px; }
    .stat-v { font-size: 24px; font-weight: 700; }
    .stat-l { font-size: 12px; color: #757575; }
    .stat-univ .stat-v { color: #4527a0; }
    .stat-warn .stat-v { color: #e65100; }
    .stat-info .stat-v { color: #1565c0; }

    .ref-tabs { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .tab-content { padding: 20px 24px; }
    .tab-toolbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .filters-inline { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .search-field { min-width: 220px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .table-container { border-radius: 8px; overflow: hidden; }

    .mat-cell-main { display: flex; align-items: flex-start; gap: 10px; }
    .code-badge { font-size: 11px; font-weight: 700; background: #ede7f6; color: #4527a0; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
    .mat-nom { font-weight: 500; }
    .mat-meta { font-size: 12px; color: #757575; }
    .ue-badge { background: #e3f2fd; color: #1565c0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
    .coeff-badge { font-weight: 700; font-size: 14px; color: #4527a0; background: #ede7f6; padding: 2px 8px; border-radius: 6px; }
    .volume-cell .vol-total { font-weight: 600; font-size: 14px; }
    .vol-detail { display: flex; gap: 6px; font-size: 11px; color: #757575; }

    .pond-bar-wrap { display: flex; border-radius: 4px; overflow: hidden; height: 22px; background: #f0f0f0; }
    .pond-cc { background: #42a5f5; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: width .3s; }
    .pond-ex { background: #ab47bc; color: white; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: width .3s; flex: 1; }
    .chip-eliminatoire { background: #fff3e0 !important; color: #e65100 !important; font-size: 11px !important; }
    .chip-eliminatoire mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .chip-inactif { background: #f5f5f5 !important; color: #9e9e9e !important; font-size: 11px !important; }
    .chip-type-mat { font-size: 11px !important; min-height: 22px !important; }
    .chip-cours_magistral { background: #e3f2fd !important; color: #1565c0 !important; }
    .chip-td     { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-tp     { background: #e0f2f1 !important; color: #00695c !important; }
    .chip-projet { background: #f3e5f5 !important; color: #6a1b9a !important; }
    .chip-langue { background: #fff8e1 !important; color: #f57f17 !important; }
    .chip-sport  { background: #fce4ec !important; color: #880e4f !important; }

    .actions-cell { display: flex; align-items: center; justify-content: flex-end; }
    .menu-delete { color: #d32f2f !important; }
    .table-row:hover { background: #f9f9ff; }
    .no-data { text-align: center; padding: 40px !important; color: #9e9e9e; }
    .no-data mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }

    .semestre-bloc { margin-bottom: 28px; }
    .semestre-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .semestre-titre { font-size: 16px; font-weight: 600; color: #283593; }
    .semestre-credits { font-size: 13px; color: #757575; background: #e8eaf6; padding: 3px 10px; border-radius: 12px; }
    .ue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .ue-card { border: 1px solid #e0e0e0; transition: box-shadow .2s; }
    .ue-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
    .ue-eliminatoire { border-color: #ffcc80; background: #fffde7; }
    .ue-inactif { opacity: 0.6; }
    .ue-avatar { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; border-radius: 50%; width: 40px; height: 40px; }
    .ue-avatar-fondamentale   { background: #e8eaf6; color: #283593; }
    .ue-avatar-complementaire { background: #e3f2fd; color: #0d47a1; }
    .ue-avatar-optionnelle    { background: #e8f5e9; color: #1b5e20; }
    .ue-avatar-libre          { background: #f5f5f5; color: #757575; }
    .ue-details { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .ue-detail-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; }
    .ue-detail-row mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .pond-mini-cc { background: #42a5f5; color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px 0 0 3px; }
    .pond-mini-ex { background: #ab47bc; color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 0 3px 3px 0; }
    .ue-flags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .chip-ue-type { font-size: 11px !important; min-height: 20px !important; }
    .chip-ue-fondamentale   { background: #e8eaf6 !important; color: #283593 !important; }
    .chip-ue-complementaire { background: #e3f2fd !important; color: #0d47a1 !important; }
    .chip-ue-optionnelle    { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .chip-ue-libre          { background: #f5f5f5 !important; color: #757575 !important; }
    .chip-eliminatoire-sm   { background: #fff3e0 !important; color: #e65100 !important; font-size: 11px !important; min-height: 20px !important; }
    .chip-compensable        { background: #e0f2f1 !important; color: #00695c !important; font-size: 11px !important; min-height: 20px !important; }
    .matieres-rattachees { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .mat-label { font-size: 11px; color: #757575; }
    .mat-chip-sm { font-size: 11px; background: #f0f0f0; padding: 1px 6px; border-radius: 3px; }
    .empty-ue { text-align: center; padding: 60px; color: #9e9e9e; }
    .empty-ue mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
    .empty-ue p { margin-bottom: 16px; }
  `]
})
export class ReferentielListComponent implements OnInit {
  state = inject(ReferentielStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  colsMatieres = ['code', 'type', 'coefficient', 'volume', 'ponderation', 'flags', 'actions'];
  searchMatiere      = '';
  filterTypeMat      = '';
  filterEliminatoire = false;
  searchUE           = '';
  filterSemestre     = '';
  filterTypeUE       = '';

  ngOnInit(): void {
    this.state.loadMatieres();
    this.state.loadUEs();
  }

  onFilterMatieres(): void {
    this.state.loadMatieres({
      search:       this.searchMatiere || undefined,
      type:         (this.filterTypeMat as any) || undefined,
      eliminatoire: this.filterEliminatoire || undefined,
      page: 1,
    });
  }

  onFilterUE(): void {
    this.state.loadUEs({
      search:   this.searchUE || undefined,
      semestre: this.filterSemestre ? Number(this.filterSemestre) : undefined,
      type:     (this.filterTypeUE as any) || undefined,
      page: 1,
    });
  }

  onPageMatieres(e: PageEvent): void {
    this.state.loadMatieres({ page: e.pageIndex + 1 });
  }

  semestresDisponibles(): number[] {
    return [...new Set(this.state.ues().map(u => u.semestre))].sort((a, b) => a - b);
  }

  totalCreditsSemestre(semestre: number): number {
    return this.state.uesBySemestre(semestre)()
      .reduce((sum, u) => sum + u.credits, 0);
  }

  typeMatLabel(type: TypeMatiere): string {
    const map: Record<TypeMatiere, string> = {
      cours_magistral: 'CM', td: 'TD', tp: 'TP',
      projet: 'Projet', stage: 'Stage', memoire: 'Mémoire',
      seminaire: 'Séminaire', sport: 'Sport', langue: 'Langue',
    };
    return map[type] ?? type;
  }

  ueTypeLabel(type: string): string {
    const map: Record<string, string> = {
      fondamentale: 'Fondamentale', complementaire: 'Complémentaire',
      optionnelle: 'Optionnelle', libre: 'Libre',
    };
    return map[type] ?? type;
  }

  openMatiereDialog(matiere?: Matiere): void {
    const ref = this.dialog.open(MatiereFormDialogComponent, {
      width: '680px',
      data: { matiere },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (matiere) {
        this.state.updateMatiere(matiere.id, result, () =>
          this.snackBar.open('Matière mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createMatiere(result, () => {
          this.snackBar.open('Matière créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openUEDialog(ue?: UE): void {
    const ref = this.dialog.open(UEFormDialogComponent, {
      width: '640px',
      data: { ue },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (ue) {
        this.state.updateUE(ue.id, result, () =>
          this.snackBar.open('UE mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createUE(result, () =>
          this.snackBar.open('UE créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  selectUEDetail(ue: UE): void {
    this.state.selectUE(ue.id);
  }

  toggleActifMatiere(m: Matiere): void {
    this.state.updateMatiere(m.id, { actif: !m.actif }, () =>
      this.snackBar.open(m.actif ? 'Matière désactivée' : 'Matière activée',
        'Fermer', { duration: 3000 })
    );
  }

  detacherUE(m: Matiere): void {
    this.state.detacherMatiereUE(m.id, () =>
      this.snackBar.open('Matière détachée de l\'UE', 'Fermer', { duration: 3000 })
    );
  }

  confirmDeleteMatiere(m: Matiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la matière',
        message: `Supprimer "${m.libelle}" ? Les évaluations liées seront impactées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteMatiere(m.id, () =>
        this.snackBar.open('Matière supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteUE(ue: UE): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'UE',
        message: `Supprimer "${ue.libelle}" (${ue.credits} ECTS) ? Les matières rattachées seront détachées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteUE(ue.id, () =>
        this.snackBar.open('UE supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  openDupliquerDialog(): void {
    this.snackBar.open('Dialog de duplication — à implémenter via DupliquerReferentielDialog', 'OK', { duration: 4000 });
  }
}
