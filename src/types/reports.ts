// Types for Reports and Analytics module

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type VisualizationType = 'line' | 'bar' | 'pie' | 'area';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

// Currency options
export type CurrencyOption = 'USD' | 'EURO' | 'GBP' | 'CAD' | 'UGX' | 'BIRR' | 'ALL';

// Transaction type options
export type TransactionTypeOption = 1 | 2 | 3 | 4 | 5 | 'ALL';

// Transaction status options
export type TransactionStatusOption = 1 | 2 | 3 | 4 | 5 | 'ALL';

export interface TransactionVolumeData {
  date: string;
  count: number;
  volume: number;
}

export interface TransactionSuccessRateData {  date: string;  successRate: number;  failureRate: number;}// New interface for the actual API responseexport interface SuccessRateApiResponse {  successRate: number;  formattedRate: string;  successRateByType: Record<string, number>;  formattedRateByType: Record<string, string>;}

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
  activeUsers: number;
}

export interface UserRetentionData {
  cohort: string;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
  cohortSize?: number;
}

export interface UserRetentionResponse {
  data: UserRetentionData[];
  metadata: {
    timeFrame: string;
    startDate: string;
    endDate: string;
    totalCohorts: number;
    averageMonth1Retention: number;
    averageMonth2Retention: number;
    averageMonth3Retention: number;
    averageMonth6Retention: number;
    totalUsersAnalyzed: number;
  };
}

export interface GeographicDistributionData {
  country: string;
  count: number;
  percentage: number;
}

// New interface for the API response
export interface UserCountryDistributionResponse {
  success: boolean;
  message: string;
  data: {
    country: string;
    userCount: number;
  }[];
}

export interface TransactionValueData {
  date: string;
  value: number;
}

export interface FeeRevenueData {
  date: string;
  revenue: number;
  transactionCount: number;
  averageFeePerTransaction: number;
  growthRate: number | null;
  totalTransactionVolume: number;
  feeRatio: number;
}

export interface TransactionCorridorData {
  fromCountry: string;
  toCountry: string;
  corridor: string;
  transactionCount: number;
  totalValue: number;
  averageValue: number;
  transactionPercentage: number;
  valuePercentage: number;
  // Legacy fields for backward compatibility
  count: number;  // Maps to transactionCount
  value: number;  // Maps to totalValue
}

export interface TransactionCorridorResponse {
  data: TransactionCorridorData[];
  metadata: {
    startDate: string;
    endDate: string;
    currency: string;
    transactionType: string;
    transactionStatus: string;
    totalCorridors: number;
    totalTransactions: number;
    totalValue: number;
    averageTransactionsPerCorridor: number;
    averageValuePerCorridor: number;
    mostActiveCorridorByCount: string;
    mostActiveCorridorByValue: string;
    uniqueSenderCountries: number;
    uniqueRecipientCountries: number;
  };
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  timeFrame: TimeFrame;
  visualizationType?: VisualizationType;
  currency?: CurrencyOption;
  transactionTypeId?: TransactionTypeOption;
  transactionStatusId?: TransactionStatusOption;
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

export interface PaydayCycleData {
  period: string;
  dayRange: string;
  transactionCount: number;
  uniqueUsers: number;
  percentageOfVolume: number;
  percentageOfUsers: number;
  averageTransactionSize: number;
}

export interface PaydayCycleResponse {
  data: PaydayCycleData[];
  metadata: {
    timeFrame: string;
    startDate: string;
    endDate: string;
    totalTransactions: number;
    totalUniqueUsers: number;
    totalVolume: number;
    dominantPeriod: string;
    startMonthConcentration: number;
    endMonthConcentration: number;
    midMonthConcentration: number;
  };
} 