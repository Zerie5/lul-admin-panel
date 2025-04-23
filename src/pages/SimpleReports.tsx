import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';

// Mock data for charts
const mockTransactionData = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 150 },
  { month: 'Mar', count: 180 },
  { month: 'Apr', count: 220 },
  { month: 'May', count: 250 },
  { month: 'Jun', count: 280 },
];

const mockUserData = [
  { month: 'Jan', count: 50 },
  { month: 'Feb', count: 80 },
  { month: 'Mar', count: 110 },
  { month: 'Apr', count: 140 },
  { month: 'May', count: 170 },
  { month: 'Jun', count: 200 },
];

const mockRevenueData = [
  { month: 'Jan', amount: 5000 },
  { month: 'Feb', amount: 7500 },
  { month: 'Mar', amount: 10000 },
  { month: 'Apr', amount: 12500 },
  { month: 'May', amount: 15000 },
  { month: 'Jun', amount: 17500 },
];

const SimpleReports: React.FC = () => {
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
                <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    {mockTransactionData.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 30, 
                          mx: 1,
                          height: `${(item.count / 300) * 100}%`,
                          bgcolor: '#18859A',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        <Typography variant="caption" sx={{ position: 'absolute', top: -20 }}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  {mockTransactionData.map((item, index) => (
                    <Typography key={index} variant="caption">
                      {item.month}
                    </Typography>
                  ))}
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#18859A' }}>
                1,200
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
                <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    {mockUserData.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 30, 
                          mx: 1,
                          height: `${(item.count / 200) * 100}%`,
                          bgcolor: '#4CAF50',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        <Typography variant="caption" sx={{ position: 'absolute', top: -20 }}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  {mockUserData.map((item, index) => (
                    <Typography key={index} variant="caption">
                      {item.month}
                    </Typography>
                  ))}
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#4CAF50' }}>
                750
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
                <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    {mockRevenueData.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 30, 
                          mx: 1,
                          height: `${(item.amount / 20000) * 100}%`,
                          bgcolor: '#F44336',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        <Typography variant="caption" sx={{ position: 'absolute', top: -20 }}>
                          ${(item.amount / 1000).toFixed(1)}k
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  {mockRevenueData.map((item, index) => (
                    <Typography key={index} variant="caption">
                      {item.month}
                    </Typography>
                  ))}
                </Box>
              </Paper>
              
              <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', color: '#F44336' }}>
                $67,500
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Summary Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              <Typography variant="body2" paragraph>
                Your platform is showing strong growth across all key metrics. Transaction volume has increased by 15% month-over-month, while user growth remains steady at 20% growth. Revenue has seen the most significant improvement with a 25% increase compared to the previous period.
              </Typography>
              <Typography variant="body2">
                Recommendations:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    Continue to focus on user acquisition to maintain growth momentum
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Analyze transaction patterns to identify opportunities for fee optimization
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Consider implementing loyalty programs to increase user retention
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleReports; 