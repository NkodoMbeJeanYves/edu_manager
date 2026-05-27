import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { TimetableStore } from './timetable.store';
import { TimetableSlot, TimetableSlotDraft } from './models/timetable.model';
import { TimetableListComponent } from './components/timetable-list/timetable-list.component';
import { TimetableFormComponent } from './components/timetable-form/timetable-form.component';
import { TimetableGridComponent } from './components/timetable-grid/timetable-grid.component';
import { TimetableDetailComponent } from './components/timetable-detail/timetable-detail.component';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-timetable-page',
  standalone: true,
  imports: [
    TimetableListComponent,
    TimetableFormComponent,
    TimetableGridComponent,
    TimetableDetailComponent,
  ],
  providers: [TimetableStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timetable.page.html',
  styleUrl: './timetable.page.scss',
})
export class TimetablePage implements OnInit {
  protected readonly store = inject(TimetableStore);
  protected readonly viewMode = signal<ViewMode>('grid');
  protected readonly editing = signal<TimetableSlot | null>(null);
  protected readonly viewing = signal<TimetableSlot | null>(null);
  protected readonly drawerOpen = signal(false);

  protected readonly classGroups = computed<string[]>(() => {
    const set = new Set<string>();
    for (const s of this.store.items()) set.add(s.classGroup);
    return [...set].sort();
  });

  protected readonly activeClassGroup = computed<string | undefined>(
    () => this.store.filter().classGroup,
  );

  constructor() {
    effect(
      () => {
        if (this.viewMode() !== 'grid') return;
        if (this.activeClassGroup()) return;
        const first = this.classGroups()[0];
        if (first) {
          this.store.setFilter({ classGroup: first });
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.store.load();
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setClassGroup(value: string): void {
    this.store.setFilter({ classGroup: value || undefined });
  }

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(slot: TimetableSlot): void {
    this.viewing.set(null);
    this.editing.set(slot);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.editing.set(null);
  }

  openDetail(slot: TimetableSlot): void {
    this.viewing.set(slot);
  }

  closeDetail(): void {
    this.viewing.set(null);
  }

  save(draft: TimetableSlotDraft): void {
    const current = this.editing();
    if (current) {
      this.store.update(current.id, draft);
    } else {
      this.store.create(draft);
    }
    this.closeDrawer();
  }

  remove(slot: TimetableSlot): void {
    const message = $localize`:@@timetable.confirmRemove:Remove this slot (${slot.subject}, ${slot.day} ${slot.startTime})?`;
    if (confirm(message)) {
      this.store.remove(slot.id);
      this.viewing.set(null);
    }
  }

  search(value: string): void {
    this.store.setFilter({ search: value });
  }
}
