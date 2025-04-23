import { useQuery, useQueryClient, useMutation } from 'react-query';
import { subDays } from 'date-fns';
import { 
  TimeFrame,
  ReportFilters,
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
  SavedReportConfiguration,
  ReportExportOptions,
  VisualizationType
} from '../types/reports';
import * as reportService from '../services/reportService';
import { REFRESH_INTERVAL } from '../config';
import React from 'react';

// Default filters (last 30 days)
const defaultFilters: ReportFilters = {
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
  timeFrame: 'daily'
};

// Hook for transaction volume data
export const useTransactionVolume = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionVolumeData[], Error>(
    ['transactionVolume', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getTransactionVolume(mergedFilters);
        return reportService.getMockTransactionVolume(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction volume:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction volume query error:', error);
      }
    }
  );
};

// Hook for transaction success rate data
export const useTransactionSuccessRate = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionSuccessRateData[], Error>(
    ['transactionSuccessRate', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getTransactionSuccessRate(mergedFilters);
        return reportService.getMockTransactionSuccessRate(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction success rate:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction success rate query error:', error);
      }
    }
  );
};

// Hook for transaction type distribution data
export const useTransactionTypeDistribution = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionTypeDistributionData[], Error>(
    ['transactionTypeDistribution', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getTransactionTypeDistribution(mergedFilters);
        return reportService.getMockTransactionTypeDistribution(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction type distribution:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction type distribution query error:', error);
      }
    }
  );
};

// Hook for average transaction value data
export const useAverageTransactionValue = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<AverageTransactionValueData[], Error>(
    ['averageTransactionValue', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getAverageTransactionValue(mergedFilters);
        return reportService.getMockAverageTransactionValue(mergedFilters);
      } catch (error) {
        console.error('Error fetching average transaction value:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Average transaction value query error:', error);
      }
    }
  );
};

// Hook for user registrations data
export const useUserRegistrations = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<UserRegistrationData[], Error>(
    ['userRegistrations', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getUserRegistrations(mergedFilters);
        return reportService.getMockUserRegistrations(mergedFilters);
      } catch (error) {
        console.error('Error fetching user registrations:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('User registrations query error:', error);
      }
    }
  );
};

// Hook for active users data
export const useActiveUsers = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<ActiveUsersData[], Error>(
    ['activeUsers', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getActiveUsers(mergedFilters);
        return reportService.getMockActiveUsers(mergedFilters);
      } catch (error) {
        console.error('Error fetching active users:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Active users query error:', error);
      }
    }
  );
};

// Hook for user retention data
export const useUserRetention = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<UserRetentionData[], Error>(
    ['userRetention', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getUserRetention(mergedFilters);
        return reportService.getMockUserRetention(mergedFilters);
      } catch (error) {
        console.error('Error fetching user retention:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('User retention query error:', error);
      }
    }
  );
};

// Hook for geographic distribution data
export const useGeographicDistribution = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<GeographicDistributionData[], Error>(
    ['geographicDistribution', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getGeographicDistribution(mergedFilters);
        return reportService.getMockGeographicDistribution(mergedFilters);
      } catch (error) {
        console.error('Error fetching geographic distribution:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Geographic distribution query error:', error);
      }
    }
  );
};

// Hook for transaction value data
export const useTransactionValue = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionValueData[], Error>(
    ['transactionValue', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getTransactionValue(mergedFilters);
        return reportService.getMockTransactionValue(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction value:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction value query error:', error);
      }
    }
  );
};

// Hook for fee revenue data
export const useFeeRevenue = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<FeeRevenueData[], Error>(
    ['feeRevenue', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getFeeRevenue(mergedFilters);
        return reportService.getMockFeeRevenue(mergedFilters);
      } catch (error) {
        console.error('Error fetching fee revenue:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Fee revenue query error:', error);
      }
    }
  );
};

// Hook for transaction corridors data
export const useTransactionCorridors = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionCorridorData[], Error>(
    ['transactionCorridors', mergedFilters],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getTransactionCorridors(mergedFilters);
        return reportService.getMockTransactionCorridors(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction corridors:', error);
        return [];
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction corridors query error:', error);
      }
    }
  );
};

// Hook to refresh all reports data
export const useRefreshReports = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries(['transactionVolume']);
    queryClient.invalidateQueries(['transactionSuccessRate']);
    queryClient.invalidateQueries(['transactionTypeDistribution']);
    queryClient.invalidateQueries(['averageTransactionValue']);
    queryClient.invalidateQueries(['userRegistrations']);
    queryClient.invalidateQueries(['activeUsers']);
    queryClient.invalidateQueries(['userRetention']);
    queryClient.invalidateQueries(['geographicDistribution']);
    queryClient.invalidateQueries(['transactionValue']);
    queryClient.invalidateQueries(['feeRevenue']);
    queryClient.invalidateQueries(['transactionCorridors']);
  };
};

// Hook for saved report configurations
export const useSavedReportConfigurations = () => {
  return useQuery<SavedReportConfiguration[], Error>(
    ['savedReportConfigurations'],
    () => {
      try {
        // In a real app, use the actual API call
        // return reportService.getSavedReportConfigurations();
        return reportService.getMockSavedReportConfigurations();
      } catch (error) {
        console.error('Error fetching saved report configurations:', error);
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        console.error('Saved report configurations query error:', error);
      }
    }
  );
};

// Hook for saving a report configuration
export const useSaveReportConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    SavedReportConfiguration,
    Error,
    Omit<SavedReportConfiguration, 'id' | 'createdAt' | 'updatedAt'>
  >(
    (configuration) => reportService.saveReportConfiguration(configuration),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedReportConfigurations');
      }
    }
  );
};

// Hook for updating a report configuration
export const useUpdateReportConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    SavedReportConfiguration,
    Error,
    { id: string; configuration: Partial<SavedReportConfiguration> }
  >(
    ({ id, configuration }) => reportService.updateReportConfiguration(id, configuration),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedReportConfigurations');
      }
    }
  );
};

// Hook for deleting a report configuration
export const useDeleteReportConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>(
    (id) => reportService.deleteReportConfiguration(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedReportConfigurations');
      }
    }
  );
};

// Hook for exporting report data
export const useExportReport = () => {
  return useMutation<
    Blob,
    Error,
    { reportType: string; filters: ReportFilters; options: ReportExportOptions }
  >(
    ({ reportType, filters, options }) => 
      reportService.exportReportData(reportType, filters, options)
  );
};

// Hook for toggling visualization type
export const useVisualizationType = (initialType: VisualizationType = 'line') => {
  const [visualizationType, setVisualizationType] = React.useState<VisualizationType>(initialType);
  
  const toggleVisualizationType = (type: VisualizationType) => {
    setVisualizationType(type);
  };
  
  return { visualizationType, toggleVisualizationType };
}; 