import { useState, useEffect } from 'react';
import { 
  NonWalletTransfer, 
  NonWalletTransferFilters, 
  NonWalletTransferStatus,
  NonWalletTransferType,
  NonWalletTransferEvent,
  NonWalletTransferUpdateStatusRequest,
  NonWalletTransferCreateRequest
} from '../types/nonWalletTransfer';
import {
  getFilteredNonWalletTransfers,
  getNonWalletTransferById,
  getNonWalletTransferEvents,
  updateNonWalletTransferStatus,
  createNonWalletTransfer
} from '../services/nonWalletTransferService';

// Helper function to generate mock transfers
const generateMockNonWalletTransfers = (count: number): NonWalletTransfer[] => {
  return Array.from({ length: count }).map((_, index) => {
    const type = Object.values(NonWalletTransferType)[Math.floor(Math.random() * Object.values(NonWalletTransferType).length)];
    const status = Object.values(NonWalletTransferStatus)[Math.floor(Math.random() * Object.values(NonWalletTransferStatus).length)];
    const amount = parseFloat((Math.random() * 1000 + 50).toFixed(2));
    const fee = parseFloat((amount * 0.05).toFixed(2));
    const totalAmount = parseFloat((amount + fee).toFixed(2));
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString();
    
    return {
      id: `NWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${index + 1}`,
      amount,
      fee,
      totalAmount,
      currency: ['USD', 'EUR', 'GBP', 'NGN'][Math.floor(Math.random() * 4)],
      type,
      status,
      reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      senderName: `Sender ${index + 1}`,
      senderPhone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
      senderEmail: Math.random() > 0.3 ? `sender${index + 1}@example.com` : undefined,
      senderCountry: ['US', 'UK', 'NG', 'GH'][Math.floor(Math.random() * 4)],
      recipientName: `Recipient ${index + 1}`,
      recipientPhone: `+${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 900000000 + 100000000)}`,
      recipientEmail: Math.random() > 0.7 ? `recipient${index + 1}@example.com` : undefined,
      recipientCountry: ['US', 'UK', 'NG', 'GH'][Math.floor(Math.random() * 4)],
      notes: Math.random() > 0.7 ? `Note for transfer ${index + 1}` : undefined,
      createdAt,
      updatedAt,
      completedAt: status === NonWalletTransferStatus.COMPLETED ? updatedAt : undefined
    };
  });
};

// Helper function to generate mock events
const generateMockTransferEvents = (transferId: string, count: number): NonWalletTransferEvent[] => {
  return Array.from({ length: count }).map((_, index) => {
    const statuses = Object.values(NonWalletTransferStatus);
    const status = statuses[Math.min(index, statuses.length - 1)];
    const createdAt = new Date(Date.now() - (count - index) * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      id: `EVT-${Math.random().toString(36).substring(2, 10)}-${index}`,
      transferId,
      status,
      notes: Math.random() > 0.5 ? `Event note ${index + 1}` : undefined,
      createdAt,
      createdBy: Math.random() > 0.3 ? `Admin ${Math.floor(Math.random() * 5) + 1}` : undefined
    };
  });
};

// Default filters
const defaultFilters: NonWalletTransferFilters = {
  page: 0,
  pageSize: 10,
  searchTerm: '',
  status: undefined,
  type: undefined,
  fromDate: undefined,
  toDate: undefined,
  minAmount: undefined,
  maxAmount: undefined
};

// Hook for fetching non-wallet transfers with filters
export const useNonWalletTransfers = (initialFilters?: Partial<NonWalletTransferFilters>) => {
  const [filters, setFilters] = useState<NonWalletTransferFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [transfers, setTransfers] = useState<NonWalletTransfer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call the API
      // const response = await getFilteredNonWalletTransfers(filters);
      
      // For development, use mock data
      const mockTransfers = generateMockNonWalletTransfers(100);
      
      // Apply filters to mock data
      let filteredTransfers = [...mockTransfers];
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredTransfers = filteredTransfers.filter(transfer => 
          transfer.id.toLowerCase().includes(searchTerm) ||
          transfer.senderName.toLowerCase().includes(searchTerm) ||
          transfer.senderPhone.includes(searchTerm) ||
          transfer.recipientPhone.includes(searchTerm)
        );
      }
      
      if (filters.status) {
        filteredTransfers = filteredTransfers.filter(transfer => 
          transfer.status === filters.status
        );
      }
      
      if (filters.type) {
        filteredTransfers = filteredTransfers.filter(transfer => 
          transfer.type === filters.type
        );
      }
      
      if (filters.fromDate) {
        const startDate = new Date(filters.fromDate);
        filteredTransfers = filteredTransfers.filter(transfer => 
          new Date(transfer.createdAt) >= startDate
        );
      }
      
      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setHours(23, 59, 59, 999);
        filteredTransfers = filteredTransfers.filter(transfer => 
          new Date(transfer.createdAt) <= endDate
        );
      }
      
      if (filters.minAmount !== undefined) {
        filteredTransfers = filteredTransfers.filter(transfer => 
          transfer.amount >= filters.minAmount!
        );
      }
      
      if (filters.maxAmount !== undefined) {
        filteredTransfers = filteredTransfers.filter(transfer => 
          transfer.amount <= filters.maxAmount!
        );
      }
      
      // Sort by created date (newest first)
      filteredTransfers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const total = filteredTransfers.length;
      
      // Apply pagination
      const start = filters.page * filters.pageSize;
      const end = start + filters.pageSize;
      const paginatedTransfers = filteredTransfers.slice(start, end);
      
      setTransfers(paginatedTransfers);
      setTotalCount(total);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

  const updateFilters = (newFilters: Partial<NonWalletTransferFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      // Reset to first page when filters change (except when changing page)
      page: 'page' in newFilters ? newFilters.page! : 0
    }));
  };

  return {
    transfers,
    totalCount,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchTransfers
  };
};

