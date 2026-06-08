import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RolesStore } from './roles.store';
import { Role, RoleDraft } from './models/role.model';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { PaginatorComponent, PaginatorChange } from '@shared/pagination/paginator.component';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [RoleListComponent, RoleFormComponent, PaginatorComponent],
  providers: [RolesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles.page.html',
  styleUrl: './roles.page.scss',
})
export class RolesPage implements OnInit {
  protected readonly store = inject(RolesStore);
  protected readonly editing = signal<Role | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(role: Role): void { this.editing.set(role); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: RoleDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(role: Role): void {
    if (role.isSystem) return;
    const message = $localize`:@@roles.confirmRemove:Remove role "${role.name}"?`;
    if (confirm(message)) this.store.remove(role.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }

  onPageChange(e: PaginatorChange): void { this.store.goToPage(e.pageIndex + 1); }
}
