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
import { Student, StudentDraft } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnChanges {
  @Input() student: Student | null = null;

  @Output() save = new EventEmitter<StudentDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    registrationNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', Validators.required],
    level: this.fb.nonNullable.control<Student['level']>('SECONDARY', Validators.required),
    status: this.fb.nonNullable.control<Student['status']>('ACTIVE', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student']) {
      if (this.student) {
        this.form.patchValue(this.student);
      } else {
        this.form.reset({
          registrationNumber: '',
          firstName: '',
          lastName: '',
          email: '',
          birthDate: '',
          level: 'SECONDARY',
          status: 'ACTIVE',
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
