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
  UserRetentionResponse,
  PaydayCycleData,
  PaydayCycleResponse,
  GeographicDistributionData,
  UserCountryDistributionResponse,
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
const API_ENDPOINTS = {
  TRANSACTION_VOLUME: `${API_BASE_URL}/api/admin/dashboard/transaction-volume`,
  TRANSACTIONS_LIST: `${API_BASE_URL}/api/admin/reports/transactions-list`,
  USER_REGISTRATIONS: `${API_BASE_URL}/api/admin/dashboard/user-registration-stats`,
  USER_REGISTRATION_COUNT: `${API_BASE_URL}/api/admin/dashboard/user-registration-data`,
  ACTIVE_USERS: `${API_BASE_URL}/api/admin/reports/active-users`,
  ACTIVE_USER_COUNT: `${API_BASE_URL}/api/admin/dashboard/active-user-data`,
  USER_RETENTION: `${API_BASE_URL}/api/admin/reports/user-retention`,
  PAYDAY_CYCLE: `${API_BASE_URL}/api/admin/reports/payday-cycle`,
  USER_COUNTRY_DISTRIBUTION: `${API_BASE_URL}/api/admin/dashboard/user-country-distribution`,
  TOTAL_TRANSACTION_VALUE: `${API_BASE_URL}/api/admin/reports/total-transaction-value`,
  FEE_REVENUE: `${API_BASE_URL}/api/admin/reports/fee-revenue`,
  TRANSACTION_CORRIDORS: `${API_BASE_URL}/api/admin/reports/transaction-corridors`,
};

export const getTransactionVolume = async (filters: ReportFilters): Promise<TransactionVolumeData[]> => {
  try {
    console.log('Fetching transaction volume data with filters:', filters);
    
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    if (filters.transactionStatusId && filters.transactionStatusId !== 'ALL') {
      params.transactionStatusId = filters.transactionStatusId;
    }
    
    const response = await axios.get(API_ENDPOINTS.TRANSACTION_VOLUME, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('Transaction volume data received:', response.data.data.length, 'records');
      
      // Map the response data to the expected format
      // API returns: { date, count, volume }
      const apiData = response.data.data.map((item: any) => ({
        date: item.date,
        volume: Number(item.volume) || 0,  // API returns 'volume' directly
        count: Number(item.count) || 0     // API returns 'count' directly
      }));
      
      // Generate complete date range to fill in missing dates with zero values
      const dateRange = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
      const apiDataMap = new Map<string, TransactionVolumeData>(apiData.map(item => [item.date, item]));
      
      // Fill in missing dates with zero values
      const data: TransactionVolumeData[] = dateRange.map((date): TransactionVolumeData => {
        const dateStr = formatDate(date, filters.timeFrame);
        const existingData = apiDataMap.get(dateStr);
        
        return existingData || {
          date: dateStr,
          volume: 0,
          count: 0
        };
      });
      
      console.log('Processed transaction volume data:', data.length, 'data points (including zero-filled dates)');
      return data;
    } else {
      console.error('Invalid response format from transaction volume API:', response.data);
      throw new Error('Invalid response format from transaction volume API');
    }
  } catch (error) {
    console.error('Error fetching transaction volume data:', error);
    throw error;
  }
};

