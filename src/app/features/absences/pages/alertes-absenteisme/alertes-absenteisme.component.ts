import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { AbsenceStateService } from '../../services/absence-state.service';
import { StatsAbsenteisme } from '../../../../core/models/absence.models';

@Component({
  selector: 'app-alertes-absenteisme',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatTooltipModule, MatTableModule,
  ],
  templateUrl: './alertes-absenteisme.component.html',
  styleUrl: './alertes-absenteisme.component.scss'
})
export class AlertesAbsenteismeComponent implements OnInit {
  state    = inject(AbsenceStateService);
  private snackBar = inject(MatSnackBar);

  nouveauSeuil = 10;
  cols = ['apprenant', 'heuresTotal', 'heuresInjust', 'taux', 'examens', 'actions'];

  ngOnInit(): void {
    this.nouveauSeuil = this.state.seuil();
  }

  getTauxClass(taux: number): string {
    if (taux > 30) return 'taux-danger';
    if (taux > 15) return 'taux-warn';
    return 'taux-ok';
  }

  updateSeuil(): void {
    const params = this.state.parametres();
    if (!params) return;
    this.state.updateParametres(params.etablissementId, {
      seuilAlerte: this.nouveauSeuil,
    }, () =>
      this.snackBar.open('Seuil mis à jour', 'Fermer', { duration: 3000 })
    );
  }
}
