import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessagesStore } from './messages.store';
import { MessageDraft } from './models/message.model';
import { MessageFormComponent } from './components/message-form/message-form.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [DatePipe, MessageFormComponent],
  providers: [MessagesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  protected readonly store = inject(MessagesStore);
  protected readonly drawerOpen = signal(false);

  ngOnInit(): void { this.store.load(); }

  openCompose(): void { this.drawerOpen.set(true); }
  closeDrawer(): void { this.drawerOpen.set(false); }

  send(draft: MessageDraft): void {
    this.store.create(draft);
    this.closeDrawer();
  }
}
