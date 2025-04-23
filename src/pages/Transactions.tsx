import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagIcon from '@mui/icons-material/Flag';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UndoIcon from '@mui/icons-material/Undo';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useFilteredTransactions, useSuccessRate, useTransactionTime, useReversalRate } from '../hooks/useDashboardData';
import { RecentTransaction, TransactionFilters } from '../services/dashboardService';
import { useFlagTransaction, useAddTransactionNote } from '../hooks/useTransactions';
import { CircularProgress, Card, CardContent, CardHeader } from '@mui/material';
import { useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme as useMuiTheme } from '@mui/material';

// Define the app color
const appColor = '#18859A';

// Transaction status colors with enhanced opacity
const statusColors = {
  completed: {
    bg: '#4caf5015',
    border: '#4caf5030',
    text: '#2e7d32',
    chip: '#e8f5e9'
  },
  pending: {
    bg: '#ff980015',
    border: '#ff980030',
    text: '#ed6c02',
    chip: '#fff3e0'
  },
  failed: {
    bg: '#f4433615',
    border: '#f4433630',
    text: '#d32f2f',
    chip: '#ffeaea'
  },
  flagged: {
    bg: '#9c27b015',
    border: '#9c27b030',
    text: '#7b1fa2',
    chip: '#f3e5f5'
  }
};

// Define transaction type colors for consistency
const typeColors = {
  wallet: {
    bg: '#4caf5015',
    border: '#4caf5030',
    text: '#2e7d32',
    chip: '#e8f5e9'
  },
  nonWallet: {
    bg: '#ff980015',
    border: '#ff980030',
    text: '#ed6c02',
    chip: '#fff3e0'
  },
  deposit: {
    bg: '#2196f315',
    border: '#2196f330',
    text: '#0d47a1',
    chip: '#e3f2fd'
  },
  business: {
    bg: '#9c27b015',
    border: '#9c27b030',
    text: '#7b1fa2',
    chip: '#f3e5f5'
  },
  currencySwap: {
    bg: '#00968815',
    border: '#00968830',
    text: '#00695c',
    chip: '#e0f2f1'
  }
};

// Define custom props interface that extends TableCellProps
interface CustomTableCellProps extends TableCellProps {
  colSpan?: number;
}

// Create a custom TableCell component that accepts the colSpan prop
const CustomTableCell = (props: CustomTableCellProps) => {
  return <TableCell {...props} />;
};

// Fix TableCell issue by using the correct typing
// MUI TableCell already supports colSpan, but TypeScript definitions might be incomplete
// We'll use a type assertion to work around this
const StyledTableCell = (props: any) => <TableCell {...props} />;

