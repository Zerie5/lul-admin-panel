import axios from 'axios';
import { 
  NonWalletTransfer, 
  NonWalletTransferFilters, 
  NonWalletTransferResponse, 
  NonWalletTransferCreateRequest, 
  NonWalletTransferUpdateStatusRequest,
  NonWalletTransferEvent,
  NonWalletTransferStatus,
  NonWalletTransferType,
  ApiPaginatedResponse,
  Country,
  Bank,
  MobileNetwork
} from '../types/nonWalletTransfer';

// Import API base URL from centralized config
import { API_BASE_URL } from '../config';

// Log the API URL for debugging
console.log('Non-Wallet Transfer Service API URL:', API_BASE_URL);

// Add a helper function to check for auth token
const getAuthToken = (): string => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  return token;
};

// Get all non-wallet transfers (without filters)
export const getAllNonWalletTransfers = async (): Promise<NonWalletTransferResponse> => {
  try {
    // Create basic parameters with default values
    const params = new URLSearchParams();
    params.append('page', '0');
    params.append('limit', '100'); // Fetch a larger number since we're not paginating
    
    console.log('Fetching all non-wallet transfers');
    
    // Get auth token
    const token = getAuthToken();
    
    // Make API request
    const response = await axios.get<ApiPaginatedResponse<NonWalletTransfer>>(
      `${API_BASE_URL}/api/admin/dashboard/nonwallet-transaction-dash`,
      { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Retrieved ${response.data.content.length} transfers`);
    
    // Map API response to the expected format
    return {
      transfers: response.data.content,
      totalCount: response.data.totalElements
    };
  } catch (error: any) {
    console.error('Error fetching all non-wallet transfers:', error);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication error - please log in again');
    }
    
    throw new Error(error?.response?.data?.message || error.message || 'Error fetching data from server');
  }
};

// Get filtered non-wallet transfers
export const getFilteredNonWalletTransfers = async (
  filters: NonWalletTransferFilters,
  searchTriggered: boolean = false
): Promise<NonWalletTransferResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', String(filters.page));
    params.append('limit', String(filters.pageSize));
    
    // Log all filter properties to help debug
    console.log('Filter properties:', {
      searchTerm: filters.searchTerm,
      searchCategory: filters.searchCategory,
      statusFilter: filters.statusFilter,
      type: filters.type,
      paymentStatus: filters.paymentStatus,
      startDate: filters.startDate,
      endDate: filters.endDate,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      timeFrame: filters.timeFrame,
      searchTriggered: searchTriggered
    });
    
    // Always apply pagination parameters
    console.log('Always applying pagination parameters');

    // Apply all other search parameters only when search is explicitly triggered
    if (searchTriggered) {
      console.log('Applying all filter parameters - search was triggered by button');
      
      // Handle time frame filtering
      if (filters.timeFrame && filters.timeFrame !== 'ALL') {
        const today = new Date();
        let startDate = new Date();
        
        switch (filters.timeFrame) {
          case 'DAILY':
            // Today
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
          case 'WEEKLY':
            // Last 7 days
            startDate.setDate(today.getDate() - 7);
            break;
          case 'MONTHLY':
            // Last 30 days
            startDate.setDate(today.getDate() - 30);
            break;
          case 'YEARLY':
            // Last 365 days
            startDate.setDate(today.getDate() - 365);
            break;
        }
        
        // Format dates as complete ISO strings (YYYY-MM-DDT00:00:00)
        const formattedStartDate = startDate.toISOString().split('.')[0];
        const formattedEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString().split('.')[0];
        
        // Only set the date range if not already specified in filters
        if (!filters.startDate) {
          params.append('startDateTime', formattedStartDate);
          console.log(`Setting startDateTime based on timeFrame: ${formattedStartDate}`);
        }
        
        if (!filters.endDate) {
          params.append('endDateTime', formattedEndDate);
          console.log(`Setting endDateTime based on timeFrame: ${formattedEndDate}`);
        }
      }
      
      if (filters.searchTerm) {
        console.log(`Adding searchTerm parameter: ${filters.searchTerm}`);
        params.append('searchTerm', filters.searchTerm);
        // Also try alternate parameter name
        params.append('query', filters.searchTerm);
      }
      
      if (filters.searchCategory) {
        console.log(`Adding searchCategory parameter: ${filters.searchCategory}`);
        params.append('searchCategory', filters.searchCategory);
        // Also try alternate parameter name
        params.append('searchBy', filters.searchCategory);
      } else {
        params.append('searchCategory', 'all');
        params.append('searchBy', 'all');
      }
      
      if (filters.statusFilter) {
        // Make sure we're sending the correct filter value
        params.append('disbursementStatus', filters.statusFilter);
        console.log(`Using disbursementStatus: ${filters.statusFilter}`);
      }
      
      if (filters.paymentStatus) {
        // Add payment status filter parameter
        params.append('paymentStatus', filters.paymentStatus);
        console.log(`Using paymentStatus: ${filters.paymentStatus}`);
      }
      
      if (filters.type) {
        // Add type filter parameter
        params.append('typeFilter', filters.type);
        console.log(`Using typeFilter: ${filters.type}`);
      }
      
      // Add explicit start and end dates if provided - ensure they have time component
      if (filters.startDate) {
        // Check if time component is already included
        const startDateTime = filters.startDate.includes('T') 
          ? filters.startDate 
          : `${filters.startDate}T00:00:00`;
        params.append('startDateTime', startDateTime);
      }
      
      if (filters.endDate) {
        // Check if time component is already included
        const endDateTime = filters.endDate.includes('T') 
          ? filters.endDate 
          : `${filters.endDate}T23:59:59`;
        params.append('endDateTime', endDateTime);
      }
      
      // Handle min and max amount validation
      if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        // Convert to 2 decimal places for consistent comparison
        const minAmount = parseFloat(Number(filters.minAmount).toFixed(2));
        const maxAmount = parseFloat(Number(filters.maxAmount).toFixed(2));
        
        // Ensure min is less than or equal to max (with a small epsilon for floating point comparison)
        if (minAmount > maxAmount) {
          throw new Error("Minimum amount must be less than or equal to maximum amount");
        }
        
        params.append('minAmount', String(minAmount));
        params.append('maxAmount', String(maxAmount));
        console.log(`Filtering by amount range: ${minAmount} to ${maxAmount}`);
      } else {
        // If only one is defined, add it without validation
        if (filters.minAmount !== undefined) {
          const minAmount = parseFloat(Number(filters.minAmount).toFixed(2));
          params.append('minAmount', String(minAmount));
          console.log(`Filtering by minimum amount: ${minAmount}`);
        }
        
        if (filters.maxAmount !== undefined) {
          const maxAmount = parseFloat(Number(filters.maxAmount).toFixed(2));
          params.append('maxAmount', String(maxAmount));
          console.log(`Filtering by maximum amount: ${maxAmount}`);
        }
      }
    } else {
      console.log('Skip applying filter parameters - waiting for search button');
      // Add minimal parameters for basic listing without filters
      params.append('searchCategory', 'all');
      params.append('searchBy', 'all');
    }
    
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/nonwallet-transaction-dash`;
    console.log(`Fetching non-wallet transfers: ${endpoint}`);
    console.log(`Parameters:`, Object.fromEntries(params.entries()));
    
    // Get auth token
    const token = getAuthToken();
    
    // Make API request
    const response = await axios.get<ApiPaginatedResponse<NonWalletTransfer>>(
      endpoint,
      { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('API response:', response.data);
    
    // Map API response to the expected format
    return {
      transfers: response.data.content,
      totalCount: response.data.totalElements
    };
  } catch (error: any) {
    console.error('Error fetching non-wallet transfers:', error);
    
    if (error?.response?.status === 401) {
      throw new Error('Authentication error - please log in again');
    }
    
    throw new Error(error?.response?.data?.message || error.message || 'Error fetching data from server');
  }
};

export const getNonWalletTransferById = async (id: string): Promise<NonWalletTransfer> => {
  try {
    console.log(`Fetching transaction details for ID: ${id}`);
    
    // Create a unique key for this request to prevent caching issues
    const requestId = Date.now();
    
    // Get auth token
    const token = getAuthToken();
    
    // Use the parameter names expected by the backend controller
    const params = new URLSearchParams();
    params.append('page', '0');
    params.append('limit', '1');
    params.append('query', id);              // 'query' instead of 'searchTerm'
    params.append('searchBy', 'id');         // 'searchBy' instead of 'searchCategory'
    params.append('_nocache', requestId.toString()); // Add a cache-busting parameter
    
    console.log(`Fetching transaction details for: ${id} (request: ${requestId})`);
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/nonwallet-transaction-dash?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Search results for transaction ${id} (request: ${requestId}):`, data);
    
    if (data.content && data.content.length > 0) {
      // Check if the exact transaction ID is found
      const exactMatch = data.content.find((t: NonWalletTransfer) => t.id === id);
      if (exactMatch) {
        console.log(`Found exact transaction match by ID: ${id}`, exactMatch);
        return exactMatch;
      }
      
      // If no exact match, return the first transaction from search results
      const transaction = data.content[0];
      console.log(`Found transaction by search for ID: ${id}`, transaction);
      return transaction;
    }
    
    throw new Error(`Transaction with ID ${id} not found`);
  } catch (error: any) {
    console.error(`Error fetching transfer ${id}:`, error);
    throw error;
  }
};

export const createNonWalletTransfer = async (
  data: NonWalletTransferCreateRequest
): Promise<NonWalletTransfer> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/create-nonwallet-transfer`;
    
    // Make the API call
    const response = await axios.post(
      endpoint,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Create transfer response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating non-wallet transfer:', error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to create transfer');
    }
    
    throw error;
  }
};

export const updateNonWalletTransferStatus = async (
  id: string,
  data: NonWalletTransferUpdateStatusRequest
): Promise<NonWalletTransfer> => {
  try {
    console.log(`Updating status for transaction ID: ${id} to ${data.status}`);
    
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/update-transaction-status/${id}`;
    
    // Make the API call
    const response = await axios.put(
      endpoint,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Updated transaction status for ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating status for transfer ${id}:`, error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to update status');
    }
    
    throw error;
  }
};

export const getNonWalletTransferEvents = async (id: string): Promise<NonWalletTransferEvent[]> => {
  try {
    console.log(`Fetching events for transaction ID: ${id}`);
    
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/transaction-events/${id}`;
    
    // Make the API call
    const response = await axios.get(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Retrieved ${response.data.length} events for transaction ${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching events for transfer ${id}:`, error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch events');
    }
    
    throw error;
  }
};

export const sendSmsNotification = async (id: string, message: string): Promise<{ success: boolean }> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/send-sms-notification/${id}`;
    
    // Make the API call
    const response = await axios.post(
      endpoint,
      { message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`SMS notification sent for transaction ${id}:`, response.data);
    return { success: true };
  } catch (error: any) {
    console.error(`Error sending SMS for transfer ${id}:`, error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to send SMS');
    }
    
    throw error;
  }
};

export const getSupportedCountries = async (): Promise<Country[]> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/supported-countries`;
    
    // Make the API call
    const response = await axios.get(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Retrieved ${response.data.length} supported countries`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supported countries:', error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch countries');
    }
    
    throw error;
  }
};

export const getBanksByCountry = async (countryCode: string): Promise<Bank[]> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/banks/${countryCode}`;
    
    // Make the API call
    const response = await axios.get(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Retrieved ${response.data.length} banks for country ${countryCode}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching banks for country ${countryCode}:`, error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch banks');
    }
    
    throw error;
  }
};

export const getMobileNetworksByCountry = async (countryCode: string): Promise<MobileNetwork[]> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/mobile-networks/${countryCode}`;
    
    // Make the API call
    const response = await axios.get(
      endpoint,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`Retrieved ${response.data.length} mobile networks for country ${countryCode}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching mobile networks for country ${countryCode}:`, error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch mobile networks');
    }
    
    throw error;
  }
};

export const calculateTransferFee = async (
  amount: number, 
  currency: string, 
  type: string,
  destinationCountry: string
): Promise<{ fee: number, totalAmount: number }> => {
  try {
    // Get auth token
    const token = getAuthToken();
    
    // Prepare the request
    const endpoint = `${API_BASE_URL}/api/admin/dashboard/calculate-fee`;
    
    // Make the API call
    const response = await axios.post(
      endpoint,
      { amount, currency, type, destinationCountry },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Fee calculation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error calculating transfer fee:', error);
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to calculate fee');
    }
    
    throw error;
  }
};

export const updateNonWalletTransferDisbursementStatus = async (
  transactionId: string,
  disbursementStageId: number,
  updateCompletedAt: boolean = false,
  notes?: string,
  adminId?: number
): Promise<NonWalletTransfer> => {
  try {
    console.log(`Updating disbursement status for transaction ID: ${transactionId} to stage ${disbursementStageId}`);
    
    // Prepare request payload
    const payload = {
      transactionId,
      disbursementStageId,
      updateCompletedAt,
      notes,
      adminId
    };
    
    // Log the payload for debugging
    console.log('Update disbursement status payload:', payload);
    
    // Get auth token using the helper function
    const token = getAuthToken();
    
    // Make API request to update disbursement status
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/update-transaction-disbursement`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating disbursement status:', errorData);
      throw new Error(errorData.message || `Failed to update disbursement status: ${response.status}`);
    }
    
    const updatedTransaction = await response.json();
    console.log('Successfully updated disbursement status:', updatedTransaction);
    
    return updatedTransaction;
  } catch (error: any) {
    console.error(`Error updating disbursement status for transaction ${transactionId}:`, error);
    throw new Error(error?.message || 'Failed to update disbursement status');
  }
};

// New function to update transaction payment status
export const updateTransactionPaymentStatus = async (
  transactionId: string,
  transactionStatusId: number,
  notes?: string,
  adminId?: number
): Promise<any> => {
  try {
    console.log(`Updating payment status for transaction ID: ${transactionId} to status ID ${transactionStatusId}`);
    
    // Prepare request body
    const requestBody = {
      transactionId, // The API accepts IDs with or without TRX prefix
      transactionStatusId,
      notes,
      adminId
    };
    
    // Log the request for debugging
    console.log('Request body for payment status update:', requestBody);
    
    // Get auth token using the helper function
    const token = getAuthToken();
    
    console.log('Using auth token for payment status update');
    
    // Make the API call
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/transactions/update-payment-status`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Payment status update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating payment status for transaction ${transactionId}:`, error);
    
    // Extract and throw error message from response if available
    if (error.response) {
      // Handle different HTTP error codes
      if (error.response.status === 403) {
        throw new Error('Access Denied: You do not have permission to update payment status');
      } else if (error.response.status === 401) {
        throw new Error('Authentication failed: Your session may have expired');
      }
      
      // Extract error message from response if available
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    // Re-throw the original error if we couldn't extract more information
    throw error;
  }
}; 