import { TransactionFilters, TransactionNote } from '../hooks/useTransactions';
import axios from 'axios';

// Mock data types
interface User {
  userId: string;
  name: string;
  phone: string;
  account?: string;
}

interface TimelineEvent {
  timestamp: string;
  status: string;
  description: string;
}

interface Note {
  timestamp: string;
  adminName: string;
  text: string;
}

interface RelatedTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  timestamp: string;
  reference?: string;
  sender: User;
  recipient: User;
  flagged: boolean;
  notes?: Note[];
  timeline: TimelineEvent[];
  relatedTransactions?: RelatedTransaction[];
}

interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
}

interface TransactionDetailsResponse {
  transaction: Transaction;
}

// Generate mock data
const generateMockTransactions = (count: number): Transaction[] => {
  const transactionTypes = ['wallet', 'non-wallet', 'deposit', 'withdrawal'];
  const statuses = ['completed', 'pending', 'failed'];
  
  return Array.from({ length: count }).map((_, index) => {
    const id = `tx-${Math.random().toString(36).substring(2, 10)}-${index}`;
    const amount = parseFloat((Math.random() * 1000 + 10).toFixed(2));
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
    const flagged = Math.random() > 0.9;
    
    const sender: User = {
      userId: `user-${Math.random().toString(36).substring(2, 10)}`,
      name: `Sender ${index}`,
      phone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
      account: Math.random() > 0.5 ? `Account ${Math.floor(Math.random() * 1000)}` : undefined
    };
    
    const recipient: User = {
      userId: `user-${Math.random().toString(36).substring(2, 10)}`,
      name: `Recipient ${index}`,
      phone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
      account: Math.random() > 0.5 ? `Account ${Math.floor(Math.random() * 1000)}` : undefined
    };
    
    const timeline: TimelineEvent[] = [
      {
        timestamp: new Date(new Date(timestamp).getTime() - 2 * 60 * 1000).toISOString(),
        status: 'pending',
        description: 'Transaction initiated'
      },
      {
        timestamp: new Date(new Date(timestamp).getTime() - 1 * 60 * 1000).toISOString(),
        status: 'pending',
        description: 'Processing payment'
      },
      {
        timestamp,
        status,
        description: status === 'completed' 
          ? 'Transaction completed successfully' 
          : status === 'pending' 
            ? 'Awaiting confirmation' 
            : 'Transaction failed'
      }
    ];
    
    const notes = flagged ? [
      {
        timestamp: new Date(new Date(timestamp).getTime() + 30 * 60 * 1000).toISOString(),
        adminName: 'Admin User',
        text: 'This transaction has been flagged for review due to unusual activity.'
      }
    ] : undefined;
    
    const relatedTransactions = Math.random() > 0.7 ? [
      {
        id: `tx-${Math.random().toString(36).substring(2, 10)}`,
        amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `tx-${Math.random().toString(36).substring(2, 10)}`,
        amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : undefined;
    
    return {
      id,
      amount,
      type,
      status,
      timestamp,
      reference: Math.random() > 0.5 ? `REF-${Math.floor(Math.random() * 1000000)}` : undefined,
      sender,
      recipient,
      flagged,
      notes,
      timeline,
      relatedTransactions
    };
  });
};

// Mock transactions data
const mockTransactions = generateMockTransactions(100);

// Transaction service with API endpoints
export const transactionService = {
  // Get transactions with filters
  getTransactions: async (filters: TransactionFilters) => {
    try {
      const response = await axios.get('/api/transactions', {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          status: filters.status,
          type: filters.type,
          userId: filters.userId,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'DESC'
        }
      });
      
      return {
        transactions: response.data.data.map((tx: any) => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          timestamp: tx.created_at,
          reference: tx.reference,
          sender: {
            userId: tx.sender_id || tx.user_id,
            name: tx.sender_name || 'Unknown',
            phone: tx.sender_phone || 'Unknown'
          },
          recipient: {
            userId: tx.recipient_id || '',
            name: tx.recipient_name || 'Unknown',
            phone: tx.recipient_phone || 'Unknown'
          },
          flagged: tx.flagged || false,
          timeline: [
            {
              timestamp: tx.created_at,
              status: tx.status,
              description: `Transaction ${tx.status}`
            }
          ]
        })),
        totalCount: response.data.pagination.total
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Fallback to mock data
      return {
        transactions: mockTransactions.slice(0, filters.limit || 10),
        totalCount: mockTransactions.length
      };
    }
  },
  
  // Get transaction details
  getTransactionDetails: async (transactionId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return { 
      transaction: {
        id: transactionId,
        amount: 0,
        type: 'wallet',
        status: 'completed',
        timestamp: new Date().toISOString(),
        sender: {
          name: 'Sender',
          phone: '+1234567890'
        },
        recipient: {
          name: 'Recipient',
          phone: '+1234567890'
        },
        flagged: false
      }
    };
  },
  
  // Flag a transaction
  flagTransaction: async (transactionId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true };
  },
  
  // Add a note to a transaction
  addTransactionNote: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true };
  },
  
  // Export transactions to CSV
  exportTransactions: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }
}; 