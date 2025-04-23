import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

// Types
export interface TransactionFilters {
  searchTerm?: string;
  searchField?: string;
  transactionType?: string;
  type?: string;
  status?: string;
  userId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface TransactionNote {
  transactionId: string;
  note: string;
}

// Hook to fetch transactions with filters
export const useTransactions = (filters: TransactionFilters = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await transactionService.getTransactions(filters);
        setData(result);
        setIsError(false);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const result = await transactionService.getTransactions(filters);
      setData(result);
      setIsError(false);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isError, refetch };
};

// Hook to fetch transaction details
export const useTransactionDetails = (transactionId: string) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await transactionService.getTransactionDetails(transactionId);
        setData(result);
        setIsError(false);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (transactionId) {
      fetchData();
    }
  }, [transactionId]);

  return { data, isLoading, isError };
};

// Hook to flag a transaction
export const useFlagTransaction = (options?: any) => {
  const mutate = async (transactionId: string) => {
    try {
      await transactionService.flagTransaction(transactionId);
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error) {
      if (options?.onError) {
        options.onError();
      }
    }
  };

  return { mutate };
};

// Hook to add a note to a transaction
export const useAddTransactionNote = (options?: any) => {
  const mutate = async (data: TransactionNote) => {
    try {
      await transactionService.addTransactionNote(data);
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error) {
      if (options?.onError) {
        options.onError();
      }
    }
  };

  return { mutate };
}; 