export const getTransactionSuccessRate = async (filters: ReportFilters): Promise<TransactionSuccessRateData[]> => {
  try {
    console.log('Fetching transaction success rate data with filters:', filters);
    
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    // Note: transactionStatusId is no longer used as per the updated API
    
    const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/success-rate`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('Transaction success rate raw data received:', response.data.data.length, 'time periods');
      
      // Calculate success rates from raw transaction data
      // Success status IDs: [2] (Completed)
      // Failure status IDs: [3, 4, 5] (Failed, Cancelled, Reversed)
      const successStatusIds = [2];
      const failureStatusIds = [3, 4, 5];
      
      const apiData = response.data.data.map((periodData: any) => {
        const { date, transactions } = periodData;
        
        if (!Array.isArray(transactions) || transactions.length === 0) {
          return {
            date: date,
            successRate: 0,
            failureRate: 0
          };
        }
        
        // Filter to only include transactions with relevant status IDs
        const relevantTransactions = transactions.filter((txn: any) => 
          successStatusIds.includes(txn.transactionStatusId) || 
          failureStatusIds.includes(txn.transactionStatusId)
        );
        
        if (relevantTransactions.length === 0) {
          return {
            date: date,
            successRate: 0,
            failureRate: 0
          };
        }
        
        // Count successful transactions
        const successfulTransactions = relevantTransactions.filter((txn: any) => 
          successStatusIds.includes(txn.transactionStatusId)
        );
        
        // Calculate percentages
        const successRate = Number(((successfulTransactions.length / relevantTransactions.length) * 100).toFixed(2));
        const failureRate = Number((100 - successRate).toFixed(2));
        
        return {
          date: date,
          successRate: successRate,
          failureRate: failureRate
        };
      });
      
      // Generate complete date range to fill in missing dates with zero values
      const dateRange = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
      const apiDataMap = new Map<string, TransactionSuccessRateData>(apiData.map(item => [item.date, item]));
      
      // Fill in missing dates with zero values
      const data: TransactionSuccessRateData[] = dateRange.map((date): TransactionSuccessRateData => {
        const dateStr = formatDate(date, filters.timeFrame);
        const existingData = apiDataMap.get(dateStr);
        
        return existingData || {
          date: dateStr,
          successRate: 0,
          failureRate: 0
        };
      });
      
      console.log('Processed transaction success rate data:', data.length, 'data points (including zero-filled dates)');
      return data;
    } else {
      console.error('Invalid response format from transaction success rate API:', response.data);
      throw new Error('Invalid response format from transaction success rate API');
    }
  } catch (error) {
    console.error('Error fetching transaction success rate data:', error);
    throw error;
  }
};

export const getTransactionTypeDistribution = async (filters: ReportFilters): Promise<TransactionTypeDistributionData[]> => {
  try {
    console.log('Fetching transaction type distribution data with filters:', filters);
    
    // First try to get type distribution data from the volume endpoint
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0],
      endDate: filters.endDate.toISOString().split('T')[0],
      timeFrame: filters.timeFrame
    };
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    
    const response = await axios.get(API_ENDPOINTS.TRANSACTION_VOLUME, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Check if the API returns type distribution data
    if (response.data && response.data.success && response.data.typeDistribution) {
      console.log('Transaction type distribution received:', response.data.typeDistribution);
      
      const typeDistribution = response.data.typeDistribution;
      
      if (Array.isArray(typeDistribution.typeDistribution)) {
        const data = typeDistribution.typeDistribution.map((item: any) => ({
          type: item.transactionTypeName || item.type || 'Unknown',
          count: Number(item.transactionCount) || Number(item.count) || 0,
          percentage: Number(item.percentage) || 0
        }));
        
        return data;
      }
    }
    
    // Fallback: Generate type distribution from transaction list
    console.log('Type distribution not available from volume endpoint, generating from transaction list...');
    
    const transactionResponse = await axios.get(API_ENDPOINTS.TRANSACTIONS_LIST, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // The API returns: {success: true, message: '...', data: {data: [...], metadata: {...}}}
    if (transactionResponse.data && transactionResponse.data.success && 
        transactionResponse.data.data && Array.isArray(transactionResponse.data.data.data)) {
      
      console.log('Generating type distribution from', transactionResponse.data.data.data.length, 'transactions');
      
      // Count transactions by type
      const typeCountMap: { [key: string]: number } = {};
      const transactions = transactionResponse.data.data.data;
      
      transactions.forEach((transaction: any) => {
        const type = transaction.transactionTypeName || transaction.type || 'Money Transfer';
        typeCountMap[type] = (typeCountMap[type] || 0) + 1;
      });
      
      // Calculate total and percentages
      const totalTransactions = transactions.length;
      
      const data = Object.entries(typeCountMap).map(([type, count]) => ({
        type,
        count,
        percentage: totalTransactions > 0 ? Number(((count / totalTransactions) * 100).toFixed(2)) : 0
      }));
      
      // Sort by count descending
      data.sort((a, b) => b.count - a.count);
      
      console.log('Generated transaction type distribution:', data);
      return data;
    } else {
      console.error('Invalid response format from transaction list API:', transactionResponse.data);
      throw new Error('Invalid response format from transaction type distribution API');
    }
  } catch (error) {
    console.error('Error fetching transaction type distribution data:', error);
    throw error;
  }
};

export const getAverageTransactionValue = async (filters: ReportFilters): Promise<AverageTransactionValueData[]> => {
  try {
    console.log('Fetching average transaction value data with filters:', filters);
    
    // Build query parameters based on the transaction-list endpoint documentation
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    // Add optional filters based on the endpoint documentation
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    if (filters.transactionStatusId && filters.transactionStatusId !== 'ALL') {
      params.transactionStatusId = filters.transactionStatusId;
    }
    
    console.log('Average transaction value API parameters:', params);
    
    const response = await axios.get(API_ENDPOINTS.TRANSACTIONS_LIST, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // The API returns: {success: true, message: '...', data: {data: [...], metadata: {...}}}
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('Transaction list data received for average calculation:', response.data.data.data.length, 'transactions');
      
      // Group transactions by date and calculate average value
      const transactionsByDate: { [key: string]: number[] } = {};
      
      response.data.data.data.forEach((transaction: any) => {
        // Extract date from timestamp field (based on endpoint documentation)
        const date = transaction.timestamp ? transaction.timestamp.split('T')[0] : 
                    transaction.createdAt ? transaction.createdAt.split('T')[0] : 
                    transaction.date;
        
        // Extract amount from the transaction (based on endpoint documentation)
        const amount = Number(transaction.amount) || 0;
        
        // Only include transactions with valid amounts
        if (amount > 0 && date) {
          if (!transactionsByDate[date]) {
            transactionsByDate[date] = [];
          }
          transactionsByDate[date].push(amount);
        }
      });
      
      // Generate complete date range based on timeFrame to ensure no gaps
      const dateRange = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
      
      // Calculate average for each date in the range
      const data = dateRange.map((date) => {
        const dateStr = formatDate(date, filters.timeFrame);
        const amounts = transactionsByDate[dateStr] || [];
        const average = amounts.length > 0 ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0;
        
        return {
          date: dateStr,
          averageValue: Number(average.toFixed(2))
        };
      });
      
      console.log('Processed average transaction value data:', {
        totalDataPoints: data.length,
        dateRange: `${data[0]?.date} to ${data[data.length - 1]?.date}`,
        nonZeroAverages: data.filter(d => d.averageValue > 0).length,
        filters: params
      });
      
      return data;
    } else {
      console.error('Invalid response format from average transaction value API:', response.data);
      throw new Error('Invalid response format from average transaction value API');
    }
  } catch (error) {
    console.error('Error fetching average transaction value data:', error);
    throw error;
  }
};

export const getUserRegistrations = async (filters: ReportFilters): Promise<{ data: UserRegistrationData[], total: number }> => {
  try {
    console.log('🔍 getUserRegistrations called with filters:', {
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
      timeFrame: filters.timeFrame
    });

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format dates for API (YYYY-MM-DD format)
    const startDate = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined;
    const endDate = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined;
    
    // Map timeFrame to API expected values
    const timeFrame = filters.timeFrame || 'daily';

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('timeFrame', timeFrame);

    console.log('📡 Making API call to:', `${API_ENDPOINTS.USER_REGISTRATIONS}?${params.toString()}`);

    const response = await fetch(`${API_ENDPOINTS.USER_REGISTRATIONS}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📊 API response received:', {
      success: result.success,
      dataLength: Array.isArray(result.data) ? result.data.length : 'Not an array',
      totalUsers: result.totalUsers,
      sampleData: Array.isArray(result.data) ? result.data.slice(0, 3) : result.data // Show first 3 items for debugging or the actual data if not array
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch user registration data');
    }

    // Check if data is an array
    if (!Array.isArray(result.data)) {
      console.error('Invalid data format - expected array but got:', typeof result.data, result.data);
      throw new Error('Invalid response format: data should be an array');
    }

    // Transform API response to match our interface
    const transformedData: UserRegistrationData[] = result.data.map((item: any) => ({
      date: item.date,
      count: item.userCount
    }));

    const finalResult = {
      data: transformedData,
      total: result.totalUsers || 0
    };

    console.log('✅ Transformed data:', {
      dataLength: finalResult.data.length,
      total: finalResult.total,
      sumOfCounts: finalResult.data.reduce((sum, item) => sum + item.count, 0)
    });

    return finalResult;
  } catch (error) {
    console.error('❌ Error fetching user registrations:', error);
    throw error; // Propagate the error instead of falling back to mock data
  }
};

