import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TimetableSlot, TimetableSlotDraft } from '../../models/timetable.model';

@Component({
  selector: 'app-timetable-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timetable-form.component.html',
  styleUrl: './timetable-form.component.scss',
})
export class TimetableFormComponent implements OnChanges {
  @Input() slot: TimetableSlot | null = null;

  @Output() save = new EventEmitter<TimetableSlotDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    day: this.fb.nonNullable.control<TimetableSlot['day']>('MONDAY', Validators.required),
    startTime: ['08:00', Validators.required],
    endTime: ['10:00', Validators.required],
    subject: ['', Validators.required],
    teacherName: ['', Validators.required],
    classGroup: ['', Validators.required],
    room: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slot']) {
      if (this.slot) {
        this.form.patchValue(this.slot);
      } else {
        this.form.reset({
          day: 'MONDAY',
          startTime: '08:00',
          endTime: '10:00',
          subject: '',
          teacherName: '',
          classGroup: '',
          room: '',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
