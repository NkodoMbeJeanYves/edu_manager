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
import { ProfilePhotoComponent } from '@shared/profile-photo/profile-photo.component';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, ProfilePhotoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnChanges {
  @Input() student: Student | null = null;

  @Output() save = new EventEmitter<StudentDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected photoError = '';

  protected readonly form = this.fb.nonNullable.group({
    registrationNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', Validators.required],
    level: this.fb.nonNullable.control<Student['level']>('SECONDARY', Validators.required),
    status: this.fb.nonNullable.control<Student['status']>('ACTIVE', Validators.required),
    photoUrl: this.fb.nonNullable.control<string>(''),
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
          photoUrl: '',
        });
      }
      this.photoError = '';
    }
  }

  protected onPhotoChange(dataUrl: string | null): void {
    this.form.controls.photoUrl.setValue(dataUrl ?? '');
    this.form.controls.photoUrl.markAsDirty();
    this.photoError = '';
  }

  protected get fullName(): string {
    const { firstName, lastName } = this.form.getRawValue();
    return `${firstName} ${lastName}`.trim();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
