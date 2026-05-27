import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { AffectationDialogComponent } from '../../components/affectation-dialog/affectation-dialog.component';
import { RejeterDialogComponent } from '../../components/rejeter-dialog/rejeter-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatutInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatDividerModule,
    MatListModule, MatStepperModule, MatTooltipModule,
  ],
  templateUrl: './inscription-detail.component.html',
  styleUrl: './inscription-detail.component.scss'
})
export class InscriptionDetailComponent implements OnInit {
  state = inject(InscriptionStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.select(id);
    this.state.loadHistorique(id);
  }

  statutLabel(statut: StatutInscription): string {
    const map: Record<StatutInscription, string> = {
      brouillon: 'Brouillon', incomplete: 'Incomplète', complete: 'Complète',
      en_validation: 'En validation', validee: 'Validée', rejetee: 'Rejetée',
      annulee: 'Annulée', en_attente: 'Liste d\'attente',
    };
    return map[statut] ?? statut;
  }

  getStepIndex(statut: StatutInscription): number {
    const steps: Record<StatutInscription, number> = {
      brouillon: 0, incomplete: 0, complete: 1,
      en_validation: 2, validee: 3, rejetee: 2,
      annulee: 0, en_attente: 1,
    };
    return steps[statut] ?? 0;
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }

  valider(id: string): void {
    this.state.valider(id, {}, () =>
      this.snackBar.open('Inscription validée', 'Fermer', { duration: 3000 })
    );
  }

  openRejeter(): void {
    const inscription = this.state.selected();
    if (!inscription) return;
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

  openAffectation(): void {
    const inscription = this.state.selected();
    if (!inscription) return;
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

  soumettre(id: string): void {
    this.state.soumettre(id, () =>
      this.snackBar.open('Dossier soumis pour validation', 'Fermer', { duration: 3000 })
    );
  }
}
