import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { StructureStateService } from '../../services/structure-state.service';
import { CycleFormDialogComponent } from '../../components/cycle-form-dialog/cycle-form-dialog.component';
import { FiliereFormDialogComponent } from '../../components/filiere-form-dialog/filiere-form-dialog.component';
import { NiveauFormDialogComponent } from '../../components/niveau-form-dialog/niveau-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EtablissementStateService } from '../../../etablissements/services/etablissement-state.service';
import { Cycle, Filiere, Niveau } from '../../../../core/models/structure.models';

@Component({
  selector: 'app-structure-tree',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatCardModule, MatTooltipModule, MatMenuModule, MatExpansionModule,
  ],
  templateUrl: './structure-tree.component.html',
  styleUrl: './structure-tree.component.scss'
})
export class StructureTreeComponent implements OnInit {
  state                      = inject(StructureStateService);
  private etablissementState = inject(EtablissementStateService);
  private dialog             = inject(MatDialog);
  private snackBar           = inject(MatSnackBar);

  expandedCycles = new Set<string>();

  ngOnInit(): void {
    const etab = this.etablissementState.selectedEtablissement();
    if (etab) {
      this.state.loadCycles(etab.id);
      this.state.loadFilieres(etab.id);
      this.state.loadStats(etab.id);
    }
  }

  onCycleOpen(cycle: Cycle): void {
    this.expandedCycles.add(cycle.id);
    this.state.loadFilieres(undefined, cycle.id);
    this.state.filieresByCycle(cycle.id)().forEach(f => {
      this.state.loadNiveaux(f.id);
    });
  }

  cyclTypeLabel(type: string): string {
    const map: Record<string, string> = {
      primaire: 'Primaire', secondaire: 'Secondaire', superieur: 'Supérieur',
    };
    return map[type] ?? type;
  }

  openCycleDialog(cycle?: Cycle, forceType?: string): void {
    const ref = this.dialog.open(CycleFormDialogComponent, {
      width: '520px',
      data: { cycle, etablissementId: this.etablissementState.selectedEtablissement()?.id, forceType },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (cycle) {
        this.state.updateCycle(cycle.id, result, () =>
          this.snackBar.open('Cycle mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createCycle(result, () =>
          this.snackBar.open('Cycle créé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openFiliereDialog(cycleId: string, typeFormation: string, filiere?: Filiere): void {
    const ref = this.dialog.open(FiliereFormDialogComponent, {
      width: '520px',
      data: {
        filiere,
        cycleId,
        etablissementId: this.etablissementState.selectedEtablissement()?.id,
        typeFormation,
      },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (filiere) {
        this.state.updateFiliere(filiere.id, result, () =>
          this.snackBar.open('Filière mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createFiliere(result, () => {
          this.snackBar.open('Filière créée', 'Fermer', { duration: 3000 });
          this.state.loadFilieres(undefined, cycleId);
        });
      }
    });
  }

  openNiveauDialog(filiere: Filiere, niveau?: Niveau): void {
    const ref = this.dialog.open(NiveauFormDialogComponent, {
      width: '480px',
      data: { niveau, filiere },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (niveau) {
        this.state.updateNiveau(niveau.id, result, () =>
          this.snackBar.open('Niveau mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createNiveau({ ...result, filiereId: filiere.id }, () => {
          this.snackBar.open('Niveau créé', 'Fermer', { duration: 3000 });
          this.state.loadNiveaux(filiere.id);
        });
      }
    });
  }

  confirmDeleteCycle(cycle: Cycle): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le cycle',
        message: `Supprimer "${cycle.libelle}" et toutes ses filières/niveaux ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteCycle(cycle.id, () =>
        this.snackBar.open('Cycle supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteFiliere(filiere: Filiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la filière',
        message: `Supprimer "${filiere.libelle}" et tous ses niveaux ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteFiliere(filiere.id, () =>
        this.snackBar.open('Filière supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteNiveau(niveau: Niveau): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le niveau',
        message: `Supprimer "${niveau.libelle}" ?`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteNiveau(niveau.id, () =>
        this.snackBar.open('Niveau supprimé', 'Fermer', { duration: 3000 })
      );
    });
  }
}
