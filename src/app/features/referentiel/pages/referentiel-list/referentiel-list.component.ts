import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
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
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ReferentielStateService } from '../../services/referentiel-state.service';
import { MatiereFormDialogComponent } from '../../components/matiere-form-dialog/matiere-form-dialog.component';
import { UEFormDialogComponent } from '../../components/ue-form-dialog/ue-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Matiere, UE, TypeMatiere } from '../../../../core/models/referentiel.models';

@Component({
  selector: 'app-referentiel-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    PaginatorComponent, MatCardModule, MatSlideToggleModule, MatDividerModule,
  ],
  templateUrl: './referentiel-list.component.html',
  styleUrl: './referentiel-list.component.scss'
})
export class ReferentielListComponent implements OnInit {
  state = inject(ReferentielStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  colsMatieres = ['code', 'type', 'coefficient', 'volume', 'ponderation', 'flags', 'actions'];
  searchMatiere      = '';
  filterTypeMat      = '';
  filterEliminatoire = false;
  searchUE           = '';
  filterSemestre     = '';
  filterTypeUE       = '';

  ngOnInit(): void {
    this.state.loadMatieres();
    this.state.loadUEs();
  }

  onFilterMatieres(): void {
    this.state.loadMatieres({
      search:       this.searchMatiere || undefined,
      type:         (this.filterTypeMat as any) || undefined,
      eliminatoire: this.filterEliminatoire || undefined,
      page: 1,
    });
  }

  onFilterUE(): void {
    this.state.loadUEs({
      search:   this.searchUE || undefined,
      semestre: this.filterSemestre ? Number(this.filterSemestre) : undefined,
      type:     (this.filterTypeUE as any) || undefined,
      page: 1,
    });
  }

  onPageMatieres(e: PaginatorChange): void {
    this.state.loadMatieres({ page: e.pageIndex + 1 });
  }

  semestresDisponibles(): number[] {
    return [...new Set(this.state.ues().map(u => u.semestre))].sort((a, b) => a - b);
  }

  totalCreditsSemestre(semestre: number): number {
    return this.state.uesBySemestre(semestre)()
      .reduce((sum, u) => sum + u.credits, 0);
  }

  typeMatLabel(type: TypeMatiere): string {
    const map: Record<TypeMatiere, string> = {
      cours_magistral: 'CM', td: 'TD', tp: 'TP',
      projet: 'Projet', stage: 'Stage', memoire: 'Mémoire',
      seminaire: 'Séminaire', sport: 'Sport', langue: 'Langue',
    };
    return map[type] ?? type;
  }

  ueTypeLabel(type: string): string {
    const map: Record<string, string> = {
      fondamentale: 'Fondamentale', complementaire: 'Complémentaire',
      optionnelle: 'Optionnelle', libre: 'Libre',
    };
    return map[type] ?? type;
  }

  openMatiereDialog(matiere?: Matiere): void {
    const ref = this.dialog.open(MatiereFormDialogComponent, {
      width: '680px',
      data: { matiere },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (matiere) {
        this.state.updateMatiere(matiere.id, result, () =>
          this.snackBar.open('Matière mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createMatiere(result, () => {
          this.snackBar.open('Matière créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }

  openUEDialog(ue?: UE): void {
    const ref = this.dialog.open(UEFormDialogComponent, {
      width: '640px',
      data: { ue },
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (ue) {
        this.state.updateUE(ue.id, result, () =>
          this.snackBar.open('UE mise à jour', 'Fermer', { duration: 3000 })
        );
      } else {
        this.state.createUE(result, () =>
          this.snackBar.open('UE créée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  selectUEDetail(ue: UE): void {
    this.state.selectUE(ue.id);
  }

  toggleActifMatiere(m: Matiere): void {
    this.state.updateMatiere(m.id, { actif: !m.actif }, () =>
      this.snackBar.open(m.actif ? 'Matière désactivée' : 'Matière activée',
        'Fermer', { duration: 3000 })
    );
  }

  detacherUE(m: Matiere): void {
    this.state.detacherMatiereUE(m.id, () =>
      this.snackBar.open('Matière détachée de l\'UE', 'Fermer', { duration: 3000 })
    );
  }

  confirmDeleteMatiere(m: Matiere): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la matière',
        message: `Supprimer "${m.libelle}" ? Les évaluations liées seront impactées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteMatiere(m.id, () =>
        this.snackBar.open('Matière supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  confirmDeleteUE(ue: UE): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer l\'UE',
        message: `Supprimer "${ue.libelle}" (${ue.credits} ECTS) ? Les matières rattachées seront détachées.`,
        confirmLabel: 'Supprimer', confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.state.deleteUE(ue.id, () =>
        this.snackBar.open('UE supprimée', 'Fermer', { duration: 3000 })
      );
    });
  }

  openDupliquerDialog(): void {
    this.snackBar.open('Dialog de duplication — à implémenter via DupliquerReferentielDialog', 'OK', { duration: 4000 });
  }
}
