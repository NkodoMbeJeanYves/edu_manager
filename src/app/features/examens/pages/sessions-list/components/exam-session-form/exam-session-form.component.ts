import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamSession, ExamSessionDraft } from '../../models/exam-session.model';

@Component({
  selector: 'app-exam-session-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-session-form.component.html',
  styleUrl: './exam-session-form.component.scss',
})
export class ExamSessionFormComponent implements OnChanges {
  @Input() session: ExamSession | null = null;
  @Output() save = new EventEmitter<ExamSessionDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    label: ['', Validators.required],
    type: this.fb.nonNullable.control<ExamSession['type']>('NORMAL', Validators.required),
    status: this.fb.nonNullable.control<ExamSession['status']>('PLANNED', Validators.required),
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      if (this.session) {
        this.form.patchValue(this.session);
      } else {
        this.form.reset({
          label: '', type: 'NORMAL', status: 'PLANNED',
          startDate: '', endDate: '',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
