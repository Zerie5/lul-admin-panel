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
  DialogActions
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
  useActiveUsers,
  useUserRetention,
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
import { TimeFrame, ReportFilters, VisualizationType, SavedReportConfiguration, ExportFormat } from '../types/reports';

// Import components
import ReportChart from '../components/ReportChart';

// Define colors for charts
const CHART_COLORS = ['#18859A', '#F44336', '#4CAF50', '#FFC107', '#9C27B0', '#FF9800'];
const PIE_COLORS = ['#18859A', '#26A69A', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'];

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
    visualizationType
  };
  
  // Use hooks to fetch data
  const { data: transactionVolumeData, isLoading: transactionVolumeLoading, error: transactionVolumeError } = useTransactionVolume(filters);
  const { data: transactionSuccessRateData, isLoading: transactionSuccessRateLoading, error: transactionSuccessRateError } = useTransactionSuccessRate(filters);
  const { data: transactionTypeDistributionData, isLoading: transactionTypeDistributionLoading, error: transactionTypeDistributionError } = useTransactionTypeDistribution(filters);
  const { data: averageTransactionValueData, isLoading: averageTransactionValueLoading, error: averageTransactionValueError } = useAverageTransactionValue(filters);
  
  const { data: userRegistrationsData, isLoading: userRegistrationsLoading, error: userRegistrationsError } = useUserRegistrations(filters);
  const { data: activeUsersData, isLoading: activeUsersLoading, error: activeUsersError } = useActiveUsers(filters);
  const { data: userRetentionData, isLoading: userRetentionLoading, error: userRetentionError } = useUserRetention(filters);
  const { data: geographicDistributionData, isLoading: geographicDistributionLoading, error: geographicDistributionError } = useGeographicDistribution(filters);
  
  const { data: transactionValueData, isLoading: transactionValueLoading, error: transactionValueError } = useTransactionValue(filters);
  const { data: feeRevenueData, isLoading: feeRevenueLoading, error: feeRevenueError } = useFeeRevenue(filters);
  const { data: transactionCorridorsData, isLoading: transactionCorridorsLoading, error: transactionCorridorsError } = useTransactionCorridors(filters);
  
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
        headers = { date: 'Date', count: 'Active Users' };
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
        headers = { corridor: 'Corridor', count: 'Transaction Count', value: 'Total Value' };
        filename = 'transaction-corridors';
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
        headers = { date: 'Date', count: 'Active Users' };
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
        headers = { corridor: 'Corridor', count: 'Transaction Count', value: 'Total Value' };
        filename = 'transaction-corridors';
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
      default: return 'transactionVolume';
    }
  };
  
  // Helper to get tab value from report type
  const getTabValueFromReportType = (reportType: string): number => {
    switch (reportType) {
      case 'transactionVolume': return 0;
      case 'userRegistrations': return 1;
      case 'feeRevenue': return 2;
      default: return -1;
    }
  };
  
  // Render filter controls
  const renderFilterControls = () => {
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
            
            <Grid item xs={12} md={3}>
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
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Line Chart">
                  <IconButton 
                    color={visualizationType === 'line' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('line')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Bar Chart">
                  <IconButton 
                    color={visualizationType === 'bar' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('bar')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={visualizationType === 'pie' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('pie')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11,2V22C5.9,21.5 2,17.2 2,12C2,6.8 5.9,2.5 11,2M13,2V11H22C21.5,6.2 17.8,2.5 13,2M13,13V22C17.7,21.5 21.5,17.8 22,13H13Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Area Chart">
                  <IconButton 
                    color={visualizationType === 'area' ? 'primary' : 'default'}
                    onClick={() => handleVisualizationTypeChange('area')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22,21H2V3H4V19H22V21M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z" />
                    </svg>
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleSavedConfigMenuOpen}
              >
                Saved Reports
              </Button>
              
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Transactions" 
                stroke={CHART_COLORS[0]}
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
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
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
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
            <LineChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Active Users" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* User Retention Chart */}
        <Grid item xs={12} md={6}>
          <ReportChart
            title="User Retention"
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
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="week1" name="Week 1" fill={CHART_COLORS[0]} />
              <Bar dataKey="week2" name="Week 2" fill={CHART_COLORS[1]} />
              <Bar dataKey="week3" name="Week 3" fill={CHART_COLORS[2]} />
              <Bar dataKey="week4" name="Week 4" fill={CHART_COLORS[3]} />
              <Legend />
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
    return (
      <Grid container spacing={3}>
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
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
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Fee Revenue" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ReportChart>
        </Grid>
        
        {/* Top Transaction Corridors Chart */}
        <Grid item xs={12}>
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
              <XAxis dataKey="corridor" />
              <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS[0]} />
              <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS[1]} />
              <RechartsTooltip />
              <Bar yAxisId="left" dataKey="count" name="Transaction Count" fill={CHART_COLORS[0]} />
              <Bar yAxisId="right" dataKey="value" name="Total Value" fill={CHART_COLORS[1]} />
              <Legend />
            </BarChart>
          </ReportChart>
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
        </Tabs>
      </Box>
      
      {/* Tab content */}
      {tabValue === 0 && renderTransactionReportsTab()}
      {tabValue === 1 && renderUserReportsTab()}
      {tabValue === 2 && renderFinancialReportsTab()}
      
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