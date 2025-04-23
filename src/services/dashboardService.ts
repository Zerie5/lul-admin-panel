import httpService from './httpService';
import { debug, logError, startTimer } from '../utils/debug';
import axios from 'axios';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API endpoints for dashboard data
const API_ENDPOINTS = {
  SUMMARY: '/api/admin/dashboard/summary',
  TRANSACTION_TRENDS: '/api/admin/dashboard/transaction-trends',
  USER_ACTIVITY: '/api/admin/dashboard/user-activity',
  RECENT_TRANSACTIONS: '/api/admin/dashboard/recent-transactions',
  FILTER_TRANSACTIONS: '/api/admin/dashboard/filter-transactions',
  TRANSACTION_TIME: '/api/admin/dashboard/transaction-time',
  PROCESSING_STATS: '/api/admin/dashboard/processing/stats',
  SUCCESS_RATE: '/api/admin/dashboard/success-rate',
  REVERSAL_RATE: '/api/admin/dashboard/reversal-rate',
  METRICS_SUMMARY: '/api/admin/dashboard/metrics-summary'
};

// Console log the available endpoints (for debugging)
console.log('Dashboard API Endpoints:', {
  summary: API_ENDPOINTS.SUMMARY,
  trends: API_ENDPOINTS.TRANSACTION_TRENDS,
  activity: API_ENDPOINTS.USER_ACTIVITY,
  transactions: API_ENDPOINTS.RECENT_TRANSACTIONS,
  metrics: API_ENDPOINTS.METRICS_SUMMARY,
  baseUrl: API_BASE_URL
});

// Interface for dashboard summary data
export interface DashboardSummary {
  totalTransactions: number;
  totalTransactionValue: number;
  activeUsers: number;
  totalRevenue: number;
}

// Interface for transaction trends data
export interface TransactionTrend {
  date: string;
  count: number;
  value: number;
}

// Interface for transaction trends response
export interface TransactionTrendsResponse {
  success: boolean;
  data: TransactionTrend[];
  timeframe: {
    start: string;
    end: string;
  };
}

// Interface for user metrics data
export interface UserMetric {
  date: string;
  newUsers: number;
  activeUsers: number;
}

// Interface for user metrics response
export interface UserMetricsResponse {
  success: boolean;
  data: UserMetric[];
  timeframe: {
    start: string;
    end: string;
  };
}

// Interface for date range filter
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Interface for metrics summary data
export interface MetricsSummary {
  avgTransactionSize: number;
  feeRatio: number;
  userGrowth: number;
  transactionsPerUser: number;
}

// Interface for metrics summary response
export interface MetricsSummaryResponse {
  success: boolean;
  data: MetricsSummary;
  timeframe: {
    start: string;
    end: string;
  };
}

// Interface for recent transaction data
export interface RecentTransaction {
  id: string;
  userName: string;
  receiverName: string;
  senderPhone: string;
  receiverPhone: string;
  senderWorkerId: string;
  receiverWorkerId: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  timestamp: string;
}

