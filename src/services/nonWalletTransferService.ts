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

// Mock data
const mockTransfers: NonWalletTransfer[] = Array.from({ length: 50 }).map((_, index) => {
  const type = Object.values(NonWalletTransferType)[Math.floor(Math.random() * Object.values(NonWalletTransferType).length)];
  const status = Object.values(NonWalletTransferStatus)[Math.floor(Math.random() * Object.values(NonWalletTransferStatus).length)];
  const amount = parseFloat((Math.random() * 1000 + 50).toFixed(2));
  const fee = parseFloat((amount * 0.05).toFixed(2));
  const totalAmount = parseFloat((amount + fee).toFixed(2));
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString();
  const updatedAt = new Date(new Date(createdAt).getTime() + Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString();
  const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS'];
  const countries = ['US', 'GB', 'NG', 'KE', 'GH'];
  
  const transfer: NonWalletTransfer = {
    id: `NWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${index + 1}`,
    amount,
    fee,
    totalAmount,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    type,
    status,
    reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    senderName: `Sender ${index + 1}`,
    senderPhone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
    senderEmail: Math.random() > 0.3 ? `sender${index + 1}@example.com` : undefined,
    senderCountry: countries[Math.floor(Math.random() * countries.length)],
    recipientName: `Recipient ${index + 1}`,
    recipientPhone: `+${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 900000000 + 100000000)}`,
    recipientEmail: Math.random() > 0.7 ? `recipient${index + 1}@example.com` : undefined,
    recipientCountry: countries[Math.floor(Math.random() * countries.length)],
    createdAt,
    updatedAt,
  };
  
  // Add type-specific fields
  if (type === NonWalletTransferType.BANK_TRANSFER) {
    transfer.recipientBank = `Bank ${Math.floor(Math.random() * 10) + 1}`;
    transfer.recipientAccountNumber = `${Math.floor(Math.random() * 10000000000)}`;
  } else if (type === NonWalletTransferType.MOBILE_MONEY) {
    transfer.recipientMobileNetwork = `Network ${Math.floor(Math.random() * 5) + 1}`;
  }
  
  // Add notes for some transfers
  if (Math.random() > 0.7) {
    transfer.notes = `Note for transfer ${index + 1}`;
  }
  
  // Add completedAt for completed transfers
  if (status === NonWalletTransferStatus.COMPLETED) {
    transfer.completedAt = updatedAt;
  }
  
  return transfer;
});

const mockEvents: Record<string, NonWalletTransferEvent[]> = {};

// Generate events for each transfer
mockTransfers.forEach(transfer => {
  const events: NonWalletTransferEvent[] = [];
  const statuses = [
    NonWalletTransferStatus.PENDING,
    ...(transfer.status === NonWalletTransferStatus.COMPLETED ? [NonWalletTransferStatus.PROCESSING, NonWalletTransferStatus.COMPLETED] : 
      transfer.status === NonWalletTransferStatus.PROCESSING ? [NonWalletTransferStatus.PROCESSING] :
      transfer.status === NonWalletTransferStatus.FAILED ? [NonWalletTransferStatus.PROCESSING, NonWalletTransferStatus.FAILED] :
      transfer.status === NonWalletTransferStatus.CANCELLED ? [NonWalletTransferStatus.CANCELLED] : [])
  ];
  
  statuses.forEach((status, index) => {
    const createdAt = new Date(new Date(transfer.createdAt).getTime() + index * 24 * 60 * 60 * 1000).toISOString();
    events.push({
      id: `EVT-${Math.random().toString(36).substring(2, 10)}-${index}`,
      transferId: transfer.id,
      status,
      notes: Math.random() > 0.5 ? `Event note ${index + 1}` : undefined,
      createdAt,
      createdBy: Math.random() > 0.3 ? `Admin ${Math.floor(Math.random() * 5) + 1}` : undefined
    });
  });
  
  mockEvents[transfer.id] = events;
});

// Mock countries
const mockCountries: Country[] = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
];

