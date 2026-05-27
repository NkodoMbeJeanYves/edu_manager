import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modele, ModeleDraft } from '../../models/modele.model';

@Component({
  selector: 'app-modele-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modele-form.component.html',
  styleUrl: './modele-form.component.scss',
})
export class ModeleFormComponent implements OnChanges {
  @Input() modele: Modele | null = null;
  @Output() save = new EventEmitter<ModeleDraft>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly placeholderHint =
    'Use placeholders like {{student_name}}, {{date}}, {{subject}} in your template.';

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: this.fb.nonNullable.control<Modele['type']>('EMAIL', Validators.required),
    event: this.fb.nonNullable.control<Modele['event']>('GENERAL', Validators.required),
    subject: [''],
    body: ['', Validators.required],
    active: this.fb.nonNullable.control<boolean>(true),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modele']) {
      if (this.modele) {
        this.form.patchValue(this.modele);
      } else {
        this.form.reset({
          name: '', type: 'EMAIL', event: 'GENERAL',
          subject: '', body: '', active: true,
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
