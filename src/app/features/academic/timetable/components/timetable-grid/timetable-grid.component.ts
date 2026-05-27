import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DayOfWeek, TimetableSlot } from '../../models/timetable.model';

interface DayColumn {
  key: DayOfWeek;
  label: string;
}

@Component({
  selector: 'app-timetable-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timetable-grid.component.html',
  styleUrl: './timetable-grid.component.scss',
})
export class TimetableGridComponent {
  @Input({ required: true }) slots: TimetableSlot[] = [];
  @Output() select = new EventEmitter<TimetableSlot>();

  protected readonly startHour = 8;
  protected readonly endHour = 18;
  protected readonly hourHeight = 60;

  protected readonly days: DayColumn[] = [
    { key: 'MONDAY', label: $localize`:@@day.mon:Lun` },
    { key: 'TUESDAY', label: $localize`:@@day.tue:Mar` },
    { key: 'WEDNESDAY', label: $localize`:@@day.wed:Mer` },
    { key: 'THURSDAY', label: $localize`:@@day.thu:Jeu` },
    { key: 'FRIDAY', label: $localize`:@@day.fri:Ven` },
    { key: 'SATURDAY', label: $localize`:@@day.sat:Sam` },
  ];

  protected readonly hours: number[] = Array.from(
    { length: this.endHour - this.startHour },
    (_, i) => this.startHour + i,
  );

  protected get gridHeight(): number {
    return (this.endHour - this.startHour) * this.hourHeight;
  }

  protected slotsFor(day: DayOfWeek): TimetableSlot[] {
    return this.slots.filter((s) => s.day === day);
  }

  protected slotTop(slot: TimetableSlot): number {
    const [h, m] = slot.startTime.split(':').map(Number);
    return ((h - this.startHour) * 60 + m) * (this.hourHeight / 60);
  }

  protected slotHeight(slot: TimetableSlot): number {
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return Math.max(24, minutes * (this.hourHeight / 60));
  }

  protected slotStyles(subject: string): Record<string, string> {
    const hue = this.hueOf(subject);
    return {
      backgroundColor: `hsla(${hue}, 65%, 55%, 0.14)`,
      borderLeftColor: `hsl(${hue}, 65%, 45%)`,
      color: `hsl(${hue}, 70%, 25%)`,
    };
  }

  private hueOf(subject: string): number {
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
  }
}
