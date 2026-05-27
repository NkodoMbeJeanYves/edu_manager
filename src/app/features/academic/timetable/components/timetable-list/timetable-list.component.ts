import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TimetableSlot } from '../../models/timetable.model';

@Component({
  selector: 'app-timetable-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timetable-list.component.html',
  styleUrl: './timetable-list.component.scss',
})
export class TimetableListComponent {
  @Input({ required: true }) slots: TimetableSlot[] = [];

  @Output() edit = new EventEmitter<TimetableSlot>();
  @Output() remove = new EventEmitter<TimetableSlot>();
}
