import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExamSession } from '../../models/exam-session.model';

@Component({
  selector: 'app-exam-session-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-session-list.component.html',
  styleUrl: './exam-session-list.component.scss',
})
export class ExamSessionListComponent {
  @Input({ required: true }) sessions: ExamSession[] = [];
  @Output() edit = new EventEmitter<ExamSession>();
  @Output() remove = new EventEmitter<ExamSession>();
}
