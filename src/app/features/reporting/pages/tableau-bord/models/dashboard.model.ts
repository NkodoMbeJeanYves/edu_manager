export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Kpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;       // % delta vs previous period
}

export interface DashboardAlert {
  id: string;
  level: AlertLevel;
  module: string;
  message: string;
}

export interface Dashboard {
  periodLabel: string;
  effectives: Kpi[];
  pedagogy: Kpi[];
  finance: Kpi[];
  alerts: DashboardAlert[];
}
