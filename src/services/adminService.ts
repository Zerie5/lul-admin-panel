import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types for dashboard data
export interface DashboardSummary {
  totalTransactions: number;
  totalTransactionValue: number;
  activeUsers: number;
  successRate: number;
  nonWalletTransfers: number;
}

export interface TransactionTrend {
  date: string;
  count: number;
  value: number;
}

export interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'WALLET_TRANSFER' | 'NON_WALLET_TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  description?: string;
}

// Admin service functions
const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await axios.get(`${API_BASE_URL}/admin/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  return response.data;
};

const getTransactionTrends = async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TransactionTrend[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/dashboard/transaction-trends`, {
    params: { period },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  return response.data;
};

const getUserActivity = async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<UserActivity[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/dashboard/user-activity`, {
    params: { period },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  return response.data;
};

const getRecentTransactions = async (limit: number = 10, page: number = 0): Promise<{
  transactions: Transaction[];
  totalCount: number;
}> => {
  const response = await axios.get(`${API_BASE_URL}/admin/transactions`, {
    params: { limit, page },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  return response.data;
};

const getTransactionDetails = async (transactionId: string): Promise<Transaction> => {
  const response = await axios.get(`${API_BASE_URL}/admin/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  return response.data;
};

// Mock data for development
export const getMockDashboardSummary = (): DashboardSummary => ({
  totalTransactions: 1248,
  totalTransactionValue: 87654.32,
  activeUsers: 356,
  successRate: 98.7,
  nonWalletTransfers: 42
});

export const getMockTransactionTrends = (): TransactionTrend[] => {
  const data: TransactionTrend[] = [];
  const now = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 100) + 50,
      value: Math.floor(Math.random() * 10000) + 5000
    });
  }
  
  return data;
};

export const getMockUserActivity = (): UserActivity[] => {
  const data: UserActivity[] = [];
  const now = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20) + 5,
      activeUsers: Math.floor(Math.random() * 100) + 200
    });
  }
  
  return data;
};

export const getMockRecentTransactions = (limit: number = 10): {
  transactions: Transaction[];
  totalCount: number;
} => {
  const transactions: Transaction[] = [];
  const transactionTypes: Transaction['type'][] = ['WALLET_TRANSFER', 'NON_WALLET_TRANSFER', 'DEPOSIT', 'WITHDRAWAL'];
  const statuses: Transaction['status'][] = ['COMPLETED', 'PENDING', 'FAILED'];
  
  for (let i = 0; i < limit; i++) {
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 30);
    
    transactions.push({
      id: `TRX${Math.floor(Math.random() * 1000000)}`,
      userId: `USR${Math.floor(Math.random() * 10000)}`,
      userName: `User ${i + 1}`,
      amount: Math.floor(Math.random() * 1000) + 10,
      type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: date.toISOString(),
      description: `Transaction description ${i + 1}`
    });
  }
  
  return {
    transactions,
    totalCount: 100
  };
};

export const adminService = {
  getDashboardSummary,
  getTransactionTrends,
  getUserActivity,
  getRecentTransactions,
  getTransactionDetails,
  // Mock functions for development
  getMockDashboardSummary,
  getMockTransactionTrends,
  getMockUserActivity,
  getMockRecentTransactions
};

export default adminService; 