import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RapportAbsenteismeService } from './rapport-absenteisme.service';
import { RapportAbsenteisme } from './models/rapport-absenteisme.model';

@Component({
  selector: 'app-rapport-absenteisme',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rapport-absenteisme.component.html',
  styleUrl: './rapport-absenteisme.component.scss',
})
export class RapportAbsenteismeComponent implements OnInit {
  private readonly service = inject(RapportAbsenteismeService);
  protected readonly rapport = signal<RapportAbsenteisme | null>(null);
  protected readonly loading = signal(false);

  protected readonly maxWeeklyRate = computed<number>(() => {
    const r = this.rapport();
    return r ? Math.max(...r.weekly.map((w) => w.rate), 1) : 1;
  });
  protected readonly maxDayRate = computed<number>(() => {
    const r = this.rapport();
    return r ? Math.max(...r.byDay.map((d) => d.rate), 1) : 1;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.service.load().subscribe({
      next: (r) => { this.rapport.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
