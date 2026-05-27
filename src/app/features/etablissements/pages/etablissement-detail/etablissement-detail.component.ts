import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EtablissementStateService } from '../../services/etablissement-state.service';
import { EtablissementFormDialogComponent } from '../../components/etablissement-form-dialog/etablissement-form-dialog.component';
import { CampusFormDialogComponent } from '../../components/campus-form-dialog/campus-form-dialog.component';
import { AnneeAcademiqueFormDialogComponent } from '../../components/annee-academique-form-dialog/annee-academique-form-dialog.component';
import { SalleFormDialogComponent } from '../../components/salle-form-dialog/salle-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AnneeAcademique, Campus, Salle } from '../../../../core/models/etablissement.models';

@Component({
  selector: 'app-etablissement-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTabsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatProgressSpinnerModule, MatDialogModule,
    MatSnackBarModule, MatTableModule, MatMenuModule, MatTooltipModule,
  ],
  templateUrl: './etablissement-detail.component.html',
  styleUrl: './etablissement-detail.component.scss'
})
export class EtablissementDetailComponent implements OnInit {
  state  = inject(EtablissementStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  anneeColumns = ['libelle', 'periode', 'dates', 'statut', 'actions'];
  salleColumns = ['code', 'nom', 'type', 'capacite', 'statut', 'actions'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectEtablissement(id);
    this.state.loadCampus(id);
    this.state.loadAnneesAcademiques(id);
    this.state.loadSalles({});
  }

  openEditDialog(): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(EtablissementFormDialogComponent, {
      width: '600px',
      data: { etablissement: etab },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.updateEtablissement(etab.id, result, () =>
          this.snackBar.open('Établissement mis à jour', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openCampusDialog(campus?: Campus): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(CampusFormDialogComponent, {
      width: '520px',
      data: { campus, etablissementId: etab.id },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (campus) {
        this.state.updateCampus(campus.id, result, () =>
          this.snackBar.open('Campus mis à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createCampus({ ...result, etablissementId: etab.id }, () =>
          this.snackBar.open('Campus ajouté', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAnneeDialog(annee?: AnneeAcademique): void {
    const etab = this.state.selectedEtablissement();
    if (!etab) return;
    const ref = this.dialog.open(AnneeAcademiqueFormDialogComponent, {
      width: '520px',
      data: { annee, etablissementId: etab.id },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (annee) {
        this.state.updateAnneeAcademique(annee.id, result, () =>
          this.snackBar.open('Année mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createAnneeAcademique({ ...result, etablissementId: etab.id }, () =>
          this.snackBar.open('Année académique créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openSalleDialog(salle?: Salle): void {
    const ref = this.dialog.open(SalleFormDialogComponent, {
      width: '560px',
      data: { salle, campus: this.state.campus() },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (salle) {
        this.state.updateSalle(salle.id, result, () =>
          this.snackBar.open('Salle mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createSalle(result, () =>
          this.snackBar.open('Salle créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDeleteCampus(campus: Campus): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer le campus',
        message: `Supprimer "${campus.nom}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deleteCampus(campus.id, () =>
          this.snackBar.open('Campus supprimé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  confirmDeleteSalle(salle: Salle): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la salle',
        message: `Supprimer "${salle.nom}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteSalle(salle.id);
    });
  }
}