// Hook for fetching a single non-wallet transfer by ID
export const useNonWalletTransfer = (transferId: string) => {
  const [transfer, setTransfer] = useState<NonWalletTransfer | null>(null);
  const [events, setEvents] = useState<NonWalletTransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfer = async () => {
    if (!transferId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call the API
      // const transferData = await getNonWalletTransferById(transferId);
      // const eventsData = await getNonWalletTransferEvents(transferId);
      
      // For development, use mock data
      const mockTransfers = generateMockNonWalletTransfers(1);
      const mockTransfer = { ...mockTransfers[0], id: transferId };
      const mockEvents = generateMockTransferEvents(transferId, 5);
      
      setTransfer(mockTransfer);
      setEvents(mockEvents);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfer();
  }, [transferId]);

  const updateStatus = async (status: NonWalletTransferStatus, notes?: string) => {
    if (!transferId) return null;
    
    try {
      setUpdateLoading(true);
      
      // In a real app, this would call the API
      // const updatedTransfer = await updateNonWalletTransferStatus(transferId, { status, notes });
      
      // For development, update the mock data
      const statusData: NonWalletTransferUpdateStatusRequest = {
        status,
        notes
      };
      
      const updatedTransfer = transfer ? {
        ...transfer,
        status: statusData.status,
        notes: statusData.notes || transfer.notes,
        updatedAt: new Date().toISOString(),
        completedAt: statusData.status === NonWalletTransferStatus.COMPLETED ? new Date().toISOString() : transfer.completedAt
      } : null;
      
      if (updatedTransfer) {
        setTransfer(updatedTransfer);
        
        // Add a new event
        const newEvent: NonWalletTransferEvent = {
          id: `EVT-${Math.random().toString(36).substring(2, 10)}`,
          transferId,
          status: statusData.status,
          notes: statusData.notes,
          createdAt: new Date().toISOString(),
          createdBy: 'Current Admin'
        };
        
        setEvents(prevEvents => [newEvent, ...prevEvents]);
      }
      
      return updatedTransfer;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
    transfer,
    events,
    loading,
    error,
    updateStatus,
    updateLoading,
    refetch: fetchTransfer
  };
};

// Hook for creating a new non-wallet transfer
export const useCreateNonWalletTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const createTransfer = async (transferData: NonWalletTransferCreateRequest) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // In a real app, this would call the API
      // const newTransfer = await createNonWalletTransfer(transferData);
      
      // For development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fee = parseFloat((transferData.amount * 0.05).toFixed(2));
      const totalAmount = parseFloat((transferData.amount + fee).toFixed(2));
      
      // Mock sender data based on senderId
      const mockSenderData = {
        senderName: `Sender ${transferData.senderId}`,
        senderPhone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
        senderCountry: 'US'
      };
      
      // Process bank details if present
      let processedBankDetails;
      if (transferData.bankDetails) {
        processedBankDetails = {
          ...transferData.bankDetails,
          routingNumber: transferData.bankDetails.branchCode || '123456789'
        };
      }
      
      // Process mobile details if present
      let processedMobileDetails;
      if (transferData.mobileDetails) {
        processedMobileDetails = {
          mobileNetwork: transferData.mobileDetails.networkProvider
        };
      }
      
      const newTransfer: NonWalletTransfer = {
        id: `NWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ...transferData,
        ...mockSenderData,
        fee,
        totalAmount,
        status: NonWalletTransferStatus.PENDING,
        reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bankDetails: processedBankDetails,
        mobileDetails: processedMobileDetails
      };
      
      setSuccess(true);
      return newTransfer;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransfer,
    loading,
    error,
    success
  };
}; 