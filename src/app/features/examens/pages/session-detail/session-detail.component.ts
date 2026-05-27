import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

interface ExamRow {
  id: string;
  subject: string;
  classGroup: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilator: string;
}

interface ExamSessionInfo {
  id: string;
  label: string;
  type: 'NORMAL' | 'MAKEUP' | 'SPECIAL';
  status: 'PLANNED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-detail.component.html',
  styleUrl: './session-detail.component.scss',
})
export class SessionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly id = this.route.snapshot.paramMap.get('id') ?? 'ex-3';

  protected readonly session: ExamSessionInfo = {
    id: this.id,
    label: 'Session normale — Trimestre 2 2024-2025',
    type: 'NORMAL',
    status: 'IN_PROGRESS',
    startDate: '2025-05-19',
    endDate: '2025-05-30',
  };

  protected readonly exams: ExamRow[] = [
    {
      id: 'ep-1', subject: 'Mathématiques', classGroup: 'Terminale S',
      date: '2025-05-19', startTime: '08:00', endTime: '11:00',
      room: 'B-201', invigilator: 'Camille Dupont',
    },
    {
      id: 'ep-2', subject: 'Sciences physiques', classGroup: 'Terminale S',
      date: '2025-05-20', startTime: '14:00', endTime: '17:00',
      room: 'Labo-3', invigilator: 'Idrissa Diallo',
    },
    {
      id: 'ep-3', subject: 'Anglais', classGroup: 'Première L',
      date: '2025-05-21', startTime: '09:00', endTime: '11:00',
      room: 'A-105', invigilator: 'Léa Moreau',
    },
    {
      id: 'ep-4', subject: 'Histoire-Géographie', classGroup: 'Première L',
      date: '2025-05-22', startTime: '14:00', endTime: '17:00',
      room: 'A-302', invigilator: 'Robert Tremblay',
    },
    {
      id: 'ep-5', subject: 'Mathématiques', classGroup: 'Première S',
      date: '2025-05-23', startTime: '08:00', endTime: '11:00',
      room: 'B-201', invigilator: 'Camille Dupont',
    },
  ];

  protected readonly convocations = 142;
  protected readonly rooms = 4;
}
