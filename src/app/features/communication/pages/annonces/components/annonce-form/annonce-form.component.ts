import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Annonce, AnnonceDraft } from '../../models/annonce.model';

@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './annonce-form.component.html',
  styleUrl: './annonce-form.component.scss',
})
export class AnnonceFormComponent implements OnChanges {
  @Input() annonce: Annonce | null = null;
  @Output() save = new EventEmitter<AnnonceDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
    audience: this.fb.nonNullable.control<Annonce['audience']>('ALL', Validators.required),
    pinned: this.fb.nonNullable.control<boolean>(false),
    publishedBy: ['Direction', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['annonce']) {
      if (this.annonce) {
        this.form.patchValue(this.annonce);
      } else {
        this.form.reset({
          title: '', body: '', audience: 'ALL', pinned: false, publishedBy: 'Direction',
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.save.emit(this.form.getRawValue());
  }
}