// Mock banks
const mockBanks: Record<string, Bank[]> = {
  'US': [
    { id: 'us-bank-1', name: 'Bank of America', code: 'BOA', country: 'US' },
    { id: 'us-bank-2', name: 'Chase Bank', code: 'CHASE', country: 'US' },
    { id: 'us-bank-3', name: 'Wells Fargo', code: 'WF', country: 'US' },
  ],
  'GB': [
    { id: 'gb-bank-1', name: 'Barclays', code: 'BARC', country: 'GB' },
    { id: 'gb-bank-2', name: 'HSBC', code: 'HSBC', country: 'GB' },
    { id: 'gb-bank-3', name: 'Lloyds Bank', code: 'LLOYDS', country: 'GB' },
  ],
  'NG': [
    { id: 'ng-bank-1', name: 'Guaranty Trust Bank', code: 'GTB', country: 'NG' },
    { id: 'ng-bank-2', name: 'First Bank of Nigeria', code: 'FBN', country: 'NG' },
    { id: 'ng-bank-3', name: 'Zenith Bank', code: 'ZENITH', country: 'NG' },
  ],
  'KE': [
    { id: 'ke-bank-1', name: 'Equity Bank', code: 'EQUITY', country: 'KE' },
    { id: 'ke-bank-2', name: 'KCB Bank', code: 'KCB', country: 'KE' },
    { id: 'ke-bank-3', name: 'Co-operative Bank', code: 'COOP', country: 'KE' },
  ],
  'GH': [
    { id: 'gh-bank-1', name: 'Ecobank Ghana', code: 'ECO', country: 'GH' },
    { id: 'gh-bank-2', name: 'GCB Bank', code: 'GCB', country: 'GH' },
    { id: 'gh-bank-3', name: 'Fidelity Bank Ghana', code: 'FID', country: 'GH' },
  ],
};

// Mock mobile networks
const mockMobileNetworks: Record<string, MobileNetwork[]> = {
  'US': [
    { id: 'us-network-1', name: 'AT&T', code: 'ATT', country: 'US' },
    { id: 'us-network-2', name: 'Verizon', code: 'VZN', country: 'US' },
    { id: 'us-network-3', name: 'T-Mobile', code: 'TMOB', country: 'US' },
  ],
  'GB': [
    { id: 'gb-network-1', name: 'Vodafone', code: 'VOD', country: 'GB' },
    { id: 'gb-network-2', name: 'EE', code: 'EE', country: 'GB' },
    { id: 'gb-network-3', name: 'O2', code: 'O2', country: 'GB' },
  ],
  'NG': [
    { id: 'ng-network-1', name: 'MTN Nigeria', code: 'MTN', country: 'NG' },
    { id: 'ng-network-2', name: 'Airtel Nigeria', code: 'AIRTEL', country: 'NG' },
    { id: 'ng-network-3', name: 'Glo Mobile', code: 'GLO', country: 'NG' },
  ],
  'KE': [
    { id: 'ke-network-1', name: 'Safaricom', code: 'SAFCOM', country: 'KE' },
    { id: 'ke-network-2', name: 'Airtel Kenya', code: 'AIRTEL', country: 'KE' },
    { id: 'ke-network-3', name: 'Telkom Kenya', code: 'TELKOM', country: 'KE' },
  ],
  'GH': [
    { id: 'gh-network-1', name: 'MTN Ghana', code: 'MTN', country: 'GH' },
    { id: 'gh-network-2', name: 'Vodafone Ghana', code: 'VOD', country: 'GH' },
    { id: 'gh-network-3', name: 'AirtelTigo', code: 'ATIGO', country: 'GH' },
  ],
};

// Use Vite's import.meta.env for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Log the API URL for debugging
console.log('Non-Wallet Transfer Service API URL:', API_URL);

// Mock API functions
export const getAllNonWalletTransfers = async (): Promise<NonWalletTransfer[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockTransfers];
};

export const getFilteredNonWalletTransfers = async (
  filters: NonWalletTransferFilters
): Promise<NonWalletTransferResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', String(filters.page));
    params.append('limit', String(filters.pageSize));
    
    if (filters.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    
    if (filters.searchCategory) {
      params.append('searchCategory', filters.searchCategory);
    } else {
      params.append('searchCategory', 'all');
    }
    
    if (filters.statusFilter) {
      // Make sure we're sending the correct filter value
      params.append('statusFilter', filters.statusFilter);
      console.log(`Using statusFilter: ${filters.statusFilter}`);
    }
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
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
    
    const endpoint = `${API_URL}/api/admin/dashboard/nonwallet-transaction-dash`;
    console.log(`Fetching non-wallet transfers: ${endpoint}`);
    console.log(`Parameters:`, Object.fromEntries(params.entries()));
    
    // Add auth token from localStorage if available
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make API request
    const response = await axios.get<ApiPaginatedResponse<NonWalletTransfer>>(
      endpoint,
      { 
        params,
        headers 
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
    
    // No more mock data fallback - throw the error to be handled by the component
    throw new Error(error?.response?.data?.message || error.message || 'Error fetching data from server');
  }
};

export const getNonWalletTransferById = async (id: string): Promise<NonWalletTransfer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const transfer = mockTransfers.find(t => t.id === id);
  
  if (!transfer) {
    throw new Error(`Transfer with ID ${id} not found`);
  }
  
  return { ...transfer };
};