export const getActiveUsers = async (filters: ReportFilters): Promise<{ data: ActiveUsersData[], total: number, uniqueActiveUsers: number }> => {
  try {
    console.log('Fetching active users data with filters:', filters);
    
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    const response = await axios.get(API_ENDPOINTS.ACTIVE_USERS, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Based on console logs, the API returns: {success: true, data: {data: [...], metadata: {...}}}
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('Active users data received:', response.data.data.data.length, 'records');
      
      // Map the response data to the expected format
      const data = response.data.data.data.map((item: any) => ({
        date: item.date,
        activeUsers: Number(item.activeUserCount) || 0
      }));
      
      // Extract metadata totals
      const metadata = response.data.data.metadata || {};
      const total = Number(metadata.totalActiveUsers) || 0;
      
      // For unique active users in the filtered period, use the metadata if available
      // Otherwise, use the maximum daily active users as an approximation
      const uniqueActiveUsers = Number(metadata.uniqueActiveUsers) || 
                               Number(metadata.totalUniqueActiveUsers) || 
                               Math.max(...data.map(item => item.activeUsers), 0);
      
      return { data, total, uniqueActiveUsers };
    } else {
      console.error('Invalid response format from active users API:', response.data);
      throw new Error('Invalid response format from active users API');
    }
  } catch (error) {
    console.error('Error fetching active users data:', error);
    throw error;
  }
};

