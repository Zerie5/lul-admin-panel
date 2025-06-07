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
  VisualizationType,
  UserRetentionResponse,
  PaydayCycleResponse
} from '../types/reports';
import * as reportService from '../services/reportService';
import { REFRESH_INTERVAL } from '../config';

// Default filters (last 30 days)
const defaultFilters: ReportFilters = {
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
  timeFrame: 'daily',
  currency: 'ALL',
  transactionTypeId: 'ALL',
  transactionStatusId: 'ALL'
};

// Hook for transaction volume data
export const useTransactionVolume = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'transactionVolume',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<TransactionVolumeData[], Error>(
    cacheKey,
    () => {
      try {
        // Use the real API call instead of mock data
        return reportService.getTransactionVolume(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction volume:', error);
        throw error; // Propagate the error to be handled by React Query
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
        // Use the real API call instead of mock data
        return reportService.getTransactionSuccessRate(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction success rate:', error);
        throw error; // Propagate the error to be handled by React Query
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
        // Use the real API call instead of mock data
        return reportService.getTransactionTypeDistribution(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction type distribution:', error);
        throw error; // Propagate the error to be handled by React Query
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
        // Use the real API call instead of mock data
        return reportService.getAverageTransactionValue(mergedFilters);
      } catch (error) {
        console.error('Error fetching average transaction value:', error);
        throw error; // Propagate the error to be handled by React Query
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
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'userRegistrations',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<{ data: UserRegistrationData[], total: number }, Error>(
    cacheKey,
    () => {
      try {
        console.log('🔄 useUserRegistrations query executing with filters:', {
          startDate: mergedFilters.startDate.toISOString().split('T')[0],
          endDate: mergedFilters.endDate.toISOString().split('T')[0],
          timeFrame: mergedFilters.timeFrame
        });
        // Use the real API call instead of mock data
        return reportService.getUserRegistrations(mergedFilters);
      } catch (error) {
        console.error('Error fetching user registrations:', error);
        throw error; // Propagate the error to be handled by React Query
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
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'activeUsers',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<{ data: ActiveUsersData[], total: number, uniqueActiveUsers: number }, Error>(
    cacheKey,
    () => {
      try {
        console.log('🔄 useActiveUsers query executing with filters:', {
          startDate: mergedFilters.startDate.toISOString().split('T')[0],
          endDate: mergedFilters.endDate.toISOString().split('T')[0],
          timeFrame: mergedFilters.timeFrame
        });
        // Use the real API call instead of mock data
        return reportService.getActiveUsers(mergedFilters);
      } catch (error) {
        console.error('Error fetching active users:', error);
        throw error; // Propagate the error to be handled by React Query
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
export const useUserRetention = (filters: ReportFilters) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };

  return useQuery<UserRetentionResponse, Error>(
    ['userRetention', mergedFilters],
    () => reportService.getUserRetention(mergedFilters),
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

// Hook for payday cycle analysis data
export const usePaydayCycleAnalysis = (filters: ReportFilters) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };

  return useQuery<PaydayCycleResponse, Error>(
    ['paydayCycleAnalysis', mergedFilters],
    () => reportService.getPaydayCycleAnalysis(mergedFilters),
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Payday cycle analysis query error:', error);
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
        // Use the real API call
        return reportService.getGeographicDistribution(mergedFilters);
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
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'transactionValue',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<TransactionValueData[], Error>(
    cacheKey,
    () => {
      try {
        console.log('🔄 useTransactionValue query executing with filters:', {
          startDate: mergedFilters.startDate.toISOString().split('T')[0],
          endDate: mergedFilters.endDate.toISOString().split('T')[0],
          timeFrame: mergedFilters.timeFrame,
          currency: mergedFilters.currency,
          transactionTypeId: mergedFilters.transactionTypeId,
          transactionStatusId: mergedFilters.transactionStatusId
        });
        // Use the real API call instead of mock data
        return reportService.getTransactionValue(mergedFilters);
      } catch (error) {
        console.error('Error fetching transaction value:', error);
        throw error; // Propagate the error to be handled by React Query
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
      console.log('🔄 useFeeRevenue query executing with filters:', {
        startDate: mergedFilters.startDate.toISOString().split('T')[0],
        endDate: mergedFilters.endDate.toISOString().split('T')[0],
        timeFrame: mergedFilters.timeFrame,
        currency: mergedFilters.currency,
        transactionTypeId: mergedFilters.transactionTypeId,
        transactionStatusId: mergedFilters.transactionStatusId
      });
      // Use the real API call - no fallback to mock data
      return reportService.getFeeRevenue(mergedFilters);
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Fee revenue query error:', error);
      },
      keepPreviousData: true,
      enabled: !!(mergedFilters.startDate && mergedFilters.endDate)
    }
  );
};

// Hook for transaction corridors data
export const useTransactionCorridors = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  return useQuery<TransactionCorridorData[], Error>(
    ['transactionCorridors', mergedFilters],
    () => {
      console.log('🔄 useTransactionCorridors query executing with filters:', {
        startDate: mergedFilters.startDate.toISOString().split('T')[0],
        endDate: mergedFilters.endDate.toISOString().split('T')[0],
        timeFrame: mergedFilters.timeFrame,
        currency: mergedFilters.currency,
        transactionTypeId: mergedFilters.transactionTypeId,
        transactionStatusId: mergedFilters.transactionStatusId
      });
      // Use the real API call instead of mock data
      return reportService.getTransactionCorridors(mergedFilters);
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Transaction corridors query error:', error);
      },
      keepPreviousData: true,
      enabled: !!(mergedFilters.startDate && mergedFilters.endDate)
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
    queryClient.invalidateQueries(['paydayCycleAnalysis']);
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

// Hook for user registration count (for the card display)
export const useUserRegistrationCount = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'userRegistrationCount',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<number, Error>(
    cacheKey,
    () => {
      try {
        console.log('🔄 useUserRegistrationCount query executing with filters:', {
          startDate: mergedFilters.startDate.toISOString().split('T')[0],
          endDate: mergedFilters.endDate.toISOString().split('T')[0],
          timeFrame: mergedFilters.timeFrame
        });
        // Use the new API call for registration count
        return reportService.getUserRegistrationCount(mergedFilters);
      } catch (error) {
        console.error('Error fetching user registration count:', error);
        throw error; // Propagate the error to be handled by React Query
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('User registration count query error:', error);
      }
    }
  );
};

// Hook for active user count (for the card display)
export const useActiveUserCount = (filters: Partial<ReportFilters> = {}) => {
  const mergedFilters: ReportFilters = { ...defaultFilters, ...filters };
  
  // Create a serializable cache key that properly handles Date objects
  const cacheKey = [
    'activeUserCount',
    {
      startDate: mergedFilters.startDate.toISOString(),
      endDate: mergedFilters.endDate.toISOString(),
      timeFrame: mergedFilters.timeFrame,
      currency: mergedFilters.currency,
      transactionTypeId: mergedFilters.transactionTypeId,
      transactionStatusId: mergedFilters.transactionStatusId
    }
  ];
  
  return useQuery<number, Error>(
    cacheKey,
    () => {
      try {
        console.log('🔄 useActiveUserCount query executing with filters:', {
          startDate: mergedFilters.startDate.toISOString().split('T')[0],
          endDate: mergedFilters.endDate.toISOString().split('T')[0],
          timeFrame: mergedFilters.timeFrame
        });
        // Use the new API call for active user count
        return reportService.getActiveUserCount(mergedFilters);
      } catch (error) {
        console.error('Error fetching active user count:', error);
        throw error; // Propagate the error to be handled by React Query
      }
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: REFRESH_INTERVAL / 2,
      retry: 2,
      onError: (error) => {
        console.error('Active user count query error:', error);
      }
    }
  );
}; 