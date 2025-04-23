export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phoneNumber: string;
  status: UserStatus;
  registrationDate: string;
  lastLogin: string;
  walletBalance?: number;
  walletId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface UserTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  timestamp: string;
  description?: string;
}

export interface UserLoginHistory {
  id: number;
  timestamp: string;
  ipAddress: string;
  device: string;
  location?: string;
  status: 'success' | 'failed';
}

export interface UserFilters {
  search?: string;
  status?: UserStatus | null;
  role?: UserRole | null;
  startDate?: string | null;
  endDate?: string | null;
  page: number;
  limit: number;
}

export interface UsersResponse {
  users: User[];
  totalCount: number;
} 