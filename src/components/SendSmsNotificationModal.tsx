import React, { useState } from 'react';
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
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NonWalletTransfer, NonWalletTransferStatus } from '../types/nonWalletTransfer';

interface SendSmsNotificationModalProps {
  open: boolean;
  onClose: () => void;
  transfer: NonWalletTransfer;
}

const SendSmsNotificationModal = ({ open, onClose, transfer }: SendSmsNotificationModalProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Default message template based on transfer status
  const getDefaultMessage = () => {
    const recipientName = transfer.recipientName.split(' ')[0]; // Get first name
    const amount = `${transfer.currency} ${transfer.amount.toFixed(2)}`;
    
    switch (transfer.status) {
      case NonWalletTransferStatus.COMPLETED:
        return `Hello ${recipientName}, your transfer of ${amount} is now available for collection. Reference: ${transfer.id}. Thank you for using LulPay.`;
      case NonWalletTransferStatus.PROCESSING:
        return `Hello ${recipientName}, your transfer of ${amount} is being processed. We will notify you once it's ready for collection. Reference: ${transfer.id}.`;
      case NonWalletTransferStatus.FAILED:
        return `Hello ${recipientName}, we regret to inform you that your transfer of ${amount} has failed. Please contact support for assistance. Reference: ${transfer.id}.`;
      default:
        return `Hello ${recipientName}, this is an update regarding your transfer of ${amount}. Reference: ${transfer.id}. Thank you for using LulPay.`;
    }
  };
  
  // Set default message when modal opens
  React.useEffect(() => {
    if (open && transfer) {
      setMessage(getDefaultMessage());
      setSuccess(false);
      setError(null);
    }
  }, [open, transfer]);
  
  // Handle message change
  const handleMessageChange = (event: { target: { value: string } }) => {
    setMessage(event.target.value);
  };
  
  // Handle send SMS
  const handleSendSms = async () => {
    if (!message.trim()) {
      setError(new Error('Message cannot be empty'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call an API
      // await sendSmsNotification(transfer.id, message);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setLoading(false);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send SMS notification'));
      setLoading(false);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Send SMS Notification
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Recipient Information
            </Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{transfer.recipientName}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{transfer.recipientPhone}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Transfer ID:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{transfer.id}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              SMS Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={message}
              onChange={handleMessageChange}
              placeholder="Enter message to send to recipient"
              variant="outlined"
              error={!!error}
              helperText={error ? error.message : `${message.length} characters`}
            />
          </Grid>
          
          {success && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: 'success.light', color: 'success.contrastText', p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  SMS notification sent successfully!
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSendSms}
          disabled={loading || success}
        >
          {loading ? 'Sending...' : 'Send SMS'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendSmsNotificationModal; 