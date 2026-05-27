import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AnnoncesStore } from './annonces.store';
import { Annonce, AnnonceDraft } from './models/annonce.model';
import { AnnonceFormComponent } from './components/annonce-form/annonce-form.component';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [DatePipe, AnnonceFormComponent],
  providers: [AnnoncesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss',
})
export class AnnoncesComponent implements OnInit {
  protected readonly store = inject(AnnoncesStore);
  protected readonly editing = signal<Annonce | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(a: Annonce): void { this.editing.set(a); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: AnnonceDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(a: Annonce): void {
    const message = $localize`:@@annonces.confirmRemove:Remove announcement "${a.title}"?`;
    if (confirm(message)) this.store.remove(a.id);
  }

  togglePinnedOnly(): void {
    this.store.setFilter({ pinnedOnly: !this.store.filter().pinnedOnly });
  }
}
