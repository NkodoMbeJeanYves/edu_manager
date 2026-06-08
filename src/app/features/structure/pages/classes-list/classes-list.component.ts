import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { StructureStateService } from '../../services/structure-state.service';
import { ClasseFormDialogComponent } from '../../components/classe-form-dialog/classe-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Classe } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatDialogModule, MatSnackBarModule, PaginatorComponent,
    MatTooltipModule, MatMenuModule, MatDividerModule,
  ],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss'
})
export class ClassesListComponent implements OnInit {
  state = inject(StructureStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['code', 'prof', 'effectif', 'annee', 'statut', 'actions'];
  search       = '';
  filterStatut = '';

  ngOnInit(): void {
    const niveauId = this.route.snapshot.queryParamMap.get('niveauId');
    this.state.loadClasses({ niveauId: niveauId ?? undefined });
  }

  onFilter(): void {
    this.state.loadClasses({
      search:  this.search || undefined,
      statut:  (this.filterStatut as any) || undefined,
      page: 1,
    });
  }

  onPageChange(e: PaginatorChange): void {
    this.state.loadClasses({ page: e.pageIndex + 1 });
  }

  statutLabel(s: string): string {
    return { active: 'Active', archivee: 'Archivée', fermee: 'Fermée' }[s] ?? s;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ClasseFormDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createClasse(result, () =>
          this.snackBar.open('Classe créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openEditDialog(classe: Classe): void {
    const ref = this.dialog.open(ClasseFormDialogComponent, {
      width: '600px', data: { classe },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateClasse(classe.id, result, () =>
          this.snackBar.open('Classe mise à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  toggleArchiver(classe: Classe): void {
    const statut = classe.statut === 'active' ? 'archivee' : 'active';
    this.state.updateClasse(classe.id, { statut }, () =>
      this.snackBar.open(
        statut === 'archivee' ? 'Classe archivée' : 'Classe réactivée',
        'Fermer', { duration: 3000 }
      )
    );
  }

  confirmDelete(classe: Classe): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la classe',
        message: `Supprimer "${classe.libelle}" ? Les apprenants affectés seront désaffectés.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteClasse(classe.id, () =>
        this.snackBar.open('Classe supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }
}
