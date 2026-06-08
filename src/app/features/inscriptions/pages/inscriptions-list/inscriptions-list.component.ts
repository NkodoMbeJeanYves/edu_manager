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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { InscriptionFormDialogComponent } from '../../components/inscription-form-dialog/inscription-form-dialog.component';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { RejeterDialogComponent } from '../../components/rejeter-dialog/rejeter-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Inscription, StatutInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-inscriptions-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, PaginatorComponent,
    MatCardModule, MatTabsModule, MatDividerModule,
  ],
  templateUrl: './inscriptions-list.component.html',
  styleUrl: './inscriptions-list.component.scss'
})
export class InscriptionsListComponent implements OnInit {
  state = inject(InscriptionStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'type', 'affectation', 'date', 'frais', 'statut', 'actions'];
  searchQuery  = '';
  filterType   = '';
  filterFrais: boolean | null = null;

  private tabStatuts: (StatutInscription | undefined)[] = [
    undefined,
    'en_validation',
    'validee',
    'rejetee',
    'en_attente',
  ];

  ngOnInit(): void {
    this.state.load();
    this.state.loadStats();
  }

  onSearch(): void {
    this.state.load({ search: this.searchQuery || undefined, page: 1 });
  }

  onFilter(): void {
    this.state.load({
      search:     this.searchQuery || undefined,
      type:       (this.filterType as any) || undefined,
      fraisPayes: this.filterFrais ?? undefined,
      page: 1,
    });
  }

  onTabChange(index: number): void {
    const statut = this.tabStatuts[index];
    const listAttente = index === 4 ? true : undefined;
    this.state.load({
      statut,
      listAttente,
      search: this.searchQuery || undefined,
      page: 1,
    });
  }

  onPageChange(e: PaginatorChange): void {
    this.state.loadPage(e.pageIndex + 1);
  }

  statutLabel(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      brouillon: 'Brouillon', incomplete: 'Incomplète', complete: 'Complète',
      en_validation: 'En validation', validee: 'Validée', rejetee: 'Rejetée',
      annulee: 'Annulée', en_attente: 'Liste d\'attente',
    };
    return map[statut] ?? statut;
  }

  peutAffecter(i: Inscription): boolean {
    return i.statut === 'validee' && !i.classeLibelle && !i.promotionLibelle;
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }

  openCreateDialog(type: 'nouvelle' | 'reinscription'): void {
    const ref = this.dialog.open(InscriptionFormDialogComponent, {
      width: '700px', data: { type },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.create(result, () => {
          this.snackBar.open('Inscription créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openAffectation(inscription: Inscription): void {
    const ref = this.dialog.open(AffectationDialogComponent, {
      width: '520px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.affecterClasse(
          { inscriptionId: inscription.id, ...result },
          () => this.snackBar.open('Affectation enregistrée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  valider(inscription: Inscription): void {
    this.state.valider(inscription.id, {}, () =>
      this.snackBar.open('Inscription validée', 'Fermer', { duration: 3000 })
    );
  }

  openRejeter(inscription: Inscription): void {
    const ref = this.dialog.open(RejeterDialogComponent, {
      width: '440px', data: { inscription },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.rejeter(inscription.id, result, () =>
          this.snackBar.open('Inscription rejetée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  soumettre(inscription: Inscription): void {
    this.state.soumettre(inscription.id, () =>
      this.snackBar.open('Dossier soumis pour validation', 'Fermer', { duration: 3000 })
    );
  }

  confirmerAnnulation(inscription: Inscription): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Annuler l\'inscription',
        message: `Annuler l'inscription de "${inscription.apprenant?.prenom} ${inscription.apprenant?.nom}" ? Cette action est irréversible.`,
        confirmLabel: 'Annuler l\'inscription',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.annuler(inscription.id, 'Annulation manuelle', () =>
          this.snackBar.open('Inscription annulée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
