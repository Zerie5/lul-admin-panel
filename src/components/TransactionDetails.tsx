import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import { format } from 'date-fns';
import { useTransactionDetails } from '../hooks/useTransactions';

// Define the app color
const appColor = '#18859A';

// Transaction status colors
const statusColors = {
  completed: '#4caf50',
  pending: '#ff9800',
  failed: '#f44336',
  flagged: '#9c27b0'
};

interface TransactionDetailsProps {
  transactionId: string;
  onClose: () => void;
  onFlag: (transactionId: string) => void;
  onAddNote: (transactionId: string) => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionId,
  onClose,
  onFlag,
  onAddNote
}) => {
  const { data, isLoading, isError } = useTransactionDetails(transactionId);

  // Handle export to CSV
  const handleExportCSV = () => {
    // Implementation for exporting to CSV would go here
    console.log('Exporting transaction to CSV:', transactionId);
  };

  // Render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: statusColors.completed }} />;
      case 'pending':
        return <PendingIcon sx={{ color: statusColors.pending }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: statusColors.failed }} />;
      case 'flagged':
        return <FlagIcon sx={{ color: statusColors.flagged }} />;
      default:
        return <TimelineIcon />;
    }
  };

  // Render status chip
  const renderStatusChip = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || '#757575';
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
        size="small"
      />
    );
  };

  if (isLoading) {
    return (
      <>
        <DialogTitle>
          Transaction Details
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress sx={{ color: appColor }} />
        </DialogContent>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <DialogTitle>
          Transaction Details
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="error">
            Error loading transaction details. Please try again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </>
    );
  }

  const { transaction } = data;

  return (
    <>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Transaction Details</Typography>
        <Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{transaction.id}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderStatusChip(transaction.status)}
                {transaction.flagged && (
                  <Chip
                    label="Flagged"
                    sx={{
                      ml: 1,
                      backgroundColor: `${statusColors.flagged}20`,
                      color: statusColors.flagged,
                      fontWeight: 'bold',
                      borderRadius: '4px'
                    }}
                    size="small"
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>${transaction.amount.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Type</Typography>
              <Typography variant="body1">{transaction.type}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
              <Typography variant="body1">
                {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Reference</Typography>
              <Typography variant="body1">{transaction.reference || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Sender Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
            <Typography variant="body1">{transaction.sender.name}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
            <Typography variant="body1">{transaction.sender.phone}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">User ID</Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{transaction.sender.userId}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Account</Typography>
            <Typography variant="body1">{transaction.sender.account || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Recipient Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
            <Typography variant="body1">{transaction.recipient.name}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
            <Typography variant="body1">{transaction.recipient.phone}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">User ID</Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{transaction.recipient.userId}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Account</Typography>
            <Typography variant="body1">{transaction.recipient.account || 'N/A'}</Typography>
          </Grid>
        </Grid>

        {transaction.notes && transaction.notes.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Admin Notes</Typography>
            <List>
              {transaction.notes.map((note, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {format(new Date(note.timestamp), 'MMM dd, yyyy HH:mm')} - {note.adminName}
                      </Typography>
                    }
                    secondary={note.text}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Transaction Timeline</Typography>
        <List>
          {transaction.timeline.map((event, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon>
                {renderStatusIcon(event.status)}
              </ListItemIcon>
              <ListItemText
                primary={event.description}
                secondary={format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              />
            </ListItem>
          ))}
        </List>

        {transaction.relatedTransactions && transaction.relatedTransactions.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Related Transactions</Typography>
            <List>
              {transaction.relatedTransactions.map((relatedTx, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {relatedTx.id.substring(0, 8)}... - ${relatedTx.amount.toFixed(2)}
                      </Typography>
                    }
                    secondary={`${relatedTx.type} - ${format(new Date(relatedTx.timestamp), 'MMM dd, yyyy')}`}
                  />
                  <Chip
                    label={relatedTx.status}
                    size="small"
                    sx={{
                      backgroundColor: `${statusColors[relatedTx.status as keyof typeof statusColors] || '#757575'}20`,
                      color: statusColors[relatedTx.status as keyof typeof statusColors] || '#757575',
                      fontWeight: 'bold',
                      borderRadius: '4px'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box>
          <Tooltip title="Flag Transaction">
            <Button
              startIcon={<FlagIcon />}
              onClick={() => onFlag(transactionId)}
              color={transaction.flagged ? 'secondary' : 'inherit'}
              sx={{ mr: 1 }}
            >
              {transaction.flagged ? 'Unflag' : 'Flag'}
            </Button>
          </Tooltip>
          <Tooltip title="Add Note">
            <Button
              startIcon={<NoteAddIcon />}
              onClick={() => onAddNote(transactionId)}
              sx={{ mr: 1 }}
            >
              Add Note
            </Button>
          </Tooltip>
          <Tooltip title="Export Details">
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
            >
              Export
            </Button>
          </Tooltip>
        </Box>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: appColor }}>
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default TransactionDetails; 