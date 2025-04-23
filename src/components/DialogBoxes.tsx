import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Box,
  useTheme
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface DialogBoxProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

// Success Dialog Box with green color scheme
export const SuccessDialog = ({
  open,
  onClose,
  title,
  message,
  confirmButtonText = 'OK',
  onConfirm,
  cancelButtonText = 'Cancel',
  showCancelButton = false,
}: DialogBoxProps) => {
  const theme = useTheme();
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderLeft: `6px solid ${theme.palette.success.main}`,
          borderRadius: '8px',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: `${theme.palette.success.light}30`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {showCancelButton && (
          <Button onClick={onClose} color="inherit">
            {cancelButtonText}
          </Button>
        )}
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          sx={{ 
            backgroundColor: theme.palette.success.main,
            '&:hover': {
              backgroundColor: theme.palette.success.dark
            }
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Warning Dialog Box with orange color scheme
export const WarningDialog = ({
  open,
  onClose,
  title,
  message,
  confirmButtonText = 'OK',
  onConfirm,
  cancelButtonText = 'Cancel',
  showCancelButton = true,
}: DialogBoxProps) => {
  const theme = useTheme();
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderLeft: `6px solid ${theme.palette.warning.main}`,
          borderRadius: '8px',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: `${theme.palette.warning.light}30`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {showCancelButton && (
          <Button onClick={onClose} color="inherit">
            {cancelButtonText}
          </Button>
        )}
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          sx={{ 
            backgroundColor: theme.palette.warning.main,
            '&:hover': {
              backgroundColor: theme.palette.warning.dark
            }
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Error Dialog Box with red color scheme
export const ErrorDialog = ({
  open,
  onClose,
  title,
  message,
  confirmButtonText = 'OK',
  onConfirm,
  cancelButtonText = 'Cancel',
  showCancelButton = false,
}: DialogBoxProps) => {
  const theme = useTheme();
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderLeft: `6px solid ${theme.palette.error.main}`,
          borderRadius: '8px',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: `${theme.palette.error.light}30`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {showCancelButton && (
          <Button onClick={onClose} color="inherit">
            {cancelButtonText}
          </Button>
        )}
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          sx={{ 
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark
            }
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 