export const getUserRetention = async (filters: ReportFilters): Promise<UserRetentionResponse> => {
  try {
    console.log('Fetching user retention data with filters:', filters);
    
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    const response = await axios.get(API_ENDPOINTS.USER_RETENTION, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Based on console logs, the API returns: {success: true, data: {data: [...], metadata: {...}}}
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('User retention data received:', response.data.data.data.length, 'cohorts');
      
      // Map the response data to the expected format
      const data = response.data.data.data.map((item: any) => ({
        cohort: item.cohort,
        month1: Number(item.month1) || 0,
        month2: Number(item.month2) || 0,
        month3: Number(item.month3) || 0,
        month6: Number(item.month6) || 0,
        cohortSize: Number(item.cohortSize) || 0
      }));
      
      // Extract metadata from response
      const metadata = response.data.data.metadata || {
        timeFrame: filters.timeFrame,
        startDate: filters.startDate.toISOString().split('T')[0],
        endDate: filters.endDate.toISOString().split('T')[0],
        totalCohorts: data.length,
        averageMonth1Retention: 0,
        averageMonth2Retention: 0,
        averageMonth3Retention: 0,
        averageMonth6Retention: 0,
        totalUsersAnalyzed: 0
      };
      
      return { data, metadata };
    } else {
      console.error('Invalid response format from user retention API:', response.data);
      throw new Error('Invalid response format from user retention API');
    }
  } catch (error) {
    console.error('Error fetching user retention data:', error);
    throw error;
  }
};

export const getPaydayCycleAnalysis = async (filters: ReportFilters): Promise<PaydayCycleResponse> => {
  try {
    console.log('Fetching payday cycle analysis with filters:', filters);
    
    // Build query parameters
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    const response = await axios.get(API_ENDPOINTS.PAYDAY_CYCLE, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Based on console logs, the API returns: {success: true, data: {data: [...], metadata: {...}}}
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('Payday cycle data received:', response.data.data.data.length, 'periods');
      
      // Map the response data to the expected format
      const data = response.data.data.data.map((item: any) => ({
        period: item.period,
        dayRange: item.dayRange,
        transactionCount: Number(item.transactionCount) || 0,
        uniqueUsers: Number(item.uniqueUsers) || 0,
        percentageOfVolume: Number(item.percentageOfVolume) || 0,
        percentageOfUsers: Number(item.percentageOfUsers) || 0,
        averageTransactionSize: Number(item.averageTransactionSize) || 0
      }));
      
      // Extract metadata from response
      const metadata = response.data.data.metadata || {
        timeFrame: filters.timeFrame,
        startDate: filters.startDate.toISOString().split('T')[0],
        endDate: filters.endDate.toISOString().split('T')[0],
        totalTransactions: 0,
        totalUniqueUsers: 0,
        totalVolume: 0,
        dominantPeriod: 'Mid Month',
        startMonthConcentration: 0,
        endMonthConcentration: 0,
        midMonthConcentration: 0
      };
      
      return { data, metadata };
    } else {
      console.error('Invalid response format from payday cycle API:', response.data);
      throw new Error('Invalid response format from payday cycle API');
    }
  } catch (error) {
    console.error('Error fetching payday cycle data:', error);
    throw error;
  }
};

export const getGeographicDistribution = async (filters: ReportFilters): Promise<GeographicDistributionData[]> => {
  try {
    console.log('Fetching user geographic distribution data');
    
    const response = await axios.get<UserCountryDistributionResponse>(API_ENDPOINTS.USER_COUNTRY_DISTRIBUTION, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log('User country distribution data received:', response.data.data.length, 'countries');
      
      const countryData = response.data.data;
      
      // Calculate total users for percentage calculation
      const totalUsers = countryData.reduce((sum, item) => sum + item.userCount, 0);
      
      if (totalUsers === 0) {
        console.log('No users found for geographic distribution');
        return [];
      }
      
      // Map the response data to the expected format with calculated percentages
      const data: GeographicDistributionData[] = countryData.map(item => ({
        country: item.country,
        count: item.userCount,
        percentage: Number(((item.userCount / totalUsers) * 100).toFixed(2))
      }));
      
      console.log('Processed geographic distribution data:', data.length, 'countries, total users:', totalUsers);
      return data;
    } else {
      console.error('Invalid response format from user country distribution API:', response.data);
      throw new Error('Invalid response format from user country distribution API');
    }
  } catch (error) {
    console.error('Error fetching user geographic distribution data:', error);
    throw error;
  }
};

