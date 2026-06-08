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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NoteStateService } from '../../services/note-state.service';
import { EvaluationFormDialogComponent } from '../../components/evaluation-form-dialog/evaluation-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Evaluation, TypeEvaluation, StatutEvaluation } from '../../../../core/models/note.models';

@Component({
  selector: 'app-evaluations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, PaginatorComponent,
    MatCardModule, MatProgressBarModule, MatDividerModule,
  ],
  templateUrl: './evaluations-list.component.html',
  styleUrl: './evaluations-list.component.scss'
})
export class EvaluationsListComponent implements OnInit {
  state = inject(NoteStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['evaluation', 'type', 'ponderation', 'groupe', 'progression', 'statut', 'actions'];
  searchQuery  = '';
  filterType   = '';
  filterStatut = '';

  ngOnInit(): void {
    this.state.loadEvaluations();
  }

  onFilter(): void {
    this.state.loadEvaluations({
      type:   (this.filterType   as TypeEvaluation)   || undefined,
      statut: (this.filterStatut as StatutEvaluation) || undefined,
      page: 1,
    });
  }

  onPageChange(e: PaginatorChange): void {
    this.state.loadEvaluations({ ...this.state.currentFilters(), page: e.pageIndex + 1 });
  }

  typeLabel(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'CC', partiel: 'Partiel', examen_final: 'Examen final',
      tp: 'TP', oral: 'Oral', projet: 'Projet',
      devoir_maison: 'Devoir maison', rattrapage: 'Rattrapage',
    };
    return map[type] ?? type;
  }

  typeIcon(type: TypeEvaluation): string {
    const map: Record<TypeEvaluation, string> = {
      cc: 'quiz', partiel: 'description', examen_final: 'assignment_turned_in',
      tp: 'science', oral: 'record_voice_over', projet: 'work',
      devoir_maison: 'home', rattrapage: 'replay',
    };
    return map[type] ?? 'edit';
  }

  statutLabel(statut: StatutEvaluation): string {
    const map: Record<StatutEvaluation, string> = {
      planifiee: 'Planifiée', en_cours: 'En cours',
      cloturee: 'Clôturée', annulee: 'Annulée',
    };
    return map[statut] ?? statut;
  }

  progressColor(e: Evaluation): 'primary' | 'warn' | 'accent' {
    if (!e.totalApprenants) return 'primary';
    const pct = ((e.noteSaisieCount ?? 0) / e.totalApprenants) * 100;
    if (pct === 100) return 'accent';
    if (pct >= 50)   return 'primary';
    return 'warn';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EvaluationFormDialogComponent, { width: '640px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEvaluation(result, () => {
          this.snackBar.open('Évaluation créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openEditDialog(evaluation: Evaluation): void {
    const ref = this.dialog.open(EvaluationFormDialogComponent, {
      width: '640px', data: { evaluation },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEvaluation(evaluation.id, result, () => {
          this.snackBar.open('Évaluation mise à jour', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  cloturer(evaluation: Evaluation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Clôturer l\'évaluation',
        message: `Clôturer "${evaluation.intitule}" ? Les notes ne pourront plus être modifiées sans motif.`,
        confirmLabel: 'Clôturer', confirmColor: 'primary', icon: 'lock',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.updateEvaluation(evaluation.id, { statut: 'cloturee' }, () =>
          this.snackBar.open('Évaluation clôturée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDelete(evaluation: Evaluation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'évaluation',
        message: `Supprimer "${evaluation.intitule}" et toutes ses notes ? Action irréversible.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deleteEvaluation(evaluation.id, () =>
          this.snackBar.open('Évaluation supprimée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
