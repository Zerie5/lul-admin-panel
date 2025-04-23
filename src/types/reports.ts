// Types for Reports and Analytics module

export type TimeFrame = 'daily' | 'weekly' | 'monthly';
export type VisualizationType = 'line' | 'bar' | 'pie' | 'area';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface TransactionVolumeData {
  date: string;
  count: number;
}

export interface TransactionSuccessRateData {
  date: string;
  successRate: number;
  failureRate: number;
}

export interface TransactionTypeDistributionData {
  type: string;
  count: number;
  percentage: number;
}

export interface AverageTransactionValueData {
  date: string;
  averageValue: number;
}

export interface UserRegistrationData {
  date: string;
  count: number;
}

export interface ActiveUsersData {
  date: string;
  count: number;
}

export interface UserRetentionData {
  cohort: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

export interface GeographicDistributionData {
  country: string;
  count: number;
  percentage: number;
}

export interface TransactionValueData {
  date: string;
  value: number;
}

export interface FeeRevenueData {
  date: string;
  revenue: number;
}

export interface TransactionCorridorData {
  corridor: string;
  count: number;
  value: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  timeFrame: TimeFrame;
  visualizationType?: VisualizationType;
}

export interface SavedReportConfiguration {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  filters: ReportFilters;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExportOptions {
  format: ExportFormat;
  fileName?: string;
  includeFilters?: boolean;
} 