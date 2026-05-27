import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss',
})
export class TeacherListComponent {
  @Input({ required: true }) teachers: Teacher[] = [];

  @Output() edit = new EventEmitter<Teacher>();
  @Output() remove = new EventEmitter<Teacher>();
}
