import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DayOfWeek, TimetableSlot } from '../../models/timetable.model';

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: $localize`:@@day.full.mon:Lundi`,
  TUESDAY: $localize`:@@day.full.tue:Mardi`,
  WEDNESDAY: $localize`:@@day.full.wed:Mercredi`,
  THURSDAY: $localize`:@@day.full.thu:Jeudi`,
  FRIDAY: $localize`:@@day.full.fri:Vendredi`,
  SATURDAY: $localize`:@@day.full.sat:Samedi`,
};

@Component({
  selector: 'app-timetable-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timetable-detail.component.html',
  styleUrl: './timetable-detail.component.scss',
})
export class TimetableDetailComponent {
  @Input({ required: true }) slot!: TimetableSlot;

  @Output() edit = new EventEmitter<TimetableSlot>();
  @Output() remove = new EventEmitter<TimetableSlot>();

  protected dayLabel(day: DayOfWeek): string {
    return DAY_LABEL[day];
  }
}
