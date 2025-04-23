import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  TimeFrame,
  TransactionVolumeData,
  TransactionSuccessRateData,
  TransactionTypeDistributionData,
  AverageTransactionValueData,
  UserRegistrationData,
  ActiveUsersData,
  UserRetentionData,
  GeographicDistributionData,
  TransactionValueData,
  FeeRevenueData,
  TransactionCorridorData,
  ReportFilters,
  SavedReportConfiguration,
  ExportFormat,
  ReportExportOptions
} from '../types/reports';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

// API endpoints - Updated to use Vercel API routes
const REPORTS_ENDPOINT = `/api/reports`;

// Actual API service functions
export const getTransactionVolume = async (filters: ReportFilters): Promise<TransactionVolumeData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'transactionVolume',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getTransactionSuccessRate = async (filters: ReportFilters): Promise<TransactionSuccessRateData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'transactionSuccessRate',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getTransactionTypeDistribution = async (filters: ReportFilters): Promise<TransactionTypeDistributionData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'transactionTypeDistribution',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    }
  });
  return response.data;
};

export const getAverageTransactionValue = async (filters: ReportFilters): Promise<AverageTransactionValueData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'averageTransactionValue',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getUserRegistrations = async (filters: ReportFilters): Promise<UserRegistrationData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'userRegistrations',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getActiveUsers = async (filters: ReportFilters): Promise<ActiveUsersData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'activeUsers',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getUserRetention = async (filters: ReportFilters): Promise<UserRetentionData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'userRetention',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    }
  });
  return response.data;
};

export const getGeographicDistribution = async (filters: ReportFilters): Promise<GeographicDistributionData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'geographicDistribution',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    }
  });
  return response.data;
};

export const getTransactionValue = async (filters: ReportFilters): Promise<TransactionValueData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'transactionValue',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getFeeRevenue = async (filters: ReportFilters): Promise<FeeRevenueData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'feeRevenue',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame
    }
  });
  return response.data;
};

export const getTransactionCorridors = async (filters: ReportFilters): Promise<TransactionCorridorData[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}`, {
    params: {
      reportType: 'transactionCorridors',
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    }
  });
  return response.data;
};

export const getSavedReportConfigurations = async (): Promise<SavedReportConfiguration[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}/configurations`);
  return response.data;
};

