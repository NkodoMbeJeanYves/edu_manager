import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, RoleDraft } from '../../models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnChanges {
  @Input() role: Role | null = null;
  @Output() save = new EventEmitter<RoleDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: ['', Validators.required],
    scope: this.fb.nonNullable.control<Role['scope']>('TENANT', Validators.required),
    permissionsCount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    isSystem: this.fb.nonNullable.control<boolean>(false),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role']) {
      if (this.role) {
        this.form.patchValue(this.role);
      } else {
        this.form.reset({
          name: '', code: '', description: '',
          scope: 'TENANT', permissionsCount: 0, isSystem: false,
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
