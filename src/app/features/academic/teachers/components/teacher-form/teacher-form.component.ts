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
import { Teacher, TeacherDraft } from '../../models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.scss',
})
export class TeacherFormComponent implements OnChanges {
  @Input() teacher: Teacher | null = null;

  @Output() save = new EventEmitter<TeacherDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    staffNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    discipline: ['', Validators.required],
    contractType: this.fb.nonNullable.control<Teacher['contractType']>('PERMANENT', Validators.required),
    status: this.fb.nonNullable.control<Teacher['status']>('ACTIVE', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacher']) {
      if (this.teacher) {
        this.form.patchValue({
          ...this.teacher,
          phone: this.teacher.phone ?? '',
        });
      } else {
        this.form.reset({
          staffNumber: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          discipline: '',
          contractType: 'PERMANENT',
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
    const value = this.form.getRawValue();
    this.save.emit({
      ...value,
      phone: value.phone || undefined,
    });
  }
}
