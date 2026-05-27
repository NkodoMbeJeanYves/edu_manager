import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ExamSessionsStore } from './sessions-list.store';
import { ExamSession, ExamSessionDraft } from './models/exam-session.model';
import { ExamSessionListComponent } from './components/exam-session-list/exam-session-list.component';
import { ExamSessionFormComponent } from './components/exam-session-form/exam-session-form.component';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [ExamSessionListComponent, ExamSessionFormComponent],
  providers: [ExamSessionsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sessions-list.component.html',
  styleUrl: './sessions-list.component.scss',
})
export class SessionsListComponent implements OnInit {
  protected readonly store = inject(ExamSessionsStore);
  protected readonly editing = signal<ExamSession | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(s: ExamSession): void { this.editing.set(s); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: ExamSessionDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(s: ExamSession): void {
    const message = $localize`:@@examens.confirmRemove:Remove session "${s.label}"?`;
    if (confirm(message)) this.store.remove(s.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }
}
