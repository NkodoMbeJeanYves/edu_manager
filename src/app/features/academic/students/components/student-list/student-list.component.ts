import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  @Input({ required: true }) students: Student[] = [];

  @Output() edit = new EventEmitter<Student>();
  @Output() remove = new EventEmitter<Student>();
}
