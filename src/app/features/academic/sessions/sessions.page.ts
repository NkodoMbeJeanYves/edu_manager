import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SessionsStore } from './sessions.store';
import { AcademicSession, AcademicSessionDraft } from './models/session.model';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionFormComponent } from './components/session-form/session-form.component';

@Component({
  selector: 'app-sessions-page',
  standalone: true,
  imports: [SessionListComponent, SessionFormComponent],
  providers: [SessionsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sessions.page.html',
  styleUrl: './sessions.page.scss',
})
export class SessionsPage implements OnInit {
  protected readonly store = inject(SessionsStore);
  protected readonly editing = signal<AcademicSession | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(session: AcademicSession): void {
    this.editing.set(session);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(null);
  }

  save(draft: AcademicSessionDraft): void {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, draft);
    } else {
      this.store.create(draft);
    }
    this.closeDrawer();
  }

  remove(session: AcademicSession): void {
    const message = $localize`:@@sessions.confirmRemove:Remove session "${session.label}"?`;
    if (confirm(message)) {
      this.store.remove(session.id);
    }
  }

  search(value: string): void {
    this.store.setFilter({ search: value });
  }
}
