import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

// Import icons separately
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';

import { useFilteredNonWalletTransfers } from '../hooks/useNonWalletTransferQueries';
import { NonWalletTransferStatus, NonWalletTransferType, NonWalletTransferFilters, DisbursementStage } from '../types/nonWalletTransfer';
import { TransferDetailsModal, CreateTransferModal, SendSmsNotificationModal } from '../components';
import { exportTransfersToCSV } from '../utils/exportUtils';

const NonWalletTransfers = () => {
  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NonWalletTransferFilters>({
    page: 0,
    pageSize: 10,
    searchTerm: '',
    searchCategory: 'all',
    statusFilter: undefined,
    type: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined
  });
  
  // State for modals
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    transferId: null as string | null
  });
  
  const [createModal, setCreateModal] = useState(false);
  
  const [smsModal, setSmsModal] = useState({
    open: false,
    transfer: null as any | null
  });
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info'
  });
  
  // Use the React Query hook to fetch transfers
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useFilteredNonWalletTransfers(filters);
  
  // Initialize transfers and totalCount from data
  const [transfers, setTransfers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Update transfers and totalCount when data changes
  useEffect(() => {
    if (data) {
      setTransfers(data.transfers || []);
      setTotalCount(data.totalCount || 0);
    }
  }, [data]);
  
  // Fetch transfers when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setNotification({
          open: false,
          message: '',
          severity: 'info'
        });
        
        const result = await refetch();
        
        if (result) {
          setTransfers(result.transfers || []);
          setTotalCount(result.totalCount || 0);
        }
      } catch (err: any) {
        console.error('Failed to fetch transfers:', err);
        setTransfers([]);
        setTotalCount(0);
        
        setNotification({
          open: true,
          message: err?.message || 'Error fetching data from server',
          severity: 'error'
        });
      }
    };
    
    fetchData();
  }, [filters]);
  
  // Handle search
  const handleSearch = (event: any) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: event.target.value,
      page: 0 // Reset to first page on search
    }));
  };
  
  // Handle search category change
  const handleSearchCategoryChange = (event: any) => {
    setFilters(prev => ({
      ...prev,
      searchCategory: event.target.value,
      page: 0
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 0 // Reset to first page unless changing page
    }));
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    handleFilterChange('page', newPage);
  };
  
  const handleChangeRowsPerPage = (event: any) => {
    handleFilterChange('pageSize', parseInt(event.target.value, 10));
  };
  
  // Handle opening details modal
  const handleOpenDetails = (transferId: string) => {
    setDetailsModal({
      open: true,
      transferId
    });
  };
  
  // Handle closing details modal
  const handleCloseDetails = (success?: boolean) => {
    setDetailsModal({
      open: false,
      transferId: null
    });
    
    if (success) {
      setNotification({
        open: true,
        message: 'Transfer status updated successfully',
        severity: 'success'
      });
      refetch();
    }
  };
  
  // Handle opening create modal
  const handleOpenCreate = () => {
    setCreateModal(true);
  };
  
  // Handle closing create modal
  const handleCloseCreate = (success?: boolean) => {
    setCreateModal(false);
    
    if (success) {
      setNotification({
        open: true,
        message: 'Transfer created successfully',
        severity: 'success'
      });
      refetch();
    }
  };
  
  // Handle opening SMS modal
  const handleOpenSms = (transfer: any) => {
    setSmsModal({
      open: true,
      transfer
    });
  };
  
  // Handle closing SMS modal
  const handleCloseSms = () => {
    setSmsModal({
      open: false,
      transfer: null
    });
  };
  
  // Handle closing notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Handle refreshing data
  const handleRefresh = async () => {
    try {
      const result = await refetch();
      if (result) {
        setTransfers(result.transfers || []);
        setTotalCount(result.totalCount || 0);
        setNotification({
          open: true,
          message: 'Data refreshed successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setNotification({
        open: true,
        message: 'Failed to refresh data',
        severity: 'error'
      });
    }
  };
  
  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({
      page: 0,
      pageSize: filters.pageSize,
      searchTerm: '',
      searchCategory: 'all',
      statusFilter: undefined,
      type: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined
    });
  };
  
  // Handle export transfers
  const handleExportTransfers = () => {
    if (transfers.length === 0) return;
    
    exportTransfersToCSV(transfers, 'non-wallet-transfers');
    
    setNotification({
      open: true,
      message: 'Transfers exported successfully',
      severity: 'success'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status chip color
  const getStatusChipColor = (status: NonWalletTransferStatus) => {
    switch (status) {
      case NonWalletTransferStatus.COMPLETED:
        return 'success';
      case NonWalletTransferStatus.PENDING:
        return 'warning';
      case NonWalletTransferStatus.PROCESSING:
        return 'info';
      case NonWalletTransferStatus.FAILED:
        return 'error';
      case NonWalletTransferStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Get disbursement stage color
  const getDisbursementStageColor = (stage: string) => {
    if (stage === 'PROCESSED') return 'success';
    if (stage === 'PROCESSING') return 'info';
    if (stage === 'RECEIVED') return 'warning';
    if (stage === 'FAILED') return 'error';
    return 'default';
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Non-Wallet Transfers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all non-wallet transfers in the system
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search transfers"
                value={filters.searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={filters.searchCategory || 'all'}
                  onChange={handleSearchCategoryChange}
                  label="Search By"
                >
                  <MenuItem value="all">All Fields</MenuItem>
                  <MenuItem value="id">Transaction ID</MenuItem>
                  <MenuItem value="sender">Sender Name</MenuItem>
                  <MenuItem value="recipient">Recipient Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportTransfers}
                  disabled={isLoading || transfers.length === 0}
                >
                  Export CSV
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                >
                  Create Transfer
                </Button>
              </Box>
            </Grid>
            
            {showFilters && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Disbursement Stage</InputLabel>
                    <Select
                      value={filters.statusFilter || ''}
                      onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
                      label="Disbursement Stage"
                    >
                      <MenuItem value="">All Stages</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {Object.values(NonWalletTransferType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Min Amount"
                    type="number"
                    placeholder="0.00"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Filter amounts greater than this value"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Max Amount"
                    type="number"
                    placeholder="1000.00"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Filter amounts less than this value"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClearFilters}
                    sx={{ height: '100%' }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Sender</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Disbursement</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="error">
                      {error instanceof Error ? error.message : 'Error fetching data'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transfers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.id}</TableCell>
                    <TableCell>
                      {formatDate(transfer.createdAt)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(transfer.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transfer.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {transfer.senderName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {transfer.senderPhone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transfer.recipientName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {transfer.recipientPhone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transfer.amount, transfer.currency)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        + {formatCurrency(transfer.fee, transfer.currency)} fee
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transfer.status} 
                        size="small"
                        color={getStatusChipColor(transfer.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {transfer.disbursementStage && (
                        <Chip 
                          label={transfer.disbursementStage} 
                          size="small"
                          color={getDisbursementStageColor(transfer.disbursementStage)}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDetails(transfer.id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleOpenSms(transfer)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={filters.pageSize}
          page={filters.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Modals */}
      {detailsModal.transferId && (
        <TransferDetailsModal
          open={detailsModal.open}
          transferId={detailsModal.transferId}
          onClose={handleCloseDetails}
        />
      )}
      
      <CreateTransferModal
        open={createModal}
        onClose={handleCloseCreate}
      />
      
      {smsModal.transfer && (
        <SendSmsNotificationModal
          open={smsModal.open}
          transfer={smsModal.transfer}
          onClose={handleCloseSms}
        />
      )}
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NonWalletTransfers; 