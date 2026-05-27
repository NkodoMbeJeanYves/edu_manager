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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BulletinStateService } from '../../services/bulletin-state.service';
import { CreateDeliberationDialogComponent } from '../../components/create-deliberation-dialog/create-deliberation-dialog.component';

@Component({
  selector: 'app-deliberations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './deliberations-list.component.html',
  styleUrl: './deliberations-list.component.scss'
})
export class DeliberationsListComponent implements OnInit {
  state = inject(BulletinStateService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  cols = ['classe', 'type', 'session', 'date', 'president', 'statut', 'actions'];

  ngOnInit(): void {
    this.state.loadDeliberations();
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      preparation: 'En préparation', en_cours: 'En cours',
      terminee: 'Terminée', signee: 'Signée', publiee: 'Publiée',
    };
    return map[s] ?? s;
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateDeliberationDialogComponent, { width: '580px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.state.createDeliberation(result, () => {
          this.snackBar.open('Délibération créée', 'Fermer', { duration: 3000 });
        });
      }
    });
  }
}
