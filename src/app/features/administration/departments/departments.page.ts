import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DepartmentsStore } from './departments.store';
import { Department, DepartmentDraft } from './models/department.model';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { DepartmentFormComponent } from './components/department-form/department-form.component';

@Component({
  selector: 'app-departments-page',
  standalone: true,
  imports: [DepartmentListComponent, DepartmentFormComponent],
  providers: [DepartmentsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './departments.page.html',
  styleUrl: './departments.page.scss',
})
export class DepartmentsPage implements OnInit {
  protected readonly store = inject(DepartmentsStore);
  protected readonly editing = signal<Department | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(dept: Department): void { this.editing.set(dept); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: DepartmentDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(dept: Department): void {
    const message = $localize`:@@departments.confirmRemove:Remove department "${dept.name}"?`;
    if (confirm(message)) this.store.remove(dept.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }
}
