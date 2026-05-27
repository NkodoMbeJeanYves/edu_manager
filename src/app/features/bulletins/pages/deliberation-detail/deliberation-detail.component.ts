import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { SignerDocumentDialogComponent } from '../../components/signer-document-dialog/signer-document-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  LigneDeliberation, MentionGenerale,
} from '../../../../core/models/bulletin.models';

@Component({
  selector: 'app-deliberation-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, MatDividerModule, MatMenuModule,
  ],
  templateUrl: './deliberation-detail.component.html',
  styleUrl: './deliberation-detail.component.scss'
})
export class DeliberationDetailComponent implements OnInit {
  state = inject(BulletinStateService);
  private route    = inject(ActivatedRoute);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.state.selectDeliberation(id);
  }

  getDecisionOptions(type: string) {
    if (type === 'jury_universitaire') {
      return [
        { value: 'admis',             label: 'Admis' },
        { value: 'admis_rattrapage',  label: 'Admis — Rattrapage' },
        { value: 'ajourne',           label: 'Ajourné' },
        { value: 'redoublant',        label: 'Redoublant' },
        { value: 'exclu',             label: 'Exclu' },
        { value: 'dispense',          label: 'Dispensé' },
        { value: 'en_attente',        label: 'En attente' },
      ];
    }
    return [
      { value: 'passage',             label: 'Passage' },
      { value: 'passage_conditionnel', label: 'Passage conditionnel' },
      { value: 'redoublement',        label: 'Redoublement' },
      { value: 'felicitations',       label: 'Félicitations' },
      { value: 'encouragements',      label: 'Encouragements' },
      { value: 'mise_en_garde',       label: 'Mise en garde' },
      { value: 'tableau_honneur',     label: "Tableau d'honneur" },
      { value: 'exclusion',           label: 'Exclusion' },
    ];
  }

  getLigneClass(ligne: LigneDeliberation): string {
    const map: Record<string, string> = {
      admis: 'ligne-admis', passage: 'ligne-admis',
      admis_rattrapage: 'ligne-ajourne', ajourne: 'ligne-ajourne',
      redoublant: 'ligne-redoublant', redoublement: 'ligne-redoublant',
      exclu: 'ligne-exclu', exclusion: 'ligne-exclu',
    };
    return map[ligne.decision ?? ''] ?? '';
  }

  getMoyColor(moy: number | null): string {
    if (moy === null) return '';
    if (moy >= 14) return 'moy-success';
    if (moy >= 10) return '';
    if (moy >= 7)  return 'moy-warning';
    return 'moy-danger';
  }

  decisionLabel(d: string): string {
    const map: Record<string, string> = {
      admis: 'Admis', passage: 'Passage',
      admis_rattrapage: 'Rattrapage', ajourne: 'Ajourné',
      redoublant: 'Redoublant', redoublement: 'Redoublement',
      exclu: 'Exclu', exclusion: 'Exclusion',
      dispense: 'Dispensé', en_attente: 'En attente',
      felicitations: 'Félicitations', encouragements: 'Encouragements',
      mise_en_garde: 'Mise en garde', tableau_honneur: "Tableau d'honneur",
      passage_conditionnel: 'Passage conditionnel',
    };
    return map[d] ?? d;
  }

  mentionLabel(m: string): string {
    const map: Record<string, string> = {
      tres_bien: 'Très bien', bien: 'Bien', assez_bien: 'Assez bien',
      passable: 'Passable', insuffisant: 'Insuffisant',
    };
    return map[m] ?? m;
  }

  casLabel(cas: string): string {
    const map: Record<string, string> = {
      fraude: 'Fraude', dispense: 'Dispensé',
      vae: 'VAE', eliminatoire: 'Éliminatoire',
    };
    return map[cas] ?? cas;
  }

  statutDelibLabel(s: string): string {
    const map: Record<string, string> = {
      preparation: 'En préparation', en_cours: 'En cours',
      terminee: 'Terminée', signee: 'Signée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }

  onDecisionChange(deliberationId: string, ligne: LigneDeliberation, decision: string): void {
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: decision as any,
      mention: ligne.mention,
      commentaire: ligne.commentaire,
    });
  }

  onMentionChange(deliberationId: string, ligne: LigneDeliberation, mention: string): void {
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: ligne.decision as any,
      mention: (mention || undefined) as MentionGenerale | undefined,
    });
  }

  onCommentaireChange(deliberationId: string, ligne: LigneDeliberation, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.state.updateDecision(deliberationId, {
      apprenantId: ligne.apprenantId,
      decision: ligne.decision as any,
      commentaire: val || undefined,
    });
  }

  preparer(id: string): void {
    this.state.preparerDeliberation(id, () =>
      this.snackBar.open('Délibération préparée — décisions calculées', 'Fermer', { duration: 3000 })
    );
  }

  appliquerCompensation(id: string): void {
    this.state.appliquerCompensation(id, () =>
      this.snackBar.open('Compensation inter-UE appliquée', 'Fermer', { duration: 3000 })
    );
  }

  cloturer(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Clôturer la délibération',
        message: 'Clôturer la délibération ? Les décisions ne pourront plus être modifiées.',
        confirmLabel: 'Clôturer', confirmColor: 'primary', icon: 'lock',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.cloturerDeliberation(id, () =>
          this.snackBar.open('Délibération clôturée', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  openSigner(id: string): void {
    const ref = this.dialog.open(SignerDocumentDialogComponent, {
      width: '440px',
      data: { titre: 'Signer le PV de délibération' },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.signerDeliberation(id, result, () =>
          this.snackBar.open('PV signé', 'Fermer', { duration: 3000 })
        );
      }
    });
  }

  publier(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Publier les résultats',
        message: 'Publier les résultats sur les portails apprenants ? Action visible immédiatement.',
        confirmLabel: 'Publier', confirmColor: 'accent', icon: 'publish',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.publierDeliberation(id, () =>
          this.snackBar.open('Résultats publiés', 'Fermer', { duration: 3000 })
        );
      }
    });
  }
}
