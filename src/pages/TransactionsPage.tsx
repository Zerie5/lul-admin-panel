import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import MuiCollapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import { SelectChangeEvent } from '@mui/material/Select';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagIcon from '@mui/icons-material/Flag';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useFlagTransaction, useAddTransactionNote } from '../hooks/useTransactions';
import TransactionDetailsComponent from '../components/TransactionDetailsComponent';
import { useRecentTransactions } from '../hooks/useDashboardData';
import { RecentTransaction } from '../services/dashboardService';

// Define the app color
const appColor = '#18859A';
const appColorLight = '#5AB6C7';

// Transaction status colors
const statusColors = {
  completed: '#4caf50',
  pending: '#ff9800',
  failed: '#f44336',
  flagged: '#9c27b0'
};

// Define types for TableCell props
interface ExtendedTableCellProps {
  colSpan?: number;
  align?: 'center' | 'left' | 'right';
  sx?: any;
  children?: React.ReactNode;
}

const TransactionsPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchField, setSearchField] = React.useState('transactionId');
  const [transactionType, setTransactionType] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [minAmount, setMinAmount] = React.useState('');
  const [maxAmount, setMaxAmount] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [currentTransactionId, setCurrentTransactionId] = React.useState<string | null>(null);
  
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const { 
    data: transactionsData, 
    isLoading, 
    error: isError,
    refetch 
  } = useRecentTransactions(
    rowsPerPage,
    page,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0]
  );

  const { mutate: flagTransaction } = useFlagTransaction({
    onSuccess: () => {
      showSnackbar('Transaction flagged successfully', 'success');
    },
    onError: () => {
      showSnackbar('Failed to flag transaction', 'error');
    }
  });

  const { mutate: addNote } = useAddTransactionNote({
    onSuccess: () => {
      showSnackbar('Note added successfully', 'success');
      setNoteDialogOpen(false);
      setNoteText('');
    },
    onError: () => {
      showSnackbar('Failed to add note', 'error');
    }
  });

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchField('transactionId');
    setTransactionType('all');
    setStatus('all');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setPage(0);
    refetch();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<string>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransactionId(transaction.id);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTransactionId(null);
  };

  const handleFlagTransaction = (transaction: any) => {
    flagTransaction(transaction.id);
  };

  const handleOpenNoteDialog = (transactionId: string) => {
    setCurrentTransactionId(transactionId);
    setNoteDialogOpen(true);
  };

  const handleAddNote = () => {
    if (currentTransactionId && noteText.trim()) {
      addNote({
        transactionId: currentTransactionId,
        note: noteText
      });
    }
  };

  const handleExportCSV = () => {
    showSnackbar('Transactions exported successfully', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('fail')) return 'error';
    return 'default';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Transaction Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          sx={{ backgroundColor: appColor }}
        >
          Export to CSV
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Transactions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                      <Select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value as string)}
                        displayEmpty
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="transactionId">Transaction ID</MenuItem>
                        <MenuItem value="userId">User ID</MenuItem>
                        <MenuItem value="phoneNumber">Phone Number</MenuItem>
                      </Select>
                    </FormControl>
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ backgroundColor: appColor }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        <MuiCollapse in={showFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={transactionType}
                    label="Transaction Type"
                    onChange={(e) => setTransactionType(e.target.value as string)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="wallet">Wallet Transfer</MenuItem>
                    <MenuItem value="non-wallet">Non-Wallet Transfer</MenuItem>
                    <MenuItem value="deposit">Deposit</MenuItem>
                    <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as string)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="flagged">Flagged</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Min Amount"
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Max Amount"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{ mr: 1 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </MuiCollapse>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    minWidth: 120,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 3,
                    borderRight: `1px solid ${theme.palette.divider}`
                  }}
                >
                  Actions
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Alert severity="error">Error loading transactions</Alert>
                  </TableCell>
                </TableRow>
              ) : transactionsData?.content.map((transaction: RecentTransaction) => (
                <TableRow key={transaction.id}>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 1,
                      borderRight: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleFlagTransaction(transaction)}
                      >
                        <FlagIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>#{transaction.id}</TableCell>
                  <TableCell>
                    <Tooltip title={transaction.userName}>
                      <Typography noWrap sx={{ maxWidth: 150 }}>
                        {transaction.userName}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={transaction.receiverName}>
                      <Typography noWrap sx={{ maxWidth: 150 }}>
                        {transaction.receiverName || 'N/A'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    ${typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : transaction.amount}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.type} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.dark
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      size="small"
                      color={getStatusColor(transaction.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {transaction.description ? (
                      <Tooltip title={transaction.description}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>
                          {transaction.description}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography
                        sx={{
                          color: theme.palette.text.disabled,
                          fontStyle: 'italic'
                        }}
                      >
                        No description
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatTimestamp(transaction.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={transactionsData?.totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedTransactionId && (
          <Box component="div">
            <DialogTitle>
              Transaction Details
            </DialogTitle>
            <DialogContent>
              <div>
                <TransactionDetailsComponent
                  transactionId={selectedTransactionId}
                  onClose={handleCloseDetails}
                  onFlag={(id: string) => handleFlagTransaction({ id })}
                  onAddNote={handleOpenNoteDialog}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleFlagTransaction({ id: selectedTransactionId })}>Flag</Button>
              <Button onClick={() => handleOpenNoteDialog(selectedTransactionId)}>Add Note</Button>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note to Transaction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" sx={{ backgroundColor: appColor }}>
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsPage; 