import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

// Import hooks
import {
  useTransactionVolume,
  useTransactionSuccessRate,
  useTransactionTypeDistribution,
  useAverageTransactionValue,
  useUserRegistrations,
  useUserRegistrationCount,
  useActiveUsers,
  useActiveUserCount,
  useUserRetention,
  usePaydayCycleAnalysis,
  useGeographicDistribution,
  useTransactionValue,
  useFeeRevenue,
  useTransactionCorridors,
  useRefreshReports,
  useSavedReportConfigurations,
  useSaveReportConfiguration,
  useUpdateReportConfiguration,
  useDeleteReportConfiguration,
  useExportReport
} from '../hooks/useReports';

// Import export utilities
import * as reportExportUtils from '../utils/reportExportUtils';

// Import types
import { TimeFrame, ReportFilters, VisualizationType, SavedReportConfiguration, ExportFormat, CurrencyOption, TransactionTypeOption, TransactionStatusOption } from '../types/reports';

// Import components
import ReportChart from '../components/ReportChart';

// Import service
import * as reportService from '../services/reportService';

// Define colors for charts
const CHART_COLORS = ['#18859A', '#F44336', '#4CAF50', '#FFC107', '#9C27B0', '#FF9800'];
const PIE_COLORS = ['#18859A', '#26A69A', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'];

// Currency options with display labels
const CURRENCY_OPTIONS = [
  { value: 'ALL', label: 'All Currencies' },
  { value: 'USD', label: 'USD' },
  { value: 'EURO', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
  { value: 'UGX', label: 'UGX' },
  { value: 'BIRR', label: 'BIRR' }
];

// Transaction type options with display labels
const TRANSACTION_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 1, label: 'Wallet-to-Wallet' },
  { value: 2, label: 'Deposit' },
  { value: 3, label: 'Non-Wallet Remittance' },
  { value: 4, label: 'Business Payment' },
  { value: 5, label: 'Currency Swap' }
];

// Transaction status options with display labels
const TRANSACTION_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Failed' },
  { value: 4, label: 'Reversed' },
  { value: 5, label: 'Canceled' }
];

// Retention-specific options (unique to User Retention)
const RETENTION_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly Cycles' },
  { value: 'payday', label: 'Payday Cycles' },
  { value: 'quarterly', label: 'Seasonal Cycles' }
];

const ACTIVITY_DEFINITION_OPTIONS = [
  { value: 'transaction', label: 'Completed Transaction' },
  { value: 'login', label: 'Platform Login' },
  { value: 'any_activity', label: 'Any Platform Activity' }
];