export const saveReportConfiguration = async (configuration: Omit<SavedReportConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedReportConfiguration> => {
  const response = await axios.post(`${REPORTS_ENDPOINT}`, configuration);
  return response.data;
};

export const updateReportConfiguration = async (id: string, configuration: Partial<SavedReportConfiguration>): Promise<SavedReportConfiguration> => {
  const response = await axios.put(`${REPORTS_ENDPOINT}/configurations/${id}`, configuration);
  return response.data;
};

export const deleteReportConfiguration = async (id: string): Promise<void> => {
  await axios.delete(`${REPORTS_ENDPOINT}/configurations/${id}`);
};

export const exportReportData = async (reportType: string, filters: ReportFilters, options: ReportExportOptions): Promise<Blob> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}/export`, {
    params: {
      reportType,
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      timeFrame: filters.timeFrame,
      format: options.format
    },
    responseType: 'blob'
  });
  return response.data;
};

// Helper function to generate dates based on timeframe
const generateDates = (startDate: Date, endDate: Date, timeFrame: string) => {
  switch (timeFrame) {
    case 'daily':
      return eachDayOfInterval({ start: startDate, end: endDate });
    case 'weekly':
      return eachWeekOfInterval({ start: startDate, end: endDate });
    case 'monthly':
      return eachMonthOfInterval({ start: startDate, end: endDate });
    default:
      return eachDayOfInterval({ start: startDate, end: endDate });
  }
};

// Helper function to format date based on timeframe
const formatDate = (date: Date, timeFrame: string) => {
  switch (timeFrame) {
    case 'daily':
      return format(date, 'MMM dd');
    case 'weekly':
      return `Week of ${format(date, 'MMM dd')}`;
    case 'monthly':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM dd');
  }
};

// Mock data for transaction volume
export const getMockTransactionVolume = (filters: ReportFilters): TransactionVolumeData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 100 + Math.floor(Math.random() * 50);
    const count = baseValue + (index * 5);
    
    return {
      date: formatDate(date, filters.timeFrame),
      count: count
    };
  });
};

// Mock data for transaction success rate
export const getMockTransactionSuccessRate = (filters: ReportFilters): TransactionSuccessRateData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date) => {
    const successRate = 90 + Math.floor(Math.random() * 10);
    
    return {
      date: formatDate(date, filters.timeFrame),
      successRate: successRate,
      failureRate: 100 - successRate
    };
  });
};

// Mock data for transaction type distribution
export const getMockTransactionTypeDistribution = (filters: ReportFilters): TransactionTypeDistributionData[] => {
  return [
    { type: 'Wallet to Wallet', count: 450, percentage: 45 },
    { type: 'Bank Transfer', count: 250, percentage: 25 },
    { type: 'Card Payment', count: 150, percentage: 15 },
    { type: 'Mobile Money', count: 100, percentage: 10 },
    { type: 'Other', count: 50, percentage: 5 }
  ];
};

// Mock data for average transaction value
export const getMockAverageTransactionValue = (filters: ReportFilters): AverageTransactionValueData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 50 + Math.floor(Math.random() * 20);
    const averageValue = baseValue + (index * 0.5);
    
    return {
      date: formatDate(date, filters.timeFrame),
      averageValue: averageValue
    };
  });
};

// Mock data for user registrations
export const getMockUserRegistrations = (filters: ReportFilters): UserRegistrationData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 20 + Math.floor(Math.random() * 10);
    const count = baseValue + (index * 2);
    
    return {
      date: formatDate(date, filters.timeFrame),
      count: count
    };
  });
};

// Mock data for active users
export const getMockActiveUsers = (filters: ReportFilters): ActiveUsersData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 500 + Math.floor(Math.random() * 100);
    const count = baseValue + (index * 10);
    
    return {
      date: formatDate(date, filters.timeFrame),
      count: count
    };
  });
};

// Mock data for user retention
export const getMockUserRetention = (filters: ReportFilters): UserRetentionData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  return [0, 1, 2, 3].map(monthsAgo => {
    const month = (currentMonth - monthsAgo + 12) % 12;
    const year = currentDate.getFullYear() - (monthsAgo > currentMonth ? 1 : 0);
    const cohort = `${months[month]} ${year}`;
    
    return {
      cohort,
      week1: 100,
      week2: Math.round(85 + Math.random() * 10),
      week3: Math.round(70 + Math.random() * 10),
      week4: Math.round(60 + Math.random() * 10)
    };
  });
};

// Mock data for geographic distribution
export const getMockGeographicDistribution = (filters: ReportFilters): GeographicDistributionData[] => {
  return [
    { country: 'Nigeria', count: 500, percentage: 30 },
    { country: 'Ghana', count: 300, percentage: 18 },
    { country: 'Kenya', count: 250, percentage: 15 },
    { country: 'South Africa', count: 200, percentage: 12 },
    { country: 'Uganda', count: 150, percentage: 9 },
    { country: 'Tanzania', count: 120, percentage: 7 },
    { country: 'Other', count: 150, percentage: 9 }
  ];
};

// Mock data for transaction value
export const getMockTransactionValue = (filters: ReportFilters): TransactionValueData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 10000 + Math.floor(Math.random() * 2000);
    const value = baseValue + (index * 100);
    
    return {
      date: formatDate(date, filters.timeFrame),
      value: value
    };
  });
};

// Mock data for fee revenue
export const getMockFeeRevenue = (filters: ReportFilters): FeeRevenueData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 500 + Math.floor(Math.random() * 100);
    const revenue = baseValue + (index * 10);
    
    return {
      date: formatDate(date, filters.timeFrame),
      revenue: revenue
    };
  });
};

// Mock data for transaction corridors
export const getMockTransactionCorridors = (filters: ReportFilters): TransactionCorridorData[] => {
  return [
    { corridor: 'Nigeria to Ghana', count: 300, value: 15000 },
    { corridor: 'Kenya to Uganda', count: 250, value: 12500 },
    { corridor: 'South Africa to Zimbabwe', count: 200, value: 10000 },
    { corridor: 'Ghana to Ivory Coast', count: 150, value: 7500 },
    { corridor: 'Nigeria to UK', count: 100, value: 5000 }
  ];
};

// Mock saved report configurations
export const getMockSavedReportConfigurations = (): SavedReportConfiguration[] => {
  return [
    {
      id: '1',
      name: 'Monthly Transaction Volume',
      description: 'Transaction volume for the last 90 days',
      reportType: 'transactionVolume',
      filters: {
        startDate: subDays(new Date(), 90),
        endDate: new Date(),
        timeFrame: 'monthly'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Weekly User Growth',
      description: 'User registrations for the last 60 days',
      reportType: 'userRegistrations',
      filters: {
        startDate: subDays(new Date(), 60),
        endDate: new Date(),
        timeFrame: 'weekly'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Revenue Overview',
      description: 'Fee revenue for the last 30 days',
      reportType: 'feeRevenue',
      filters: {
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
        timeFrame: 'daily'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Mock function to save a report configuration
export const saveMockReportConfiguration = (config: Omit<SavedReportConfiguration, 'id' | 'createdAt' | 'updatedAt'>): SavedReportConfiguration => {
  const newConfig: SavedReportConfiguration = {
    ...config,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newConfig;
};

// Mock function to update a report configuration
export const updateMockReportConfiguration = (config: SavedReportConfiguration): SavedReportConfiguration => {
  return {
    ...config,
    updatedAt: new Date().toISOString()
  };
};

// Mock function to delete a report configuration
export const deleteMockReportConfiguration = (id: string): boolean => {
  return true;
};

// Mock function to export a report
export const exportMockReport = (options: ReportExportOptions): Blob => {
  // In a real app, this would generate a file for download
  return new Blob(['Mock export data'], { type: 'text/plain' });
}; 