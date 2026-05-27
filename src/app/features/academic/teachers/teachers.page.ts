import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TeachersStore } from './teachers.store';
import { Teacher, TeacherDraft } from './models/teacher.model';
import { TeacherListComponent } from './components/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './components/teacher-form/teacher-form.component';

@Component({
  selector: 'app-teachers-page',
  standalone: true,
  imports: [TeacherListComponent, TeacherFormComponent],
  providers: [TeachersStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teachers.page.html',
  styleUrl: './teachers.page.scss',
})
export class TeachersPage implements OnInit {
  protected readonly store = inject(TeachersStore);
  protected readonly editing = signal<Teacher | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(teacher: Teacher): void {
    this.editing.set(teacher);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(null);
  }

  save(draft: TeacherDraft): void {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, draft);
    } else {
      this.store.create(draft);
    }
    this.closeDrawer();
  }

  remove(teacher: Teacher): void {
    const message = $localize`:@@teachers.confirmRemove:Remove teacher ${teacher.firstName} ${teacher.lastName}?`;
    if (confirm(message)) {
      this.store.remove(teacher.id);
    }
  }

  search(value: string): void {
    this.store.setFilter({ search: value });
  }
}
