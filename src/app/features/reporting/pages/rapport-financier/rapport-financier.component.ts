import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RapportFinancierService } from './rapport-financier.service';
import { RapportFinancier } from './models/rapport-financier.model';

@Component({
  selector: 'app-rapport-financier',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rapport-financier.component.html',
  styleUrl: './rapport-financier.component.scss',
})
export class RapportFinancierComponent implements OnInit {
  private readonly service = inject(RapportFinancierService);
  protected readonly rapport = signal<RapportFinancier | null>(null);
  protected readonly loading = signal(false);

  protected readonly maxMonthly = computed<number>(() => {
    const r = this.rapport();
    return r ? Math.max(...r.monthly.map((m) => m.expected), 1) : 1;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.service.load().subscribe({
      next: (r) => { this.rapport.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
