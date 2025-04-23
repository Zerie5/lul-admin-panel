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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
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
  onClose: (success?: boolean) => void;
  transferId: string;
}

const TransferDetailsModal = ({ open, onClose, transferId }: TransferDetailsModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<NonWalletTransferStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusError, setStatusError] = useState('');
  
  const { 
    transfer, 
    events, 
    loading, 
    error, 
    updateStatus, 
    updateLoading 
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
    setNewStatus('');
    setStatusNote('');
    setStatusError('');
  };
  
  // Handle status change dialog close
  const handleStatusChangeClose = () => {
    setStatusChangeOpen(false);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus) {
      setStatusError('Please select a status');
      return;
    }
    
    try {
      await updateStatus(newStatus, statusNote);
      handleStatusChangeClose();
      onClose(true);
    } catch (err) {
      console.error('Error updating status:', err);
      setStatusError('Failed to update status');
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
  
  // Render transfer details tab
  const renderDetailsTab = () => {
    if (!transfer) return null;
    
    return (
      <Grid container spacing={2}>
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
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Phone:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{transfer.senderPhone}</Typography>
              </Grid>
              
              {transfer.senderEmail && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{transfer.senderEmail}</Typography>
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
        
        {transfer.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2">{transfer.notes}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };
  
  // Render timeline tab
  const renderTimelineTab = () => {
    if (!events || events.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No events found for this transfer</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        {events.map((event, index) => (
          <Box
            key={event.id}
            sx={{
              position: 'relative',
              pb: index === events.length - 1 ? 0 : 3,
              pl: 4
            }}
          >
            {index !== events.length - 1 && (
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
                bgcolor: statusColors[event.status],
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
                {`Status: ${event.status}`}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDate(event.createdAt)}
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
                  variant="contained"
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
        <DialogTitle>Update Transfer Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!statusError} sx={{ mb: 2 }}>
              <InputLabel id="status-select-label">New Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as NonWalletTransferStatus)}
                label="New Status"
              >
                {Object.values(NonWalletTransferStatus)
                  .filter(status => status !== transfer?.status)
                  .map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
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
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Status'}
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
    </Dialog>
  );
};

export default TransferDetailsModal; 