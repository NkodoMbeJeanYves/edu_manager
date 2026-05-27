import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Grade } from '../../models/grade.model';

@Component({
  selector: 'app-grade-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grade-list.component.html',
  styleUrl: './grade-list.component.scss',
})
export class GradeListComponent {
  @Input({ required: true }) grades: Grade[] = [];

  @Output() edit = new EventEmitter<Grade>();
  @Output() remove = new EventEmitter<Grade>();

  passingThreshold(g: Grade): boolean {
    return g.score / g.maxScore >= 0.5;
  }
}
