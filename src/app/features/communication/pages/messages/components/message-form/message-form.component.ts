import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Message, MessageDraft } from '../../models/message.model';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message-form.component.html',
  styleUrl: './message-form.component.scss',
})
export class MessageFormComponent {
  @Output() send = new EventEmitter<MessageDraft>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    fromName: ['Direction', Validators.required],
    toName: ['', Validators.required],
    subject: ['', Validators.required],
    body: ['', Validators.required],
    priority: this.fb.nonNullable.control<Message['priority']>('NORMAL', Validators.required),
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.send.emit({ ...this.form.getRawValue(), folder: 'SENT' });
  }
}
