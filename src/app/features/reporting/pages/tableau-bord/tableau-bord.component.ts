import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DashboardService } from './tableau-bord.service';
import { Dashboard } from './models/dashboard.model';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tableau-bord.component.html',
  styleUrl: './tableau-bord.component.scss',
})
export class TableauBordComponent implements OnInit {
  private readonly service = inject(DashboardService);

  protected readonly dashboard = signal<Dashboard | null>(null);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.load().subscribe({
      next: (d) => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
