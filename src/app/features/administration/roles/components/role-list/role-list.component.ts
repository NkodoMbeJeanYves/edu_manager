import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-role-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent {
  @Input({ required: true }) roles: Role[] = [];
  @Output() edit = new EventEmitter<Role>();
  @Output() remove = new EventEmitter<Role>();
}
