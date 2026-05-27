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
import { AcademicSession, AcademicSessionDraft } from '../../models/session.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-form.component.html',
  styleUrl: './session-form.component.scss',
})
export class SessionFormComponent implements OnChanges {
  @Input() session: AcademicSession | null = null;

  @Output() save = new EventEmitter<AcademicSessionDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    label: ['', Validators.required],
    type: this.fb.nonNullable.control<AcademicSession['type']>('TERM', Validators.required),
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: this.fb.nonNullable.control<AcademicSession['status']>('UPCOMING', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      if (this.session) {
        this.form.patchValue(this.session);
      } else {
        this.form.reset({
          label: '',
          type: 'TERM',
          startDate: '',
          endDate: '',
          status: 'UPCOMING',
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
