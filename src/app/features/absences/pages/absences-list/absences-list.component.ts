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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { AbsenceStateService } from '../../services/absence-state.service';
import { JustificatifDialogComponent } from '../../components/justificatif-dialog/justificatif-dialog.component';
import { ValiderJustificatifDialogComponent } from '../../components/valider-justificatif-dialog/valider-justificatif-dialog.component';
import { Absence, StatutAbsence } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-absences-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatPaginatorModule,
    MatCardModule, MatTabsModule, MatBadgeModule,
  ],
  templateUrl: './absences-list.component.html',
  styleUrl: './absences-list.component.scss'
})
export class AbsencesListComponent implements OnInit {
  state = inject(AbsenceStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'seance', 'duree', 'statut', 'notification', 'actions'];
  searchQuery    = '';
  filterDateDebut = '';
  filterDateFin   = '';

  private tabStatuts: (StatutAbsence | undefined | 'examen')[] = [
    undefined, 'non_justifiee', 'en_attente', 'justifiee', 'examen',
  ];

  ngOnInit(): void {
    this.state.loadAbsences();
  }

  onTabChange(index: number): void {
    const statut = this.tabStatuts[index];
    if (statut === 'examen') {
      this.state.loadAbsences({ estExamen: true });
    } else {
      this.state.loadAbsences({ statut: statut as StatutAbsence | undefined });
    }
  }

  onFilter(): void {
    this.state.loadAbsences({
      dateDebut: this.filterDateDebut || undefined,
      dateFin:   this.filterDateFin   || undefined,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadAbsences({ page: e.pageIndex + 1 });
  }

  statutLabel(s: StatutAbsence): string {
    const map: Record<StatutAbsence, string> = {
      non_justifiee: 'Non justifiée',
      en_attente:    'En attente',
      justifiee:     'Justifiée',
      rejetee:       'Rejetée',
    };
    return map[s] ?? s;
  }

  notifierParent(absence: Absence): void {
    this.state.notifierParent(absence.id, () =>
      this.snackBar.open('Notification envoyée', 'Fermer', { duration: 3000 })
    );
  }

  ouvrirJustificatif(absence: Absence): void {
    const ref = this.dialog.open(JustificatifDialogComponent, {
      width: '520px', data: { absence },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.soumettreJustificatif(result, () =>
          this.snackBar.open('Justificatif soumis', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  ouvrirValidation(absence: Absence): void {
    const ref = this.dialog.open(ValiderJustificatifDialogComponent, {
      width: '480px', data: { absence },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.validerJustificatif(result, () => {
          const msg = result.statut === 'accepte'
            ? 'Justificatif accepté'
            : 'Justificatif rejeté';
          this.snackBar.open(msg, 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  voirJustificatif(url: string): void {
    window.open(url, '_blank');
  }

  goToJustificatifs(): void {
    this.state.loadAbsences({ statut: 'en_attente' });
  }
}
