import { QueryClient } from '@tanstack/react-query';
import {
  getAllNonWalletTransfers,
  getFilteredNonWalletTransfers,
  getNonWalletTransferById,
  createNonWalletTransfer,
  updateNonWalletTransferStatus,
  getNonWalletTransferEvents,
  sendSmsNotification,
  getSupportedCountries,
  getBanksByCountry,
  getMobileNetworksByCountry,
  calculateTransferFee
} from '../services/nonWalletTransferService';
import {
  NonWalletTransferFilters,
  NonWalletTransferCreateRequest,
  NonWalletTransferUpdateStatusRequest,
  NonWalletTransferStatus,
  NonWalletTransferResponse
} from '../types/nonWalletTransfer';
import { useState } from 'react';

// Create a client
const queryClient = new QueryClient();

// Query keys
export const queryKeys = {
  allTransfers: ['nonWalletTransfers'] as const,
  filteredTransfers: (filters: NonWalletTransferFilters) => 
    [...queryKeys.allTransfers, 'filtered', filters] as const,
  transferDetails: (id: string) => 
    [...queryKeys.allTransfers, 'details', id] as const,
  transferEvents: (id: string) => 
    [...queryKeys.allTransfers, 'events', id] as const,
  countries: ['countries'] as const,
  banks: (countryCode: string) => 
    ['banks', countryCode] as const,
  mobileNetworks: (countryCode: string) => 
    ['mobileNetworks', countryCode] as const,
};

// Hook for fetching all non-wallet transfers
export const useAllNonWalletTransfers = () => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      try {
        const data = await getAllNonWalletTransfers();
        return data;
      } catch (error) {
        console.error('Error fetching transfers:', error);
        throw error;
      }
    }
  };
};

// Hook for fetching filtered non-wallet transfers
export const useFilteredNonWalletTransfers = (filters: NonWalletTransferFilters) => {
  const [data, setData] = useState<NonWalletTransferResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      const responseData = await getFilteredNonWalletTransfers(filters);
      setData(responseData);
      return responseData;
    } catch (err) {
      console.error('Error fetching filtered transfers:', err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  };
};

// Hook for fetching a single non-wallet transfer by ID
export const useNonWalletTransferDetails = (id: string) => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      if (!id) return null;
      try {
        const data = await getNonWalletTransferById(id);
        return data;
      } catch (error) {
        console.error(`Error fetching transfer ${id}:`, error);
        throw error;
      }
    }
  };
};

// Hook for fetching events for a non-wallet transfer
export const useNonWalletTransferEvents = (id: string) => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      if (!id) return null;
      try {
        const data = await getNonWalletTransferEvents(id);
        return data;
      } catch (error) {
        console.error(`Error fetching events for transfer ${id}:`, error);
        throw error;
      }
    }
  };
};

// Hook for creating a new non-wallet transfer
export const useCreateNonWalletTransfer = () => {
  return async (data: NonWalletTransferCreateRequest) => {
    try {
      const result = await createNonWalletTransfer(data);
      return result;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  };
};

// Hook for updating the status of a non-wallet transfer
export const useUpdateNonWalletTransferStatus = (id: string) => {
  return {
    mutate: async (data: NonWalletTransferUpdateStatusRequest) => {
      try {
        const result = await updateNonWalletTransferStatus(id, data);
        return result;
      } catch (error) {
        console.error(`Error updating status for transfer ${id}:`, error);
        throw error;
      }
    },
    isLoading: false,
    isError: false,
    error: null
  };
};

// Hook for sending SMS notification
export const useSendSmsNotification = (id: string) => {
  return {
    mutate: async (message: string) => {
      try {
        const result = await sendSmsNotification(id, message);
        return result;
      } catch (error) {
        console.error(`Error sending SMS for transfer ${id}:`, error);
        throw error;
      }
    },
    isLoading: false,
    isError: false,
    error: null
  };
};

// Hook for fetching supported countries
export const useSupportedCountries = () => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      try {
        const data = await getSupportedCountries();
        return data;
      } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
    }
  };
};

// Hook for fetching banks by country
export const useBanksByCountry = (countryCode: string) => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      if (!countryCode) return null;
      try {
        const data = await getBanksByCountry(countryCode);
        return data;
      } catch (error) {
        console.error(`Error fetching banks for country ${countryCode}:`, error);
        throw error;
      }
    }
  };
};

// Hook for fetching mobile networks by country
export const useMobileNetworksByCountry = (countryCode: string) => {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {
      if (!countryCode) return null;
      try {
        const data = await getMobileNetworksByCountry(countryCode);
        return data;
      } catch (error) {
        console.error(`Error fetching mobile networks for country ${countryCode}:`, error);
        throw error;
      }
    }
  };
};

// Hook for calculating transfer fee
export const useCalculateTransferFee = () => {
  return {
    mutate: async (params: { amount: number; currency: string; type: string; destinationCountry: string }) => {
      try {
        const result = await calculateTransferFee(
          params.amount,
          params.currency,
          params.type,
          params.destinationCountry
        );
        return result;
      } catch (error) {
        console.error('Error calculating fee:', error);
        throw error;
      }
    },
    isLoading: false,
    isError: false,
    error: null
  };
}; 