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
  templateUrl: './edt-calendrier.component.html',
  styleUrl: './edt-calendrier.component.scss'
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