// Interface for recent transactions response
export interface RecentTransactionsResponse {
  content: RecentTransaction[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TransactionFilters {
  searchTerm?: string;
  searchCategory?: string;
  statusFilter?: string | null;
  typeFilter?: string | null;
}

// Interface for transaction processing stats
export interface ProcessingStats {
  averageTimeSeconds: number;
  formattedTime: string;
  averageTimeByType: {
    WALLET_TO_WALLET?: number;
    DEPOSIT?: number;
    NON_WALLET?: number;
    BUSINESS_PAYMENT?: number;
    CURRENCY_SWAP?: number;
    [key: string]: number | undefined;
  };
}

// Interface for transaction success rate
export interface SuccessRateStats {
  successRate: number;
  formattedRate: string;
  successRateByType: {
    WALLET_TO_WALLET?: number;
    DEPOSIT?: number;
    NON_WALLET?: number;
    BUSINESS_PAYMENT?: number;
    CURRENCY_SWAP?: number;
    [key: string]: number | undefined;
  };
  formattedRateByType: {
    WALLET_TO_WALLET?: string;
    DEPOSIT?: string;
    NON_WALLET?: string;
    BUSINESS_PAYMENT?: string;
    CURRENCY_SWAP?: string;
    [key: string]: string | undefined;
  };
}

// Interface for transaction processing time
export interface TransactionTime {
  averageProcessingTime: number;
  processingTimeByType: {
    WALLET_TO_WALLET?: number;
    DEPOSIT?: number;
    NON_WALLET?: number;
    BUSINESS_PAYMENT?: number;
    CURRENCY_SWAP?: number;
    [key: string]: number | undefined;
  };
  formattedAverageTime: string;
}

// Interface for transaction reversal rate
export interface ReversalRateStats {
  overallReversalRate: number;
  reversalRateByType: {
    DEPOSIT?: number;
    WITHDRAWAL?: number;
    WALLET_TO_WALLET?: number;
    BUSINESS_PAYMENT?: number;
    NON_WALLET?: number;
    CURRENCY_SWAP?: number;
    [key: string]: number | undefined;
  };
  formattedReversalRate: string;
}

// Update with the new user activity interface that matches the API response
export interface UserActivityResponse {
  totalActiveUsers: number;
  activeUsersByDate: Record<string, number>;
  newUsersByDate: Record<string, number>;
  transactionsByDate: Record<string, number>;
  averageDailyActiveUsers: number;
  userGrowthRate: number;
}

/**
 * Formats a date string to YYYY-MM-DD format
 * @param dateStr Date string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
const formatDateParam = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr; // Return original if parsing fails
  }
};

/**
 * Fetches dashboard summary data
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Dashboard summary data
 */
export const fetchDashboardSummary = async (startDate?: string, endDate?: string): Promise<DashboardSummary> => {
  console.log('fetchDashboardSummary called with:', { startDate, endDate });
  const timer = startTimer('fetchDashboardSummary');
  debug('DashboardService', 'Fetching dashboard summary', { startDate, endDate });
  
  try {
    const params: Record<string, string> = {};
    
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
      console.log('Formatted startDate:', params.startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
      console.log('Formatted endDate:', params.endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.SUMMARY} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.SUMMARY, params);
    console.log('Dashboard summary response:', response);
    debug('DashboardService', 'Successfully fetched dashboard summary', response);
    timer();
    
    // Handle direct response format (as described in the API docs)
    if (response && typeof response === 'object') {
      if (response.totalTransactions !== undefined) {
        return response as DashboardSummary;
      } else if (response.success === true && response.data) {
        // Alternative wrapper format
        return response.data;
      }
    }
    
    // Throw error if response format is unexpected
    console.error('Dashboard summary response format unexpected:', response);
    throw new Error('Invalid response format from summary API');
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    logError('DashboardService', 'Failed to fetch dashboard summary', error);
    timer();
    throw error;
  }
};

/**
 * Fetches transaction trends data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 * @returns Transaction trends data
 */
export const fetchTransactionTrends = async (startDate?: string, endDate?: string): Promise<TransactionTrend[]> => {
  console.log('fetchTransactionTrends called with:', { startDate, endDate });
  const timer = startTimer('fetchTransactionTrends');
  
  try {
    const params: Record<string, string> = {};
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.TRANSACTION_TRENDS} with params:`, params);
    const response: TransactionTrendsResponse = await httpService.get(API_ENDPOINTS.TRANSACTION_TRENDS, params);
    debug('DashboardService', 'Successfully fetched transaction trends', response);
    timer();
    
    // Return the data array from the response
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Transaction trends response format unexpected:', response);
      throw new Error('Invalid response format from transaction trends API');
    }
  } catch (error) {
    console.error('Failed to fetch transaction trends:', error);
    logError('DashboardService', 'Failed to fetch transaction trends', error);
    timer();
    throw error;
  }
};

/**
 * Fetches user activity data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 * @returns User activity data
 */
export const fetchUserActivity = async (startDate?: string, endDate?: string): Promise<UserActivityResponse> => {
  console.log('fetchUserActivity called with:', { startDate, endDate });
  const timer = startTimer('fetchUserActivity');
  
  try {
    const params: Record<string, string> = {};
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.USER_ACTIVITY} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.USER_ACTIVITY, params);
    console.log('User activity response:', response);
    debug('DashboardService', 'Successfully fetched user activity metrics', response);
    timer();
    
    // Handle different response formats with better error handling
    if (!response || typeof response !== 'object') {
      console.error('Invalid user activity response format:', response);
      throw new Error('Invalid response format from user activity API');
    }
    
    // Verify if the response matches the expected structure
    if (
      'totalActiveUsers' in response &&
      'activeUsersByDate' in response &&
      'newUsersByDate' in response &&
      'transactionsByDate' in response
    ) {
      return response as UserActivityResponse;
    } else if (response.success && response.data) {
      // Handle legacy response format if needed
      console.warn('Received legacy response format for user activity, transforming...');
      return response.data;
    } else {
      console.error('User activity response missing required fields:', response);
      throw new Error('Invalid response structure from user activity API');
    }
  } catch (error) {
    console.error('Failed to fetch user activity metrics:', error);
    logError('DashboardService', 'Failed to fetch user activity metrics', error);
    timer();
    throw error;
  }
};

/**
 * Fetches recent transactions data
 * @param limit Number of transactions to fetch (default: 10)
 * @param page Page number for pagination (0-indexed, default: 0)
 * @param startDate Optional start date for filtering (YYYY-MM-DD)
 * @param endDate Optional end date for filtering (YYYY-MM-DD)
 * @param filters Optional transaction filters
 * @returns Recent transactions data with pagination info
 */
export const fetchRecentTransactions = async (
  limit: number = 10,
  page: number = 0,
  startDate?: string,
  endDate?: string,
  filters?: TransactionFilters
): Promise<RecentTransactionsResponse> => {
  console.log('%c API CALL - fetchRecentTransactions', 'background: #ff9800; color: white; padding: 2px 8px; font-weight: bold; border-radius: 4px;');
  console.log('URL:', API_ENDPOINTS.RECENT_TRANSACTIONS);
  console.log('Parameters:', {
    limit,
    page,
    startDate,
    endDate,
    filters
  });
  
  const timer = startTimer('fetchRecentTransactions');
  
  try {
    const params: Record<string, string | number> = {
      limit,
      page
    };
    
    // Add date filters
    if (startDate) {
      console.log('Adding startDate param:', startDate);
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      console.log('Adding endDate param:', endDate);
      params.endDate = formatDateParam(endDate);
    }

    // Add search parameters - even if searchCategory is undefined, 
    // the backend needs the searchTerm to search across all fields
    if (filters?.searchTerm) {
      console.log('Adding searchTerm param:', filters.searchTerm);
      params.searchTerm = filters.searchTerm;
      
      if (filters.searchCategory) {
        console.log('Adding searchCategory param:', filters.searchCategory);
        
        // Send the category as-is - backend should handle the field mapping
        params.searchCategory = filters.searchCategory;
        console.log('Using category directly:', filters.searchCategory);
      } else {
        console.log('No search category specified, backend will search all fields');
      }
    }

    // Add filter parameters
    if (filters?.statusFilter) {
      console.log('Adding statusFilter param:', filters.statusFilter);
      params.statusFilter = filters.statusFilter;
    }
    if (filters?.typeFilter) {
      console.log('Adding typeFilter param:', filters.typeFilter);
      params.typeFilter = filters.typeFilter;
    }
    
    console.log('Final API params:', params);
    console.log(`MAKING HTTP GET TO: ${API_ENDPOINTS.RECENT_TRANSACTIONS}`);
    const response = await httpService.get(API_ENDPOINTS.RECENT_TRANSACTIONS, params);
    console.log('API RESPONSE RECEIVED:', {
      success: true,
      url: API_ENDPOINTS.RECENT_TRANSACTIONS,
      params,
      totalElements: response?.totalElements,
      contentLength: response?.content?.length,
      firstRecord: response?.content?.[0]
    });
    
    timer();
    return response;
  } catch (error) {
    console.error('API ERROR - Failed to fetch recent transactions:', error);
    console.error('API called with:', API_ENDPOINTS.RECENT_TRANSACTIONS);
    console.error('API params:', {
      limit,
      page,
      startDate,
      endDate,
      filters
    });
    timer();
    throw error;
  }
};

/**
 * Fetches metrics summary data
 * @param startDate Optional start date for filtering in ISO format (YYYY-MM-DD)
 * @param endDate Optional end date for filtering in ISO format (YYYY-MM-DD)
 * @returns Metrics summary data
 */
export const fetchMetricsSummary = async (startDate?: string, endDate?: string): Promise<MetricsSummary> => {
  console.log('fetchMetricsSummary called with:', { startDate, endDate });
  const timer = startTimer('fetchMetricsSummary');
  
  try {
    const params: Record<string, string> = {};
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.METRICS_SUMMARY} with params:`, params);
    const response: MetricsSummaryResponse = await httpService.get(API_ENDPOINTS.METRICS_SUMMARY, params);
    debug('DashboardService', 'Successfully fetched metrics summary', response);
    timer();
    
    // Return the data from the response
    if (response.success && response.data) {
      return response.data;
    } else {
      console.error('Metrics summary response format unexpected:', response);
      throw new Error('Invalid response format from metrics summary API');
    }
  } catch (error) {
    console.error('Failed to fetch metrics summary:', error);
    logError('DashboardService', 'Failed to fetch metrics summary', error);
    timer();
    throw error;
  }
};

