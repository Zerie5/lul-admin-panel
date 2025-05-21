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
  updateNonWalletTransferDisbursementStatus,
  createNonWalletTransfer,
  updateTransactionPaymentStatus
} from '../services/nonWalletTransferService';

// Default filters
const defaultFilters: NonWalletTransferFilters = {
  page: 0,
  pageSize: 10,
  searchTerm: '',
  searchCategory: 'all',
  statusFilter: undefined,
  type: undefined,
  paymentStatus: undefined,
  startDate: undefined,
  endDate: undefined,
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
      
      // Call the API service to get filtered transfers
      const response = await getFilteredNonWalletTransfers(filters);
      
      setTransfers(response.transfers || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error('Error fetching transfers:', err);
      setError(err);
      setTransfers([]);
      setTotalCount(0);
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
  const [disbursementUpdateLoading, setDisbursementUpdateLoading] = useState(false);
  const [paymentStatusUpdateLoading, setPaymentStatusUpdateLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfer = async () => {
    if (!transferId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch actual data from the backend
      const transferData = await getNonWalletTransferById(transferId);
      const eventsData = await getNonWalletTransferEvents(transferId);
      
      setTransfer(transferData);
      setEvents(eventsData);
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
      
      // Update status using the actual API
      const updatedTransfer = await updateNonWalletTransferStatus(transferId, { status, notes });
      
      if (updatedTransfer) {
        setTransfer(updatedTransfer);
        
        // Fetch updated events
        const updatedEvents = await getNonWalletTransferEvents(transferId);
        setEvents(updatedEvents);
      }
      
      return updatedTransfer;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const updateDisbursementStatus = async (
    disbursementStageId: number, 
    updateCompletedAt?: boolean, 
    notes?: string, 
    adminId?: number
  ) => {
    if (!transferId) return null;
    
    try {
      setDisbursementUpdateLoading(true);
      
      // Update disbursement status using the actual API
      const updatedTransfer = await updateNonWalletTransferDisbursementStatus(
        transferId, 
        disbursementStageId, 
        updateCompletedAt, 
        notes, 
        adminId
      );
      
      if (updatedTransfer) {
        setTransfer(updatedTransfer);
        
        // Fetch updated events
        const updatedEvents = await getNonWalletTransferEvents(transferId);
        setEvents(updatedEvents);
      }
      
      return updatedTransfer;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setDisbursementUpdateLoading(false);
    }
  };

  // Add payment status update function
  const updatePaymentStatus = async (
    transactionStatusId: number,
    notes?: string,
    adminId?: number
  ) => {
    if (!transferId) return null;
    
    try {
      setPaymentStatusUpdateLoading(true);
      
      // Update payment status using the new API endpoint
      const updatedTransfer = await updateTransactionPaymentStatus(
        transferId,
        transactionStatusId,
        notes,
        adminId
      );
      
      if (updatedTransfer) {
        setTransfer(updatedTransfer);
        
        // Fetch updated events
        const updatedEvents = await getNonWalletTransferEvents(transferId);
        setEvents(updatedEvents);
      }
      
      return updatedTransfer;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setPaymentStatusUpdateLoading(false);
    }
  };

  return {
    transfer,
    events,
    loading,
    error,
    updateStatus,
    updateDisbursementStatus,
    updatePaymentStatus,
    updateLoading,
    disbursementUpdateLoading,
    paymentStatusUpdateLoading,
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
      
      // Call the API to create a new transfer
      const result = await createNonWalletTransfer(transferData);
      
      setSuccess(true);
      return result;
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