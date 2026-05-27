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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EnseignantStateService } from '../../services/enseignant-state.service';
import { EnseignantFormDialogComponent } from '../../components/enseignant-form-dialog/enseignant-form-dialog.component';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Enseignant, StatutEnseignant, TypeContrat } from '../../../../core/models/enseignant.models';

@Component({
  selector: 'app-enseignants-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    MatPaginatorModule, MatCardModule, MatDividerModule,
  ],
  templateUrl: './enseignants-list.component.html',
  styleUrl: './enseignants-list.component.scss',
})
export class EnseignantsListComponent implements OnInit {
  state = inject(EnseignantStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['enseignant', 'contrat', 'matieres', 'charge', 'statut', 'actions'];
  searchQuery   = '';
  filterStatut  = '';
  filterContrat = '';

  ngOnInit(): void {
    this.state.loadEnseignants();
    this.state.loadStats('');
  }

  onFilter(): void {
    this.state.loadEnseignants({
      search:       this.searchQuery   || undefined,
      statut:       (this.filterStatut  as StatutEnseignant) || undefined,
      typeContrat:  (this.filterContrat as TypeContrat)      || undefined,
      page: 1,
    });
  }

  onPageChange(e: PageEvent): void {
    this.state.loadEnseignants({ page: e.pageIndex + 1 });
  }

  statutLabel(s: StatutEnseignant): string {
    return { actif: 'Actif', inactif: 'Inactif', suspendu: 'Suspendu', retraite: 'Retraité' }[s] ?? s;
  }

  contratLabel(c: TypeContrat): string {
    const map: Record<TypeContrat, string> = {
      titulaire: 'Titulaire', vacataire: 'Vacataire',
      contractuel: 'Contractuel', fonctionnaire: 'Fonctionnaire', detache: 'Détaché',
    };
    return map[c] ?? c;
  }

  diplomeLabel(d: string): string {
    const map: Record<string, string> = {
      licence: 'Licence', master: 'Master', doctorat: 'Doctorat',
      bts: 'BTS', hdr: 'HDR', agregation: 'Agrégation', autre: 'Autre',
    };
    return map[d] ?? d;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EnseignantFormDialogComponent, { width: '680px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEnseignant(result, () =>
          this.snackBar.open('Enseignant créé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openEditDialog(e: Enseignant): void {
    const ref = this.dialog.open(EnseignantFormDialogComponent, {
      width: '680px', data: { enseignant: e },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEnseignant(e.id, result, () =>
          this.snackBar.open('Enseignant mis à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAffectationDialog(e: Enseignant): void {
    const ref = this.dialog.open(AffectationDialogComponent, {
      width: '580px',
      data: { enseignant: e },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.affecterMatiere(result, () =>
          this.snackBar.open('Matière affectée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  toggleStatut(e: Enseignant): void {
    const statut = e.statut === 'actif' ? 'inactif' : 'actif';
    this.state.updateEnseignant(e.id, { statut }, () =>
      this.snackBar.open(
        statut === 'actif' ? 'Enseignant réactivé' : 'Enseignant désactivé',
        'Fermer', { duration: 3000 }
      )
    );
  }

  confirmDelete(e: Enseignant): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'enseignant',
        message: `Supprimer "${e.prenom} ${e.nom}" ? Ses affectations seront supprimées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteEnseignant(e.id, () =>
        this.snackBar.open('Enseignant supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }
}
