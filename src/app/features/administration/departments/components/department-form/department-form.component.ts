import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department, DepartmentDraft } from '../../models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent implements OnChanges {
  @Input() department: Department | null = null;
  @Output() save = new EventEmitter<DepartmentDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    managerName: [''],
    staffCount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    status: this.fb.nonNullable.control<Department['status']>('ACTIVE', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department']) {
      if (this.department) {
        this.form.patchValue(this.department);
      } else {
        this.form.reset({
          code: '', name: '', description: '', managerName: '',
          staffCount: 0, status: 'ACTIVE',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