/**
 * Fetches filtered transactions with server-side filtering and pagination
 * @param limit Number of records per page (default: 10)
 * @param page Current page number (0-based, default: 0)
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @param filters Optional filters for transactions
 * @returns Filtered transactions data with pagination metadata
 */
export const fetchFilteredTransactions = async (
  limit: number = 10,
  page: number = 0,
  startDate?: string,
  endDate?: string,
  filters?: TransactionFilters
): Promise<RecentTransactionsResponse> => {
  console.log('fetchFilteredTransactions called with:', { 
    limit, page, startDate, endDate, filters 
  });
  const timer = startTimer('fetchFilteredTransactions');
  
  try {
    const params: Record<string, any> = {
      limit,
      page
    };
    
    // Add date filters if present
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    // Add search filters if present
    if (filters?.searchTerm) {
      params.searchTerm = filters.searchTerm;
    }
    if (filters?.searchCategory) {
      params.searchCategory = filters.searchCategory;
    }
    
    // Add status filter if present
    if (filters?.statusFilter) {
      params.statusFilter = filters.statusFilter;
    }
    
    // Add type filter if present
    if (filters?.typeFilter) {
      // Do not transform the values - send exactly as received from UI
      // The backend expects: "wallet", "non-wallet", "deposit", "business", or "currency-swap"
      console.log(`Sending typeFilter value to API: '${filters.typeFilter}'`);
      params.typeFilter = filters.typeFilter;
    }
    
    console.log(`Calling ${API_ENDPOINTS.FILTER_TRANSACTIONS} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.FILTER_TRANSACTIONS, params);
    
    debug('DashboardService', 'Successfully fetched filtered transactions', {
      params,
      responseSize: response?.content?.length || 0,
      totalElements: response?.totalElements || 0
    });
    
    timer();
    return response;
  } catch (error) {
    console.error('Failed to fetch filtered transactions:', error);
    logError('DashboardService', 'Failed to fetch filtered transactions', error);
    timer();
    throw error;
  }
};

/**
 * Fetches transaction processing time statistics
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Transaction processing time data
 */
export const fetchTransactionTime = async (
  startDate?: string, 
  endDate?: string
): Promise<TransactionTime> => {
  console.log('fetchTransactionTime called with:', { startDate, endDate });
  const timer = startTimer('fetchTransactionTime');
  
  try {
    const params: Record<string, string> = {};
    
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.TRANSACTION_TIME} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.TRANSACTION_TIME, params);
    debug('DashboardService', 'Successfully fetched transaction time stats', response);
    timer();
    return response;
  } catch (error) {
    console.error('Failed to fetch transaction time stats:', error);
    logError('DashboardService', 'Failed to fetch transaction time stats', error);
    timer();
    throw error;
  }
};

/**
 * Fetches transaction processing time statistics
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Processing stats data
 */
export const fetchProcessingStats = async (
  startDate?: string, 
  endDate?: string
): Promise<ProcessingStats> => {
  console.log('fetchProcessingStats called with:', { startDate, endDate });
  const timer = startTimer('fetchProcessingStats');
  
  try {
    const params: Record<string, string> = {};
    
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.PROCESSING_STATS} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.PROCESSING_STATS, params);
    debug('DashboardService', 'Successfully fetched processing stats', response);
    timer();
    return response;
  } catch (error) {
    console.error('Failed to fetch processing stats:', error);
    logError('DashboardService', 'Failed to fetch processing stats', error);
    timer();
    throw error;
  }
};

/**
 * Fetches transaction success rate statistics
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Success rate stats data
 */
export const fetchSuccessRate = async (
  startDate?: string, 
  endDate?: string
): Promise<SuccessRateStats> => {
  console.log('fetchSuccessRate called with:', { startDate, endDate });
  const timer = startTimer('fetchSuccessRate');
  
  try {
    const params: Record<string, string> = {};
    
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.SUCCESS_RATE} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.SUCCESS_RATE, params);
    console.log('Raw success rate response:', response);
    
    // Handle different response formats
    let successRateData: SuccessRateStats;
    
    if (response && typeof response === 'object') {
      if (response.successRate !== undefined) {
        // Direct response format
        successRateData = response as SuccessRateStats;
      } else if (response.data && response.data.successRate !== undefined) {
        // Wrapped response format
        successRateData = response.data;
      } else {
        console.error('Unexpected success rate response format:', response);
        throw new Error('Invalid response format from success rate API');
      }
    } else {
      console.error('Invalid success rate response type:', typeof response);
      throw new Error('Invalid response type from success rate API');
    }
    
    console.log('Processed success rate data:', successRateData);
    debug('DashboardService', 'Successfully fetched success rate stats', successRateData);
    timer();
    return successRateData;
  } catch (error) {
    console.error('Failed to fetch success rate stats:', error);
    logError('DashboardService', 'Failed to fetch success rate stats', error);
    timer();
    throw error;
  }
};

/**
 * Fetches transaction reversal rate statistics
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 * @returns Reversal rate stats data
 */
export const fetchReversalRate = async (
  startDate?: string, 
  endDate?: string
): Promise<ReversalRateStats> => {
  console.log('fetchReversalRate called with:', { startDate, endDate });
  const timer = startTimer('fetchReversalRate');
  
  try {
    const params: Record<string, string> = {};
    
    // Use consistent date formatting
    if (startDate) {
      params.startDate = formatDateParam(startDate);
    }
    if (endDate) {
      params.endDate = formatDateParam(endDate);
    }
    
    console.log(`Calling ${API_ENDPOINTS.REVERSAL_RATE} with params:`, params);
    const response = await httpService.get(API_ENDPOINTS.REVERSAL_RATE, params);
    console.log('Raw reversal rate response:', response);
    
    // Handle different response formats
    let reversalRateData: ReversalRateStats;
    
    if (response && typeof response === 'object') {
      if (response.overallReversalRate !== undefined) {
        // Direct response format
        reversalRateData = response as ReversalRateStats;
      } else if (response.data && response.data.overallReversalRate !== undefined) {
        // Wrapped response format
        reversalRateData = response.data;
      } else {
        console.error('Unexpected reversal rate response format:', response);
        throw new Error('Invalid response format from reversal rate API');
      }
    } else {
      console.error('Invalid reversal rate response type:', typeof response);
      throw new Error('Invalid response type from reversal rate API');
    }
    
    console.log('Processed reversal rate data:', reversalRateData);
    debug('DashboardService', 'Successfully fetched reversal rate stats', reversalRateData);
    timer();
    return reversalRateData;
  } catch (error) {
    console.error('Failed to fetch reversal rate stats:', error);
    logError('DashboardService', 'Failed to fetch reversal rate stats', error);
    timer();
    throw error;
  }
};

export default {
  fetchDashboardSummary,
  fetchTransactionTrends,
  fetchUserActivity,
  fetchRecentTransactions,
  fetchFilteredTransactions,
  fetchMetricsSummary,
  fetchProcessingStats,
  fetchSuccessRate,
  fetchTransactionTime,
  fetchReversalRate
}; 