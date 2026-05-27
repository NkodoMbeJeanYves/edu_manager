import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationsStore } from './notifications.store';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe],
  providers: [NotificationsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  protected readonly store = inject(NotificationsStore);

  ngOnInit(): void { this.store.load(); }
}
