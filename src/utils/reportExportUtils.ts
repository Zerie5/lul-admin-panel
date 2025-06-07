import { 
  TransactionVolumeData,
  TransactionSuccessRateData,
  TransactionTypeDistributionData,
  AverageTransactionValueData,
  UserRegistrationData,
  ActiveUsersData,
  UserRetentionData,
  GeographicDistributionData,
  TransactionValueData,
  FeeRevenueData,
  TransactionCorridorData
} from '../types/reports';
import { convertToCSV, downloadCSV } from './exportUtils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper function to get current date string for filenames
const getDateString = () => format(new Date(), 'yyyy-MM-dd');

// Export transaction volume data to CSV
export const exportTransactionVolumeToCSV = (data: TransactionVolumeData[]) => {
  const headers = {
    date: 'Date',
    count: 'Transaction Count'
  };
  
  downloadCSV(data, headers, `transaction-volume-${getDateString()}.csv`);
};

// Export transaction success rate data to CSV
export const exportTransactionSuccessRateToCSV = (data: TransactionSuccessRateData[]) => {
  const headers = {
    date: 'Date',
    successRate: 'Success Rate (%)',
    failureRate: 'Failure Rate (%)'
  };
  
  downloadCSV(data, headers, `transaction-success-rate-${getDateString()}.csv`);
};

// Export transaction type distribution data to CSV
export const exportTransactionTypeDistributionToCSV = (data: TransactionTypeDistributionData[]) => {
  const headers = {
    type: 'Transaction Type',
    count: 'Count',
    percentage: 'Percentage (%)'
  };
  
  downloadCSV(data, headers, `transaction-type-distribution-${getDateString()}.csv`);
};

// Export average transaction value data to CSV
export const exportAverageTransactionValueToCSV = (data: AverageTransactionValueData[]) => {
  const headers = {
    date: 'Date',
    averageValue: 'Average Value'
  };
  
  downloadCSV(data, headers, `average-transaction-value-${getDateString()}.csv`);
};

// Export user registrations data to CSV
export const exportUserRegistrationsToCSV = (data: UserRegistrationData[]) => {
  const headers = {
    date: 'Date',
    count: 'New Registrations'
  };
  
  downloadCSV(data, headers, `user-registrations-${getDateString()}.csv`);
};

// Export active users data to CSV
export const exportActiveUsersToCSV = (data: ActiveUsersData[]) => {
  const headers = {
    date: 'Date',
    count: 'Active Users'
  };
  
  downloadCSV(data, headers, `active-users-${getDateString()}.csv`);
};

// Export user retention data to CSV
export const exportUserRetentionToCSV = (data: UserRetentionData[]) => {
  const headers = {
    cohort: 'Cohort',
    week1: 'Week 1 (%)',
    week2: 'Week 2 (%)',
    week3: 'Week 3 (%)',
    week4: 'Week 4 (%)'
  };
  
  downloadCSV(data, headers, `user-retention-${getDateString()}.csv`);
};

// Export geographic distribution data to CSV
export const exportGeographicDistributionToCSV = (data: GeographicDistributionData[]) => {
  const headers = {
    country: 'Country',
    count: 'User Count',
    percentage: 'Percentage (%)'
  };
  
  downloadCSV(data, headers, `geographic-distribution-${getDateString()}.csv`);
};

// Export transaction value data to CSV
export const exportTransactionValueToCSV = (data: TransactionValueData[]) => {
  const headers = {
    date: 'Date',
    value: 'Total Value'
  };
  
  downloadCSV(data, headers, `transaction-value-${getDateString()}.csv`);
};

// Export fee revenue data to CSV
export const exportFeeRevenueToCSV = (data: FeeRevenueData[]) => {
  const headers = {
    date: 'Date',
    revenue: 'Fee Revenue ($)',
    transactionCount: 'Transaction Count',
    averageFeePerTransaction: 'Average Fee per Transaction ($)',
    growthRate: 'Growth Rate (%)',
    totalTransactionVolume: 'Total Transaction Volume ($)',
    feeRatio: 'Fee Ratio (%)'
  };
  
  // Format data for export
  const formattedData = data.map(item => ({
    ...item,
    revenue: Number(item.revenue).toFixed(2),
    averageFeePerTransaction: Number(item.averageFeePerTransaction || 0).toFixed(2),
    growthRate: item.growthRate !== null ? Number(item.growthRate).toFixed(2) : 'N/A',
    totalTransactionVolume: Number(item.totalTransactionVolume || 0).toFixed(2),
    feeRatio: Number(item.feeRatio || 0).toFixed(2)
  }));
  
  downloadCSV(formattedData, headers, `fee-revenue-${getDateString()}.csv`);
};

// Export transaction corridors data to CSV
export const exportTransactionCorridorsToCSV = (data: TransactionCorridorData[]) => {
  const headers = {
    fromCountry: 'From Country',
    toCountry: 'To Country',
    corridor: 'Corridor',
    transactionCount: 'Transaction Count',
    totalValue: 'Total Value ($)',
    averageValue: 'Average Value ($)',
    transactionPercentage: 'Transaction %',
    valuePercentage: 'Value %'
  };
  
  // Format data for export
  const formattedData = data.map(item => ({
    ...item,
    totalValue: Number(item.totalValue).toFixed(2),
    averageValue: Number(item.averageValue).toFixed(2),
    transactionPercentage: Number(item.transactionPercentage).toFixed(2),
    valuePercentage: Number(item.valuePercentage).toFixed(2)
  }));
  
  downloadCSV(formattedData, headers, `transaction-corridors-${getDateString()}.csv`);
};

// Export data to Excel
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
  filename: string
) => {
  // Convert data to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => {
      const row: Record<string, any> = {};
      Object.keys(headers).forEach(key => {
        row[headers[key]] = item[key];
      });
      return row;
    })
  );
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export data to PDF
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
  title: string,
  filename: string
) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);
  
  // Prepare table data
  const tableColumn = Object.values(headers);
  const tableRows = data.map(item => Object.keys(headers).map(key => item[key]));
  
  // Add table to document
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200]
    },
    headStyles: {
      fillColor: [24, 133, 154],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Save PDF file
  doc.save(`${filename}.pdf`);
}; 