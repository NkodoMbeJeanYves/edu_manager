import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent {
  @Input({ required: true }) departments: Department[] = [];
  @Output() edit = new EventEmitter<Department>();
  @Output() remove = new EventEmitter<Department>();
}
