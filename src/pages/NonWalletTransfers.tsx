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
  InputLabel,
 
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useFilteredNonWalletTransfers } from '../hooks/useNonWalletTransferQueries';
import { getFilteredNonWalletTransfers } from '../services/nonWalletTransferService';
import { NonWalletTransferStatus, NonWalletTransferType, NonWalletTransferFilters, DisbursementStage, TimeFrame } from '../types/nonWalletTransfer';
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
    paymentStatus: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    timeFrame: TimeFrame.ALL
  });
  
  // Add state for search input that doesn't trigger immediate filtering
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');
  
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
  
  // State for search button loading
  const [searchLoading, setSearchLoading] = useState(false);
  
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
  
  // Fetch transfers only when pagination changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setNotification({
          open: false,
          message: '',
          severity: 'info'
        });
        
        console.log('Auto-fetching due to pagination change');
        // Pass false to indicate this is not a search button triggered action
        const result = await refetch(false);
        
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
    
    // Only fetch automatically for pagination changes
    if (filters.page !== undefined || filters.pageSize !== undefined) {
      fetchData();
    }
  }, [filters.page, filters.pageSize]); // Only depend on pagination filters
  
  // Handle search input change without triggering search
  const handleSearchInputChange = (event: any) => {
    setSearchInput(event.target.value);
  };
  
  // Handle search submission (on button click or Enter key)
  const handleSearchSubmit = async () => {
    // Set loading state
    setSearchLoading(true);
    
    // Clear previous results immediately to prevent showing stale data
    setTransfers([]);
    setTotalCount(0);
    
    try {
      // Create updated filters with the new search term
      const updatedFilters = {
        ...filters,
        searchTerm: searchInput,
        page: 0 // Reset to first page on search
      };
      
      // Update the filters state
      setFilters(updatedFilters);
      
      // Use a small timeout to ensure state update completes before refetch
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Trigger search with the updated filters directly
      const result = await refetch(true);
      
      // Update state with new results
      if (result) {
        setTransfers(result.transfers || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Error during search:', error);
      // Keep transfers empty on error
      setTransfers([]);
      setTotalCount(0);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle Enter key in search field
  const handleSearchKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };
  
  // Handle search category change
  const handleSearchCategoryChange = (event: any) => {
    setFilters(prev => ({
      ...prev,
      searchCategory: event.target.value,
      page: 0
    }));
  };
  
  // Handle filter change without triggering search
  const handleFilterChange = (field: string, value: any) => {
    // Only update the filters state without triggering a search
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Only reset page for page changes
      page: field === 'page' ? value : prev.page
    }));
  };
  
  // Handle applying all filters with the search button
  const handleApplyFilters = async () => {
    console.log('Applying all filters with search button');
    
    // Set loading state to true
    setSearchLoading(true);
    
    // Clear previous results immediately to prevent showing stale data
    setTransfers([]);
    setTotalCount(0);
    
    try {
      // Reset to first page when applying filters
      setFilters(prev => ({
        ...prev,
        page: 0
      }));
      
      // Trigger search with all filters applied
      const result = await refetch(true);
      
      // Update state with new results
      if (result) {
        setTransfers(result.transfers || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error('Error during search:', error);
      // Keep transfers empty on error
      setTransfers([]);
      setTotalCount(0);
    } finally {
      // Set loading state back to false when done
      setSearchLoading(false);
    }
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
    console.log(`Opening transaction details for ID: ${transferId}`);
    
    setDetailsModal({
      open: true,
      transferId
    });
  };
  
  // Handle closing details modal
  const handleCloseDetails = (success?: boolean, updateType?: string) => {
    setDetailsModal({
      open: false,
      transferId: null
    });
    
    if (success) {
      // Show different messages based on what was updated
      const message = updateType === 'disbursement' 
        ? 'Disbursement stage updated successfully'
        : updateType === 'payment'
        ? 'Payment status updated successfully'
        : 'Transfer status updated successfully';
        
      setNotification({
        open: true,
        message,
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
    // Clear search input
    setSearchInput('');
    
    // Clear transfers data
    setTransfers([]);
    setTotalCount(0);
    
    // Reset all filters
    setFilters({
      page: 0,
      pageSize: filters.pageSize,
      searchTerm: '',
      searchCategory: 'all',
      statusFilter: undefined,
      type: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      timeFrame: TimeFrame.ALL
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
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleSearchSubmit}
                        size="small"
                        aria-label="search"
                        disabled={searchLoading}
                      >
                        {searchLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon />
                        )}
                      </IconButton>
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
                  disabled={isLoading || searchLoading}
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
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={filters.paymentStatus || ''}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      label="Payment Status"
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="1">Pending</MenuItem>
                      <MenuItem value="2">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Time Frame</InputLabel>
                    <Select
                      value={filters.timeFrame || TimeFrame.ALL}
                      onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                      label="Time Frame"
                    >
                      <MenuItem value={TimeFrame.ALL}>All Time</MenuItem>
                      <MenuItem value={TimeFrame.DAILY}>Today</MenuItem>
                      <MenuItem value={TimeFrame.WEEKLY}>Last 7 Days</MenuItem>
                      <MenuItem value={TimeFrame.MONTHLY}>Last 30 Days</MenuItem>
                      <MenuItem value={TimeFrame.YEARLY}>Last 365 Days</MenuItem>
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
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClearFilters}
                    sx={{ height: '100%' }}
                    disabled={searchLoading}
                  >
                    Clear Filters
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={12} md={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '7%', width: '100%' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleApplyFilters}
                      disabled={searchLoading}
                      sx={{ 
                        minWidth: '250px',
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      {searchLoading ? (
                        <>
                          <CircularProgress
                            size={24}
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              marginLeft: '-12px',
                              marginTop: '-12px',
                              top: '50%'
                            }}
                          />
                          <Box sx={{ opacity: 0.5 }}>Searching...</Box>
                        </>
                      ) : (
                        <>
                          <SearchIcon sx={{ mr: 1 }} />
                          Search with Filters
                        </>
                      )}
                    </Button>
                  </Box>
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
                      {transfer.senderCountry && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {transfer.senderCountry}
                          </Typography>
                        </>
                      )}
                      {transfer.senderPhone && !transfer.senderCountry && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {transfer.senderPhone}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {transfer.recipientName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {transfer.recipientPhone}
                      </Typography>
                      {transfer.recipientEmail && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {transfer.recipientEmail}
                          </Typography>
                        </>
                      )}
                      {transfer.recipientRelationship && (
                        <>
                          <br />
                          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                            {transfer.recipientRelationship.charAt(0) + transfer.recipientRelationship.slice(1).toLowerCase()} 
                          </Typography>
                        </>
                      )}
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
                        sx={{
                          backgroundColor: transfer.status === NonWalletTransferStatus.COMPLETED
                            ? '#e8f5e9' // light green
                            : transfer.status === NonWalletTransferStatus.PROCESSING
                            ? '#e3f2fd' // light blue
                            : transfer.status === NonWalletTransferStatus.PENDING
                            ? '#fff3e0' // light orange
                            : transfer.status === NonWalletTransferStatus.FAILED
                            ? '#ffebee' // light red
                            : '#eeeeee', // light grey for CANCELLED
                          color: transfer.status === NonWalletTransferStatus.COMPLETED
                            ? '#2e7d32' // dark green
                            : transfer.status === NonWalletTransferStatus.PROCESSING
                            ? '#1565c0' // dark blue
                            : transfer.status === NonWalletTransferStatus.PENDING
                            ? '#e65100' // dark orange
                            : transfer.status === NonWalletTransferStatus.FAILED
                            ? '#c62828' // dark red
                            : '#757575', // dark grey for CANCELLED
                          fontWeight: 600,
                          borderRadius: '20px',
                          height: '24px',
                          '& .MuiChip-label': {
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            px: 1.5
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {transfer.disbursementStage && (
                        <Chip 
                          label={transfer.disbursementStage} 
                          size="small"
                          sx={{
                            backgroundColor: transfer.disbursementStage === 'Completed' || transfer.disbursementStage === 'PROCESSED'
                              ? '#e8f5e9' // light green
                              : transfer.disbursementStage === 'Processing' || transfer.disbursementStage === 'PROCESSING'
                              ? '#e3f2fd' // light blue
                              : '#fff3e0', // light orange
                            color: transfer.disbursementStage === 'Completed' || transfer.disbursementStage === 'PROCESSED'
                              ? '#2e7d32' // dark green
                              : transfer.disbursementStage === 'Processing' || transfer.disbursementStage === 'PROCESSING'
                              ? '#1565c0' // dark blue
                              : '#e65100', // dark orange
                            fontWeight: 600,
                            borderRadius: '20px',
                            height: '24px',
                            '& .MuiChip-label': {
                              textTransform: 'uppercase',
                              fontSize: '0.75rem',
                              px: 1.5
                            }
                          }}
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