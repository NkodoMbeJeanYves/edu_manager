export interface TopAbsent {
  name: string;
  classGroup: string;
  hours: number;
  rate: number;
}

export interface WeeklyPoint {
  week: string;
  rate: number;
}

export interface DayDistribution {
  day: string;
  rate: number;
}

export interface RapportAbsenteisme {
  periodLabel: string;
  overallRate: number;
  totalHours: number;
  justifiedRate: number;
  topAbsents: TopAbsent[];
  weekly: WeeklyPoint[];
  byDay: DayDistribution[];
}
