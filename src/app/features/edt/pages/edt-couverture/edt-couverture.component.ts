import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EdtStateService } from '../../services/edt-state.service';

@Component({
  selector: 'app-edt-couverture',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatCardModule, MatChipsModule, MatTooltipModule,
  ],
  templateUrl: './edt-couverture.component.html',
  styleUrl: './edt-couverture.component.scss'
})
export class EdtCouvertureComponent implements OnInit {
  state    = inject(EdtStateService);
  classeId = '';
  periodeId = '';

  ngOnInit(): void {}

  onFilter(): void {
    if (this.classeId.length > 5) {
      this.state.loadCouverture(this.classeId, this.periodeId || undefined);
    }
  }
}
