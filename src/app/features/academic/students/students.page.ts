import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { StudentsStore } from './students.store';
import { Student, StudentDraft } from './models/student.model';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentFormComponent } from './components/student-form/student-form.component';

@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [StudentListComponent, StudentFormComponent],
  providers: [StudentsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students.page.html',
  styleUrl: './students.page.scss',
})
export class StudentsPage implements OnInit {
  protected readonly store = inject(StudentsStore);
  protected readonly editing = signal<Student | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(student: Student): void {
    this.editing.set(student);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(null);
  }

  save(draft: StudentDraft): void {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, draft);
    } else {
      this.store.create(draft);
    }
    this.closeDrawer();
  }

  remove(student: Student): void {
    const message = $localize`:@@students.confirmRemove:Remove student ${student.firstName} ${student.lastName}?`;
    if (confirm(message)) {
      this.store.remove(student.id);
    }
  }

  search(value: string): void {
    this.store.setFilter({ search: value });
  }
}
