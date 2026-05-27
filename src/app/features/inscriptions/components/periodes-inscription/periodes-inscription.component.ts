import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InscriptionStateService } from '../../services/inscription-state.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PeriodeInscription } from '../../../../core/models/inscription.models';

@Component({
  selector: 'app-periodes-inscription',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule,
  ],
  templateUrl: './periodes-inscription.component.html',
  styleUrl: './periodes-inscription.component.scss'
})
export class PeriodesinscriptionComponent implements OnInit {
  @Input() etablissementId!: string;
  @Input() anneeAcademiqueId!: string;

  state    = inject(InscriptionStateService);
  private fb       = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog   = inject(MatDialog);

  showForm = false;

  form = this.fb.group({
    libelle:       ['', Validators.required],
    type:          ['nouvelle', Validators.required],
    dateOuverture: [null as Date | null, Validators.required],
    dateCloture:   [null as Date | null, Validators.required],
    capaciteMax:   [null as number | null],
  });

  ngOnInit(): void {
    if (this.etablissementId) {
      this.state.loadPeriodes(this.etablissementId);
    }
  }

  creerPeriode(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.state.createPeriode({
      ...this.form.value as any,
      etablissementId:   this.etablissementId,
      anneeAcademiqueId: this.anneeAcademiqueId,
    }, () => {
      this.snackBar.open('Période créée', 'Fermer', { duration: 3000 });
      this.form.reset({ type: 'nouvelle' });
      this.showForm = false;
    });
  }

  confirmerSuppression(periode: PeriodeInscription): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titre: 'Supprimer la période',
        message: `Supprimer "${periode.libelle}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.state.deletePeriode(periode.id);
        this.snackBar.open('Période supprimée', 'Fermer', { duration: 3000 });
      }
    });
  }
}
