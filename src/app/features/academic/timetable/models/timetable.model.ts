export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableSlot {
  id: string;
  tenantId: string;
  day: DayOfWeek;
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  subject: string;
  teacherName: string;
  classGroup: string;
  room: string;
  createdAt: string;
}

export interface TimetableFilter {
  search?: string;
  day?: DayOfWeek;
  classGroup?: string;
}

export type TimetableSlotDraft = Omit<TimetableSlot, 'id' | 'tenantId' | 'createdAt'>;
