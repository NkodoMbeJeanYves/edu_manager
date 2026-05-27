import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModelesStore } from './modeles.store';
import { Modele, ModeleDraft } from './models/modele.model';
import { ModeleFormComponent } from './components/modele-form/modele-form.component';

@Component({
  selector: 'app-modeles',
  standalone: true,
  imports: [DatePipe, ModeleFormComponent],
  providers: [ModelesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modeles.component.html',
  styleUrl: './modeles.component.scss',
})
export class ModelesComponent implements OnInit {
  protected readonly store = inject(ModelesStore);
  protected readonly editing = signal<Modele | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(m: Modele): void { this.editing.set(m); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: ModeleDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(m: Modele): void {
    const message = $localize`:@@modeles.confirmRemove:Remove template "${m.name}"?`;
    if (confirm(message)) this.store.remove(m.id);
  }
}
