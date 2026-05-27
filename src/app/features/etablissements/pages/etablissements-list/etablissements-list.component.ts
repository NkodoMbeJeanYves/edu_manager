import { Component, OnInit, inject, signal } from '@angular/core';
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
import { EtablissementStateService } from '../../services/etablissement-state.service';
import { Etablissement } from '../../../../core/models/etablissement.models';
import { EtablissementFormDialogComponent } from '../../components/etablissement-form-dialog/etablissement-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-etablissements-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule,
  ],
  templateUrl: './etablissements-list.component.html',
  styleUrl: './etablissements-list.component.scss'
})
export class EtablissementsListComponent implements OnInit {
  state = inject(EtablissementStateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nom', 'type', 'contact', 'statut', 'actions'];
  searchQuery = '';
  filterType = '';
  filterActif: boolean | null = null;

  ngOnInit(): void {
    this.state.loadEtablissements();
  }

  onSearch(): void {
    this.state.loadEtablissements({ search: this.searchQuery, type: this.filterType || undefined });
  }

  onFilter(): void {
    this.state.loadEtablissements({
      search: this.searchQuery || undefined,
      type: this.filterType || undefined,
      actif: this.filterActif ?? undefined,
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(EtablissementFormDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createEtablissement(result, () => {
          this.snackBar.open('Établissement créé avec succès', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openEditDialog(etablissement: Etablissement): void {
    const ref = this.dialog.open(EtablissementFormDialogComponent, {
      width: '600px',
      data: { etablissement }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEtablissement(etablissement.id, result, () => {
          this.snackBar.open('Établissement mis à jour', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  toggleActif(etablissement: Etablissement): void {
    this.state.updateEtablissement(etablissement.id, { actif: !etablissement.actif }, () => {
      this.snackBar.open(
        etablissement.actif ? 'Établissement désactivé' : 'Établissement activé',
        'Fermer', { duration: 3000 }
      );
    });
  }

  confirmDelete(etablissement: Etablissement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'établissement',
        message: `Êtes-vous sûr de vouloir supprimer "${etablissement.nom}" ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.state.deleteEtablissement(etablissement.id, () => {
          this.snackBar.open('Établissement supprimé', 'Fermer', { duration: 3000 });
        });
      }
    });
  }
}
