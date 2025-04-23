import { NonWalletTransfer } from '../types/nonWalletTransfer';

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Object mapping field names to display names
 * @returns CSV string
 */
export const convertToCSV = <T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>
): string => {
  if (data.length === 0) return '';

  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return Object.keys(headers)
      .map(key => {
        let value = item[key];
        
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma or newline
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = value.replace(/"/g, '""');
            return `"${value}"`;
          }
          return value;
        } else if (value instanceof Date) {
          return value.toISOString();
        } else if (typeof value === 'object') {
          // Convert objects to JSON strings
          const jsonStr = JSON.stringify(value);
          return `"${jsonStr.replace(/"/g, '""')}"`;
        }
        
        return String(value);
      })
      .join(',');
  });
  
  return [headerRow, ...rows].join('\n');
};

/**
 * Download data as a CSV file
 * @param data Data to download
 * @param headers Object mapping field names to display names
 * @param filename Filename for the downloaded file
 */
export const downloadCSV = <T extends Record<string, any>>(
  data: T[],
  headers: Record<string, string>,
  filename: string
): void => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports an array of transfers to a CSV file
 * @param transfers Array of transfers to export
 * @param filename Name of the file to download
 */
export const exportTransfersToCSV = (transfers: NonWalletTransfer[], filename: string = 'non-wallet-transfers.csv') => {
  // Define the headers
  const headers = [
    'ID',
    'Reference',
    'Sender Name',
    'Sender Phone',
    'Sender Email',
    'Sender Country',
    'Recipient Name',
    'Recipient Phone',
    'Recipient Email',
    'Recipient Country',
    'Recipient Bank',
    'Recipient Account Number',
    'Recipient Mobile Network',
    'Amount',
    'Fee',
    'Total Amount',
    'Currency',
    'Type',
    'Status',
    'Notes',
    'Created At',
    'Updated At',
    'Completed At'
  ];
  
  // Convert transfers to CSV rows
  const rows = transfers.map(transfer => [
    transfer.id,
    transfer.reference,
    transfer.senderName,
    transfer.senderPhone,
    transfer.senderEmail || '',
    transfer.senderCountry,
    transfer.recipientName,
    transfer.recipientPhone,
    transfer.recipientEmail || '',
    transfer.recipientCountry,
    transfer.recipientBank || '',
    transfer.recipientAccountNumber || '',
    transfer.recipientMobileNetwork || '',
    transfer.amount.toString(),
    transfer.fee.toString(),
    transfer.totalAmount.toString(),
    transfer.currency,
    transfer.type,
    transfer.status,
    transfer.notes || '',
    transfer.createdAt,
    transfer.updatedAt,
    transfer.completedAt || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 