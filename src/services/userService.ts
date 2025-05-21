import axios from 'axios';
import { User, UserFilters, UsersResponse, UserTransaction, UserLoginHistory, UserStatus, UserRole } from '../types/user';
import { API_URL } from '../config';

const USERS_ENDPOINT = `${API_URL}/users`;

// Set up axios interceptor for authentication
axios.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Helper function to handle axios responses
const handleResponse = async <T>(promise: Promise<any>): Promise<T> => {
  const response = await promise;
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  return handleResponse<User>(axios.get(`${USERS_ENDPOINT}/me`));
};

export const updateUser = async (userId: number, userData: Partial<User>): Promise<User> => {
  return handleResponse<User>(axios.put(`${USERS_ENDPOINT}/${userId}`, userData));
};

export const getAllUsers = async (): Promise<User[]> => {
  return handleResponse<User[]>(axios.get(USERS_ENDPOINT));
};

export const getFilteredUsers = async (filters: UserFilters): Promise<UsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.role) queryParams.append('role', filters.role);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  
  queryParams.append('page', filters.page.toString());
  queryParams.append('limit', filters.limit.toString());
  
  return handleResponse<UsersResponse>(axios.get(`${USERS_ENDPOINT}?${queryParams.toString()}`));
};

export const getUserById = async (userId: number): Promise<User> => {
  return handleResponse<User>(axios.get(`${USERS_ENDPOINT}/${userId}`));
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  return handleResponse<User>(axios.post(USERS_ENDPOINT, userData));
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axios.delete(`${USERS_ENDPOINT}/${userId}`);
};

export const updateUserStatus = async (userId: number, status: UserStatus): Promise<User> => {
  return handleResponse<User>(axios.put(`${USERS_ENDPOINT}/${userId}/status`, { status }));
};

export const getUserTransactions = async (userId: number): Promise<UserTransaction[]> => {
  return handleResponse<UserTransaction[]>(axios.get(`${USERS_ENDPOINT}/${userId}/transactions`));
};

export const getUserLoginHistory = async (userId: number): Promise<UserLoginHistory[]> => {
  return handleResponse<UserLoginHistory[]>(axios.get(`${USERS_ENDPOINT}/${userId}/login-history`));
};

// Mock data generator for development
export const generateMockUsers = (count: number): User[] => {
  const statuses = Object.values(UserStatus);
  const roles = Object.values(UserRole);
  
  return Array.from({ length: count }).map((_, index) => ({
    id: index + 1,
    username: `user${index + 1}`,
    email: `user${index + 1}@example.com`,
    firstName: `First${index + 1}`,
    lastName: `Last${index + 1}`,
    phoneNumber: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    walletBalance: Math.floor(Math.random() * 10000) / 100,
    walletId: `wallet-${Math.random().toString(36).substring(2, 10)}`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
  }));
};

export const generateMockTransactions = (userId: number, count: number): UserTransaction[] => {
  const types = ['deposit', 'withdrawal', 'transfer', 'payment'];
  const statuses = ['completed', 'pending', 'failed'];
  
  return Array.from({ length: count }).map((_, index) => ({
    id: `tx-${Math.random().toString(36).substring(2, 10)}-${index}`,
    amount: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
    description: Math.random() > 0.3 ? `Transaction ${index + 1} description` : undefined
  }));
};

export const generateMockLoginHistory = (userId: number, count: number): UserLoginHistory[] => {
  const devices = ['iPhone', 'Android', 'Chrome on Windows', 'Safari on Mac', 'Firefox on Linux'];
  const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia', 'Berlin, Germany'];
  
  return Array.from({ length: count }).map((_, index) => ({
    id: index + 1,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
    ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    device: devices[Math.floor(Math.random() * devices.length)],
    location: Math.random() > 0.2 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
    status: Math.random() > 0.1 ? 'success' : 'failed'
  }));
}; 