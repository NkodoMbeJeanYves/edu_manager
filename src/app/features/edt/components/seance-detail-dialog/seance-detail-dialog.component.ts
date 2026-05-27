import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EdtStateService } from '../../services/edt-state.service';

@Component({
  selector: 'app-seance-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './seance-detail-dialog.component.html',
  styleUrl: './seance-detail-dialog.component.scss'
})
export class SeanceDetailDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SeanceDetailDialogComponent>);
  readonly data: { seanceId: string } = inject(MAT_DIALOG_DATA);
  state = inject(EdtStateService);

  contenu          = '';
  travaux          = '';
  motifAnnulation  = '';
  showAnnulation   = false;

  constructor() {
    // Synchronise les champs locaux quand la séance est chargée
    effect(() => {
      const s = this.state.selectedSeance();
      if (s && s.id === this.data.seanceId) {
        this.contenu = s.contenuEnseignant ?? '';
        this.travaux = s.travauxDemandes  ?? '';
      }
    });
  }

  ngOnInit(): void {
    this.state.selectSeance(this.data.seanceId);
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours', realisee: 'Réalisée',
      annulee: 'Annulée', reportee: 'Reportée', suspendue: 'Suspendue',
    };
    return map[s] ?? s;
  }

  sauvegarderCahier(seanceId: string): void {
    this.state.saisirCahierTexte({
      seanceId,
      contenuEnseignant: this.contenu,
      travauxDemandes: this.travaux || undefined,
    });
  }

  ouvrirAnnulation(): void {
    this.showAnnulation = !this.showAnnulation;
  }
}
