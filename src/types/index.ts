export type DataPoint = {
  id: number;
  value: number;
  timestamp: number;
};

export interface DashboardData {
  metrics: DataPoint[];
  lastUpdated: number;
}

export type ChartConfig = {
  type: 'line' | 'bar' | 'pie';
  title: string;
  labels: string[];
  data: number[];
};

export interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
}

export interface LegendItem {
  label: string;
  color: string;
}