export const getTransactionValue = async (filters: ReportFilters): Promise<TransactionValueData[]> => {
  try {
    console.log('🔍 getTransactionValue called with filters:', {
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
      timeFrame: filters.timeFrame,
      currency: filters.currency,
      transactionTypeId: filters.transactionTypeId,
      transactionStatusId: filters.transactionStatusId
    });

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format dates for API (YYYY-MM-DD format)
    const startDate = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined;
    const endDate = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined;
    
    // Map timeFrame to API expected values
    const timeFrame = filters.timeFrame || 'daily';

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('timeFrame', timeFrame);
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.append('currency', filters.currency);
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.append('transactionTypeId', filters.transactionTypeId.toString());
    }
    if (filters.transactionStatusId && filters.transactionStatusId !== 'ALL') {
      params.append('transactionStatusId', filters.transactionStatusId.toString());
    }

    console.log('📡 Making API call to:', `${API_ENDPOINTS.TOTAL_TRANSACTION_VALUE}?${params.toString()}`);

    const response = await fetch(`${API_ENDPOINTS.TOTAL_TRANSACTION_VALUE}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📊 API response received:', {
      success: result.success,
      hasData: !!result.data,
      hasDataArray: !!(result.data && result.data.data),
      dataArrayLength: Array.isArray(result.data?.data) ? result.data.data.length : 'Not an array',
      metadata: result.data?.metadata,
      sampleData: Array.isArray(result.data?.data) ? result.data.data.slice(0, 3) : result.data // Show first 3 items for debugging
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch total transaction value data');
    }

    // The API returns data in result.data.data format
    const dataArray = result.data?.data;
    
    // Check if data is an array
    if (!Array.isArray(dataArray)) {
      console.error('Invalid data format - expected array but got:', typeof dataArray, dataArray);
      throw new Error('Invalid response format: data should be an array');
    }

    // Transform API response to match our interface
    const transformedData: TransactionValueData[] = dataArray.map((item: any) => ({
      date: item.date,
      value: Number(item.value) || 0
    }));

    console.log('✅ Transformed transaction value data:', {
      dataLength: transformedData.length,
      totalValue: result.data?.metadata?.totalValue,
      totalTransactions: result.data?.metadata?.totalTransactions,
      sampleTransformed: transformedData.slice(0, 3)
    });

    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching total transaction value data:', error);
    
    // Fallback to mock data if API fails
    console.log('🔄 Falling back to mock data due to API error');
    return getMockTransactionValue(filters);
  }
};

export const getFeeRevenue = async (filters: ReportFilters): Promise<FeeRevenueData[]> => {
  try {
    console.log('Fetching fee revenue data with filters:', filters);
    
    // Build query parameters for the fee revenue endpoint
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      timeFrame: filters.timeFrame
    };
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    if (filters.transactionStatusId && filters.transactionStatusId !== 'ALL') {
      params.transactionStatusId = filters.transactionStatusId;
    }
    
    console.log('Fee revenue API parameters:', params);
    
    const response = await axios.get(API_ENDPOINTS.FEE_REVENUE, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('Fee revenue API response:', response.data);
    
    // Based on the endpoint documentation, the response structure is:
    // { success: true, message: "...", data: { success: true, data: [...], metadata: {...} } }
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('Fee revenue data received:', response.data.data.data.length, 'data points');
      
      // Map API response to expected format
      const data = response.data.data.data.map((item: any) => ({
        date: item.date,
        revenue: Number(item.feeRevenue) || 0,
        transactionCount: Number(item.transactionCount) || 0,
        averageFeePerTransaction: Number(item.averageFeePerTransaction) || 0,
        growthRate: item.growthRate !== null ? Number(item.growthRate) : null,
        totalTransactionVolume: Number(item.totalTransactionVolume) || 0,
        feeRatio: Number(item.feeRatio) || 0
      }));
      
      console.log('Mapped fee revenue data:', data.slice(0, 3)); // Log first 3 items for debugging
      return data;
    } else {
      console.error('Invalid response format from fee revenue API:', response.data);
      throw new Error('Invalid response format from fee revenue API');
    }
    
  } catch (error) {
    console.error('Error fetching fee revenue data:', error);
    throw error; // Don't fall back to mock data, let the error propagate
  }
};

export const getTransactionCorridors = async (filters: ReportFilters): Promise<TransactionCorridorData[]> => {
  try {
    console.log('Fetching transaction corridors data with filters:', filters);
    
    // Build query parameters for the transaction corridors endpoint
    const params: any = {
      startDate: filters.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: filters.endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
      limit: 20 // Default limit from endpoint documentation
    };
    
    // Add optional filters
    if (filters.currency && filters.currency !== 'ALL') {
      params.currency = filters.currency;
    }
    if (filters.transactionTypeId && filters.transactionTypeId !== 'ALL') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    if (filters.transactionStatusId && filters.transactionStatusId !== 'ALL') {
      params.transactionStatusId = filters.transactionStatusId;
    }
    
    console.log('Transaction corridors API parameters:', params);
    
    const response = await axios.get(API_ENDPOINTS.TRANSACTION_CORRIDORS, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    console.log('Transaction corridors API response:', response.data);
    
    // Based on the endpoint documentation, the response structure is:
    // { success: true, message: "...", data: { success: true, data: [...], metadata: {...} } }
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.data)) {
      console.log('Transaction corridors data received:', response.data.data.data.length, 'corridors');
      
      // Map API response to expected format
      const data = response.data.data.data.map((item: any) => ({
        fromCountry: item.fromCountry || '',
        toCountry: item.toCountry || '',
        corridor: item.corridor || `${item.fromCountry} to ${item.toCountry}`,
        transactionCount: Number(item.transactionCount) || 0,
        totalValue: Number(item.totalValue) || 0,
        averageValue: Number(item.averageValue) || 0,
        transactionPercentage: Number(item.transactionPercentage) || 0,
        valuePercentage: Number(item.valuePercentage) || 0,
        // Legacy fields for backward compatibility
        count: Number(item.transactionCount) || 0,
        value: Number(item.totalValue) || 0
      }));
      
      console.log('Mapped transaction corridors data:', data.slice(0, 3)); // Log first 3 items for debugging
      return data;
    } else {
      console.error('Invalid response format from transaction corridors API:', response.data);
      throw new Error('Invalid response format from transaction corridors API');
    }
    
  } catch (error) {
    console.error('Error fetching transaction corridors data:', error);
    throw error; // Don't fall back to mock data, let the error propagate
  }
};

export const getSavedReportConfigurations = async (): Promise<SavedReportConfiguration[]> => {
  const response = await axios.get(`${REPORTS_ENDPOINT}/configurations`);
  return response.data;
};

export const saveReportConfiguration = async (configuration: Omit<SavedReportConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedReportConfiguration> => {
  const response = await axios.post(`${REPORTS_ENDPOINT}/configurations`, configuration);
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
  const response = await axios.post(`${REPORTS_ENDPOINT}/export`, {
      reportType,
    filters,
    options
  }, {
    responseType: 'blob'
  });
  return response.data;
};

export const getUserRegistrationCount = async (filters: ReportFilters): Promise<number> => {
  try {
    console.log('🔍 getUserRegistrationCount called with filters:', {
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
      timeFrame: filters.timeFrame
    });

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format dates for API (YYYY-MM-DD format)
    const startDate = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined;
    const endDate = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined;
    
    // Map timeFrame to API expected values
    const timeFrame = filters.timeFrame || 'daily';

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('timeFrame', timeFrame);

    console.log('📡 Making API call to:', `${API_ENDPOINTS.USER_REGISTRATION_COUNT}?${params.toString()}`);

    const response = await fetch(`${API_ENDPOINTS.USER_REGISTRATION_COUNT}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📊 API response received:', {
      success: result.success,
      userCount: result.userCount,
      timeFrame: result.timeFrame,
      startDate: result.startDate,
      endDate: result.endDate
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch user registration count');
    }

    console.log('✅ User registration count:', result.userCount);

    return result.userCount || 0;
  } catch (error) {
    console.error('❌ Error fetching user registration count:', error);
    throw error;
  }
};

