import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { EdtStateService } from '../../services/edt-state.service';
import { SeanceFormDialogComponent } from '../../components/seance-form-dialog/seance-form-dialog.component';
import { SeanceDetailDialogComponent } from '../../components/seance-detail-dialog/seance-detail-dialog.component';
import { ConflitsDialogComponent } from '../../components/conflits-dialog/conflits-dialog.component';
import { EventCalendrier } from '../../../../core/models/edt.models';

@Component({
  selector: 'app-edt-calendrier',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatMenuModule, MatCardModule, MatBadgeModule,
  ],
  template: `
    <div class="page-container">

      <div class="edt-header">
        <div class="header-left">
          <h1 class="page-title">Emplois du temps</h1>
        </div>

        <div class="vue-selector">
          <mat-form-field appearance="outline" class="select-vue">
            <mat-label>Vue</mat-label>
            <mat-select [(ngModel)]="vueMode" (ngModelChange)="onVueChange()">
              <mat-option value="classe">Par classe</mat-option>
              <mat-option value="enseignant">Par enseignant</mat-option>
              <mat-option value="salle">Par salle</mat-option>
              <mat-option value="promotion">Par promotion</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="select-entity">
            <mat-label>{{ entityLabel() }}</mat-label>
            <input matInput [(ngModel)]="entityId"
                   (ngModelChange)="onEntityChange()"
                   placeholder="ID ou sélectionner...">
            <mat-hint>Sera remplacé par sélecteur dynamique</mat-hint>
          </mat-form-field>
        </div>

        <div class="nav-semaine">
          <button mat-icon-button (click)="semainePrecedente()" matTooltip="Semaine précédente">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <div class="semaine-label">
            <span class="semaine-range">{{ semaineLabel() }}</span>
            <button mat-button (click)="semaineAujourdhui()">Aujourd'hui</button>
          </div>
          <button mat-icon-button (click)="semaineSuivante()" matTooltip="Semaine suivante">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <div class="header-actions">
          @if (state.aConflits()) {
            <button mat-raised-button color="warn"
                    (click)="ouvrirConflits()"
                    [matBadge]="state.conflits().length"
                    matBadgeColor="warn">
              <mat-icon>warning</mat-icon> Conflits
            </button>
          }
          <button mat-raised-button color="primary" (click)="openSeanceDialog()">
            <mat-icon>add</mat-icon> Ajouter une séance
          </button>
          <button mat-icon-button [matMenuTriggerFor]="actionsMenu" matTooltip="Plus d'actions">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item [routerLink]="['cours-planifies']">
              <mat-icon>repeat</mat-icon> Cours récurrents
            </button>
            <button mat-menu-item [routerLink]="['creneaux']">
              <mat-icon>schedule</mat-icon> Créneaux horaires
            </button>
            <button mat-menu-item [routerLink]="['couverture']">
              <mat-icon>analytics</mat-icon> Couverture programme
            </button>
          </mat-menu>
        </div>
      </div>

      @if (state.loadingCalendrier()) {
        <div class="loading-container"><mat-spinner diameter="48"></mat-spinner></div>
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

      @if (!state.loadingCalendrier()) {
        <div class="calendrier-wrapper">
          <div class="calendrier-grid">

            <div class="grid-header">
              <div class="time-col-header"></div>
              @for (jour of joursAffichage(); track jour.date) {
                <div class="jour-header"
                     [class.jour-today]="isToday(jour.date)">
                  <div class="jour-nom">{{ jour.nom }}</div>
                  <div class="jour-date">{{ jour.date | date:'d MMM' }}</div>
                </div>
              }
            </div>

            <div class="grid-body">
              <div class="time-col">
                @for (heure of heuresAffichage; track heure) {
                  <div class="time-slot-label">{{ heure }}</div>
                }
              </div>

              @for (jour of joursAffichage(); track jour.date) {
                <div class="jour-col"
                     [class.jour-col-today]="isToday(jour.date)"
                     (click)="onSlotClick(jour.date, $event)">

                  @for (heure of heuresAffichage; track heure) {
                    <div class="heure-ligne"></div>
                  }

                  @for (event of getEventsJour(jour.date); track event.id) {
                    <div class="event-card"
                         [style.top.px]="getEventTop(event)"
                         [style.height.px]="getEventHeight(event)"
                         [style.background]="event.couleur || getCouleurType(event.typeCours)"
                         [class]="'event-statut-' + event.statut"
                         [matTooltip]="event.titre + ' — ' + event.salle"
                         (click)="openSeanceDetail(event); $event.stopPropagation()">
                      <div class="event-titre">{{ event.titre }}</div>
                      @if (event.sous_titre) {
                        <div class="event-sous">{{ event.sous_titre }}</div>
                      }
                      <div class="event-heure">
                        {{ event.heureDebut }} – {{ event.heureFin }}
                      </div>
                      @if (event.salle) {
                        <div class="event-salle">
                          <mat-icon>room</mat-icon>{{ event.salle }}
                        </div>
                      }
                      @if (event.statut === 'annulee') {
                        <div class="event-annule-overlay">ANNULÉE</div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="legende">
          <div class="legende-item">
            <div class="legende-dot" style="background: #42a5f5"></div><span>CM</span>
          </div>
          <div class="legende-item">
            <div class="legende-dot" style="background: #66bb6a"></div><span>TD</span>
          </div>
          <div class="legende-item">
            <div class="legende-dot" style="background: #ff7043"></div><span>TP</span>
          </div>
          <div class="legende-item">
            <div class="legende-dot" style="background: #ab47bc"></div><span>Examen</span>
          </div>
          <div class="legende-item">
            <div class="legende-dot legende-annule"></div><span>Annulée</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 20px 24px; max-width: 1500px; margin: 0 auto; height: calc(100vh - 64px); display: flex; flex-direction: column; }
    .edt-header { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .page-title { margin: 0; font-size: 22px; font-weight: 600; }
    .vue-selector { display: flex; gap: 12px; align-items: flex-end; }
    .select-vue { width: 160px; }
    .select-entity { width: 220px; }
    .nav-semaine { display: flex; align-items: center; gap: 4px; background: white; border-radius: 8px; padding: 4px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .semaine-label { display: flex; flex-direction: column; align-items: center; min-width: 140px; }
    .semaine-range { font-weight: 600; font-size: 13px; }
    .header-actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fdecea; color: #c62828; padding: 10px 16px; border-radius: 8px; margin-bottom: 12px; }

    .calendrier-wrapper { flex: 1; overflow: auto; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .calendrier-grid { min-width: 800px; }

    .grid-header { display: grid; grid-template-columns: 60px repeat(6, 1fr); border-bottom: 2px solid #e0e0e0; position: sticky; top: 0; background: white; z-index: 10; }
    .time-col-header { border-right: 1px solid #e0e0e0; }
    .jour-header { padding: 12px 8px; text-align: center; border-right: 1px solid #f0f0f0; }
    .jour-today { background: #e8f0fe; border-radius: 8px 8px 0 0; }
    .jour-nom { font-weight: 600; font-size: 13px; color: #444; text-transform: capitalize; }
    .jour-date { font-size: 12px; color: #777; margin-top: 2px; }

    .grid-body { display: grid; grid-template-columns: 60px repeat(6, 1fr); }
    .time-slot-label { height: 60px; display: flex; align-items: flex-start; justify-content: flex-end; padding: 4px 8px 0 0; font-size: 11px; color: #9e9e9e; border-right: 1px solid #e0e0e0; border-top: 1px solid #f5f5f5; }

    .jour-col { position: relative; border-right: 1px solid #f0f0f0; cursor: pointer; }
    .jour-col:hover { background: #f8f9ff; }
    .jour-col-today { background: #fafbff; }
    .heure-ligne { height: 60px; border-top: 1px solid #f0f0f0; }

    .event-card {
      position: absolute; left: 2px; right: 2px;
      border-radius: 6px; padding: 4px 6px;
      color: white; font-size: 11px; overflow: hidden;
      cursor: pointer; transition: box-shadow .15s, transform .1s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      z-index: 5;
    }
    .event-card:hover { box-shadow: 0 3px 8px rgba(0,0,0,0.3); transform: scale(1.02); z-index: 6; }
    .event-titre { font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-sous  { font-size: 10px; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-heure { font-size: 10px; opacity: 0.9; margin-top: 2px; }
    .event-salle { display: flex; align-items: center; gap: 2px; font-size: 10px; opacity: 0.85; margin-top: 1px; }
    .event-salle mat-icon { font-size: 11px; width: 11px; height: 11px; }
    .event-statut-annulee { opacity: 0.55; filter: grayscale(60%); }
    .event-annule-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); font-size: 10px; font-weight: 700; letter-spacing: 1px; border-radius: 6px; }

    .legende { display: flex; gap: 16px; padding: 10px 0; flex-wrap: wrap; }
    .legende-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; }
    .legende-dot { width: 12px; height: 12px; border-radius: 3px; }
    .legende-annule { background: #bdbdbd; opacity: 0.55; }
  `]
})
export class EdtCalendrierComponent implements OnInit {
  state = inject(EdtStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  vueMode  = 'classe';
  entityId = '';

  readonly joursAffichage = computed(() => {
    const lundi = new Date(this.state.semaineCourante());
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const noms = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      return {
        date: d.toISOString().split('T')[0],
        nom: noms[i],
      };
    });
  });

  readonly heuresAffichage = Array.from({ length: 12 }, (_, i) => {
    const h = 8 + i;
    return `${String(h).padStart(2, '0')}:00`;
  });

  ngOnInit(): void {}

  entityLabel(): string {
    const map: Record<string, string> = {
      classe: 'Classe', enseignant: 'Enseignant',
      salle: 'Salle', promotion: 'Promotion',
    };
    return map[this.vueMode] ?? 'Entité';
  }

  semaineLabel(): string {
    const lundi = new Date(this.state.semaineCourante());
    const samedi = new Date(lundi);
    samedi.setDate(lundi.getDate() + 5);
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(lundi)} – ${fmt(samedi)} ${lundi.getFullYear()}`;
  }

  isToday(date: string): boolean {
    return date === new Date().toISOString().split('T')[0];
  }

  getEventsJour(date: string): EventCalendrier[] {
    return this.state.eventsCalendrier().filter(e => e.date === date);
  }

  getEventTop(event: EventCalendrier): number {
    const [h, m] = event.heureDebut.split(':').map(Number);
    return (h - 8) * 60 + m;
  }

  getEventHeight(event: EventCalendrier): number {
    const [hd, md] = event.heureDebut.split(':').map(Number);
    const [hf, mf] = event.heureFin.split(':').map(Number);
    const duree = (hf * 60 + mf) - (hd * 60 + md);
    return Math.max(duree, 30);
  }

  getCouleurType(type: string): string {
    const map: Record<string, string> = {
      cm: '#42a5f5', td: '#66bb6a', tp: '#ff7043',
      examen: '#ab47bc', rattrapage: '#ef5350',
      projet: '#26c6da', autre: '#8d6e63',
    };
    return map[type] ?? '#78909c';
  }

  onVueChange(): void {
    if (this.entityId) this.chargerCalendrier();
  }

  onEntityChange(): void {
    if (this.entityId.length > 5) this.chargerCalendrier();
  }

  chargerCalendrier(): void {
    this.state.loadCalendrier({
      vue: this.vueMode as any,
      entityId: this.entityId,
      semaine: this.state.semaineCourante(),
      anneeAcademiqueId: '',
    });
  }

  semainePrecedente(): void {
    this.state.changerSemaine(-1);
  }

  semaineSuivante(): void {
    this.state.changerSemaine(1);
  }

  semaineAujourdhui(): void {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const lundi = new Date(now.setDate(diff));
    this.state.loadCalendrier({
      vue: this.vueMode as any,
      entityId: this.entityId,
      semaine: lundi.toISOString().split('T')[0],
      anneeAcademiqueId: '',
    });
  }

  onSlotClick(date: string, event: MouseEvent): void {
    const col = event.currentTarget as HTMLElement;
    const rect = col.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const h = Math.floor(y / 60) + 8;
    const m = Math.floor((y % 60) / 30) * 30;
    const heureDebut = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const heureFin   = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.openSeanceDialog({ date, heureDebut, heureFin });
  }

  openSeanceDialog(prefill?: { date?: string; heureDebut?: string; heureFin?: string }): void {
    const ref = this.dialog.open(SeanceFormDialogComponent, {
      width: '620px',
      data: { prefill, vueMode: this.vueMode, entityId: this.entityId },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.state.createSeance(result, () => {
        this.snackBar.open('Séance ajoutée', 'Fermer', { duration: 3000 });
        this.chargerCalendrier();
      });
    });
  }

  openSeanceDetail(event: EventCalendrier): void {
    const ref = this.dialog.open(SeanceDetailDialogComponent, {
      width: '520px',
      data: { seanceId: event.seanceId },
    });
    ref.afterClosed().subscribe(action => {
      if (!action) return;
      if (action.type === 'annuler') {
        this.state.annulerSeance(event.seanceId, action.motif, () => {
          this.snackBar.open('Séance annulée', 'Fermer', { duration: 3000 });
          this.chargerCalendrier();
        });
      } else if (action.type === 'realiser') {
        this.state.marquerRealisee(event.seanceId, () => {
          this.snackBar.open('Séance marquée comme réalisée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  ouvrirConflits(): void {
    this.dialog.open(ConflitsDialogComponent, {
      width: '560px',
      data: { conflits: this.state.conflits() },
    });
  }
}
