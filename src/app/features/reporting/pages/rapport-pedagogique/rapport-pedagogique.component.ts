import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RapportPedagogiqueService } from './rapport-pedagogique.service';
import { RapportPedagogique } from './models/rapport-pedagogique.model';

@Component({
  selector: 'app-rapport-pedagogique',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rapport-pedagogique.component.html',
  styleUrl: './rapport-pedagogique.component.scss',
})
export class RapportPedagogiqueComponent implements OnInit {
  private readonly service = inject(RapportPedagogiqueService);
  protected readonly rapport = signal<RapportPedagogique | null>(null);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.load().subscribe({
      next: (r) => { this.rapport.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
