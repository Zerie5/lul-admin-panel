import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
// Import these separately to avoid linter errors
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';

import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoopIcon from '@mui/icons-material/Loop';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import SmsIcon from '@mui/icons-material/Sms';
import MoneyIcon from '@mui/icons-material/Money';
import PaymentsIcon from '@mui/icons-material/Payments';
import DoneIcon from '@mui/icons-material/Done';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useNonWalletTransfer } from '../hooks/useNonWalletTransfers';
import { NonWalletTransferStatus, NonWalletTransferType } from '../types/nonWalletTransfer';
import { useSendSmsNotification, useUpdateNonWalletTransferStatus } from '../hooks/useNonWalletTransferQueries';

// Status colors
const statusColors = {
  [NonWalletTransferStatus.PENDING]: '#ff9800',
  [NonWalletTransferStatus.PROCESSING]: '#2196f3',
  [NonWalletTransferStatus.COMPLETED]: '#4caf50',
  [NonWalletTransferStatus.FAILED]: '#f44336',
  [NonWalletTransferStatus.CANCELLED]: '#9e9e9e'
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
  try {
    // Map any invalid currency codes to valid ones
    const currencyMap: Record<string, string> = {
      'EURO': 'EUR',
      // Add other mappings as needed
    };
    
    // Use the mapped currency code if available, otherwise use the original
    const validCurrency = currencyMap[currency] || currency;
    
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
      currency: validCurrency
  }).format(amount);
  } catch (error) {
    // Fallback if the currency is invalid
    console.warn(`Invalid currency code: ${currency}`, error);
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

interface TransferDetailsModalProps {
  open: boolean;
  onClose: (success?: boolean, updateType?: string) => void;
  transferId: string;
}

const TransferDetailsModal = ({ open, onClose, transferId }: TransferDetailsModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<NonWalletTransferStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusError, setStatusError] = useState('');
  const [paymentStatusId, setPaymentStatusId] = useState<number>(1); // Default to PENDING (1)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessDialog, setPaymentSuccessDialog] = useState(false);
  
  // Add states for disbursement status update
  const [disbursementChangeOpen, setDisbursementChangeOpen] = useState(false);
  const [newDisbursementStageId, setNewDisbursementStageId] = useState<number | ''>('');
  const [lastUpdatedStageId, setLastUpdatedStageId] = useState<number | null>(null);
  const [disbursementNote, setDisbursementNote] = useState('');
  const [updateCompletedAt, setUpdateCompletedAt] = useState(true);
  const [disbursementError, setDisbursementError] = useState('');
  const [showDisbursementSuccess, setShowDisbursementSuccess] = useState(false);
  
  // Add state for success dialog
  const [disbursementSuccessDialog, setDisbursementSuccessDialog] = useState(false);
  
  const { 
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
    refetch 
  } = useNonWalletTransfer(transferId);
  
  // Add state for SMS notification
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSuccess, setSmsSuccess] = useState(false);
  
  // Use the hooks for sending SMS and updating status
  const sendSmsNotification = useSendSmsNotification(transferId);
  const updateTransferStatus = useUpdateNonWalletTransferStatus(transferId);
  
  // Handle tab change
  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle status change dialog open
  const handleStatusChangeOpen = () => {
    setStatusChangeOpen(true);
    
    // Set initial payment status ID based on current transfer status
    if (transfer) {
      setPaymentStatusId(getPaymentStatusIdFromStatus(transfer.status));
    } else {
      setPaymentStatusId(1); // Default to PENDING
    }
    
    setStatusNote('');
    setStatusError('');
  };
  
  // Handle status change dialog close
  const handleStatusChangeClose = () => {
    setStatusChangeOpen(false);
  };
  
  // Update the status change handler to use the new payment status update API
  const handleStatusChange = async () => {
    if (!paymentStatusId) {
      setStatusError('Please select a status');
      return;
    }
    
    try {
      // Use the new payment status update endpoint
      const result = await updatePaymentStatus(
        paymentStatusId,
        statusNote,
        1 // Admin ID, you may want to get this from user context or state
      );
      
      if (result) {
      handleStatusChangeClose();
        
        // Show success dialog for user feedback
        setPaymentSuccessDialog(true);
        
        // Show in-page success message
        setShowPaymentSuccess(true);
        
        // Hide success message after a delay
        setTimeout(() => {
          setShowPaymentSuccess(false);
        }, 3000);
        
        // Automatically close success dialog after 2 seconds
        setTimeout(() => {
          setPaymentSuccessDialog(false);
          onClose(true, 'payment');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      
      // Set more descriptive error messages based on the error
      if (err.message && err.message.includes('Authentication token not found')) {
        setStatusError('Authentication error: Please log in again to update the payment status');
      } else if (err.message && err.message.includes('Access Denied')) {
        setStatusError('Authorization error: You do not have permission to update payment status');
      } else if (err.message && err.message.includes('403')) {
        setStatusError('Forbidden: Admin privileges required for this operation');
      } else {
        setStatusError(err.message || 'Failed to update payment status');
      }
    }
  };
  
  // Handle disbursement status change dialog open
  const handleDisbursementChangeOpen = () => {
    setDisbursementChangeOpen(true);
    setNewDisbursementStageId('');
    setDisbursementNote('');
    setDisbursementError('');
    setUpdateCompletedAt(true);
  };
  
  // Handle disbursement status change dialog close
  const handleDisbursementChangeClose = () => {
    setDisbursementChangeOpen(false);
  };
  
  // Handle disbursement status change
  const handleDisbursementChange = async () => {
    if (!newDisbursementStageId) {
      setDisbursementError('Please select a disbursement stage');
      return;
    }
    
    try {
      await updateDisbursementStatus(
        Number(newDisbursementStageId), 
        updateCompletedAt, 
        disbursementNote
      );
      
      // Save the last updated stage ID
      setLastUpdatedStageId(Number(newDisbursementStageId));
      
      handleDisbursementChangeClose();
      
      // Show success dialog instead of just an alert
      setDisbursementSuccessDialog(true);
      
      // Also show the in-page success message
      setShowDisbursementSuccess(true);
      
      // Hide success message after a delay
      setTimeout(() => {
        setShowDisbursementSuccess(false);
      }, 3000);
      
      // Automatically close success dialog after 2 seconds
      setTimeout(() => {
        setDisbursementSuccessDialog(false);
        
        // Call onClose with success=true to trigger reload and notification
        onClose(true, 'disbursement');
      }, 2000);
    } catch (err) {
      console.error('Error updating disbursement status:', err);
      setDisbursementError('Failed to update disbursement status');
    }
  };
  
  // Handle sending SMS notification
  const handleSendSms = async () => {
    if (!smsMessage.trim()) {
      setSmsError('Message cannot be empty');
      return;
    }
    
    setSendingSms(true);
    setSmsError(null);
    
    try {
      await sendSmsNotification.mutate(smsMessage);
      setSmsSuccess(true);
      
      // Close the dialog after success
      setTimeout(() => {
        setSmsDialogOpen(false);
        setSmsSuccess(false);
        setSmsMessage('');
      }, 1500);
    } catch (error) {
      setSmsError('Failed to send SMS notification');
      console.error('Error sending SMS:', error);
    } finally {
      setSendingSms(false);
    }
  };
  
  // Handle opening SMS dialog
  const handleOpenSmsDialog = () => {
    if (!transfer) return;
    
    // Default message template based on transfer status
    const recipientName = transfer.recipientName.split(' ')[0]; // Get first name
    const amount = `${transfer.currency} ${transfer.amount.toFixed(2)}`;
    
    let defaultMessage = '';
    switch (transfer.status) {
      case NonWalletTransferStatus.COMPLETED:
        defaultMessage = `Hello ${recipientName}, your transfer of ${amount} is now available for collection. Reference: ${transfer.id}. Thank you for using LulPay.`;
        break;
      case NonWalletTransferStatus.PROCESSING:
        defaultMessage = `Hello ${recipientName}, your transfer of ${amount} is being processed. We will notify you once it's ready for collection. Reference: ${transfer.id}.`;
        break;
      case NonWalletTransferStatus.FAILED:
        defaultMessage = `Hello ${recipientName}, we regret to inform you that your transfer of ${amount} has failed. Please contact support for assistance. Reference: ${transfer.id}.`;
        break;
      default:
        defaultMessage = `Hello ${recipientName}, this is an update regarding your transfer of ${amount}. Reference: ${transfer.id}. Thank you for using LulPay.`;
    }
    
    setSmsMessage(defaultMessage);
    setSmsDialogOpen(true);
  };
  
  // Handle cancelling a transfer
  const handleCancelTransfer = async () => {
    if (!transfer || transfer.status !== NonWalletTransferStatus.PENDING) return;
    
    try {
      await updateTransferStatus.mutate({
        status: NonWalletTransferStatus.CANCELLED,
        notes: 'Cancelled by administrator'
      });
      
      onClose(true);
    } catch (error) {
      console.error('Error cancelling transfer:', error);
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: NonWalletTransferStatus) => {
    switch (status) {
      case NonWalletTransferStatus.COMPLETED:
        return <CheckCircleOutlineIcon sx={{ color: statusColors[status] }} />;
      case NonWalletTransferStatus.PENDING:
        return <AccessTimeIcon sx={{ color: statusColors[status] }} />;
      case NonWalletTransferStatus.PROCESSING:
        return <LoopIcon sx={{ color: statusColors[status] }} />;
      case NonWalletTransferStatus.FAILED:
        return <ErrorOutlineIcon sx={{ color: statusColors[status] }} />;
      case NonWalletTransferStatus.CANCELLED:
        return <CancelIcon sx={{ color: statusColors[status] }} />;
    }
  };
  
  // Render status chip
  const renderStatusChip = (status: NonWalletTransferStatus) => {
    const color = statusColors[status];
    
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
      />
    );
  };
  
  // Get disbursement status label
  const getDisbursementStageLabel = (stageId: number | undefined) => {
    if (!stageId) return 'Unknown';
    
    switch (stageId) {
      case 1:
        return 'Pending';
      case 2:
        return 'Processing';
      case 3:
        return 'Completed';
      default:
        return `Stage ${stageId}`;
    }
  };
  
  // Render disbursement status chip
  const renderDisbursementChip = (stageId: number | undefined) => {
    if (!stageId) return null;
    
    let color;
    let icon;
    
    switch (stageId) {
      case 1:
        color = statusColors[NonWalletTransferStatus.PENDING];
        icon = <HourglassTopIcon sx={{ color }} />;
        break;
      case 2:
        color = statusColors[NonWalletTransferStatus.PROCESSING];
        icon = <LoopIcon sx={{ color }} />;
        break;
      case 3:
        color = statusColors[NonWalletTransferStatus.COMPLETED];
        icon = <CheckCircleOutlineIcon sx={{ color }} />;
        break;
      default:
        color = '#9e9e9e';
        icon = <InfoIcon sx={{ color }} />;
    }
    
    return (
      <Chip
        icon={icon}
        label={getDisbursementStageLabel(stageId)}
        sx={{
          backgroundColor: `${color}20`,
          color,
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
      />
    );
  };
  
  // Map from NonWalletTransferStatus enum to payment status ID
  const getPaymentStatusIdFromStatus = (status: NonWalletTransferStatus): number => {
    switch (status) {
      case NonWalletTransferStatus.COMPLETED:
        return 2; // COMPLETED
      case NonWalletTransferStatus.FAILED:
        return 3; // FAILED
      case NonWalletTransferStatus.CANCELLED:
        return 4; // REVERSED
      case NonWalletTransferStatus.PENDING:
      case NonWalletTransferStatus.PROCESSING:
      default:
        return 1; // PENDING
    }
  };

  // Map from payment status ID to NonWalletTransferStatus enum
  const getStatusFromPaymentStatusId = (statusId: number): NonWalletTransferStatus => {
    switch (statusId) {
      case 2:
        return NonWalletTransferStatus.COMPLETED;
      case 3:
        return NonWalletTransferStatus.FAILED;
      case 4:
        return NonWalletTransferStatus.CANCELLED;
      case 1:
      default:
        return NonWalletTransferStatus.PENDING;
    }
  };
  
  // Render transfer details tab
  const renderDetailsTab = () => {
    if (!transfer) return null;
    
    return (
      <Grid container spacing={2}>
        {/* Show success animation for payment status update */}
        <Collapse in={showPaymentSuccess} sx={{ width: '100%' }}>
          <Alert 
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ 
              mb: 2, 
              width: '100%',
              animation: 'fadeInDown 0.5s',
              '@keyframes fadeInDown': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: '#4caf50',
                fontSize: '1.5rem'
              },
              py: 1.5
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Payment Status Updated Successfully!
              </Typography>
              <Typography variant="body2">
                The transaction has been {paymentStatusId === 2 ? 'marked as completed' : 
                  paymentStatusId === 3 ? 'marked as failed' : 
                  paymentStatusId === 4 ? 'reversed' : 'updated'}
              </Typography>
            </Box>
          </Alert>
        </Collapse>
        
        {/* Show success animation for disbursement status update */}
        <Collapse in={showDisbursementSuccess} sx={{ width: '100%' }}>
          <Alert 
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ 
              mb: 2, 
              width: '100%',
              animation: 'fadeInDown 0.5s',
              '@keyframes fadeInDown': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: '#4caf50',
                fontSize: '1.5rem'
              },
              py: 1.5
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Disbursement Status Updated Successfully!
              </Typography>
              <Typography variant="body2">
                The transaction has been {lastUpdatedStageId === 3 ? 'marked as completed' : 'moved to processing'}
              </Typography>
            </Box>
          </Alert>
        </Collapse>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Transfer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Transfer ID:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{transfer.id}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Amount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(transfer.amount, transfer.currency)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fee:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {formatCurrency(transfer.fee, transfer.currency)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(transfer.amount + transfer.fee, transfer.currency)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Type:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {transfer.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
              </Grid>
              <Grid item xs={6}>
                {renderStatusChip(transfer.status)}
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Created:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{formatDate(transfer.createdAt)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{formatDate(transfer.updatedAt)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Sender Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Name:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{transfer.senderName}</Typography>
              </Grid>
              
              {transfer.senderCountry && (
                <>
              <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Country:</Typography>
              </Grid>
              <Grid item xs={6}>
                    <Typography variant="body2">{transfer.senderCountry}</Typography>
              </Grid>
                </>
              )}
              
              {transfer.senderPhone && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{transfer.senderPhone}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Recipient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Name:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{transfer.recipientName}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Phone:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{transfer.recipientPhone}</Typography>
              </Grid>
              
              {transfer.recipientEmail && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{transfer.recipientEmail}</Typography>
                  </Grid>
                </>
              )}
              
              {transfer.recipientCountry && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Country:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{transfer.recipientCountry}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Additional details based on transfer type */}
        {transfer.type === NonWalletTransferType.BANK_TRANSFER && transfer.bankDetails && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bank Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Bank Name:</Typography>
                  <Typography variant="body1">{transfer.bankDetails.bankName}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Account Number:</Typography>
                  <Typography variant="body1">{transfer.bankDetails.accountNumber}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Routing Number:</Typography>
                  <Typography variant="body1">{transfer.bankDetails.routingNumber}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {transfer.type === NonWalletTransferType.MOBILE_MONEY && transfer.mobileDetails && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mobile Money Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Mobile Network:</Typography>
                  <Typography variant="body1">{transfer.mobileDetails.mobileNetwork}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {(transfer.notes || transfer.description) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {transfer.notes && (
                <Typography variant="body2" paragraph>{transfer.notes}</Typography>
              )}
              {transfer.description && (
                <>
                  {transfer.notes && <Divider sx={{ my: 1 }} />}
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                    Description:
                  </Typography>
                  <Typography variant="body2">{transfer.description}</Typography>
                </>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Add Recipient ID Document section if available */}
        {(transfer.recipientIdDocumentType || transfer.recipientIdNumber) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recipient Identification
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {transfer.recipientIdDocumentType && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Document Type:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {transfer.recipientIdDocumentType}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {transfer.recipientIdNumber && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Document Number:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {transfer.recipientIdNumber}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {transfer.recipientRelationship && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Relationship to Sender:</Typography>
                      <Chip 
                        label={transfer.recipientRelationship.charAt(0) + transfer.recipientRelationship.slice(1).toLowerCase()}
                        sx={{ 
                          mt: 0.5,
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          color: 'primary.main',
                          fontWeight: 'medium'
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* Add disbursement status section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Payment & Disbursement Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Payment Status:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: `${statusColors[transfer.status]}20`,
                        color: statusColors[transfer.status],
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        py: 0.75,
                        px: 1.5,
                        height: 32
                      }}
                    >
                      {transfer.status === NonWalletTransferStatus.PENDING && (
                        <AccessTimeIcon sx={{ mr: 0.75, fontSize: 18 }} />
                      )}
                      {transfer.status === NonWalletTransferStatus.PROCESSING && (
                        <LoopIcon sx={{ mr: 0.75, fontSize: 18 }} />
                      )}
                      {transfer.status === NonWalletTransferStatus.COMPLETED && (
                        <CheckCircleOutlineIcon sx={{ mr: 0.75, fontSize: 18 }} />
                      )}
                      {transfer.status === NonWalletTransferStatus.FAILED && (
                        <ErrorOutlineIcon sx={{ mr: 0.75, fontSize: 18 }} />
                      )}
                      {transfer.status === NonWalletTransferStatus.CANCELLED && (
                        <CancelIcon sx={{ mr: 0.75, fontSize: 18 }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {transfer.status}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Disbursement Status:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {transfer.disbursementStage ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: `${
                            transfer.disbursementStage === 'Completed' || transfer.disbursementStage === 'PROCESSED'
                              ? statusColors[NonWalletTransferStatus.COMPLETED]
                              : transfer.disbursementStage === 'Processing' || transfer.disbursementStage === 'PROCESSING'
                              ? statusColors[NonWalletTransferStatus.PROCESSING]
                              : statusColors[NonWalletTransferStatus.PENDING]
                          }20`,
                          color: transfer.disbursementStage === 'Completed' || transfer.disbursementStage === 'PROCESSED'
                            ? statusColors[NonWalletTransferStatus.COMPLETED]
                            : transfer.disbursementStage === 'Processing' || transfer.disbursementStage === 'PROCESSING'
                            ? statusColors[NonWalletTransferStatus.PROCESSING]
                            : statusColors[NonWalletTransferStatus.PENDING],
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          py: 0.75,
                          px: 1.5,
                          height: 32
                        }}
                      >
                        {(transfer.disbursementStage === 'Processing' || transfer.disbursementStage === 'PROCESSING') && (
                          <LoopIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {(transfer.disbursementStage === 'Completed' || transfer.disbursementStage === 'PROCESSED') && (
                          <CheckCircleOutlineIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {(transfer.disbursementStage === 'Pending' || transfer.disbursementStage === 'RECEIVED') && (
                          <AccessTimeIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {transfer.disbursementStage}
                        </Typography>
                      </Box>
                    ) : transfer.disbursementStageId ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: `${
                            transfer.disbursementStageId === 3
                              ? statusColors[NonWalletTransferStatus.COMPLETED]
                              : transfer.disbursementStageId === 2
                              ? statusColors[NonWalletTransferStatus.PROCESSING]
                              : statusColors[NonWalletTransferStatus.PENDING]
                          }20`,
                          color: transfer.disbursementStageId === 3
                            ? statusColors[NonWalletTransferStatus.COMPLETED]
                            : transfer.disbursementStageId === 2
                            ? statusColors[NonWalletTransferStatus.PROCESSING]
                            : statusColors[NonWalletTransferStatus.PENDING],
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          py: 0.75,
                          px: 1.5,
                          height: 32
                        }}
                      >
                        {transfer.disbursementStageId === 2 && (
                          <LoopIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {transfer.disbursementStageId === 3 && (
                          <CheckCircleOutlineIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {transfer.disbursementStageId === 1 && (
                          <AccessTimeIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {getDisbursementStageLabel(transfer.disbursementStageId)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: `${
                            transfer.status === NonWalletTransferStatus.COMPLETED
                              ? statusColors[NonWalletTransferStatus.COMPLETED]
                              : transfer.status === NonWalletTransferStatus.PROCESSING
                              ? statusColors[NonWalletTransferStatus.PROCESSING]
                              : statusColors[NonWalletTransferStatus.PENDING]
                          }20`,
                          color: transfer.status === NonWalletTransferStatus.COMPLETED
                            ? statusColors[NonWalletTransferStatus.COMPLETED]
                            : transfer.status === NonWalletTransferStatus.PROCESSING
                            ? statusColors[NonWalletTransferStatus.PROCESSING]
                            : statusColors[NonWalletTransferStatus.PENDING],
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          py: 0.75,
                          px: 1.5,
                          height: 32
                        }}
                      >
                        {transfer.status === NonWalletTransferStatus.PROCESSING && (
                          <LoopIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {transfer.status === NonWalletTransferStatus.COMPLETED && (
                          <CheckCircleOutlineIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        {transfer.status === NonWalletTransferStatus.PENDING && (
                          <AccessTimeIcon sx={{ mr: 0.75, fontSize: 18 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {transfer.status === NonWalletTransferStatus.COMPLETED ? 'Completed' : 
                           transfer.status === NonWalletTransferStatus.PROCESSING ? 'Processing' : 'Pending'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Render timeline tab
  const renderTimelineTab = () => {
    if (!transfer) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No transfer data available</Typography>
        </Box>
      );
    }
    
    // Generate timeline events based on available dates
    const timelineEvents = [];
    
    // Always add the first event for transaction initiated
    if (transfer.createdAt) {
      timelineEvents.push({
        id: 'created',
        status: NonWalletTransferStatus.PENDING,
        title: 'Transaction Initiated',
        date: transfer.createdAt,
        notes: 'Transaction has been initiated'
      });
    }
    
    // Add payment completed event if completedAt exists
    if (transfer.completedAt) {
      timelineEvents.push({
        id: 'completed',
        status: NonWalletTransferStatus.COMPLETED,
        title: 'Payment Completed',
        date: transfer.completedAt,
        notes: 'Payment has been completed successfully'
      });
    }
    
    // Add disbursement completed event if disbursementCompleted exists
    if (transfer.disbursmentCompleted) {
      timelineEvents.push({
        id: 'disbursed',
        status: NonWalletTransferStatus.COMPLETED,
        title: 'Disbursement Completed',
        date: transfer.disbursmentCompleted,
        notes: 'Funds have been disbursed to recipient'
      });
    }
    
    if (timelineEvents.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No timeline events available for this transfer</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        {timelineEvents.map((event, index) => (
          <Box
            key={event.id}
            sx={{
              position: 'relative',
              pb: index === timelineEvents.length - 1 ? 0 : 3,
              pl: 4
            }}
          >
            {index !== timelineEvents.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: 24,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'divider'
                }}
              />
            )}
            
            <Box
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: event.id === 'created' ? statusColors[NonWalletTransferStatus.PENDING] :
                        event.id === 'completed' ? statusColors[NonWalletTransferStatus.PROCESSING] :
                        statusColors[NonWalletTransferStatus.COMPLETED],
                border: '2px solid',
                borderColor: 'background.paper'
              }}
            />
            
            <Paper
              sx={{
                p: 2,
                mb: 1
              }}
            >
              <Typography variant="subtitle2">
                {`Status: ${event.title}`}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDate(event.date)}
              </Typography>
              
              {event.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.notes}
                </Typography>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    );
  };
  
  // If there's an error loading the transfer, show error message
  if (error) {
    return (
      <Dialog
        open={open}
        onClose={() => onClose()}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Transfer Details
          <IconButton
            aria-label="close"
            onClick={() => onClose()}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Error Loading Transfer Details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {error.message || 'Failed to load transfer details. This may be due to an invalid transfer ID or a network issue.'}
            </Typography>
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Transfer ID:</strong> {transferId}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please check that this ID is correct. If the problem persists, contact technical support.
              </Typography>
            </Alert>
            <Button 
              variant="contained" 
              onClick={refetch}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Try Again'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Transfer Details
          </Typography>
          <IconButton onClick={() => onClose()} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">Error: {error.message}</Typography>
          </Box>
        ) : !transfer ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Transfer not found</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="transfer details tabs"
                sx={{ px: 2 }}
              >
                <Tab icon={<InfoIcon />} label="Details" />
                <Tab icon={<TimelineIcon />} label="Timeline" />
              </Tabs>
            </Box>
            
            <Box sx={{ p: 3 }}>
              {tabValue === 0 ? renderDetailsTab() : renderTimelineTab()}
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SmsIcon />}
                onClick={handleOpenSmsDialog}
                disabled={!transfer || transfer.status === NonWalletTransferStatus.PENDING}
              >
                Send SMS Notification
              </Button>
              
              <Box>
                {transfer && transfer.status === NonWalletTransferStatus.PENDING && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelTransfer}
                    sx={{ mr: 1 }}
                  >
                    Cancel Transfer
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<MoneyIcon />}
                  onClick={handleDisbursementChangeOpen}
                  disabled={!transfer || transfer.status === NonWalletTransferStatus.CANCELLED}
                  sx={{ mr: 1 }}
                >
                  Update Disbursement
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PaymentsIcon />}
                  onClick={handleStatusChangeOpen}
                  disabled={!transfer || 
                            transfer.status === NonWalletTransferStatus.COMPLETED || 
                            transfer.status === NonWalletTransferStatus.CANCELLED}
                >
                  Update Status
                </Button>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      
      {/* Status Change Dialog */}
      <Dialog
        open={statusChangeOpen}
        onClose={handleStatusChangeClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!statusError} sx={{ mb: 2 }}>
              <InputLabel id="payment-status-select-label">New Payment Status</InputLabel>
              <Select
                labelId="payment-status-select-label"
                value={paymentStatusId}
                onChange={(e) => setPaymentStatusId(e.target.value as number)}
                label="New Payment Status"
              >
                <MenuItem value={1}>PENDING</MenuItem>
                <MenuItem value={2}>COMPLETED</MenuItem>
                <MenuItem value={3}>FAILED</MenuItem>
                <MenuItem value={4}>REVERSED</MenuItem>
              </Select>
              {statusError && <FormHelperText>{statusError}</FormHelperText>}
            </FormControl>
            
            <TextField
              fullWidth
              label="Status Change Note"
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note explaining the reason for this status change"
            />
          </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={handleStatusChangeClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStatusChange}
            disabled={paymentStatusUpdateLoading}
            startIcon={paymentStatusUpdateLoading ? <CircularProgress size={20} /> : null}
          >
            {paymentStatusUpdateLoading ? 'Updating...' : 'Update Payment Status'}
          </Button>
        </Box>
      </Dialog>
      
      {/* Disbursement Status Change Dialog */}
      <Dialog
        open={disbursementChangeOpen}
        onClose={handleDisbursementChangeClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Disbursement Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!disbursementError} sx={{ mb: 2 }}>
              <InputLabel id="disbursement-stage-select-label">Disbursement Stage</InputLabel>
              <Select
                labelId="disbursement-stage-select-label"
                value={newDisbursementStageId}
                onChange={(e) => setNewDisbursementStageId(e.target.value as number)}
                label="Disbursement Stage"
              >
                <MenuItem value={2}>Processing</MenuItem>
                <MenuItem value={3}>Completed</MenuItem>
              </Select>
              {disbursementError && <FormHelperText>{disbursementError}</FormHelperText>}
            </FormControl>
            
            {newDisbursementStageId === 3 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="update-completed-at-label">Update Completed Time</InputLabel>
                <Select
                  labelId="update-completed-at-label"
                  value={updateCompletedAt}
                  onChange={(e) => setUpdateCompletedAt(e.target.value === 'true')}
                  label="Update Completed Time"
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
                <FormHelperText>
                  Setting this to 'Yes' will update the completion timestamp
                </FormHelperText>
              </FormControl>
            )}
            
            <TextField
              fullWidth
              label="Status Change Note"
              multiline
              rows={3}
              value={disbursementNote}
              onChange={(e) => setDisbursementNote(e.target.value)}
              placeholder="Add a note explaining this disbursement status change"
            />
          </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={handleDisbursementChangeClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDisbursementChange}
            disabled={disbursementUpdateLoading}
            startIcon={disbursementUpdateLoading ? <CircularProgress size={20} /> : <DoneIcon />}
          >
            {disbursementUpdateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </Box>
      </Dialog>
      
      {/* SMS Dialog */}
      <Dialog
        open={smsDialogOpen}
        onClose={() => setSmsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send SMS Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Enter message to send to recipient"
              variant="outlined"
              error={!!smsError}
              helperText={smsError || `${smsMessage.length} characters`}
              sx={{ mb: 2 }}
            />
            
            {smsSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                SMS notification sent successfully!
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsDialogOpen(false)} disabled={sendingSms}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendSms}
            disabled={sendingSms || smsSuccess}
          >
            {sendingSms ? <CircularProgress size={24} /> : 'Send SMS'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={disbursementSuccessDialog}
        PaperProps={{
          sx: { 
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden' 
          }
        }}
      >
        <Fade in={disbursementSuccessDialog}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              maxWidth: 350
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  mb: 2,
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(0.95)',
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)'
                    },
                    '70%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 15px rgba(76, 175, 80, 0)'
                    },
                    '100%': {
                      transform: 'scale(0.95)',
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
                    }
                  }
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 50 }} />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Success!
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                Disbursement status has been updated successfully.
              </Typography>
              
              <Chip
                icon={lastUpdatedStageId === 3 ? <CheckCircleOutlineIcon /> : <LoopIcon />}
                label={lastUpdatedStageId === 3 ? 'Completed' : 'Processing'}
                sx={{
                  backgroundColor: `${lastUpdatedStageId === 3 ? statusColors[NonWalletTransferStatus.COMPLETED] : statusColors[NonWalletTransferStatus.PROCESSING]}20`,
                  color: lastUpdatedStageId === 3 ? statusColors[NonWalletTransferStatus.COMPLETED] : statusColors[NonWalletTransferStatus.PROCESSING],
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  py: 0.5,
                  px: 1
                }}
              />
            </Box>
          </Paper>
        </Fade>
      </Dialog>
      
      {/* Add Payment Success Dialog */}
      <Dialog
        open={paymentSuccessDialog}
        PaperProps={{
          sx: { 
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden' 
          }
        }}
      >
        <Fade in={paymentSuccessDialog}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              maxWidth: 350
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  mb: 2,
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(0.95)',
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)'
                    },
                    '70%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 15px rgba(76, 175, 80, 0)'
                    },
                    '100%': {
                      transform: 'scale(0.95)',
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
                    }
                  }
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 50 }} />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Success!
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                Payment status has been updated successfully.
              </Typography>
              
              <Chip
                icon={paymentStatusId === 2 ? <CheckCircleOutlineIcon /> : 
                     paymentStatusId === 3 ? <ErrorOutlineIcon /> : 
                     paymentStatusId === 4 ? <CancelIcon /> : <AccessTimeIcon />}
                label={paymentStatusId === 2 ? 'Completed' : 
                      paymentStatusId === 3 ? 'Failed' : 
                      paymentStatusId === 4 ? 'Reversed' : 'Pending'}
                sx={{
                  backgroundColor: paymentStatusId === 2 ? `${statusColors[NonWalletTransferStatus.COMPLETED]}20` :
                                   paymentStatusId === 3 ? `${statusColors[NonWalletTransferStatus.FAILED]}20` : 
                                   paymentStatusId === 4 ? `${statusColors[NonWalletTransferStatus.CANCELLED]}20` : 
                                   `${statusColors[NonWalletTransferStatus.PENDING]}20`,
                  color: paymentStatusId === 2 ? statusColors[NonWalletTransferStatus.COMPLETED] :
                         paymentStatusId === 3 ? statusColors[NonWalletTransferStatus.FAILED] : 
                         paymentStatusId === 4 ? statusColors[NonWalletTransferStatus.CANCELLED] : 
                         statusColors[NonWalletTransferStatus.PENDING],
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  py: 0.5,
                  px: 1
                }}
              />
            </Box>
          </Paper>
        </Fade>
      </Dialog>
    </Dialog>
  );
};

export default TransferDetailsModal; 