import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Student } from '../../models/student.model';
import { ProfilePhotoComponent } from '@shared/profile-photo/profile-photo.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [ProfilePhotoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  @Input({ required: true }) students: Student[] = [];

  @Output() edit = new EventEmitter<Student>();
  @Output() remove = new EventEmitter<Student>();
}
