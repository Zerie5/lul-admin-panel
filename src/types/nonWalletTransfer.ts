export enum NonWalletTransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NonWalletTransferType {
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CASH_PICKUP = 'CASH_PICKUP',
  DEPOSIT = 'DEPOSIT'
}

export enum DisbursementStage {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export interface NonWalletTransfer {
  id: string;
  amount: number;
  fee: number;
  totalAmount: number;
  currency: string;
  type: NonWalletTransferType;
  status: NonWalletTransferStatus;
  reference: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  senderCountry: string;
  senderAddress?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientCountry: string;
  recipientAddress?: string;
  recipientBank?: string;
  recipientAccountNumber?: string;
  recipientMobileNetwork?: string;
  notes?: string;
  description?: string;
  disbursementStage?: string;
  disbursementStageId?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  mobileDetails?: {
    mobileNetwork: string;
  };
}

export interface NonWalletTransferFilters {
  page: number;
  pageSize: number;
  searchTerm?: string;
  searchCategory?: string;
  status?: NonWalletTransferStatus;
  type?: NonWalletTransferType;
  statusFilter?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApiPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface NonWalletTransferResponse {
  transfers: NonWalletTransfer[];
  totalCount: number;
}

export interface NonWalletTransferCreateRequest {
  senderId: string;
  amount: number;
  currency: string;
  type: NonWalletTransferType;
  purpose?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientCountry: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branchCode?: string;
    swiftCode?: string;
  };
  mobileDetails?: {
    networkProvider: string;
    accountNumber?: string;
  };
}

export interface NonWalletTransferUpdateStatusRequest {
  status: NonWalletTransferStatus;
  notes?: string;
}

export interface NonWalletTransferEvent {
  id: string;
  transferId: string;
  status: NonWalletTransferStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  country: string;
}

export interface MobileNetwork {
  id: string;
  name: string;
  code: string;
  country: string;
} 