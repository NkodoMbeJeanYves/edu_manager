import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AcademicSession } from '../../models/session.model';

@Component({
  selector: 'app-session-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.scss',
})
export class SessionListComponent {
  @Input({ required: true }) sessions: AcademicSession[] = [];

  @Output() edit = new EventEmitter<AcademicSession>();
  @Output() remove = new EventEmitter<AcademicSession>();
}
