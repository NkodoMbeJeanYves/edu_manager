import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { AbsenceStateService } from '../../services/absence-state.service';
import { StatutPresence, SaisirPresencesDto } from '../../../../core/models/absence.models';

interface LigneAppel {
  apprenantId: string;
  prenom: string;
  nom: string;
  numeroInscription: string;
  presenceId?: string;
  statut: StatutPresence;
  minutesRetard: number;
  remarque: string;
  modifie: boolean;
}

@Component({
  selector: 'app-appel',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatSnackBarModule, MatTooltipModule,
    MatCardModule, MatInputModule, MatFormFieldModule, MatDividerModule,
  ],
  templateUrl: './appel.component.html',
  styleUrl: './appel.component.scss'
})
export class AppelComponent implements OnInit {
  state    = inject(AbsenceStateService);
  private route    = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  seanceId = '';
  lignes: LigneAppel[] = [];

  constructor() {
    // Rebuild lines reactively whenever the feuille signal changes.
    effect(() => {
      const feuille = this.state.feuillePresence();
      if (feuille) this.buildLignes(feuille);
    });
  }

  ngOnInit(): void {
    this.seanceId = this.route.snapshot.paramMap.get('seanceId') ?? '';
    if (this.seanceId) {
      this.state.loadFeuillePresence(this.seanceId);
    }
  }

  private buildLignes(feuille: NonNullable<ReturnType<AbsenceStateService['feuillePresence']>>): void {
    this.lignes = feuille.presences.map(p => ({
      apprenantId:       p.apprenantId,
      prenom:            p.apprenant?.prenom ?? '',
      nom:               p.apprenant?.nom    ?? '',
      numeroInscription: p.apprenant?.numeroInscription ?? '',
      presenceId:        p.id,
      statut:            p.statut,
      minutesRetard:     p.minutesRetard ?? 0,
      remarque:          p.remarque      ?? '',
      modifie:           false,
    }));
  }

  lignesModifiees(): LigneAppel[] {
    return this.lignes.filter(l => l.modifie);
  }

  progression(): number {
    if (!this.lignes.length) return 0;
    const renseignees = this.lignes.filter(
      l => l.modifie || l.statut !== 'present'
    ).length;
    return Math.round((renseignees / this.lignes.length) * 100);
  }

  retardsCount(): number {
    return this.lignes.filter(l => l.statut === 'retard').length;
  }

  setStatut(ligne: LigneAppel, statut: StatutPresence): void {
    ligne.statut  = statut;
    ligne.modifie = true;
    if (statut !== 'retard') ligne.minutesRetard = 0;
  }

  tousPresents(): void {
    this.lignes.forEach(l => {
      l.statut  = 'present';
      l.modifie = true;
    });
  }

  tousAbsents(): void {
    this.lignes.forEach(l => {
      l.statut  = 'absent';
      l.modifie = true;
    });
  }

  sauvegarder(): void {
    const dto: SaisirPresencesDto = {
      seanceId: this.seanceId,
      presences: this.lignes.map(l => ({
        apprenantId:   l.apprenantId,
        statut:        l.statut,
        minutesRetard: l.statut === 'retard' ? l.minutesRetard : undefined,
        remarque:      l.remarque || undefined,
      })),
    };
    this.state.saisirPresences(dto, () => {
      this.lignes.forEach(l => l.modifie = false);
      this.snackBar.open('Appel sauvegardé', 'Fermer', { duration: 3000 });
    });
  }
}
