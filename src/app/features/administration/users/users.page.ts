import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { UsersStore } from './users.store';
import { User, UserDraft } from './models/user.model';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [UserListComponent, UserFormComponent],
  providers: [UsersStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage implements OnInit {
  protected readonly store = inject(UsersStore);
  protected readonly editing = signal<User | null>(null);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.editing.set(null); this.drawerOpen.set(true); }
  openEdit(user: User): void { this.editing.set(user); this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); this.editing.set(null); }

  save(draft: UserDraft): void {
    const current = this.editing();
    if (current) this.store.update(current.id, draft);
    else this.store.create(draft);
    this.closeDrawer();
  }

  remove(user: User): void {
    const message = $localize`:@@users.confirmRemove:Remove user ${user.firstName} ${user.lastName}?`;
    if (confirm(message)) this.store.remove(user.id);
  }

  search(value: string): void { this.store.setFilter({ search: value }); }
}