const Reports = () => {
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // State for time frame
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  
  // State for visualization type
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('line');
  
  // State for new filters
  const [currency, setCurrency] = useState<CurrencyOption>('ALL');
  const [transactionTypeId, setTransactionTypeId] = useState<TransactionTypeOption>('ALL');
  const [transactionStatusId, setTransactionStatusId] = useState<TransactionStatusOption>('ALL');
  
  // State for retention-specific filters
  const [retentionType, setRetentionType] = useState('monthly');
  const [activityDefinition, setActivityDefinition] = useState('transaction');
  const [includeIncompleteCohorts, setIncludeIncompleteCohorts] = useState(false);
  
  // State for export menu
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentExportData, setCurrentExportData] = useState<{
    data: any[];
    type: string;
    title: string;
  } | null>(null);
  
  // State for saved configurations
  const [saveConfigDialogOpen, setSaveConfigDialogOpen] = useState(false);
  const [savedConfigName, setSavedConfigName] = useState('');
  const [savedConfigDescription, setSavedConfigDescription] = useState('');
  const [savedConfigMenuAnchor, setSavedConfigMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Create filters object
  const filters: ReportFilters = {
    startDate,
    endDate,
    timeFrame,
    visualizationType,
    currency,
    transactionTypeId,
    transactionStatusId
  };
  
  // Use hooks to fetch data
  const { data: transactionVolumeData, isLoading: transactionVolumeLoading, error: transactionVolumeError } = useTransactionVolume(filters);
  const { data: transactionSuccessRateData, isLoading: transactionSuccessRateLoading, error: transactionSuccessRateError } = useTransactionSuccessRate(filters);
  const { data: transactionTypeDistributionData, isLoading: transactionTypeDistributionLoading, error: transactionTypeDistributionError } = useTransactionTypeDistribution(filters);
  const { data: averageTransactionValueData, isLoading: averageTransactionValueLoading, error: averageTransactionValueError } = useAverageTransactionValue(filters);
  
  const { data: userRegistrationsResponse, isLoading: userRegistrationsLoading, error: userRegistrationsError } = useUserRegistrations(filters);
  const { data: userRegistrationCountResponse, isLoading: userRegistrationCountLoading, error: userRegistrationCountError } = useUserRegistrationCount(filters);
  const { data: activeUsersResponse, isLoading: activeUsersLoading, error: activeUsersError } = useActiveUsers(filters);
  const { data: activeUserCountResponse, isLoading: activeUserCountLoading, error: activeUserCountError } = useActiveUserCount(filters);
  const { data: userRetentionResponse, isLoading: userRetentionLoading, error: userRetentionError } = useUserRetention(filters);
  const { data: paydayCycleResponse, isLoading: paydayCycleLoading, error: paydayCycleError } = usePaydayCycleAnalysis(filters);
  const { data: geographicDistributionData, isLoading: geographicDistributionLoading, error: geographicDistributionError } = useGeographicDistribution(filters);
  
  const { data: transactionValueData, isLoading: transactionValueLoading, error: transactionValueError } = useTransactionValue(filters);
  const { data: feeRevenueData, isLoading: feeRevenueLoading, error: feeRevenueError } = useFeeRevenue(filters);
  const { data: transactionCorridorsData, isLoading: transactionCorridorsLoading, error: transactionCorridorsError } = useTransactionCorridors(filters);
  
  // Calculate total registrations in the filtered period using the helper function
  const totalRegistrationsInPeriod = reportService.getTotalRegistrationsFromFiltered(userRegistrationsResponse);
  
  // Calculate percentage of active users to registered users (using filtered period data)
  const activeUserPercentage = (userRegistrationCountResponse && userRegistrationCountResponse > 0) ? 
    ((activeUserCountResponse || 0) / userRegistrationCountResponse * 100).toFixed(1) : '0.0';
  
  // Debug logging for User Reports cards
  console.log('🎯 User Reports Debug:', {
    filters: {
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
      timeFrame: timeFrame
    },
    userRegistrationsResponse: {
      dataLength: Array.isArray(userRegistrationsResponse?.data) ? userRegistrationsResponse.data.length : 'Not an array',
      total: userRegistrationsResponse?.total,
      sampleData: Array.isArray(userRegistrationsResponse?.data) ? userRegistrationsResponse.data.slice(0, 3) : userRegistrationsResponse?.data
    },
    userRegistrationCountResponse: userRegistrationCountResponse,
    activeUserCountResponse: activeUserCountResponse,
    totalRegistrationsInPeriod: totalRegistrationsInPeriod,
    activeUserPercentage: activeUserPercentage,
    isLoading: {
      userRegistrations: userRegistrationsLoading,
      userRegistrationCount: userRegistrationCountLoading,
      activeUserCount: activeUserCountLoading
    },
    errors: {
      userRegistrations: userRegistrationsError,
      userRegistrationCount: userRegistrationCountError,
      activeUserCount: activeUserCountError
    }
  });
  
  // Debug logging for Financial Reports
  console.log('💰 Financial Reports Debug:', {
    filters: {
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
      timeFrame: timeFrame,
      currency: currency,
      transactionTypeId: transactionTypeId,
      transactionStatusId: transactionStatusId
    },
    transactionValueData: {
      dataLength: Array.isArray(transactionValueData) ? transactionValueData.length : 'Not an array',
      sampleData: Array.isArray(transactionValueData) ? transactionValueData.slice(0, 3) : transactionValueData,
      totalValue: Array.isArray(transactionValueData) ? transactionValueData.reduce((sum, item) => sum + item.value, 0) : 'N/A'
    },
    isLoading: {
      transactionValue: transactionValueLoading,
      feeRevenue: feeRevenueLoading,
      transactionCorridors: transactionCorridorsLoading
    },
    errors: {
      transactionValue: transactionValueError,
      feeRevenue: feeRevenueError,
      transactionCorridors: transactionCorridorsError
    }
  });
  
  // Extract data and totals
  const userRegistrationsData = userRegistrationsResponse?.data || [];
  const totalRegisteredUsers = userRegistrationsResponse?.total || 0;
  const activeUsersData = activeUsersResponse?.data || [];
  const totalActiveUsers = activeUsersResponse?.total || 0;
  const uniqueActiveUsers = activeUsersResponse?.uniqueActiveUsers || 0;
  
  // Extract retention data
  const userRetentionData = userRetentionResponse?.data || [];
  const retentionMetadata = userRetentionResponse?.metadata;
  
  // Extract payday cycle data
  const paydayCycleData = paydayCycleResponse?.data || [];
  const paydayCycleMetadata = paydayCycleResponse?.metadata;
  
  // Get saved configurations
  const { data: savedConfigurations, isLoading: savedConfigurationsLoading } = useSavedReportConfigurations();
  
  // Mutations for saved configurations
  const saveConfiguration = useSaveReportConfiguration();
  const updateConfiguration = useUpdateReportConfiguration();
  const deleteConfiguration = useDeleteReportConfiguration();
  
  // Export mutation
  const exportReport = useExportReport();
  
  // Get refresh function
  const refreshReports = useRefreshReports();
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refreshReports();
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };
  
  // Handle time frame change
  const handleTimeFrameChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value as TimeFrame);
  };
  
  // Handle visualization type change
  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVisualizationType(type);
  };
  
  // Handle currency change
  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as CurrencyOption);
  };
  
  // Handle transaction type change
  const handleTransactionTypeChange = (event: SelectChangeEvent) => {
    setTransactionTypeId(event.target.value as TransactionTypeOption);
  };
  
  // Handle transaction status change
  const handleTransactionStatusChange = (event: SelectChangeEvent) => {
    setTransactionStatusId(event.target.value as TransactionStatusOption);
  };
  
  // Handle retention-specific filters
  const handleRetentionTypeChange = (event: SelectChangeEvent) => {
    setRetentionType(event.target.value);
  };
  
  const handleActivityDefinitionChange = (event: SelectChangeEvent) => {
    setActivityDefinition(event.target.value);
  };
  
  const handleIncludeIncompleteCohortsChange = (event: any) => {
    setIncludeIncompleteCohorts(event.target.checked);
  };
  
  // Handle export menu open
  const handleExportMenuOpen = (event: any, data: any[], type: string, title: string) => {
    setExportMenuAnchor(event.currentTarget);
    setCurrentExportData({ data, type, title });
  };
  
  // Handle export menu close
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };
  
  // Handle export
  const handleExport = (format: ExportFormat) => {
    if (!currentExportData) return;
    
    const { data, type, title } = currentExportData;
    
    switch (format) {
      case 'csv':
        handleExportToCSV();
        break;
      case 'excel':
        handleExportToExcel();
        break;
      case 'pdf':
        handleExportToPDF();
        break;
    }
    
    handleExportMenuClose();
  };
  
  // Handle export to CSV
  const handleExportToCSV = () => {
    if (!currentExportData) return;
    
    const { data, type } = currentExportData;
    
    switch (type) {
      case 'transactionVolume':
        reportExportUtils.exportTransactionVolumeToCSV(data);
        break;
      case 'transactionSuccessRate':
        reportExportUtils.exportTransactionSuccessRateToCSV(data);
        break;
      case 'transactionTypeDistribution':
        reportExportUtils.exportTransactionTypeDistributionToCSV(data);
        break;
      case 'averageTransactionValue':
        reportExportUtils.exportAverageTransactionValueToCSV(data);
        break;
      case 'userRegistrations':
        reportExportUtils.exportUserRegistrationsToCSV(data);
        break;
      case 'activeUsers':
        reportExportUtils.exportActiveUsersToCSV(data);
        break;
      case 'userRetention':
        reportExportUtils.exportUserRetentionToCSV(data);
        break;
      case 'geographicDistribution':
        reportExportUtils.exportGeographicDistributionToCSV(data);
        break;
      case 'transactionValue':
        reportExportUtils.exportTransactionValueToCSV(data);
        break;
      case 'feeRevenue':
        reportExportUtils.exportFeeRevenueToCSV(data);
        break;
      case 'transactionCorridors':
        reportExportUtils.exportTransactionCorridorsToCSV(data);
        break;
      case 'paydayCycleAnalysis':
        reportExportUtils.exportTransactionCorridorsToCSV(data);
        break;
    }
  };
  
  // Handle export to Excel
  const handleExportToExcel = () => {
    if (!currentExportData) return;
    
    const { data, type, title } = currentExportData;
    let headers: Record<string, string> = {};
    let filename = '';
    
    switch (type) {
      case 'transactionVolume':
        headers = { date: 'Date', count: 'Transaction Count' };
        filename = 'transaction-volume';
        break;
      case 'transactionSuccessRate':
        headers = { date: 'Date', successRate: 'Success Rate (%)', failureRate: 'Failure Rate (%)' };
        filename = 'transaction-success-rate';
        break;
      case 'transactionTypeDistribution':
        headers = { type: 'Transaction Type', count: 'Count', percentage: 'Percentage (%)' };
        filename = 'transaction-type-distribution';
        break;
      case 'averageTransactionValue':
        headers = { date: 'Date', averageValue: 'Average Value' };
        filename = 'average-transaction-value';
        break;
      case 'userRegistrations':
        headers = { date: 'Date', count: 'New Registrations' };
        filename = 'user-registrations';
        break;
      case 'activeUsers':
        headers = { date: 'Date', activeUsers: 'Active Users' };
        filename = 'active-users';
        break;
      case 'userRetention':
        headers = { cohort: 'Cohort', week1: 'Week 1 (%)', week2: 'Week 2 (%)', week3: 'Week 3 (%)', week4: 'Week 4 (%)' };
        filename = 'user-retention';
        break;
      case 'geographicDistribution':
        headers = { country: 'Country', count: 'User Count', percentage: 'Percentage (%)' };
        filename = 'geographic-distribution';
        break;
      case 'transactionValue':
        headers = { date: 'Date', value: 'Total Value' };
        filename = 'transaction-value';
        break;
      case 'feeRevenue':
        headers = { date: 'Date', revenue: 'Fee Revenue' };
        filename = 'fee-revenue';
        break;
      case 'transactionCorridors':
        headers = { 
          fromCountry: 'From Country',
          toCountry: 'To Country', 
          corridor: 'Corridor', 
          transactionCount: 'Transaction Count', 
          totalValue: 'Total Value ($)',
          averageValue: 'Average Value ($)',
          transactionPercentage: 'Transaction %',
          valuePercentage: 'Value %'
        };
        filename = 'transaction-corridors';
        break;
      case 'paydayCycleAnalysis':
        headers = { period: 'Period', dayRange: 'Day Range', transactionCount: 'Transaction Count', uniqueUsers: 'Unique Users', percentageOfVolume: 'Volume %', averageTransactionSize: 'Avg Transaction Size' };
        filename = 'payday-cycle-analysis';
        break;
    }
    
    reportExportUtils.exportToExcel(data, headers, `${filename}-${format(new Date(), 'yyyy-MM-dd')}`);
    handleExportMenuClose();
  };
  
  // Handle export to PDF
  const handleExportToPDF = () => {
    if (!currentExportData) return;
    
    const { data, type, title } = currentExportData;
    let headers: Record<string, string> = {};
    let filename = '';
    
    switch (type) {
      case 'transactionVolume':
        headers = { date: 'Date', count: 'Transaction Count' };
        filename = 'transaction-volume';
        break;
      case 'transactionSuccessRate':
        headers = { date: 'Date', successRate: 'Success Rate (%)', failureRate: 'Failure Rate (%)' };
        filename = 'transaction-success-rate';
        break;
      case 'transactionTypeDistribution':
        headers = { type: 'Transaction Type', count: 'Count', percentage: 'Percentage (%)' };
        filename = 'transaction-type-distribution';
        break;
      case 'averageTransactionValue':
        headers = { date: 'Date', averageValue: 'Average Value' };
        filename = 'average-transaction-value';
        break;
      case 'userRegistrations':
        headers = { date: 'Date', count: 'New Registrations' };
        filename = 'user-registrations';
        break;
      case 'activeUsers':
        headers = { date: 'Date', activeUsers: 'Active Users' };
        filename = 'active-users';
        break;
      case 'userRetention':
        headers = { cohort: 'Cohort', week1: 'Week 1 (%)', week2: 'Week 2 (%)', week3: 'Week 3 (%)', week4: 'Week 4 (%)' };
        filename = 'user-retention';
        break;
      case 'geographicDistribution':
        headers = { country: 'Country', count: 'User Count', percentage: 'Percentage (%)' };
        filename = 'geographic-distribution';
        break;
      case 'transactionValue':
        headers = { date: 'Date', value: 'Total Value' };
        filename = 'transaction-value';
        break;
      case 'feeRevenue':
        headers = { date: 'Date', revenue: 'Fee Revenue' };
        filename = 'fee-revenue';
        break;
      case 'transactionCorridors':
        headers = { 
          fromCountry: 'From Country',
          toCountry: 'To Country', 
          corridor: 'Corridor', 
          transactionCount: 'Transaction Count', 
          totalValue: 'Total Value ($)',
          averageValue: 'Average Value ($)',
          transactionPercentage: 'Transaction %',
          valuePercentage: 'Value %'
        };
        filename = 'transaction-corridors';
        break;
      case 'paydayCycleAnalysis':
        headers = { period: 'Period', dayRange: 'Day Range', transactionCount: 'Transaction Count', uniqueUsers: 'Unique Users', percentageOfVolume: 'Volume %', averageTransactionSize: 'Avg Transaction Size' };
        filename = 'payday-cycle-analysis';
        break;
    }
    
    reportExportUtils.exportToPDF(data, headers, title, `${filename}-${format(new Date(), 'yyyy-MM-dd')}`);
    handleExportMenuClose();
  };
  
  // Handle saved configuration menu open
  const handleSavedConfigMenuOpen = (event: any) => {
    setSavedConfigMenuAnchor(event.currentTarget);
  };
  
  // Handle saved configuration menu close
  const handleSavedConfigMenuClose = () => {
    setSavedConfigMenuAnchor(null);
  };
  
  // Handle save configuration dialog open
  const handleSaveConfigDialogOpen = () => {
    setSaveConfigDialogOpen(true);
    setSavedConfigName('');
    setSavedConfigDescription('');
    handleSavedConfigMenuClose();
  };
  
  // Handle save configuration dialog close
  const handleSaveConfigDialogClose = () => {
    setSaveConfigDialogOpen(false);
  };
  
  // Handle save configuration
  const handleSaveConfiguration = () => {
    if (!savedConfigName) return;
    
    const reportType = getReportTypeFromTabValue(tabValue);
    
    saveConfiguration.mutate({
      name: savedConfigName,
      description: savedConfigDescription || undefined,
      reportType,
      filters
    }, {
      onSuccess: () => {
        handleSaveConfigDialogClose();
      }
    });
  };
  
  // Handle load configuration
  const handleLoadConfiguration = (config: SavedReportConfiguration) => {
    setStartDate(new Date(config.filters.startDate));
    setEndDate(new Date(config.filters.endDate));
    setTimeFrame(config.filters.timeFrame);
    setVisualizationType(config.filters.visualizationType || 'line');
    
    // Set new filter values with fallbacks to 'ALL'
    setCurrency(config.filters.currency || 'ALL');
    setTransactionTypeId(config.filters.transactionTypeId || 'ALL');
    setTransactionStatusId(config.filters.transactionStatusId || 'ALL');
    
    // Set tab based on report type
    const tabIndex = getTabValueFromReportType(config.reportType);
    if (tabIndex !== -1) {
      setTabValue(tabIndex);
    }
    
    handleSavedConfigMenuClose();
  };
  
  // Handle delete configuration
  const handleDeleteConfiguration = (id: string) => {
    deleteConfiguration.mutate(id);
    handleSavedConfigMenuClose();
  };
  
  // Helper to get report type from tab value
  const getReportTypeFromTabValue = (tab: number): string => {
    switch (tab) {
      case 0: return 'transactionVolume';
      case 1: return 'userRegistrations';
      case 2: return 'feeRevenue';
      case 3: return 'userRetention';
      default: return 'transactionVolume';
    }
  };
  
  // Helper to get tab value from report type
  const getTabValueFromReportType = (reportType: string): number => {
    switch (reportType) {
      case 'transactionVolume': return 0;
      case 'userRegistrations': return 1;
      case 'feeRevenue': return 2;
      case 'userRetention': return 3;
      default: return -1;
    }
  };
  
  // Render filter controls
  const renderFilterControls = () => {
    // Determine if transaction-specific filters should be enabled
    const enableTransactionFilters = tabValue === 0 || tabValue === 2; // Transaction Reports or Financial Reports
    
    // Determine if retention-specific filters should be shown
    const showRetentionFilters = tabValue === 3; // Retention Report tab
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => date && setStartDate(date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => date && setEndDate(date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="time-frame-label">Time Frame</InputLabel>
                <Select
                  labelId="time-frame-label"
                  value={timeFrame}
                  onChange={handleTimeFrameChange}
                  label="Time Frame"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Retention-specific filters - only show on User Reports tab */}
            {showRetentionFilters && (
              <>
                {/* Retention Type Filter */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="retention-type-label">Retention Cycle</InputLabel>
                    <Select
                      labelId="retention-type-label"
                      value={retentionType}
                      onChange={handleRetentionTypeChange}
                      label="Retention Cycle"
                    >
                      {RETENTION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Activity Definition Filter */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="activity-definition-label">Activity Type</InputLabel>
                    <Select
                      labelId="activity-definition-label"
                      value={activityDefinition}
                      onChange={handleActivityDefinitionChange}
                      label="Activity Type"
                    >
                      {ACTIVITY_DEFINITION_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            {/* Transaction-specific filters - only show on Transaction/Financial tabs */}
            {!showRetentionFilters && (
              <>
                {/* Currency Filter */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      labelId="currency-label"
                      value={currency}
                      onChange={handleCurrencyChange}
                      label="Currency"
                      disabled={!enableTransactionFilters}
                      sx={{
                        opacity: enableTransactionFilters ? 1 : 0.6,
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: enableTransactionFilters ? 'inherit' : 'rgba(0, 0, 0, 0.38)'
                        }
                      }}
                    >
                      {CURRENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Transaction Type Filter */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="transaction-type-label">Type</InputLabel>
                    <Select
                      labelId="transaction-type-label"
                      value={transactionTypeId}
                      onChange={handleTransactionTypeChange}
                      label="Type"
                      disabled={!enableTransactionFilters}
                      sx={{
                        opacity: enableTransactionFilters ? 1 : 0.6,
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: enableTransactionFilters ? 'inherit' : 'rgba(0, 0, 0, 0.38)'
                        }
                      }}
                    >
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Transaction Status Filter */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="transaction-status-label">Status</InputLabel>
                    <Select
                      labelId="transaction-status-label"
                      value={transactionStatusId}
                      onChange={handleTransactionStatusChange}
                      label="Status"
                      disabled={!enableTransactionFilters}
                      sx={{
                        opacity: enableTransactionFilters ? 1 : 0.6,
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: enableTransactionFilters ? 'inherit' : 'rgba(0, 0, 0, 0.38)'
                        }
                      }}
                    >
                      {TRANSACTION_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
          
          {/* Second row for visualization controls and actions */}
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  Chart Type:
                </Typography>
                <Tooltip title="Line Chart">
                  <IconButton 
                    color={visualizationType === 'line' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('line')}
                    size="small"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Bar Chart">
                  <IconButton 
                    color={visualizationType === 'bar' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('bar')}
                    size="small"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={visualizationType === 'pie' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('pie')}
                    size="small"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11,2V22C5.9,21.5 2,17.2 2,12C2,6.8 5.9,2.5 11,2M13,2V11H22C21.5,6.2 17.8,2.5 13,2M13,13V22C17.7,21.5 21.5,17.8 22,13H13Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Area Chart">
                  <IconButton 
                    color={visualizationType === 'area' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('area')}
                    size="small"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22,21H2V3H4V19H22V21M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleSavedConfigMenuOpen}
                size="small"
              >
                Saved Reports
              </Button>
              
              <IconButton onClick={handleRefresh} color="primary" size="small">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render active filters chips
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    // Only show transaction-specific filters when they are enabled
    const enableTransactionFilters = tabValue === 0 || tabValue === 2; // Transaction Reports or Financial Reports
    
    if (enableTransactionFilters && currency !== 'ALL') {
      const currencyLabel = CURRENCY_OPTIONS.find(opt => opt.value === currency)?.label;
      activeFilters.push({ label: `Currency: ${currencyLabel}`, key: 'currency' });
    }
    
    if (enableTransactionFilters && transactionTypeId !== 'ALL') {
      const typeLabel = TRANSACTION_TYPE_OPTIONS.find(opt => opt.value === transactionTypeId)?.label;
      activeFilters.push({ label: `Type: ${typeLabel}`, key: 'type' });
    }
    
    if (enableTransactionFilters && transactionStatusId !== 'ALL') {
      const statusLabel = TRANSACTION_STATUS_OPTIONS.find(opt => opt.value === transactionStatusId)?.label;
      activeFilters.push({ label: `Status: ${statusLabel}`, key: 'status' });
    }
    
    if (activeFilters.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Active Filters:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={() => {
                if (filter.key === 'currency') setCurrency('ALL');
                if (filter.key === 'type') setTransactionTypeId('ALL');
                if (filter.key === 'status') setTransactionStatusId('ALL');
              }}
            />
          ))}
          <Button
            size="small"
            variant="text"
            color="secondary"
            onClick={() => {
              setCurrency('ALL');
              setTransactionTypeId('ALL');
              setTransactionStatusId('ALL');
            }}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            Clear All
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render transaction reports tab
  const renderTransactionReportsTab = () => {
    return (
      <Grid container spacing={3}>
        {/* Transaction Volume Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Transaction Volume"
            data={transactionVolumeData || []}
            isLoading={transactionVolumeLoading}
            error={transactionVolumeError}
            type="transactionVolume"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <LineChart data={transactionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  // Format depends on timeFrame - for daily show MMM d, for weekly show week number, for monthly show month only
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else if (timeFrame === 'weekly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS[0]} />
              <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS[1]} />
              <RechartsTooltip formatter={(value, name) => {
                if (name === 'count') return [`${value}`, 'Transaction Count'];
                if (name === 'volume') return [`$${Number(value).toLocaleString()}`, 'Transaction Value ($)'];
                return [value, name];
              }} 
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
              }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="count" 
                name="Transaction Count" 
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="volume" 
                name="Transaction Value" 
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* Transaction Success/Failure Rate Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Transaction Success/Failure Rate"
            data={transactionSuccessRateData || []}
            isLoading={transactionSuccessRateLoading}
            error={transactionSuccessRateError}
            type="transactionSuccessRate"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <LineChart data={transactionSuccessRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={50}
                interval="preserveStartEnd"
              />
              <YAxis />
              <RechartsTooltip 
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                name="Success Rate (%)" 
                stroke={CHART_COLORS[2]} 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="failureRate" 
                name="Failure Rate (%)" 
                stroke={CHART_COLORS[1]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* Transaction Types Distribution Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Transaction Types Distribution"
            data={transactionTypeDistributionData || []}
            isLoading={transactionTypeDistributionLoading}
            error={transactionTypeDistributionError}
            type="transactionTypeDistribution"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <PieChart>
              <Pie
                data={transactionTypeDistributionData}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#555555',
                  strokeWidth: 1,
                  strokeDasharray: "2 2"
                }}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  name,
                  percent
                }) => {
                  const RADIAN = Math.PI / 180;
                  // Position the label further from the center
                  const radius = outerRadius * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#333333"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={11} // Smaller font size
                      fontWeight="normal"
                    >
                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {transactionTypeDistributionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ReportChart>
        </Grid>
        
        {/* Average Transaction Value Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Average Transaction Value"
            data={averageTransactionValueData || []}
            isLoading={averageTransactionValueLoading}
            error={averageTransactionValueError}
            type="averageTransactionValue"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <LineChart data={averageTransactionValueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={50}
                interval="preserveStartEnd"
              />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Average Value']}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="averageValue" 
                name="Average Value" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
      </Grid>
    );
  };
  
  // Render user reports tab
  const renderUserReportsTab = () => {
    return (
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Total Registered Users Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    New Registrations
                  </Typography>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {userRegistrationCountLoading ? (
                      <CircularProgress size={24} />
                    ) : userRegistrationCountError ? (
                      <Typography variant="body2" color="error">
                        Error loading data
                      </Typography>
                    ) : (
                      (userRegistrationCountResponse || 0).toLocaleString()
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    In selected period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Total Active Users Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Unique Active Users
                  </Typography>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {activeUserCountLoading ? (
                      <CircularProgress size={24} />
                    ) : activeUserCountError ? (
                      <Typography variant="body2" color="error">
                        Error loading data
                      </Typography>
                    ) : (
                      (activeUserCountResponse || 0).toLocaleString()
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    In selected period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Active User Percentage Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Activity Rate
                  </Typography>
                  <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    {userRegistrationCountLoading || activeUserCountLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      `${activeUserPercentage}%`
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Active vs New Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* New User Registrations Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="New User Registrations"
            data={userRegistrationsData || []}
            isLoading={userRegistrationsLoading}
            error={userRegistrationsError}
            type="userRegistrations"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <BarChart data={userRegistrationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  // Format depends on timeFrame
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else if (timeFrame === 'weekly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } else if (timeFrame === 'yearly') {
                    return new Date(value).getFullYear().toString();
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => [`${value}`, 'New Registrations']}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                }}
              />
              <Bar 
                dataKey="count" 
                name="New Users" 
                fill={CHART_COLORS[0]} 
              />
            </BarChart>
          </ReportChart>
        </Grid>
        
        {/* Active Users Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Active Users"
            data={activeUsersData || []}
            isLoading={activeUsersLoading}
            error={activeUsersError}
            type="activeUsers"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <BarChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  // Format depends on timeFrame
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else if (timeFrame === 'weekly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } else if (timeFrame === 'yearly') {
                    return new Date(value).getFullYear().toString();
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => [`${value}`, 'Active Users']}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                }}
              />
              <Bar 
                dataKey="activeUsers" 
                name="Active Users" 
                fill={CHART_COLORS[0]} 
              />
            </BarChart>
          </ReportChart>
        </Grid>
        
        {/* Geographic Distribution Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="User Geographic Distribution"
            data={geographicDistributionData || []}
            isLoading={geographicDistributionLoading}
            error={geographicDistributionError}
            type="geographicDistribution"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <PieChart>
              <Pie
                data={geographicDistributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="country"
              >
                {geographicDistributionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ReportChart>
        </Grid>
      </Grid>
    );
  };
  
  // Render financial reports tab
  const renderFinancialReportsTab = () => {
    // Calculate financial summary metrics
    const totalFeeRevenue = Array.isArray(feeRevenueData) ? 
      feeRevenueData.reduce((sum, item) => sum + item.revenue, 0) : 0;
    
    const totalTransactions = Array.isArray(feeRevenueData) ? 
      feeRevenueData.reduce((sum, item) => sum + (item.transactionCount || 0), 0) : 0;
    
    const averageFeePerTransaction = totalTransactions > 0 ? 
      totalFeeRevenue / totalTransactions : 0;
    
    const totalTransactionVolume = Array.isArray(feeRevenueData) ? 
      feeRevenueData.reduce((sum, item) => sum + (item.totalTransactionVolume || 0), 0) : 0;
    
    const overallFeeRatio = totalTransactionVolume > 0 ? 
      (totalFeeRevenue / totalTransactionVolume * 100) : 0;
    
    // Calculate period-over-period growth
    const currentPeriodRevenue = Array.isArray(feeRevenueData) && feeRevenueData.length > 0 ? 
      feeRevenueData[feeRevenueData.length - 1]?.revenue || 0 : 0;
    const previousPeriodRevenue = Array.isArray(feeRevenueData) && feeRevenueData.length > 1 ? 
      feeRevenueData[feeRevenueData.length - 2]?.revenue || 0 : 0;
    const revenueGrowthRate = previousPeriodRevenue > 0 ? 
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100) : 0;

    return (
      <Grid container spacing={3}>
        {/* Financial Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f8f9fa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Total Fee Revenue
                  </Typography>
                  {feeRevenueLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" color="primary">
                      ${totalFeeRevenue.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {currency === 'ALL' ? 'All Currencies' : currency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f8f9fa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Avg Fee per Transaction
                  </Typography>
                  {feeRevenueLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" color="success.main">
                      ${averageFeePerTransaction.toFixed(2)}
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Per transaction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f8f9fa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Total Transaction Volume
                  </Typography>
                  {feeRevenueLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h4" color="info.main">
                      ${totalTransactionVolume.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Total processed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', backgroundColor: '#f8f9fa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Fee Ratio
                  </Typography>
                  {feeRevenueLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {overallFeeRatio.toFixed(2)}%
                      </Typography>
                      {revenueGrowthRate !== 0 && (
                        <Typography 
                          variant="body2" 
                          color={revenueGrowthRate >= 0 ? "success.main" : "error.main"}
                          sx={{ mt: 1 }}
                        >
                          {revenueGrowthRate > 0 ? '+' : ''}{revenueGrowthRate.toFixed(1)}% vs last period
                        </Typography>
                      )}
                    </Box>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Of transaction volume
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Total Transaction Value Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Total Transaction Value"
            data={transactionValueData || []}
            isLoading={transactionValueLoading}
            error={transactionValueError}
            type="transactionValue"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <LineChart data={transactionValueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  // Format depends on timeFrame
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else if (timeFrame === 'weekly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } else if (timeFrame === 'yearly') {
                    return new Date(value).getFullYear().toString();
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <RechartsTooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Value']}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Total Value" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* Fee Revenue Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Fee Revenue"
            data={feeRevenueData || []}
            isLoading={feeRevenueLoading}
            error={feeRevenueError}
            type="feeRevenue"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <LineChart data={feeRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  // Format depends on timeFrame
                  if (timeFrame === 'monthly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                  } else if (timeFrame === 'weekly') {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  } else if (timeFrame === 'yearly') {
                    return new Date(value).getFullYear().toString();
                  } else {
                    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
                }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <RechartsTooltip 
                formatter={(value, name) => {
                  if (name === 'Fee Revenue') {
                    return [`$${Number(value).toLocaleString()}`, 'Fee Revenue'];
                  }
                  return [value, name];
                }}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="font-semibold text-gray-800">
                          {new Date(label).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-medium">Fee Revenue:</span> ${Number(data.revenue).toLocaleString()}
                        </p>
                        <p className="text-green-600">
                          <span className="font-medium">Transactions:</span> {Number(data.transactionCount).toLocaleString()}
                        </p>
                        <p className="text-purple-600">
                          <span className="font-medium">Avg Fee:</span> ${Number(data.averageFeePerTransaction).toFixed(2)}
                        </p>
                        {data.growthRate !== null && (
                          <p className={data.growthRate >= 0 ? "text-green-600" : "text-red-600"}>
                            <span className="font-medium">Growth:</span> {data.growthRate > 0 ? '+' : ''}{data.growthRate}%
                          </p>
                        )}
                        <p className="text-gray-600">
                          <span className="font-medium">Volume:</span> ${Number(data.totalTransactionVolume).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Fee Ratio:</span> {data.feeRatio}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Fee Revenue" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* Top Transaction Corridors Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Top Transaction Corridors"
            data={transactionCorridorsData || []}
            isLoading={transactionCorridorsLoading}
            error={transactionCorridorsError}
            type="transactionCorridors"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <BarChart data={transactionCorridorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="corridor" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS[0]} />
              <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS[1]} />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="font-semibold text-gray-800">{data.corridor}</p>
                        <p className="text-blue-600">
                          <span className="font-medium">From:</span> {data.fromCountry}
                        </p>
                        <p className="text-green-600">
                          <span className="font-medium">To:</span> {data.toCountry}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Transactions:</span> {Number(data.transactionCount || data.count).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Total Value:</span> ${Number(data.totalValue || data.value).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Average Value:</span> ${Number(data.averageValue || 0).toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Transaction Share:</span> {Number(data.transactionPercentage || 0).toFixed(1)}%
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Value Share:</span> {Number(data.valuePercentage || 0).toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="count" 
                name="Transaction Count" 
                fill={CHART_COLORS[0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="value" 
                name="Total Value ($)" 
                fill={CHART_COLORS[1]}
              />
              <Legend />
            </BarChart>
          </ReportChart>
        </Grid>
      </Grid>
    );
  };
  
  // Render retention report tab
  const renderRetentionReportTab = () => {
    return (
      <Grid container spacing={3}>
        {/* Retention Insights Summary */}
        <Grid item xs={12}>
          {retentionMetadata && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Retention Insights
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {retentionMetadata.averageMonth1Retention?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Month 1 Retention
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {retentionMetadata.averageMonth2Retention?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Month 2 Retention
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {retentionMetadata.averageMonth3Retention?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Month 3 Retention
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {retentionMetadata.averageMonth6Retention?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Month 6 Retention
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Cohorts Analyzed: {retentionMetadata.totalCohorts}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users: {retentionMetadata.totalUsersAnalyzed?.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* User Retention Chart */}
        <Grid item xs={12}>
          <ReportChart
            title="User Retention Analysis (Monthly Cohorts)"
            data={userRetentionData || []}
            isLoading={userRetentionLoading}
            error={userRetentionError}
            type="userRetention"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <BarChart data={userRetentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort" />
              <YAxis 
                label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip 
                formatter={(value, name) => {
                  const period = name === 'month1' ? 'Month 1' : 
                               name === 'month2' ? 'Month 2' : 
                               name === 'month3' ? 'Month 3' : 
                               name === 'month6' ? 'Month 6' : name;
                  return [`${value}%`, `${period} Retention`];
                }}
                labelFormatter={(label) => `Cohort: ${label}`}
              />
              <Bar dataKey="month1" name="month1" fill={CHART_COLORS[0]} />
              <Bar dataKey="month2" name="month2" fill={CHART_COLORS[1]} />
              <Bar dataKey="month3" name="month3" fill={CHART_COLORS[2]} />
              <Bar dataKey="month6" name="month6" fill={CHART_COLORS[3]} />
              <Legend 
                formatter={(value) => {
                  return value === 'month1' ? 'Month 1' : 
                         value === 'month2' ? 'Month 2' : 
                         value === 'month3' ? 'Month 3' : 
                         value === 'month6' ? 'Month 6' : value;
                }}
              />
            </BarChart>
          </ReportChart>
        </Grid>

        {/* Payday Cycle Analysis Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="Payday Cycle Analysis"
            data={paydayCycleData || []}
            isLoading={paydayCycleLoading}
            error={paydayCycleError}
            type="paydayCycleAnalysis"
            onExport={handleExportMenuOpen}
            onRetry={handleRefresh}
          >
            <PieChart>
              <Pie
                data={paydayCycleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ period, percentageOfVolume }) => `${period}: ${percentageOfVolume.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentageOfVolume"
                nameKey="period"
              >
                {paydayCycleData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name) => [`${value}%`, 'Volume Share']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
            </PieChart>
          </ReportChart>
        </Grid>

        {/* Payday Cycle Insights Summary */}
        <Grid item xs={12} md={6}>
          {paydayCycleMetadata && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payday Cycle Insights
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Dominant Period: <strong>{paydayCycleMetadata.dominantPeriod}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Transactions: <strong>{paydayCycleMetadata.totalTransactions?.toLocaleString()}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Volume: <strong>${paydayCycleMetadata.totalVolume?.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary.contrastText">
                        {paydayCycleMetadata.startMonthConcentration?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="primary.contrastText">
                        Start Month
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="h6" color="success.contrastText">
                        {paydayCycleMetadata.midMonthConcentration?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="success.contrastText">
                        Mid Month
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="h6" color="warning.contrastText">
                        {paydayCycleMetadata.endMonthConcentration?.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="warning.contrastText">
                        End Month
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gain insights into system performance and user behavior
        </Typography>
      </Box>
      
      {renderFilterControls()}
      
      {renderActiveFilters()}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report tabs"
          variant="fullWidth"
        >
          <Tab icon={<AssessmentIcon />} label="Transaction Reports" />
          <Tab icon={<PeopleIcon />} label="User Reports" />
          <Tab icon={<AccountBalanceWalletIcon />} label="Financial Reports" />
          <Tab icon={<AssessmentIcon />} label="Retention Report" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      {tabValue === 0 && renderTransactionReportsTab()}
      {tabValue === 1 && renderUserReportsTab()}
      {tabValue === 2 && renderFinancialReportsTab()}
      {tabValue === 3 && renderRetentionReportTab()}
      
      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={() => handleExport('csv')}>Export to CSV</MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>Export to Excel</MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>Export to PDF</MenuItem>
      </Menu>
      
      {/* Saved Configurations Menu */}
      <Menu
        anchorEl={savedConfigMenuAnchor}
        open={Boolean(savedConfigMenuAnchor)}
        onClose={handleSavedConfigMenuClose}
      >
        <MenuItem onClick={handleSaveConfigDialogOpen}>
          Save Current Configuration
        </MenuItem>
        <Divider />
        {savedConfigurationsLoading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading saved configurations...
          </MenuItem>
        ) : savedConfigurations && savedConfigurations.length > 0 ? (
          savedConfigurations.map((config) => (
            <MenuItem key={config.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1 }} onClick={() => handleLoadConfiguration(config)}>
                  {config.name}
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfiguration(config.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No saved configurations</MenuItem>
        )}
      </Menu>
      
      {/* Save Configuration Dialog */}
      <Dialog open={saveConfigDialogOpen} onClose={handleSaveConfigDialogClose}>
        <DialogTitle>Save Report Configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Configuration Name"
            fullWidth
            value={savedConfigName}
            onChange={(e) => setSavedConfigName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            value={savedConfigDescription}
            onChange={(e) => setSavedConfigDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveConfigDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveConfiguration} 
            variant="contained"
            disabled={!savedConfigName || saveConfiguration.isLoading}
          >
            {saveConfiguration.isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 