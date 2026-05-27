import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GradesStore } from './grades.store';
import { Grade, GradeDraft } from './models/grade.model';
import { GradeListComponent } from './components/grade-list/grade-list.component';
import { GradeFormComponent } from './components/grade-form/grade-form.component';

@Component({
  selector: 'app-grades-page',
  standalone: true,
  imports: [GradeListComponent, GradeFormComponent],
  providers: [GradesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grades.page.html',
  styleUrl: './grades.page.scss',
})
export class GradesPage implements OnInit {
  protected readonly store = inject(GradesStore);
  protected readonly editing = signal<Grade | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(grade: Grade): void {
    this.editing.set(grade);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(null);
  }

  save(draft: GradeDraft): void {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, draft);
    } else {
      this.store.create(draft);
    }
    this.closeDrawer();
  }

  remove(grade: Grade): void {
    const message = $localize`:@@grades.confirmRemove:Remove grade for ${grade.studentName} (${grade.subject})?`;
    if (confirm(message)) {
      this.store.remove(grade.id);
    }
  }

  search(value: string): void {
    this.store.setFilter({ search: value });
  }
}
