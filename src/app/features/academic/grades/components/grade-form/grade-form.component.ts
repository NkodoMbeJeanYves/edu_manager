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
import { Grade, GradeDraft } from '../../models/grade.model';

@Component({
  selector: 'app-grade-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grade-form.component.html',
  styleUrl: './grade-form.component.scss',
})
export class GradeFormComponent implements OnChanges {
  @Input() grade: Grade | null = null;

  @Output() save = new EventEmitter<GradeDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    registrationNumber: ['', Validators.required],
    studentName: ['', Validators.required],
    subject: ['', Validators.required],
    evaluationType: this.fb.nonNullable.control<Grade['evaluationType']>('QUIZ', Validators.required),
    score: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    maxScore: this.fb.nonNullable.control<number>(20, [Validators.required, Validators.min(1)]),
    evaluatedAt: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grade']) {
      if (this.grade) {
        this.form.patchValue(this.grade);
      } else {
        this.form.reset({
          registrationNumber: '',
          studentName: '',
          subject: '',
          evaluationType: 'QUIZ',
          score: 0,
          maxScore: 20,
          evaluatedAt: '',
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