// Processing Time Card component
const ProcessingTimeCard = () => {
  const theme = useTheme();
  
  const { data: transactionTimeStats, isLoading, error } = useTransactionTime();
  
  const getColorForTime = (time: number) => {
    if (!time && time !== 0) return theme.palette.warning.main; // Handle undefined/null
    if (time <= 3) return theme.palette.success.main; // Fast - green
    if (time <= 6) return theme.palette.warning.main; // Medium - orange/yellow
    return theme.palette.error.main; // Slow - red
  };
  
  if (isLoading) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CircularProgress size={20} />
      </Card>
    );
  }
  
  if (error || !transactionTimeStats) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="caption" color="error">Error loading processing time data</Typography>
        </CardContent>
      </Card>
    );
  }

  // Safely access properties with fallbacks to prevent crashes
  const averageTime = transactionTimeStats.averageProcessingTime || 0;
  const formattedTime = transactionTimeStats.formattedAverageTime || '0 sec';
  const timeByType = transactionTimeStats.processingTimeByType || {};
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: 1,
      borderRadius: 1,
      overflow: 'hidden'
    }}>
      <Box 
        sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          py: 0.5,
          px: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: '1rem' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.1, fontSize: '0.8rem' }}>
              Transaction Processing Times
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Average time to complete
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 1, pb: '4px !important' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          flexDirection: 'column',
          mb: 1,
          py: 0.5,
          backgroundColor: `${getColorForTime(averageTime)}08`,
          borderRadius: 1
        }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 'bold', 
              color: getColorForTime(averageTime),
              lineHeight: 1.1,
              fontSize: '1.1rem'
            }}
          >
            {formattedTime}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Average processing time
          </Typography>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            mb: 0.5,
            fontWeight: 'bold',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'block',
              width: 2,
              height: 10,
              backgroundColor: theme.palette.primary.main,
              mr: 0.5,
              borderRadius: 1
            }
          }}
        >
          By Transaction Type
        </Typography>
        
        <Box>
          {Object.entries(timeByType).map(([type, time]) => {
            if (time === undefined || time === null) return null; // Skip invalid entries
            
            // Calculate a width percentage based on time (for mini progress bar)
            const allTimes = Object.values(timeByType).filter(t => t !== undefined && t !== null) as number[];
            const minTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
            const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : 1;
            const range = maxTime - minTime || 1; // Avoid division by zero
            
            // Calculate width percentage (between 30% and 90%)
            const widthPercentage = 30 + ((time - minTime) / range) * 60;
            
            return (
              <Box 
                key={type} 
                sx={{ 
                  mb: 0.5,
                  position: 'relative',
                  '&:last-child': {
                    mb: 0
                  }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: '0.65rem',
                    mb: 0.1,
                    display: 'block'
                  }}
                >
                  {type.replace(/_/g, ' ')}
                </Typography>
                
                <Box sx={{ 
                  position: 'relative',
                  height: 14,
                  backgroundColor: `${getColorForTime(time)}10`,
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${widthPercentage}%`,
                      backgroundColor: getColorForTime(time),
                      opacity: 0.15,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.6rem',
                      color: getColorForTime(time),
                      zIndex: 1,
                      ml: 1
                    }}
                  >
                    {time.toFixed(1)} sec
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

// Success Rate Card component
const SuccessRateCard = () => {
  const theme = useTheme();
  
  const { data: successRateStats, isLoading, error } = useSuccessRate();
  
  // Add debugging log to see the actual data
  useEffect(() => {
    if (successRateStats) {
      console.log('Success Rate Data received:', {
        successRate: successRateStats.successRate,
        formattedRate: successRateStats.formattedRate,
        successRateByType: successRateStats.successRateByType,
        formattedRateByType: successRateStats.formattedRateByType,
        rawData: successRateStats
      });
    }
  }, [successRateStats]);
  
  const getColorForRate = (rate: number) => {
    if (rate === undefined || rate === null) return theme.palette.warning.main; // Handle undefined/null
    if (rate >= 0.95) return theme.palette.success.main; // High success - green
    if (rate >= 0.85) return theme.palette.warning.main; // Medium success - orange/yellow
    return theme.palette.error.main; // Low success - red
  };
  
  const formatRateDisplay = (rate?: number | string, formattedValue?: string): string => {
    if (formattedValue) return formattedValue;
    if (typeof rate === 'number') return `${(rate * 100).toFixed(1)}%`;
    if (typeof rate === 'string' && !rate.includes('%')) return `${rate}%`;
    return rate?.toString() || '0%';
  };
  
  if (isLoading) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CircularProgress size={20} />
      </Card>
    );
  }
  
  if (error || !successRateStats) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="caption" color="error">Error loading success rate data</Typography>
        </CardContent>
      </Card>
    );
  }

  // Safely access properties with fallbacks to prevent crashes
  const successRate = successRateStats.successRate || 0;
  const formattedRate = formatRateDisplay(successRate, successRateStats.formattedRate);
  const rateByType = successRateStats.successRateByType || {};
  const formattedRateByType = successRateStats.formattedRateByType || {};
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: 1,
      borderRadius: 1,
      overflow: 'hidden'
    }}>
      <Box 
        sx={{ 
          backgroundColor: theme.palette.success.main,
          color: 'white',
          py: 0.5,
          px: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleIcon sx={{ fontSize: '1rem' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.1, fontSize: '0.8rem' }}>
              Transaction Success Rate
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Completion rate by type
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 1, pb: '4px !important' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          flexDirection: 'column',
          mb: 1,
          py: 0.5,
          backgroundColor: `${getColorForRate(successRate)}08`,
          borderRadius: 1
        }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 'bold', 
              color: getColorForRate(successRate),
              lineHeight: 1.1,
              fontSize: '1.1rem'
            }}
          >
            {formattedRate}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Overall success rate
          </Typography>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            mb: 0.5,
            fontWeight: 'bold',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'block',
              width: 2,
              height: 10,
              backgroundColor: theme.palette.success.main,
              mr: 0.5,
              borderRadius: 1
            }
          }}
        >
          By Transaction Type
        </Typography>
        
        <Box>
          {Object.entries(rateByType).map(([type, rate]) => {
            if (rate === undefined || rate === null) return null; // Skip invalid entries
            
            // Calculate a width percentage based on rate (for mini progress bar)
            // We'll map the range [0.8, 1.0] to [30%, 100%] for visual clarity
            const widthPercentage = Math.max(30, ((rate - 0.8) / 0.2) * 70 + 30);
            
            return (
              <Box 
                key={type} 
                sx={{ 
                  mb: 0.5,
                  position: 'relative',
                  '&:last-child': {
                    mb: 0
                  }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: '0.65rem',
                    mb: 0.1,
                    display: 'block'
                  }}
                >
                  {type.replace(/_/g, ' ')}
                </Typography>
                
                <Box sx={{ 
                  position: 'relative',
                  height: 14,
                  backgroundColor: `${getColorForRate(rate)}10`,
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${widthPercentage}%`,
                      backgroundColor: getColorForRate(rate),
                      opacity: 0.15,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.6rem',
                      color: getColorForRate(rate),
                      zIndex: 1,
                      ml: 1
                    }}
                  >
                    {formattedRateByType[type] || formatRateDisplay(rate)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

// Reversal Rate Card component
const ReversalRateCard = () => {
  const theme = useTheme();
  
  const { data: reversalRateStats, isLoading, error } = useReversalRate();
  
  // Add debugging log to see the actual data
  useEffect(() => {
    if (reversalRateStats) {
      console.log('Reversal Rate Data received:', {
        overallReversalRate: reversalRateStats.overallReversalRate,
        formattedReversalRate: reversalRateStats.formattedReversalRate,
        reversalRateByType: reversalRateStats.reversalRateByType,
        rawData: reversalRateStats
      });
    }
  }, [reversalRateStats]);
  
  const getColorForRate = (rate: number) => {
    if (rate === undefined || rate === null) return theme.palette.warning.main;
    if (rate <= 0.01) return theme.palette.success.main; // Low reversal - green
    if (rate <= 0.03) return theme.palette.warning.main; // Medium reversal - orange/yellow
    return theme.palette.error.main; // High reversal - red
  };
  
  const formatRateDisplay = (rate?: number | string, formattedValue?: string): string => {
    if (formattedValue) return formattedValue;
    if (typeof rate === 'number') return `${(rate * 100).toFixed(2)}%`;
    if (typeof rate === 'string' && !rate.includes('%')) return `${rate}%`;
    return rate?.toString() || '0%';
  };
  
  if (isLoading) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CircularProgress size={20} />
      </Card>
    );
  }
  
  if (error || !reversalRateStats) {
    return (
      <Card sx={{ 
        height: '100%', 
        minHeight: 100,
        boxShadow: 1,
        borderRadius: 1
      }}>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="caption" color="error">Error loading reversal rate data</Typography>
        </CardContent>
      </Card>
    );
  }

  // Safely access properties with fallbacks to prevent crashes
  const reversalRate = reversalRateStats.overallReversalRate || 0;
  const formattedRate = formatRateDisplay(reversalRate, reversalRateStats.formattedReversalRate);
  const rateByType = reversalRateStats.reversalRateByType || {};
  
  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: 1,
      borderRadius: 1,
      overflow: 'hidden'
    }}>
      <Box 
        sx={{ 
          backgroundColor: theme.palette.error.main,
          color: 'white',
          py: 0.5,
          px: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <UndoIcon sx={{ fontSize: '1rem' }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.1, fontSize: '0.8rem' }}>
              Transaction Reversal Rate
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Reversal rate by type
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <CardContent sx={{ p: 1, pb: '4px !important' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          flexDirection: 'column',
          mb: 1,
          py: 0.5,
          backgroundColor: `${getColorForRate(reversalRate)}08`,
          borderRadius: 1
        }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 'bold', 
              color: getColorForRate(reversalRate),
              lineHeight: 1.1,
              fontSize: '1.1rem'
            }}
          >
            {formattedRate}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Overall reversal rate
          </Typography>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            mb: 0.5,
            fontWeight: 'bold',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'block',
              width: 2,
              height: 10,
              backgroundColor: theme.palette.error.main,
              mr: 0.5,
              borderRadius: 1
            }
          }}
        >
          By Transaction Type
        </Typography>
        
        <Box>
          {Object.entries(rateByType).map(([type, rate]) => {
            if (rate === undefined || rate === null) return null; // Skip invalid entries
            
            // Calculate a width percentage based on rate (for mini progress bar)
            // We'll map the range [0, 0.05] to [5%, 100%] for visual clarity
            const widthPercentage = Math.min(100, Math.max(5, (rate / 0.05) * 100));
            
            return (
              <Box 
                key={type} 
                sx={{ 
                  mb: 0.5,
                  position: 'relative',
                  '&:last-child': {
                    mb: 0
                  }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: '0.65rem',
                    mb: 0.1,
                    display: 'block'
                  }}
                >
                  {type.replace(/_/g, ' ')}
                </Typography>
                
                <Box sx={{ 
                  position: 'relative',
                  height: 14,
                  backgroundColor: `${getColorForRate(rate)}10`,
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${widthPercentage}%`,
                      backgroundColor: getColorForRate(rate),
                      opacity: 0.15,
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.6rem',
                      color: getColorForRate(rate),
                      zIndex: 1,
                      ml: 1
                    }}
                  >
                    {formatRateDisplay(rate)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

const Transactions: React.FC = () => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  
  // Transaction details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecentTransaction | null>(null);
  
  // Note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch transactions data with server-side pagination and filtering
  const { 
    data: transactionsData, 
    isLoading, 
    error: isError,
    refetch,
    isFetching
  } = useFilteredTransactions(
    rowsPerPage, // Pass the current rowsPerPage
    page,        // Pass the current page
    undefined,   // startDate
    undefined,   // endDate
    {            // Pass all filters directly to the API
      searchTerm,
      searchCategory,
      statusFilter,
      typeFilter
    }
  );

  // Add error handling and logging for API response
  useEffect(() => {
    if (isError) {
      console.error('Error fetching transaction data:', isError);
    }
  }, [isError]);

  // Stats for display - directly from API response with fallbacks
  const totalFilteredRecords = transactionsData?.totalElements || 0;
  const totalPages = transactionsData?.totalPages || 0;
  const displayingStart = transactionsData?.empty ? 0 : page * rowsPerPage + 1;
  const displayingEnd = Math.min((page + 1) * rowsPerPage, totalFilteredRecords);

  // No need for client-side pagination - use the response data directly
  const transactions = transactionsData?.content || [];

  // Log when data changes
  useEffect(() => {
    console.log('Transaction data received:', transactionsData);
    
    // Add more detailed logging to debug page rendering issues
    if (transactionsData) {
      console.log('API Response structure:', {
        totalElements: transactionsData.totalElements,
        totalPages: transactionsData.totalPages,
        contentLength: transactionsData.content?.length || 0,
        emptyResponse: transactionsData.empty,
        firstRecord: transactionsData.content?.[0] ? 'Present' : 'Missing'
      });
      
      // Check for potential problematic values in the first record
      if (transactionsData.content?.length > 0) {
        const firstTransaction = transactionsData.content[0];
        try {
          console.log('First record inspection:', {
            hasId: !!firstTransaction.id,
            hasUserName: !!firstTransaction.userName,
            hasAmount: typeof firstTransaction.amount === 'number',
            hasTimestamp: !!firstTransaction.timestamp,
            senderWorkerId: firstTransaction.senderWorkerId || 'N/A',
            receiverWorkerId: firstTransaction.receiverWorkerId || 'N/A'
          });
          
          // Try parsing the timestamp to check if it's valid
          try {
            const date = new Date(firstTransaction.timestamp);
            console.log('Timestamp parse test:', date.toISOString());
          } catch (e) {
            console.error('Invalid timestamp in first record:', firstTransaction.timestamp);
          }
          
          // Try formatting the amount to check if it's valid
          try {
            const formattedAmount = formatAmount(firstTransaction.amount);
            console.log('Amount format test:', formattedAmount);
          } catch (e) {
            console.error('Invalid amount in first record:', firstTransaction.amount);
          }
        } catch (e) {
          console.error('Error inspecting first record:', e);
        }
      }
    } else if (isError) {
      console.error('Transaction data fetch error detected');
    }
  }, [transactionsData, isError]);

  // Debug effect to log when refetches happen
  useEffect(() => {
    console.log('isFetching:', isFetching);
  }, [isFetching]);

  // Debug effect to track filter changes
  useEffect(() => {
    console.log('FILTER STATE CHANGE:', { 
      typeFilter, 
      isFetching,
      queryKey: ['filteredTransactions', rowsPerPage, page, undefined, undefined, 
        `${searchTerm || ''}-${searchCategory || ''}-${statusFilter || ''}-${typeFilter || ''}`]
    });
  }, [typeFilter, isFetching, rowsPerPage, page, searchTerm, searchCategory, statusFilter]);

  // Debug effect to track the transaction types
  useEffect(() => {
    // Log the first few transactions to see their type values
    if (transactionsData?.content && transactionsData.content.length > 0) {
      const typeCounts: Record<string, number> = {};

      // Count transaction types to understand what values we're getting from API
      transactionsData.content.forEach(transaction => {
        const type = transaction.type || 'undefined';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      console.log('Transaction type distribution:', typeCounts);
      console.log('Current typeFilter value:', typeFilter);
    }
  }, [transactionsData, typeFilter]);

  // Flag transaction mutation
  const { mutate: flagTransaction } = useFlagTransaction({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Transaction flagged successfully',
        severity: 'success'
      });
      refetch();
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Failed to flag transaction',
        severity: 'error'
      });
    }
  });

  // Add note mutation
  const { mutate: addNote } = useAddTransactionNote({
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Note added successfully',
        severity: 'success'
      });
      setNoteDialogOpen(false);
      setNoteText('');
      refetch();
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Failed to add note',
        severity: 'error'
      });
    }
  });

  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    // Page change will trigger a refetch with the new page
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    // RowsPerPage change will trigger a refetch
  };

  // Handle search and filters
  const handleSearchChange = (event: any) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log('%c SEARCH TERM CHANGED', 'background: #4CAF50; color: white; padding: 2px 8px; font-weight: bold;', value);
    setPage(0); // Reset to first page when search changes
  };

  const handleSearchCategoryChange = (category: string) => {
    console.log('%c SEARCH CATEGORY CHANGED', 'background: #2196F3; color: white; padding: 2px 8px; font-weight: bold;', {
      from: searchCategory,
      to: category
    });
    setSearchCategory(category);
    setPage(0); // Reset to first page when category changes
  };

  const handleStatusFilter = (status: string | null) => {
    const newStatus = status === statusFilter ? null : status;
    console.log('Status filter changed to:', newStatus);
    setStatusFilter(newStatus);
    setPage(0); // Reset to first page when status changes
  };

  const handleTypeFilter = (type: string | null) => {
    // Toggle off if the same filter is clicked twice
    const newType = type === typeFilter ? null : type;
    
    console.log('%c Type Filter Changed', 'background: #4caf50; color: white; padding: 2px 6px; border-radius: 2px;', {
      from: typeFilter,
      to: newType,
      filterValues: {
        wallet: "Filters wallet-to-wallet transactions",
        "non-wallet": "Filters non-wallet transactions",
        deposit: "Filters deposit transactions",
        business: "Filters business payment transactions",
        "currency-swap": "Filters currency swap transactions"
      }
    });
    
    setTypeFilter(newType);
    setPage(0); // Reset to first page when type changes
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm('');
    setSearchCategory('all');
    setStatusFilter(null);
    setTypeFilter(null);
    setPage(0);
    // With server-side filtering, we don't need to explicitly refetch as
    // changing the state values will trigger a refetch automatically
    // due to the useFilteredTransactions hook's query key
  };

  // Handle transaction details
  const handleOpenDetails = (transaction: RecentTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTransaction(null);
  };

  // Handle flagging transaction
  const handleFlagTransaction = (transaction: RecentTransaction) => {
    flagTransaction(transaction.id);
  };

  // Handle adding note
  const handleOpenNoteDialog = (transaction: RecentTransaction) => {
    setSelectedTransaction(transaction);
    setNoteDialogOpen(true);
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote({
        transactionId: selectedTransaction!.id,
        note: noteText
      });
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    setSnackbar({
      open: true,
      message: 'Transactions exported successfully',
      severity: 'success'
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Format amount with commas and decimals - with error handling
  const formatAmount = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error, amount);
      return '$0.00';
    }
  };

  // Render status chip with enhanced styling - with error handling
  const renderStatusChip = (status: string) => {
    try {
      const statusKey = status.toLowerCase() as keyof typeof statusColors;
      const colors = statusColors[statusKey] || {
        bg: '#75757515',
        border: '#75757530',
        text: '#757575',
        chip: '#f5f5f5'
      };

      return (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          sx={{
            backgroundColor: colors.chip,
            color: colors.text,
            fontWeight: 'bold',
            borderRadius: '4px',
            border: `1px solid ${colors.border}`,
            '& .MuiChip-label': {
              px: 1
            }
          }}
          size="small"
        />
      );
    } catch (error) {
      console.error('Error rendering status chip:', error, status);
      return <Chip label="Unknown" size="small" />;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    };
    return date.toLocaleTimeString('en-US', options);
  };

  const theme = useTheme();

  // Debug function to test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('%c 🧪 TESTING API CONNECTION', 'background: #000; color: #ff0; padding: 4px 8px; font-weight: bold;');
      const response = await fetch('/api/admin/dashboard/filter-transactions?limit=10&page=0');
      const data = await response.json();
      console.log('✅ API test successful:', data);
      setSnackbar({
        open: true,
        message: `API test successful: ${data.content?.length || 0} records returned`,
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ API test failed:', error);
      setSnackbar({
        open: true,
        message: `API test failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Wrap transaction rendering with try/catch to prevent crashes
  const renderTransactionRow = (transaction: RecentTransaction) => {
    try {
      return (
        <TableRow 
          key={transaction.id}
          sx={{ 
            '&:hover': { 
              backgroundColor: `${theme.palette.primary.main}08`,
              cursor: 'pointer'
            }
          }}
        >
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleOpenDetails(transaction)}
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': { 
                    backgroundColor: `${theme.palette.primary.main}15`,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleFlagTransaction(transaction)}
                sx={{ 
                  color: statusColors.flagged.text,
                  '&:hover': { 
                    backgroundColor: `${statusColors.flagged.bg}15`,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <FlagIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleOpenNoteDialog(transaction)}
                sx={{ 
                  color: theme.palette.info.main,
                  '&:hover': { 
                    backgroundColor: `${theme.palette.info.main}15`,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <NoteAddIcon />
              </IconButton>
            </Box>
          </TableCell>
          <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
            #{transaction.id || 'N/A'}
          </TableCell>
          <TableCell>{transaction.userName || 'N/A'}</TableCell>
          <TableCell>{transaction.senderWorkerId || 'N/A'}</TableCell>
          <TableCell>{transaction.receiverName || 'N/A'}</TableCell>
          <TableCell>{transaction.receiverWorkerId || 'N/A'}</TableCell>
          <TableCell sx={{ fontWeight: 500 }}>
            {transaction.amount ? formatAmount(transaction.amount) : '$0.00'}
          </TableCell>
          <TableCell>
            <Chip 
              label={transaction.type || 'Unknown'} 
              size="small"
              sx={{ 
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.dark,
                fontWeight: 500
              }}
            />
          </TableCell>
          <TableCell>{renderStatusChip(transaction.status || 'Unknown')}</TableCell>
          <TableCell>
            <Typography 
              noWrap 
              sx={{ 
                maxWidth: '200px',
                fontStyle: transaction.description ? 'normal' : 'italic',
                color: transaction.description ? 'inherit' : theme.palette.text.secondary
              }}
            >
              {transaction.description || 'No description'}
            </Typography>
          </TableCell>
          <TableCell>{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A'}</TableCell>
        </TableRow>
      );
    } catch (error) {
      console.error('Error rendering transaction row:', error, transaction);
      return (
        <TableRow key={transaction.id || 'error-row'}>
          <StyledTableCell colSpan={11}>
            <Typography color="error">Error rendering this transaction</Typography>
          </StyledTableCell>
        </TableRow>
      );
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Transaction Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setShowDebug(!showDebug)}
            sx={{ mr: 1 }}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{ backgroundColor: appColor }}
          >
            Export to CSV
          </Button>
        </Box>
      </Box>

      {showDebug && (
        <Paper sx={{ p: 2, mb: 2, background: '#f5f5f5' }}>
          <Typography variant="h6" mb={1}>Debug Tools</Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="contained" 
              color="warning" 
              onClick={testApiConnection}
            >
              Test API Connection
            </Button>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={() => refetch()}
            >
              Force Refetch
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleClearFilters}
            >
              Clear All Filters
            </Button>
          </Box>
          <Typography variant="body2" mt={1}>
            <strong>Total records:</strong> {transactionsData?.totalElements || 0} | <strong>Filtered records:</strong> {totalFilteredRecords}
          </Typography>
          <Typography variant="body2">
            <strong>Displaying:</strong> {totalFilteredRecords > 0 ? `${displayingStart}-${displayingEnd} of ${totalFilteredRecords}` : '0 records'} | 
            <strong>Page:</strong> {page + 1} of {totalPages || 1}
          </Typography>
          <Typography variant="body2">
            <strong>Server-side filtering:</strong> {searchTerm || statusFilter || typeFilter ? 'Active' : 'Inactive'}
          </Typography>
          <Typography variant="body2">
            <strong>Active filters:</strong> 
            {searchTerm ? (
              <Chip 
                size="small" 
                label={`${searchCategory === 'all' ? 'All fields' : searchCategory}: "${searchTerm}"`} 
                sx={{ 
                  ml: 1,
                  bgcolor: `${appColor}15`,
                  color: appColor,
                  fontWeight: 500
                }} 
              />
            ) : null}
            {statusFilter ? (
              <Chip 
                size="small" 
                label={`Status: ${statusFilter}`} 
                sx={{ 
                  ml: 1, 
                  bgcolor: statusColors[statusFilter.toLowerCase() as keyof typeof statusColors]?.chip || '#f5f5f5',
                  color: statusColors[statusFilter.toLowerCase() as keyof typeof statusColors]?.text || '#757575',
                  fontWeight: 500
                }} 
              />
            ) : null}
            {typeFilter ? (
              <Chip 
                size="small" 
                label={`Type: ${typeFilter}`} 
                sx={{ 
                  ml: 1,
                  bgcolor: typeColors[typeFilter.replace('-', '') as keyof typeof typeColors]?.chip || '#f5f5f5',
                  color: typeColors[typeFilter.replace('-', '') as keyof typeof typeColors]?.text || '#757575',
                  fontWeight: 500
                }} 
              />
            ) : null}
            {!searchTerm && !statusFilter && !typeFilter ? <span>None</span> : null}
            
            {/* Compound search indicator */}
            {(searchTerm && (statusFilter || typeFilter)) || (statusFilter && typeFilter) ? (
              <Chip 
                size="small" 
                label="Compound search" 
                sx={{ 
                  ml: 1,
                  bgcolor: '#4a148c15',
                  color: '#4a148c',
                  fontWeight: 600
                }} 
              />
            ) : null}
            
            {/* Number of matched results */}
            <Box sx={{ mt: 1, display: 'inline-block', ml: 1 }}>
              <Chip 
                size="small" 
                label={`${totalFilteredRecords} results`} 
                sx={{ 
                  bgcolor: '#e0e0e0',
                  color: 'text.primary',
                  fontWeight: 600
                }} 
              />
            </Box>
          </Typography>
          <Typography variant="body2" mt={1}>
            <strong>API Status:</strong> {isFetching ? 'Loading...' : 'Idle'} | <strong>First:</strong> {String(transactionsData?.first)} | <strong>Last:</strong> {String(transactionsData?.last)} | <strong>Empty:</strong> {String(transactionsData?.empty)}
          </Typography>
        </Paper>
      )}

      {/* Dashboard Cards */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={3}>
            <ProcessingTimeCard />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <SuccessRateCard />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <ReversalRateCard />
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Search input row */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                placeholder={`Search ${searchCategory === 'all' ? 'all fields' : searchCategory}`}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              
              {/* Compound search indicator */}
              {(searchTerm && (statusFilter || typeFilter)) || (statusFilter && typeFilter) ? (
                <Chip 
                  label="Compound Search Active" 
                  color="secondary"
                  sx={{ 
                    bgcolor: '#4a148c',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    px: 1,
                    py: 2.5
                  }} 
                />
              ) : null}
            </Box>
          </Grid>
          
          {/* Filter options row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Search category filters */}
              <Grid item xs={12} md={5.5}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.secondary }}>
                    Search by:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    <Button 
                      variant={searchCategory === 'all' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('all')}
                      startIcon={<AllInclusiveIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'all' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'all' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'all' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      All Fields
                    </Button>
                    <Button 
                      variant={searchCategory === 'id' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('id')}
                      startIcon={<ReceiptIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'id' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'id' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'id' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      Transaction ID
                    </Button>
                    <Button 
                      variant={searchCategory === 'sender' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('sender')}
                      startIcon={<PersonIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'sender' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'sender' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'sender' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      Sender
                    </Button>
                    <Button 
                      variant={searchCategory === 'senderId' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('senderId')}
                      startIcon={<PersonIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'senderId' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'senderId' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'senderId' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      Sender ID
                    </Button>
                    <Button 
                      variant={searchCategory === 'recipient' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('recipient')}
                      startIcon={<PersonOutlineIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'recipient' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'recipient' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'recipient' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      Recipient
                    </Button>
                    <Button 
                      variant={searchCategory === 'recipientId' ? 'contained' : 'outlined'}
                      onClick={() => handleSearchCategoryChange('recipientId')}
                      startIcon={<PersonOutlineIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: searchCategory === 'recipientId' ? appColor : 'transparent',
                        borderColor: appColor,
                        color: searchCategory === 'recipientId' ? 'white' : appColor,
                        '&:hover': { bgcolor: searchCategory === 'recipientId' ? appColor : `${appColor}20` },
                        borderRadius: '20px',
                        px: 1.5
                      }}
                    >
                      Recipient ID
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              {/* Vertical Divider */}
              <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
              </Grid>
              
              {/* Status filters */}
              <Grid item xs={12} md={5.5}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: theme.palette.text.secondary }}>
                    Filter by status:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Button 
                      variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusFilter('completed')}
                      size="small"
                      sx={{ 
                        bgcolor: statusFilter === 'completed' ? statusColors.completed.chip : 'transparent',
                        borderColor: statusColors.completed.border,
                        color: statusColors.completed.text,
                        fontWeight: statusFilter === 'completed' ? 'bold' : 'normal',
                        '&:hover': { bgcolor: statusColors.completed.chip },
                        borderRadius: '20px',
                        px: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      Completed
                    </Button>
                    <Button 
                      variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusFilter('pending')}
                      size="small"
                      sx={{ 
                        bgcolor: statusFilter === 'pending' ? statusColors.pending.chip : 'transparent',
                        borderColor: statusColors.pending.border,
                        color: statusColors.pending.text,
                        fontWeight: statusFilter === 'pending' ? 'bold' : 'normal',
                        '&:hover': { bgcolor: statusColors.pending.chip },
                        borderRadius: '20px',
                        px: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant={statusFilter === 'failed' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusFilter('failed')}
                      size="small"
                      sx={{ 
                        bgcolor: statusFilter === 'failed' ? statusColors.failed.chip : 'transparent',
                        borderColor: statusColors.failed.border,
                        color: statusColors.failed.text,
                        fontWeight: statusFilter === 'failed' ? 'bold' : 'normal',
                        '&:hover': { bgcolor: statusColors.failed.chip },
                        borderRadius: '20px',
                        px: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      Failed
                    </Button>
                    <Button 
                      variant={statusFilter === 'reversed' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusFilter('reversed')}
                      size="small"
                      sx={{ 
                        bgcolor: statusFilter === 'reversed' ? statusColors.flagged.chip : 'transparent',
                        borderColor: statusColors.flagged.border,
                        color: statusColors.flagged.text,
                        fontWeight: statusFilter === 'reversed' ? 'bold' : 'normal',
                        '&:hover': { bgcolor: statusColors.flagged.chip },
                        borderRadius: '20px',
                        px: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      Reversed
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Type and clear filters row */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 1,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.secondary }}>
                      Transaction type:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Button 
                        variant={typeFilter === 'wallet' ? 'contained' : 'outlined'}
                        onClick={() => handleTypeFilter('wallet')}
                        size="small"
                        sx={{ 
                          bgcolor: typeFilter === 'wallet' ? typeColors.wallet.chip : 'transparent',
                          borderColor: typeColors.wallet.border,
                          color: typeColors.wallet.text,
                          fontWeight: typeFilter === 'wallet' ? 'bold' : 'normal',
                          '&:hover': { bgcolor: typeColors.wallet.chip },
                          borderRadius: '20px',
                          px: 1.5
                        }}
                      >
                        Wallet
                      </Button>
                      <Button 
                        variant={typeFilter === 'non-wallet' ? 'contained' : 'outlined'}
                        onClick={() => handleTypeFilter('non-wallet')}
                        size="small"
                        sx={{ 
                          bgcolor: typeFilter === 'non-wallet' ? typeColors.nonWallet.chip : 'transparent',
                          borderColor: typeColors.nonWallet.border,
                          color: typeColors.nonWallet.text,
                          fontWeight: typeFilter === 'non-wallet' ? 'bold' : 'normal',
                          '&:hover': { bgcolor: typeColors.nonWallet.chip },
                          borderRadius: '20px',
                          px: 1.5
                        }}
                      >
                        Non-Wallet
                      </Button>
                      <Button 
                        variant={typeFilter === 'deposit' ? 'contained' : 'outlined'}
                        onClick={() => handleTypeFilter('deposit')}
                        size="small"
                        sx={{ 
                          bgcolor: typeFilter === 'deposit' ? typeColors.deposit.chip : 'transparent',
                          borderColor: typeColors.deposit.border,
                          color: typeColors.deposit.text,
                          fontWeight: typeFilter === 'deposit' ? 'bold' : 'normal',
                          '&:hover': { bgcolor: typeColors.deposit.chip },
                          borderRadius: '20px',
                          px: 1.5
                        }}
                      >
                        Deposit
                      </Button>
                      <Button 
                        variant={typeFilter === 'business' ? 'contained' : 'outlined'}
                        onClick={() => handleTypeFilter('business')}
                        size="small"
                        sx={{ 
                          bgcolor: typeFilter === 'business' ? typeColors.business.chip : 'transparent',
                          borderColor: typeColors.business.border,
                          color: typeColors.business.text,
                          fontWeight: typeFilter === 'business' ? 'bold' : 'normal',
                          '&:hover': { bgcolor: typeColors.business.chip },
                          borderRadius: '20px',
                          px: 1.5
                        }}
                      >
                        Business Payment
                      </Button>
                      <Button 
                        variant={typeFilter === 'currency-swap' ? 'contained' : 'outlined'}
                        onClick={() => handleTypeFilter('currency-swap')}
                        size="small"
                        sx={{ 
                          bgcolor: typeFilter === 'currency-swap' ? typeColors.currencySwap.chip : 'transparent',
                          borderColor: typeColors.currencySwap.border,
                          color: typeColors.currencySwap.text,
                          fontWeight: typeFilter === 'currency-swap' ? 'bold' : 'normal',
                          '&:hover': { bgcolor: typeColors.currencySwap.chip },
                          borderRadius: '20px',
                          px: 1.5
                        }}
                      >
                        Currency Swap
                      </Button>
                    </Box>
                  </Box>
                  
                  {(searchTerm || statusFilter || typeFilter || searchCategory !== 'all') && (
                    <Button 
                      variant="outlined"
                      startIcon={<FilterListIcon />} 
                      onClick={handleClearFilters}
                      size="medium"
                      sx={{ 
                        height: 'fit-content', 
                        alignSelf: 'flex-end', 
                        borderRadius: '20px',
                        px: 2
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        {/* Active filters summary above table */}
        {(searchTerm || statusFilter || typeFilter) && (
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Showing {totalFilteredRecords} {totalFilteredRecords === 1 ? 'transaction' : 'transactions'} matching:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchTerm && (
                <Chip 
                  size="small" 
                  label={`${searchCategory === 'all' ? 'All fields' : searchCategory}: "${searchTerm}"`} 
                  onDelete={() => setSearchTerm('')}
                  sx={{ 
                    bgcolor: `${appColor}15`,
                    color: appColor,
                    fontWeight: 500
                  }} 
                />
              )}
              {statusFilter && (
                <Chip 
                  size="small" 
                  label={`Status: ${statusFilter}`} 
                  onDelete={() => setStatusFilter(null)}
                  sx={{ 
                    bgcolor: statusColors[statusFilter.toLowerCase() as keyof typeof statusColors]?.chip || '#f5f5f5',
                    color: statusColors[statusFilter.toLowerCase() as keyof typeof statusColors]?.text || '#757575',
                    fontWeight: 500
                  }} 
                />
              )}
              {typeFilter && (
                <Chip 
                  size="small" 
                  label={`Type: ${typeFilter}`} 
                  onDelete={() => setTypeFilter(null)}
                  sx={{ 
                    bgcolor: typeColors[typeFilter.replace('-', '') as keyof typeof typeColors]?.chip || '#f5f5f5',
                    color: typeColors[typeFilter.replace('-', '') as keyof typeof typeColors]?.text || '#757575',
                    fontWeight: 500
                  }} 
                />
              )}
              <Button 
                size="small"
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<FilterListIcon />}
                sx={{ height: 24, fontSize: '0.75rem' }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        )}
        
        <TableContainer sx={{ 
          maxHeight: 'calc(100vh - 300px)', // Increased height
          minHeight: '400px',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}> {/* Minimum width set */}
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: 'bold',
                    width: '120px' // Fixed width for actions
                  }}
                >
                  Actions
                </TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '150px' }}>ID</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '180px' }}>From</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '150px' }}>Sender ID</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '180px' }}>To</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '150px' }}>Receiver ID</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '120px' }}>Amount</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '120px' }}>Type</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '120px' }}>Status</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '200px' }}>Description</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold', width: '150px' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <StyledTableCell align="center" sx={{ p: 3, textAlign: 'center' }} colSpan={11}>
                    <CircularProgress />
                  </StyledTableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <StyledTableCell sx={{ p: 3, textAlign: 'center' }} colSpan={11}>
                    <Alert severity="error">
                      Error loading transactions. Please try refreshing the page.
                    </Alert>
                    <Button 
                      variant="outlined" 
                      onClick={() => refetch()} 
                      sx={{ mt: 2 }}
                    >
                      Retry
                    </Button>
                  </StyledTableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <StyledTableCell sx={{ p: 3, textAlign: 'center' }} colSpan={11}>
                    <Typography>
                      No transactions found matching your criteria.
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              ) : (
                transactions.map(transaction => renderTransactionRow(transaction))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Update TablePagination to use server-side values */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalFilteredRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-select': {
              backgroundColor: `${theme.palette.primary.main}10`,
              borderRadius: 1,
              p: 0.5,
            },
            '.MuiTablePagination-displayedRows': {
              fontWeight: 500,
            },
            '.MuiTablePagination-actions': {
              '.MuiIconButton-root': {
                color: theme.palette.primary.main,
                '&.Mui-disabled': {
                  color: theme.palette.action.disabled,
                },
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                },
              },
            },
          }}
        />
      </Paper>

      {/* Transaction Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedTransaction && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Transaction Details</Typography>
              <IconButton onClick={handleCloseDetails} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {renderStatusChip(selectedTransaction.status)}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatAmount(selectedTransaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                  <Typography variant="body1">{selectedTransaction.type}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
                  <Typography variant="body1">
                    {formatDate(new Date(selectedTransaction.timestamp))} {formatTime(new Date(selectedTransaction.timestamp))}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reference ID</Typography>
                  <Typography variant="body1">#{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedTransaction.userName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{selectedTransaction.senderPhone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Sender ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedTransaction.senderWorkerId || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Sender Information</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedTransaction.userName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{selectedTransaction.senderPhone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Sender ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedTransaction.senderWorkerId || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Recipient Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedTransaction.receiverName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{selectedTransaction.receiverPhone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Receiver ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedTransaction.receiverWorkerId || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Box>
                <Button
                  startIcon={<FlagIcon />}
                  onClick={() => handleFlagTransaction(selectedTransaction)}
                  sx={{ mr: 1 }}
                >
                  Flag Transaction
                </Button>
                <Button
                  startIcon={<NoteAddIcon />}
                  onClick={() => handleOpenNoteDialog(selectedTransaction)}
                  sx={{ mr: 1 }}
                >
                  Add Note
                </Button>
              </Box>
              <Button onClick={handleCloseDetails} variant="contained" sx={{ backgroundColor: appColor }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Note Dialog */}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions; 