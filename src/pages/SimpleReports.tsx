import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';

// TODO: Replace with real API data - Mock data removed for security
// const mockTransactionData = [
//   { month: 'Jan', count: 120 },
//   { month: 'Feb', count: 150 },
//   { month: 'Mar', count: 180 },
//   { month: 'Apr', count: 220 },
//   { month: 'May', count: 250 },
//   { month: 'Jun', count: 280 },
// ];

// const mockUserData = [
//   { month: 'Jan', count: 50 },
//   { month: 'Feb', count: 80 },
//   { month: 'Mar', count: 110 },
//   { month: 'Apr', count: 140 },
//   { month: 'May', count: 170 },
//   { month: 'Jun', count: 200 },
// ];

// const mockRevenueData = [
//   { month: 'Jan', amount: 5000 },
//   { month: 'Feb', amount: 7500 },
//   { month: 'Mar', amount: 10000 },
//   { month: 'Apr', amount: 12500 },
//   { month: 'May', amount: 15000 },
//   { month: 'Jun', amount: 17500 },
// ];

const SimpleReports: React.FC = () => {
  // TODO: Implement real data fetching from backend API
  // const { data: transactionData } = useTransactionData();
  // const { data: userData } = useUserData();
  // const { data: revenueData } = useRevenueData();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Reports & Analytics Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        View key metrics and performance indicators for your business.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Transaction Volume */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Volume
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total transactions over time
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connect to backend API to view transaction data
                  </Typography>
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#18859A' }}>
                --
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* User Growth */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                New user registrations over time
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connect to backend API to view user data
                  </Typography>
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#4CAF50' }}>
                --
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Revenue */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total revenue over time
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Connect to backend API to view revenue data
                  </Typography>
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#F44336' }}>
                --
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleReports; 