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
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-button routerLink="/edt" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Couverture du programme</h1>
        </div>
        <div class="header-filters">
          <mat-form-field appearance="outline">
            <mat-label>Classe / Promotion (ID)</mat-label>
            <input matInput [(ngModel)]="classeId"
                   (ngModelChange)="onFilter()"
                   placeholder="Sélectionner...">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Période (ID)</mat-label>
            <input matInput [(ngModel)]="periodeId"
                   (ngModelChange)="onFilter()">
          </mat-form-field>
        </div>
      </div>

      @if (state.stats(); as stats) {
        <div class="global-stats">
          <mat-card class="gstat-card">
            <div class="gstat-v">{{ stats.volumeHorairePlanifie }}h</div>
            <div class="gstat-l">Volume planifié</div>
          </mat-card>
          <mat-card class="gstat-card">
            <div class="gstat-v">{{ stats.volumeHoraireRealise }}h</div>
            <div class="gstat-l">Réalisé</div>
          </mat-card>
          <mat-card class="gstat-card" [class.gstat-warn]="stats.tauxCouverture < 50">
            <div class="gstat-v">{{ stats.tauxCouverture }}%</div>
            <div class="gstat-l">Taux couverture</div>
          </mat-card>
          <mat-card class="gstat-card" [class.gstat-warn]="state.matieresSousCouverte().length > 0">
            <div class="gstat-v">{{ state.matieresSousCouverte().length }}</div>
            <div class="gstat-l">Matières < 50%</div>
          </mat-card>
        </div>
      }

      @if (state.matieresSousCouverte().length > 0) {
        <div class="alerte-sous-couverture">
          <mat-icon>warning</mat-icon>
          <strong>{{ state.matieresSousCouverte().length }} matière(s)</strong> ont moins de 50% de couverture
          et nécessitent une attention particulière.
        </div>
      }

      <div class="couverture-list">
        @for (c of state.couverture(); track c.matiereId) {
          <mat-card class="couverture-card" [class.carte-alerte]="c.taux < 50">
            <div class="couverture-header">
              <div class="mat-info">
                <span class="mat-libelle">{{ c.matiereLibelle }}</span>
                <span class="mat-heures">
                  {{ c.volumeRealise }}h / {{ c.volumePlanifie }}h
                </span>
              </div>
              <div class="couverture-right">
                <span class="taux-val"
                      [class.taux-ok]="c.taux >= 80"
                      [class.taux-warn]="c.taux >= 50 && c.taux < 80"
                      [class.taux-danger]="c.taux < 50">
                  {{ c.taux }}%
                </span>
                @if (c.seancesRestantes > 0) {
                  <mat-chip class="chip-restant">
                    {{ c.seancesRestantes }} séance(s) restante(s)
                  </mat-chip>
                } @else {
                  <mat-chip class="chip-termine">Terminé</mat-chip>
                }
              </div>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="c.taux"
              [color]="c.taux >= 80 ? 'accent' : c.taux >= 50 ? 'primary' : 'warn'"
              class="couverture-bar">
            </mat-progress-bar>
          </mat-card>
        }

        @if (state.couverture().length === 0) {
          <div class="empty-couverture">
            <mat-icon>analytics</mat-icon>
            <p>Sélectionner une classe et une période pour voir la couverture</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 4px; }
    .back-btn { min-width: 40px; }
    .page-title { margin: 0; font-size: 22px; font-weight: 600; }
    .header-filters { display: flex; gap: 12px; }
    .global-stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .gstat-card { padding: 16px 20px; text-align: center; }
    .gstat-v { font-size: 24px; font-weight: 700; }
    .gstat-l { font-size: 12px; color: #757575; }
    .gstat-warn .gstat-v { color: #e65100; }
    .alerte-sous-couverture { display: flex; align-items: center; gap: 10px; background: #fff3e0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; color: #e65100; font-size: 14px; }
    .alerte-sous-couverture mat-icon { color: #e65100; }
    .couverture-list { display: flex; flex-direction: column; gap: 12px; }
    .couverture-card { padding: 16px; border: 1px solid #e0e0e0; }
    .carte-alerte { border-color: #ffb74d; background: #fffde7; }
    .couverture-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .mat-info { display: flex; flex-direction: column; gap: 2px; }
    .mat-libelle { font-weight: 600; font-size: 14px; }
    .mat-heures { font-size: 12px; color: #757575; }
    .couverture-right { display: flex; align-items: center; gap: 8px; }
    .taux-val { font-size: 20px; font-weight: 700; min-width: 48px; text-align: right; }
    .taux-ok     { color: #2e7d32; }
    .taux-warn   { color: #e65100; }
    .taux-danger { color: #c62828; }
    .couverture-bar { height: 8px; border-radius: 4px; }
    .chip-restant { background: #fff3e0 !important; color: #e65100 !important; font-size: 11px !important; }
    .chip-termine { background: #e8f5e9 !important; color: #2e7d32 !important; font-size: 11px !important; }
    .empty-couverture { text-align: center; padding: 60px; color: #9e9e9e; }
    .empty-couverture mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
  `]
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
