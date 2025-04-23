import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import dashboardService, { TransactionFilters, TransactionTime, UserActivityResponse } from '../services/dashboardService';
import { debug, logError } from '../utils/debug';

// Debug identifier for this module
const DEBUG_AREA = 'useDashboardData';

// Set to false to completely disable mock data
const SHOULD_USE_MOCK_DATA = false;

/**
 * Hook for fetching dashboard summary data
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 */
export const useDashboardSummary = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useDashboardSummary hook called', { startDate, endDate });
  
  return useQuery(
    ['dashboardSummary', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching dashboard summary data', { startDate, endDate });
      
      console.log('🔍 SUMMARY API CALL: Fetching with date params:', { startDate, endDate });
      const data = await dashboardService.fetchDashboardSummary(startDate, endDate);
      console.log('✅ SUMMARY API CALL: Successful response:', data);
      debug(DEBUG_AREA, 'Dashboard summary data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching transaction trends data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useTransactionTrends = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useTransactionTrends hook called', { startDate, endDate });
  
  return useQuery(
    ['transactionTrends', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching transaction trends data', { startDate, endDate });
      
      const data = await dashboardService.fetchTransactionTrends(startDate, endDate);
      debug(DEBUG_AREA, 'Transaction trends data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching user activity data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useUserActivity = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useUserActivity hook called', { startDate, endDate });
  
  return useQuery<UserActivityResponse>(
    ['userActivity', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching user activity data', { startDate, endDate });
      
      const data = await dashboardService.fetchUserActivity(startDate, endDate);
      debug(DEBUG_AREA, 'User activity data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      onError: (error) => {
        console.error('Failed to fetch user activity data:', error);
      }
    }
  );
};

/**
 * Hook to fetch recent transactions data
 * @param limit Number of transactions to fetch (default: 10)
 * @param page Page number for pagination (0-indexed, default: 0)
 * @param startDate Optional start date for filtering (YYYY-MM-DD)
 * @param endDate Optional end date for filtering (YYYY-MM-DD)
 * @param filters Optional transaction filters
 * @returns Recent transactions query
 */
export const useRecentTransactions = (
  limit: number = 10,
  page: number = 0,
  startDate?: string,
  endDate?: string,
  filters?: TransactionFilters
) => {
  // Create a stable, serialized representation of the filters
  const filtersKey = filters 
    ? `${filters.searchTerm || ''}-${filters.searchCategory || ''}-${filters.statusFilter || ''}-${filters.typeFilter || ''}`
    : 'no-filters';
    
  // Create the query key
  const queryKey = ['recentTransactions', limit, page, startDate || 'no-start', endDate || 'no-end', filtersKey];
  
  // Log the query key and parameters
  console.log('useRecentTransactions called with:', {
    limit, page, startDate, endDate, filters
  });
  console.log('Query key:', queryKey);
  
  return useQuery(
    queryKey,
    () => {
      console.log('Executing API call with params:', { limit, page, startDate, endDate, filters });
      return dashboardService.fetchRecentTransactions(limit, page, startDate, endDate, filters);
    },
    {
      staleTime: 30 * 1000, // 30 seconds - reduced to make testing easier
      retry: 1, // Only retry once - reduces waiting time during errors
      onSuccess: (data) => {
        console.log('API call successful, received:', {
          totalElements: data?.totalElements,
          contentLength: data?.content?.length,
          firstRecord: data?.content?.[0]
        });
      },
      onError: (error) => {
        console.error('API call failed:', error);
      },
      keepPreviousData: true
    }
  );
};

/**
 * Hook to fetch transactions with server-side filtering
 * @param limit Number of transactions to fetch per page
 * @param page Page number for pagination (0-indexed)
 * @param startDate Optional start date for filtering (YYYY-MM-DD)
 * @param endDate Optional end date for filtering (YYYY-MM-DD)
 * @param filters Optional transaction filters
 * @returns Filtered transactions query
 */
export const useFilteredTransactions = (
  limit: number = 10,
  page: number = 0,
  startDate?: string,
  endDate?: string,
  filters?: TransactionFilters
) => {
  // Create a stable, serialized representation of the filters
  const filtersKey = filters 
    ? `${filters.searchTerm || ''}-${filters.searchCategory || ''}-${filters.statusFilter || ''}-${filters.typeFilter || ''}`
    : 'no-filters';
    
  // Create the query key
  const queryKey = ['filteredTransactions', limit, page, startDate || 'no-start', endDate || 'no-end', filtersKey];
  
  // Log the query key and parameters
  console.log('useFilteredTransactions called with:', {
    limit, page, startDate, endDate, filters
  });
  console.log('Query key:', queryKey);
  
  return useQuery(
    queryKey,
    () => {
      console.log('Executing filtered transactions API call with params:', { 
        limit, page, startDate, endDate, filters 
      });
      return dashboardService.fetchFilteredTransactions(limit, page, startDate, endDate, filters);
    },
    {
      staleTime: 0, // Consider data stale immediately
      cacheTime: 0, // Don't cache results
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: 1, // Only retry once
      onSuccess: (data) => {
        console.log('Filtered transactions API call successful, received:', {
          totalElements: data?.totalElements,
          totalPages: data?.totalPages,
          contentLength: data?.content?.length,
          firstRecord: data?.content?.[0]
        });
      },
      onError: (error) => {
        console.error('Filtered transactions API call failed:', error);
      },
      keepPreviousData: false // Don't keep previous data while loading new data
    }
  );
};

/**
 * Hook for fetching metrics summary data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useMetricsSummary = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useMetricsSummary hook called', { startDate, endDate });
  
  return useQuery(
    ['metricsSummary', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching metrics summary data', { startDate, endDate });
      
      const data = await dashboardService.fetchMetricsSummary(startDate, endDate);
      debug(DEBUG_AREA, 'Metrics summary data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching transaction processing statistics
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useProcessingStats = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useProcessingStats hook called', { startDate, endDate });
  
  return useQuery(
    ['processingStats', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching processing stats data', { startDate, endDate });
      
      const data = await dashboardService.fetchProcessingStats(startDate, endDate);
      debug(DEBUG_AREA, 'Processing stats data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching transaction success rate
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useSuccessRate = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useSuccessRate hook called', { startDate, endDate });
  
  return useQuery(
    ['successRate', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching success rate data', { startDate, endDate });
      
      const data = await dashboardService.fetchSuccessRate(startDate, endDate);
      debug(DEBUG_AREA, 'Success rate data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching transaction reversal rate
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useReversalRate = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useReversalRate hook called', { startDate, endDate });
  
  return useQuery(
    ['reversalRate', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching reversal rate data', { startDate, endDate });
      
      const data = await dashboardService.fetchReversalRate(startDate, endDate);
      debug(DEBUG_AREA, 'Reversal rate data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for fetching transaction processing time
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 */
export const useTransactionTime = (startDate?: string, endDate?: string) => {
  debug(DEBUG_AREA, 'useTransactionTime hook called', { startDate, endDate });
  
  return useQuery(
    ['transactionTime', startDate, endDate],
    async () => {
      debug(DEBUG_AREA, 'Fetching transaction time data', { startDate, endDate });
      
      const data = await dashboardService.fetchTransactionTime(startDate, endDate);
      debug(DEBUG_AREA, 'Transaction time data fetched successfully', data);
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000) // Exponential backoff
    }
  );
};

/**
 * Hook for refreshing all dashboard data
 */
export const useRefreshDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const refreshAll = async () => {
    debug(DEBUG_AREA, 'Refreshing all dashboard data');
    setIsRefreshing(true);
    
    try {
      console.log('Invalidating all dashboard queries for refresh');
      
      // Invalidate each query individually and catch errors separately
      const promises = [
        queryClient.invalidateQueries(['dashboardSummary'])
          .catch(e => console.error('Error refreshing summary:', e)),
        queryClient.invalidateQueries(['transactionTrends'])
          .catch(e => console.error('Error refreshing trends:', e)),
        queryClient.invalidateQueries(['userActivity'])
          .catch(e => console.error('Error refreshing activity:', e)),
        queryClient.invalidateQueries(['recentTransactions'])
          .catch(e => console.error('Error refreshing transactions:', e)),
        queryClient.invalidateQueries(['filteredTransactions'])
          .catch(e => console.error('Error refreshing filtered transactions:', e)),
        queryClient.invalidateQueries(['processingStats'])
          .catch(e => console.error('Error refreshing processing stats:', e)),
        queryClient.invalidateQueries(['transactionTime'])
          .catch(e => console.error('Error refreshing transaction time:', e)),
        queryClient.invalidateQueries(['successRate'])
          .catch(e => console.error('Error refreshing success rate:', e)),
        queryClient.invalidateQueries(['reversalRate'])
          .catch(e => console.error('Error refreshing reversal rate:', e)),
        queryClient.invalidateQueries(['metricsSummary'])
          .catch(e => console.error('Error refreshing metrics:', e))
      ];
      
      await Promise.allSettled(promises);
      debug(DEBUG_AREA, 'All dashboard data refresh attempts completed');
    } catch (error) {
      logError(DEBUG_AREA, 'Error during refresh operation', error);
      console.error('Global error during dashboard refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return {
    refreshAll,
    isRefreshing
  };
};

export default {
  useDashboardSummary,
  useTransactionTrends,
  useUserActivity,
  useRecentTransactions,
  useFilteredTransactions,
  useProcessingStats,
  useSuccessRate,
  useReversalRate,
  useRefreshDashboard,
  useTransactionTime,
  useMetricsSummary
};