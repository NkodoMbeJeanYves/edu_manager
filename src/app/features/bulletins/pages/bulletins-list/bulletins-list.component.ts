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
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { GenererBulletinsDialogComponent } from '../../components/generer-bulletins-dialog/generer-bulletins-dialog.component';
import { SignerDocumentDialogComponent } from '../../components/signer-document-dialog/signer-document-dialog.component';
import { AppreciationDialogComponent } from '../../components/appreciation-dialog/appreciation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Bulletin, StatutDocument } from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-bulletins-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatMenuModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDialogModule, MatSnackBarModule,
    PaginatorComponent, MatCardModule, MatTabsModule,
  ],
  templateUrl: './bulletins-list.component.html',
  styleUrl: './bulletins-list.component.scss'
})
export class BulletinsListComponent implements OnInit {
  state = inject(BulletinStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['apprenant', 'type', 'periode', 'resultat', 'decision', 'statut', 'actions'];
  searchApprenant = '';
  filterType = '';

  private tabStatuts: (StatutDocument | undefined)[] = [
    undefined, 'genere', 'valide', 'signe', 'publie',
  ];

  ngOnInit(): void {
    this.state.loadBulletins();
    this.state.loadStatsBulletins();
  }

  onTabChange(index: number): void {
    this.state.loadBulletins({ statut: this.tabStatuts[index] });
  }

  onFilter(): void {
    this.state.loadBulletins({
      type: (this.filterType as any) || undefined,
    });
  }

  onPageChange(e: PaginatorChange): void {
    this.state.loadBulletins({ page: e.pageIndex + 1 });
  }

  getMoyenneColor(m: number): string {
    if (m >= 14) return 'moyenne-success';
    if (m >= 10) return '';
    if (m >= 7)  return 'moyenne-warning';
    return 'moyenne-danger';
  }

  mentionLabel(mention: string): string {
    const map: Record<string, string> = {
      tres_bien: 'Très bien', bien: 'Bien', assez_bien: 'Assez bien',
      passable: 'Passable', insuffisant: 'Insuffisant',
    };
    return map[mention] ?? mention;
  }

  decisionLabel(decision: string): string {
    const map: Record<string, string> = {
      passage: 'Passage', redoublement: 'Redoublement',
      passage_conditionnel: 'Passage conditionnel',
      exclusion: 'Exclusion', felicitations: 'Félicitations',
      encouragements: 'Encouragements', mise_en_garde: 'Mise en garde',
      tableau_honneur: "Tableau d'honneur", admis: 'Admis',
      admis_rattrapage: 'Admis rattrapage', ajourne: 'Ajourné',
      redoublant: 'Redoublant', exclu: 'Exclu',
    };
    return map[decision] ?? decision;
  }

  statutLabel(statut: StatutDocument): string {
    const map: Record<StatutDocument, string> = {
      brouillon: 'Brouillon', genere: 'Généré', valide: 'Validé',
      signe: 'Signé', publie: 'Publié', archive: 'Archivé',
    };
    return map[statut] ?? statut;
  }

  openGenererDialog(): void {
    const ref = this.dialog.open(GenererBulletinsDialogComponent, { width: '560px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.genererBulletins(result, count => {
          this.snackBar.open(
            `${count} bulletin(s) généré(s) avec succès`,
            'Fermer', { duration: 4000 }
          );
          this.state.loadBulletins();
          this.state.loadStatsBulletins();
        });
      }
    });
  }

  valider(bulletin: Bulletin): void {
    this.state.validerBulletin(bulletin.id, {}, () =>
      this.snackBar.open('Bulletin validé', 'Fermer', { duration: 3000 })
    );
  }

  openSigner(bulletin: Bulletin): void {
    const ref = this.dialog.open(SignerDocumentDialogComponent, {
      width: '440px',
      data: { titre: 'Signer le bulletin', document: bulletin },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.signerBulletin(bulletin.id, result, () =>
          this.snackBar.open('Bulletin signé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openAppreciation(bulletin: Bulletin): void {
    const ref = this.dialog.open(AppreciationDialogComponent, {
      width: '520px',
      data: { bulletin },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.apprecerBulletin({
          apprenantId: bulletin.apprenantId,
          periodeId:   bulletin.periodeId,
          ...result,
        }, () =>
          this.snackBar.open('Appréciation enregistrée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  telecharger(bulletin: Bulletin): void {
    const nom = `Bulletin_${bulletin.apprenant?.nom}_${bulletin.periode?.libelle ?? ''}.pdf`;
    this.state.telechargerBulletin(bulletin.id, nom);
  }

  publierTous(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Publier tous les bulletins',
        message: 'Publier tous les bulletins signés ? Ils seront visibles par les apprenants et parents.',
        confirmLabel: 'Publier', confirmColor: 'primary', icon: 'publish',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        const periodeId = this.state.bulletins()[0]?.periodeId ?? '';
        this.state.publierBulletins(periodeId, undefined, count => {
          this.snackBar.open(
            `${count} bulletin(s) publié(s)`,
            'Fermer', { duration: 4000 }
          );
        });
      }
    });
  }
}
