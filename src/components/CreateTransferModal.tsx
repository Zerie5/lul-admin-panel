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
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
// Import these separately to avoid linter errors
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
// Import Formik components separately
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useCreateNonWalletTransfer } from '../hooks/useNonWalletTransfers';
import { NonWalletTransferType } from '../types/nonWalletTransfer';

interface CreateTransferModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

const CreateTransferModal = ({ open, onClose }: CreateTransferModalProps) => {
  const [step, setStep] = useState(1);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });
  
  const { createTransfer, loading: apiLoading, error, success } = useCreateNonWalletTransfer();
  
  // TODO: Replace with real sender data from backend API
  // Mock sender data removed for security - connect to backend API
  const mockSenders = [
    // Remove hardcoded demo users for security
    // TODO: Implement API call to fetch real senders
    // { id: 'USR001', name: 'User Name', phone: '+1234567890', email: 'user@example.com', country: 'US' },
  ];
  
  const initialValues = {
    senderId: '',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderCountry: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientCountry: '',
    amount: '',
    currency: 'USD',
    type: NonWalletTransferType.MOBILE_MONEY,
    purpose: ''
  };
  
  const handleClose = () => {
    setStep(1);
    setConfirmationOpen(false);
    setFormValues(null);
    onClose();
  };
  
  const handleNext = () => {
    setStep(2);
  };
  
  const handleBack = () => {
    setStep(1);
  };
  
  const getValidationSchema = () => {
    return Yup.object({
      senderId: Yup.string().required('Sender is required'),
      recipientName: Yup.string().required('Recipient name is required'),
      recipientPhone: Yup.string()
        .required('Recipient phone is required')
        .matches(/^\+?[0-9]{10,15}$/, 'Phone number must be valid (10-15 digits)'),
      recipientEmail: Yup.string()
        .email('Invalid email format')
        .nullable(),
      recipientCountry: Yup.string().required('Recipient country is required'),
      amount: Yup.number()
        .required('Amount is required')
        .positive('Amount must be positive')
        .min(1, 'Minimum amount is 1')
        .typeError('Amount must be a number'),
      currency: Yup.string().required('Currency is required'),
      type: Yup.string().required('Transfer type is required'),
      purpose: Yup.string()
        .max(500, 'Purpose cannot exceed 500 characters')
    });
  };
  
  const handleSubmit = async (values: any) => {
    setFormValues(values);
    setConfirmationOpen(true);
  };
  
  const handleConfirmSubmit = async () => {
    if (!formValues) return;
    
    // Find the selected sender
    const selectedSender = mockSenders.find(sender => sender.id === formValues.senderId);
    
    if (!selectedSender) {
      setNotification({
        open: true,
        message: 'Selected sender not found',
        severity: 'error'
      });
      return;
    }
    
    // Prepare transfer data
    const transferData = {
      senderId: formValues.senderId,
      amount: parseFloat(formValues.amount),
      currency: formValues.currency,
      type: formValues.type,
      recipientName: formValues.recipientName,
      recipientPhone: formValues.recipientPhone,
      recipientEmail: formValues.recipientEmail || undefined,
      recipientCountry: formValues.recipientCountry,
      purpose: formValues.purpose || undefined
    };
    
    try {
      setLoading(true);
      const result = await createTransfer(transferData);
      if (result) {
        setConfirmationOpen(false);
        setNotification({
          open: true,
          message: 'Transfer created successfully',
          severity: 'success'
        });
        onClose(true);
      }
    } catch (err) {
      console.error('Error creating transfer:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to create transfer',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  const renderFormFields = (formikProps: any) => {
    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formikProps;
    
    if (step === 1) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Sender Information
            </Typography>
            <FormControl fullWidth error={touched.senderId && Boolean(errors.senderId)}>
              <InputLabel id="sender-select-label">Select Sender</InputLabel>
              <Select
                labelId="sender-select-label"
                name="senderId"
                value={values.senderId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setFieldValue('senderId', selectedId);
                  
                  // Auto-fill sender details
                  const selectedSender = mockSenders.find(sender => sender.id === selectedId);
                  if (selectedSender) {
                    setFieldValue('senderName', selectedSender.name);
                    setFieldValue('senderPhone', selectedSender.phone);
                    setFieldValue('senderEmail', selectedSender.email);
                    setFieldValue('senderCountry', selectedSender.country);
                  }
                }}
                onBlur={handleBlur}
                label="Select Sender"
              >
                <MenuItem value="">
                  <em>Select a sender</em>
                </MenuItem>
                {mockSenders.map(sender => (
                  <MenuItem key={sender.id} value={sender.id}>
                    {sender.name} ({sender.phone})
                  </MenuItem>
                ))}
              </Select>
              {touched.senderId && errors.senderId && (
                <FormHelperText>{errors.senderId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {values.senderId && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected Sender:
                </Typography>
                <Typography variant="body1">
                  {values.senderName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {values.senderPhone} • {values.senderEmail}
                </Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Transfer Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              value={values.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.amount && Boolean(errors.amount)}
              helperText={touched.amount && errors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {values.currency}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                labelId="currency-select-label"
                name="currency"
                value={values.currency}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Currency"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Transfer Type</InputLabel>
              <Select
                labelId="type-select-label"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Transfer Type"
              >
                {Object.values(NonWalletTransferType).map(type => (
                  <MenuItem key={type} value={type}>
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Recipient Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="recipientName"
              label="Recipient Name"
              value={values.recipientName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.recipientName && Boolean(errors.recipientName)}
              helperText={touched.recipientName && errors.recipientName}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="recipientPhone"
              label="Recipient Phone"
              value={values.recipientPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.recipientPhone && Boolean(errors.recipientPhone)}
              helperText={touched.recipientPhone && errors.recipientPhone}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="recipientEmail"
              label="Recipient Email (Optional)"
              value={values.recipientEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.recipientEmail && Boolean(errors.recipientEmail)}
              helperText={touched.recipientEmail && errors.recipientEmail}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth error={touched.recipientCountry && Boolean(errors.recipientCountry)}>
              <InputLabel id="recipient-country-label">Recipient Country</InputLabel>
              <Select
                labelId="recipient-country-label"
                name="recipientCountry"
                value={values.recipientCountry}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Recipient Country"
              >
                <MenuItem value="">
                  <em>Select a country</em>
                </MenuItem>
                <MenuItem value="US">United States</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                <MenuItem value="AU">Australia</MenuItem>
                <MenuItem value="NG">Nigeria</MenuItem>
                <MenuItem value="GH">Ghana</MenuItem>
                <MenuItem value="KE">Kenya</MenuItem>
              </Select>
              {touched.recipientCountry && errors.recipientCountry && (
                <FormHelperText>{errors.recipientCountry}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Additional Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="purpose"
              label="Purpose/Note"
              multiline
              rows={3}
              value={values.purpose}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter the purpose of this transfer or any additional notes"
            />
          </Grid>
        </Grid>
      );
    }
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Create Non-Wallet Transfer
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {step === 1 ? 'Step 1 of 2: Select sender and enter transfer details' : 'Step 2 of 2: Enter recipient information'}
            </Typography>
          </Box>
          
          <Formik
            initialValues={initialValues}
            validationSchema={getValidationSchema()}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form>
                {renderFormFields(formikProps)}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {step === 2 ? (
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  ) : (
                    <Box />
                  )}
                  
                  {step === 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!formikProps.values.senderId || !formikProps.values.amount || formikProps.errors.amount}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={formikProps.isSubmitting || !formikProps.isValid}
                    >
                      Create Transfer
                    </Button>
                  )}
                </Box>
              </Form>
            )}
          </Formik>
          
          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error">
                Error: {error.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Transfer</DialogTitle>
        <DialogContent>
          {formValues && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to create this transfer?
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Amount:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formValues.currency} {parseFloat(formValues.amount).toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Recipient:
                </Typography>
                <Typography variant="body1">
                  {formValues.recipientName} ({formValues.recipientPhone})
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Transfer Type:
                </Typography>
                <Typography variant="body1">
                  {formValues.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateTransferModal; 