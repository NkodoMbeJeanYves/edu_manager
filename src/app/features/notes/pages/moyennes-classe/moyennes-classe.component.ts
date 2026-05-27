import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteStateService } from '../../services/note-state.service';
import { MoyenneGenerale } from '../../../../core/models/note.models';

@Component({
  selector: 'app-moyennes-classe',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatChipsModule, MatCardModule, MatTooltipModule,
  ],
  templateUrl: './moyennes-classe.component.html',
  styleUrl: './moyennes-classe.component.scss'
})
export class MoyennesClasseComponent implements OnInit {
  state    = inject(NoteStateService);
  private snackBar = inject(MatSnackBar);

  classeId = '';
  periodeId = '';

  ngOnInit(): void {}

  onClasseChange(): void {
    if (this.classeId && this.periodeId) {
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    }
  }

  onPeriodeChange(): void {
    if (this.classeId && this.periodeId) {
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    }
  }

  calculerMoyennes(): void {
    if (!this.periodeId) return;
    this.state.calculerMoyennes(this.periodeId, this.classeId || undefined, () => {
      this.snackBar.open('Moyennes calculées', 'Fermer', { duration: 3000 });
      this.state.loadMoyennesClasse(this.classeId, this.periodeId);
    });
  }

  moyenneClasse(): number {
    const moyennes = this.state.moyennesClasse()
      .map(m => m.moyenne)
      .filter((m): m is number => m !== null);
    if (!moyennes.length) return 0;
    return moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
  }

  tauxReussite(): number {
    const total = this.state.moyennesClasse().length;
    if (!total) return 0;
    const reussis = this.state.moyennesClasse()
      .filter(m => (m.moyenne ?? 0) >= 10).length;
    return Math.round((reussis / total) * 100);
  }

  colonnesMatieres(): string[] {
    const first = this.state.moyennesClasse()[0];
    if (!first?.moyennesMatiere) return [];
    return first.moyennesMatiere.map(mm => mm.matiereLibelle);
  }

  getMoyMatiere(moy: MoyenneGenerale, matiereLibelle: string): number | null {
    return moy.moyennesMatiere?.find(mm => mm.matiereLibelle === matiereLibelle)?.moyenne ?? null;
  }

  abrev(libelle: string): string {
    return libelle.length > 8 ? libelle.substring(0, 6) + '…' : libelle;
  }

  getNoteColor(note: number | null | undefined): string {
    if (note === null || note === undefined) return '';
    if (note >= 14) return 'note-success';
    if (note >= 10) return '';
    if (note >= 7)  return 'note-warning';
    return 'note-danger';
  }
}
