import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { NoteStateService } from '../../services/note-state.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModifierNoteDialogComponent } from '../../components/modifier-note-dialog/modifier-note-dialog.component';
import { SaisieNoteMasse, TypeEvaluation } from '../../../../core/models/note.models';

interface LigneNote {
  apprenantId: string;
  prenom: string;
  nom: string;
  numeroInscription: string;
  noteId?: string;
  valeur: number | string;
  absent: boolean;
  dispense: boolean;
  commentaire: string;
  statut: string;
  modifie: boolean;
}

@Component({
  selector: 'app-saisie-notes',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatChipsModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatCardModule, MatSlideToggleModule, MatDividerModule,
  ],
  templateUrl: './saisie-notes.component.html',
  styleUrl: './saisie-notes.component.scss'
})
export class SaisieNotesComponent implements OnInit {
  state = inject(NoteStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  lignes: LigneNote[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectEvaluation(id);
    setTimeout(() => this.buildLignes(), 1500);
  }

  private buildLignes(): void {
    const notes = this.state.notes();
    this.lignes = notes.map(n => ({
      apprenantId:        n.apprenantId,
      prenom:             n.apprenant?.prenom ?? '',
      nom:                n.apprenant?.nom ?? '',
      numeroInscription:  n.apprenant?.numeroInscription ?? '',
      noteId:             n.id,
      valeur:             n.valeur !== null ? n.valeur : '',
      absent:             n.absent,
      dispense:           n.dispense,
      commentaire:        n.commentaire ?? '',
      statut:             n.statut,
      modifie:            false,
    }));
  }

  lignesModifiees(): LigneNote[] {
    return this.lignes.filter(l => l.modifie);
  }

  onNoteChange(ligne: LigneNote): void {
    ligne.modifie = true;
  }

  onAbsentChange(ligne: LigneNote): void {
    if (ligne.absent) {
      ligne.valeur  = '';
      ligne.dispense = false;
    }
    ligne.modifie = true;
  }

  onDispenseChange(ligne: LigneNote): void {
    if (ligne.dispense) {
      ligne.valeur = '';
      ligne.absent = false;
    }
    ligne.modifie = true;
  }

  isNoteValide(ligne: LigneNote): boolean {
    if (ligne.valeur === '' || ligne.absent || ligne.dispense) return true;
    const v = Number(ligne.valeur);
    const max = this.state.selectedEvaluation()?.noteMax ?? 20;
    return !isNaN(v) && v >= 0 && v <= max;
  }

  reinitialiser(): void {
    this.buildLignes();
  }

  sauvegarder(): void {
    const evaluation = this.state.selectedEvaluation();
    if (!evaluation) return;
    const modifiees = this.lignesModifiees();
    if (!modifiees.length) return;

    const dto: SaisieNoteMasse = {
      evaluationId: evaluation.id,
      notes: modifiees.map(l => ({
        apprenantId: l.apprenantId,
        valeur:      l.absent || l.dispense ? null : (l.valeur === '' ? null : Number(l.valeur)),
        absent:      l.absent,
        dispense:    l.dispense,
        commentaire: l.commentaire || undefined,
      })),
    };

    this.state.saisirNotesMasse(dto, () => {
      this.lignes.forEach(l => l.modifie = false);
      this.snackBar.open('Notes sauvegardées', 'Fermer', { duration: 3000 });
    });
  }

  soumettreNotes(evaluationId: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Soumettre les notes',
        message: 'Soumettre les notes pour validation par le responsable pédagogique ?',
        confirmLabel: 'Soumettre', confirmColor: 'primary', icon: 'send',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.soumettreNotes(evaluationId, () =>
          this.snackBar.open('Notes soumises pour validation', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  validerNotes(evaluationId: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Valider les notes',
        message: 'Valider définitivement les notes ? Elles ne pourront plus être modifiées sans motif.',
        confirmLabel: 'Valider', confirmColor: 'primary', icon: 'check_circle',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.validerNotes({ evaluationId }, () =>
          this.snackBar.open('Notes validées', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  publierNotes(evaluationId: string): void {
    this.state.publierNotes(evaluationId, () =>
      this.snackBar.open('Notes publiées — visibles aux apprenants', 'Fermer', { duration: 4000 })
    );
  }

  openModifierNote(ligne: LigneNote): void {
    if (!ligne.noteId) return;
    const ref = this.dialog.open(ModifierNoteDialogComponent, {
      width: '440px',
      data: { ligne, noteMax: this.state.selectedEvaluation()?.noteMax ?? 20 },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateNote(ligne.noteId!, result, () => {
          this.snackBar.open('Note modifiée', 'Fermer', { duration: 3000 });
          this.buildLignes();
        });
      }
    });
  }

  typeLabel(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'CC', partiel: 'Partiel', examen_final: 'Examen final',
      tp: 'TP', oral: 'Oral', projet: 'Projet',
      devoir_maison: 'Devoir maison', rattrapage: 'Rattrapage',
    };
    return map[type] ?? type;
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours',
      cloturee: 'Clôturée', annulee: 'Annulée',
    };
    return map[s] ?? s;
  }

  noteStatutLabel(s: string): string {
    const map: Record<string, string> = {
      brouillon: 'Brouillon', soumise: 'Soumise',
      validee: 'Validée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }
}