export const createNonWalletTransfer = async (
  data: NonWalletTransferCreateRequest
): Promise<NonWalletTransfer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const amount = data.amount;
  const fee = parseFloat((amount * 0.05).toFixed(2));
  const totalAmount = parseFloat((amount + fee).toFixed(2));
  const createdAt = new Date().toISOString();
  
  const newTransfer: NonWalletTransfer = {
    id: `NWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${mockTransfers.length + 1}`,
    amount,
    fee,
    totalAmount,
    currency: data.currency,
    type: data.type,
    status: NonWalletTransferStatus.PENDING,
    reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    senderName: `Sender ${mockTransfers.length + 1}`,
    senderPhone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
    senderEmail: `sender${mockTransfers.length + 1}@example.com`,
    senderCountry: 'US',
    recipientName: data.recipientName,
    recipientPhone: data.recipientPhone,
    recipientEmail: data.recipientEmail,
    recipientCountry: data.recipientCountry,
    notes: data.purpose,
    createdAt,
    updatedAt: createdAt,
  };
  
  // Add type-specific fields
  if (data.type === NonWalletTransferType.BANK_TRANSFER && data.bankDetails) {
    newTransfer.recipientBank = data.bankDetails.bankName;
    newTransfer.recipientAccountNumber = data.bankDetails.accountNumber;
  } else if (data.type === NonWalletTransferType.MOBILE_MONEY && data.mobileDetails) {
    newTransfer.recipientMobileNetwork = data.mobileDetails.networkProvider;
  }
  
  // Add to mock data
  mockTransfers.unshift(newTransfer);
  
  // Create initial event
  const event: NonWalletTransferEvent = {
    id: `EVT-${Math.random().toString(36).substring(2, 10)}-0`,
    transferId: newTransfer.id,
    status: NonWalletTransferStatus.PENDING,
    notes: 'Transfer created',
    createdAt,
    createdBy: 'Admin'
  };
  
  mockEvents[newTransfer.id] = [event];
  
  return newTransfer;
};

export const updateNonWalletTransferStatus = async (
  id: string,
  data: NonWalletTransferUpdateStatusRequest
): Promise<NonWalletTransfer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const transferIndex = mockTransfers.findIndex(t => t.id === id);
  
  if (transferIndex === -1) {
    throw new Error(`Transfer with ID ${id} not found`);
  }
  
  const transfer = { ...mockTransfers[transferIndex] };
  const updatedAt = new Date().toISOString();
  
  transfer.status = data.status;
  transfer.updatedAt = updatedAt;
  
  if (data.notes) {
    transfer.notes = data.notes;
  }
  
  if (data.status === NonWalletTransferStatus.COMPLETED) {
    transfer.completedAt = updatedAt;
  } else {
    delete transfer.completedAt;
  }
  
  // Update in mock data
  mockTransfers[transferIndex] = transfer;
  
  // Create status update event
  const event: NonWalletTransferEvent = {
    id: `EVT-${Math.random().toString(36).substring(2, 10)}-${mockEvents[id].length}`,
    transferId: id,
    status: data.status,
    notes: data.notes || `Status updated to ${data.status}`,
    createdAt: updatedAt,
    createdBy: 'Admin'
  };
  
  mockEvents[id].push(event);
  
  return transfer;
};

export const getNonWalletTransferEvents = async (id: string): Promise<NonWalletTransferEvent[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const events = mockEvents[id];
  
  if (!events) {
    throw new Error(`Events for transfer with ID ${id} not found`);
  }
  
  return [...events];
};

export const sendSmsNotification = async (id: string, message: string): Promise<{ success: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const transfer = mockTransfers.find(t => t.id === id);
  
  if (!transfer) {
    throw new Error(`Transfer with ID ${id} not found`);
  }
  
  // Create SMS notification event
  const event: NonWalletTransferEvent = {
    id: `EVT-${Math.random().toString(36).substring(2, 10)}-${mockEvents[id].length}`,
    transferId: id,
    status: transfer.status,
    notes: `SMS notification sent: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  };
  
  mockEvents[id].push(event);
  
  return { success: true };
};

export const getSupportedCountries = async (): Promise<Country[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockCountries];
};

export const getBanksByCountry = async (countryCode: string): Promise<Bank[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const banks = mockBanks[countryCode];
  
  if (!banks) {
    return [];
  }
  
  return [...banks];
};

export const getMobileNetworksByCountry = async (countryCode: string): Promise<MobileNetwork[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const networks = mockMobileNetworks[countryCode];
  
  if (!networks) {
    return [];
  }
  
  return [...networks];
};

export const calculateTransferFee = async (
  amount: number, 
  currency: string, 
  type: string,
  destinationCountry: string
): Promise<{ fee: number, totalAmount: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple fee calculation: 5% of amount
  const fee = parseFloat((amount * 0.05).toFixed(2));
  const totalAmount = parseFloat((amount + fee).toFixed(2));
  
  return { fee, totalAmount };
}; 