export const getActiveUserCount = async (filters: ReportFilters): Promise<number> => {
  try {
    console.log('🔍 getActiveUserCount called with filters:', {
      startDate: filters.startDate?.toISOString().split('T')[0],
      endDate: filters.endDate?.toISOString().split('T')[0],
      timeFrame: filters.timeFrame
    });

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format dates for API (YYYY-MM-DD format)
    const startDate = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined;
    const endDate = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined;
    
    // Map timeFrame to API expected values
    const timeFrame = filters.timeFrame || 'daily';

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('timeFrame', timeFrame);

    console.log('📡 Making API call to:', `${API_ENDPOINTS.ACTIVE_USER_COUNT}?${params.toString()}`);

    const response = await fetch(`${API_ENDPOINTS.ACTIVE_USER_COUNT}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📊 API response received:', {
      success: result.success,
      activeUserCount: result.activeUserCount,
      timeFrame: result.timeFrame,
      startDate: result.startDate,
      endDate: result.endDate
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch active user count');
    }

    console.log('✅ Active user count:', result.activeUserCount);

    return result.activeUserCount || 0;
  } catch (error) {
    console.error('❌ Error fetching active user count:', error);
    throw error;
  }
};

// Helper functions for generating mock data
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

const formatDate = (date: Date, timeFrame: string) => {
  switch (timeFrame) {
    case 'daily':
      return format(date, 'yyyy-MM-dd');
    case 'weekly':
      return format(date, 'yyyy-MM-dd');
    case 'monthly':
      return format(date, 'yyyy-MM');
    default:
      return format(date, 'yyyy-MM-dd');
  }
};

// Mock data functions for development and fallbacks
export const getMockTransactionVolume = (filters: ReportFilters): TransactionVolumeData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseVolume = 50000 + Math.floor(Math.random() * 10000);
    const baseCount = 200 + Math.floor(Math.random() * 50);
    
    return {
      date: formatDate(date, filters.timeFrame),
      volume: baseVolume + (index * 1000),
      count: baseCount + (index * 5)
    };
  });
};

export const getMockTransactionTypeDistribution = (filters: ReportFilters): TransactionTypeDistributionData[] => {
  return [
    { type: 'Money Transfer', count: 1250, percentage: 62.5 },
    { type: 'Bill Payment', count: 450, percentage: 22.5 },
    { type: 'Mobile Top-up', count: 200, percentage: 10.0 },
    { type: 'Other', count: 100, percentage: 5.0 }
  ];
};

export const getMockAverageTransactionValue = (filters: ReportFilters): AverageTransactionValueData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date, index) => {
    const baseValue = 100 + Math.floor(Math.random() * 50);
    const value = baseValue + (index * 2);
    
    return {
      date: formatDate(date, filters.timeFrame),
      averageValue: value
    };
  });
};

export const getMockActiveUsers = (filters: ReportFilters): ActiveUsersData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  return dates.map((date) => {
    const activeUsers = 200 + Math.floor(Math.random() * 100);
    
    return {
      date: formatDate(date, filters.timeFrame),
      activeUsers: activeUsers
    };
  });
};

export const getMockUserRetention = (filters: ReportFilters): UserRetentionData[] => {
  const cohorts = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  
  return cohorts.map((cohort, index) => {
    const baseRetention = 90 - (index * 5);
    
    return {
      cohort: cohort,
      month1: baseRetention - Math.floor(Math.random() * 10),
      month2: baseRetention - 15 - Math.floor(Math.random() * 10),
      month3: baseRetention - 25 - Math.floor(Math.random() * 10),
      month6: baseRetention - 40 - Math.floor(Math.random() * 10),
      cohortSize: 100 + Math.floor(Math.random() * 50)
    };
  });
};

export const getMockGeographicDistribution = (filters: ReportFilters): GeographicDistributionData[] => {
  return [
    { country: 'Nigeria', count: 500, percentage: 50.0 },
    { country: 'Ghana', count: 200, percentage: 20.0 },
    { country: 'Kenya', count: 150, percentage: 15.0 },
    { country: 'South Africa', count: 100, percentage: 10.0 },
    { country: 'Others', count: 50, percentage: 5.0 }
  ];
};

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

export const getMockFeeRevenue = (filters: ReportFilters): FeeRevenueData[] => {
  const dates = generateDates(filters.startDate, filters.endDate, filters.timeFrame);
  
  // Realistic fee revenue patterns for a remittance business
  const baseFeeRevenue = {
    'USD': 850,
    'EUR': 720,
    'GBP': 650,
    'CAD': 480,
    'UGX': 320,
    'BIRR': 280,
    'ALL': 1200
  };
  
  // Transaction type multipliers (some types generate higher fees)
  const typeMultipliers = {
    1: 0.8,  // WALLET_TO_WALLET (lower fees)
    2: 1.2,  // DEPOSIT (higher fees)
    3: 1.0,  // BUSINESS_PAYMENT (standard fees)
    4: 1.5,  // CURRENCY_SWAP (highest fees due to exchange)
    5: 1.1,  // NON_WALLET_TRANSFER (slightly higher fees)
    'ALL': 1.0
  };
  
  // Get base revenue based on currency
  const currencyKey = (filters.currency || 'ALL') as keyof typeof baseFeeRevenue;
  let baseRevenue = baseFeeRevenue[currencyKey] || baseFeeRevenue['ALL'];
  
  // Apply transaction type multiplier
  const typeKey = (filters.transactionTypeId || 'ALL') as keyof typeof typeMultipliers;
  const typeMultiplier = typeMultipliers[typeKey] || 1.0;
  baseRevenue *= typeMultiplier;
  
  // Generate realistic growth trends and seasonal patterns
  const totalDays = dates.length;
  let previousRevenue = 0;
  
  return dates.map((date, index) => {
    // Base seasonal pattern (higher on weekdays, lower on weekends for daily view)
    let seasonalMultiplier = 1.0;
    if (filters.timeFrame === 'daily') {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      seasonalMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.1; // Lower on weekends
    }
    
    // Monthly pattern (higher mid-month, payday periods)
    if (filters.timeFrame === 'monthly') {
      const monthIndex = index % 12;
      // Higher in months like December (holidays), March (tax season), etc.
      const monthMultipliers = [0.9, 0.85, 1.1, 1.0, 0.95, 1.05, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
      seasonalMultiplier = monthMultipliers[monthIndex];
    }
    
    // Growth trend (slight upward trend over time)
    const growthFactor = 1 + (index / totalDays * 0.15); // 15% growth over the period
    
    // Random variation (±15%)
    const randomVariation = 0.85 + (Math.random() * 0.3);
    
    // Calculate fee revenue
    const feeRevenue = Math.round(baseRevenue * seasonalMultiplier * growthFactor * randomVariation * 100) / 100;
    
    // Calculate realistic transaction count (fee revenue / average fee per transaction)
    const avgFeePerTransaction = 8.5 + (Math.random() * 3); // $8.50 - $11.50 per transaction
    const transactionCount = Math.round(feeRevenue / avgFeePerTransaction);
    
    // Calculate growth rate vs previous period
    let growthRate = null;
    if (previousRevenue > 0) {
      growthRate = Number(((feeRevenue - previousRevenue) / previousRevenue * 100).toFixed(2));
    }
    previousRevenue = feeRevenue;
    
    // Calculate transaction volume (approximately 100x the fee revenue for remittances)
    const totalTransactionVolume = Math.round(feeRevenue * 100 * (0.95 + Math.random() * 0.1));
    
    // Calculate fee ratio (fee as percentage of total volume)
    const feeRatio = Number((feeRevenue / totalTransactionVolume * 100).toFixed(2));
    
    return {
      date: formatDate(date, filters.timeFrame),
      revenue: feeRevenue,
      transactionCount: transactionCount,
      averageFeePerTransaction: Number(avgFeePerTransaction.toFixed(2)),
      growthRate: growthRate,
      totalTransactionVolume: totalTransactionVolume,
      feeRatio: feeRatio
    };
  });
};

export const getMockTransactionCorridors = (filters: ReportFilters): TransactionCorridorData[] => {
  return [
    { 
      fromCountry: 'Nigeria',
      toCountry: 'Ghana',
      corridor: 'Nigeria to Ghana', 
      transactionCount: 300,
      totalValue: 15000,
      averageValue: 50.0,
      transactionPercentage: 30.0,
      valuePercentage: 35.2,
      count: 300, 
      value: 15000 
    },
    { 
      fromCountry: 'Kenya',
      toCountry: 'Uganda',
      corridor: 'Kenya to Uganda', 
      transactionCount: 250,
      totalValue: 12500,
      averageValue: 50.0,
      transactionPercentage: 25.0,
      valuePercentage: 29.4,
      count: 250, 
      value: 12500 
    },
    { 
      fromCountry: 'South Africa',
      toCountry: 'Zimbabwe',
      corridor: 'South Africa to Zimbabwe', 
      transactionCount: 200,
      totalValue: 10000,
      averageValue: 50.0,
      transactionPercentage: 20.0,
      valuePercentage: 23.5,
      count: 200, 
      value: 10000 
    },
    { 
      fromCountry: 'Ghana',
      toCountry: 'Ivory Coast',
      corridor: 'Ghana to Ivory Coast', 
      transactionCount: 150,
      totalValue: 7500,
      averageValue: 50.0,
      transactionPercentage: 15.0,
      valuePercentage: 17.6,
      count: 150, 
      value: 7500 
    },
    { 
      fromCountry: 'Nigeria',
      toCountry: 'UK',
      corridor: 'Nigeria to UK', 
      transactionCount: 100,
      totalValue: 5000,
      averageValue: 50.0,
      transactionPercentage: 10.0,
      valuePercentage: 11.8,
      count: 100, 
      value: 5000 
    }
  ];
};

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

export const saveMockReportConfiguration = (config: Omit<SavedReportConfiguration, 'id' | 'createdAt' | 'updatedAt'>): SavedReportConfiguration => {
  const newConfig: SavedReportConfiguration = {
    ...config,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newConfig;
};

export const updateMockReportConfiguration = (config: SavedReportConfiguration): SavedReportConfiguration => {
  return {
    ...config,
    updatedAt: new Date().toISOString()
  };
};

export const deleteMockReportConfiguration = (id: string): boolean => {
  return true;
};

export const exportMockReport = (options: ReportExportOptions): Blob => {
  return new Blob(['Mock export data'], { type: 'text/plain' });
};

export const getMockPaydayCycleAnalysis = (filters: ReportFilters): PaydayCycleResponse => {
  const data: PaydayCycleData[] = [
    {
      period: 'Start of Month',
      dayRange: '1-5',
      transactionCount: 1250,
      uniqueUsers: 856,
      percentageOfVolume: 35.2,
      percentageOfUsers: 42.8,
      averageTransactionSize: 285.50
    },
    {
      period: 'Mid Month',
      dayRange: '6-24',
      transactionCount: 2100,
      uniqueUsers: 1340,
      percentageOfVolume: 45.8,
      percentageOfUsers: 67.0,
      averageTransactionSize: 220.75
    },
    {
      period: 'End of Month',
      dayRange: '25-31',
      transactionCount: 980,
      uniqueUsers: 687,
      percentageOfVolume: 19.0,
      percentageOfUsers: 34.4,
      averageTransactionSize: 195.25
    }
  ];

  const metadata = {
    timeFrame: filters.timeFrame,
    startDate: filters.startDate.toISOString().split('T')[0],
    endDate: filters.endDate.toISOString().split('T')[0],
    totalTransactions: 4330,
    totalUniqueUsers: 2000,
    totalVolume: 1234567.50,
    dominantPeriod: 'Mid Month',
    startMonthConcentration: 35.2,
    endMonthConcentration: 19.0,
    midMonthConcentration: 45.8
  };

  return { data, metadata };
};

// Function to calculate total registrations from filtered user registration data
export const getTotalRegistrationsFromFiltered = (userRegistrationsResponse: { data: UserRegistrationData[], total: number } | undefined): number => {
  if (!userRegistrationsResponse || !userRegistrationsResponse.data) {
    return 0;
  }
  
  // Sum all registration counts from the filtered period
  return userRegistrationsResponse.data.reduce((sum, item) => sum + item.count, 0);
}; 