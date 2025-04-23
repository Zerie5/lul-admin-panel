import { query } from './db.js';
import { getMockData } from './mock-data.js';
import express from 'express';
const router = express.Router();

// Handle GET requests
router.get('/', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataType } = req.query;
    
    // Get time range parameters (default to last 30 days)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date();
    
    // Handle different data types
    switch (dataType) {
      case 'summary':
        const summaryData = await getDashboardSummary(startDate, endDate);
        return res.status(200).json(summaryData);
      
      case 'transactionTrends':
        const trendData = await getTransactionTrends(startDate, endDate);
        return res.status(200).json(trendData);
      
      case 'userActivity':
        const activityData = await getUserActivity(startDate, endDate);
        return res.status(200).json(activityData);
      
      case 'recentTransactions':
        const transactionsData = await getRecentTransactions();
        return res.status(200).json(transactionsData);
      
      default:
        // If no specific data type is requested, return all dashboard data
        const [summary, trends, activity, transactions] = await Promise.all([
          getDashboardSummary(startDate, endDate),
          getTransactionTrends(startDate, endDate),
          getUserActivity(startDate, endDate),
          getRecentTransactions()
        ]);
        
        return res.status(200).json({
          summary,
          transactionTrends: trends,
          userActivity: activity,
          recentTransactions: transactions
        });
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Function to get dashboard summary data
async function getDashboardSummary(startDate, endDate) {
  try {
    // Query for total transactions count
    const totalTransactionsQuery = `
      SELECT COUNT(*) as total_transactions
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    // Query for total transaction value
    const totalValueQuery = `
      SELECT COALESCE(SUM(transacted_value), 0) as total_value
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    // Query for success rate
    const successRateQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN transaction_status_id = 2 THEN 1 END) as completed,
        ROUND(
          (COUNT(CASE WHEN transaction_status_id = 2 THEN 1 END)::numeric / 
          NULLIF(COUNT(*)::numeric, 0)) * 100, 
          1
        ) as success_rate
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    // Query for active users
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT sender_id) + COUNT(DISTINCT receiver_id) as active_users
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    // Execute all queries in parallel
    const [
      totalTransactionsResult,
      totalValueResult,
      successRateResult,
      activeUsersResult
    ] = await Promise.all([
      query(totalTransactionsQuery, [startDate, endDate]),
      query(totalValueQuery, [startDate, endDate]),
      query(successRateQuery, [startDate, endDate]),
      query(activeUsersQuery, [startDate, endDate])
    ]);
    
    // Extract and format the results
    const totalTransactions = parseInt(totalTransactionsResult.rows[0].total_transactions);
    const totalTransactionValue = parseFloat(totalValueResult.rows[0].total_value);
    const successRate = parseFloat(successRateResult.rows[0].success_rate || 0);
    const activeUsers = parseInt(activeUsersResult.rows[0].active_users);
    
    return {
      totalTransactions,
      totalTransactionValue,
      activeUsers,
      successRate
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    
    // Return mock data as fallback
    return getMockData('summary');
  }
}

// Function to get transaction trends data
async function getTransactionTrends(startDate, endDate) {
  try {
    const query_text = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COALESCE(SUM(transacted_value), 0) as value
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    const result = await query(query_text, [startDate, endDate]);
    
    // Format the results
    return result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: parseInt(row.count),
      value: parseFloat(row.value)
    }));
  } catch (error) {
    console.error('Error getting transaction trends:', error);
    
    // Return mock data as fallback
    return getMockData('transactionTrends');
  }
}

// Function to get user activity data
async function getUserActivity(startDate, endDate) {
  try {
    // Query for new users per day
    const newUsersQuery = `
      SELECT 
        DATE(u.created_at) as date,
        COUNT(*) as new_users
      FROM auth.users u
      WHERE u.created_at BETWEEN $1 AND $2
      GROUP BY DATE(u.created_at)
      ORDER BY date
    `;
    
    // Query for active users per day
    const activeUsersQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT sender_id) as active_users
      FROM wallet.transaction_history
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    // Execute queries in parallel
    const [newUsersResult, activeUsersResult] = await Promise.all([
      query(newUsersQuery, [startDate, endDate]),
      query(activeUsersQuery, [startDate, endDate])
    ]);
    
    // Create a map of dates to combine the results
    const dateMap = new Map();
    
    // Process new users data
    newUsersResult.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        date: dateStr,
        newUsers: parseInt(row.new_users),
        activeUsers: 0
      });
    });
    
    // Process active users data and merge with new users
    activeUsersResult.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        const existing = dateMap.get(dateStr);
        existing.activeUsers = parseInt(row.active_users);
      } else {
        dateMap.set(dateStr, {
          date: dateStr,
          newUsers: 0,
          activeUsers: parseInt(row.active_users)
        });
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error getting user activity:', error);
    
    // Return mock data as fallback
    return getMockData('userActivity');
  }
}

// Function to get recent transactions
async function getRecentTransactions() {
  try {
    const query_text = `
      SELECT 
        th.transaction_id as id,
        th.sender_id as user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        th.transacted_value as amount,
        tt.name as type,
        ts.name as status,
        th.created_at as timestamp
      FROM wallet.transaction_history th
      JOIN auth.users u ON th.sender_id = u.id
      JOIN wallet.transaction_types tt ON th.transaction_type_id = tt.id
      JOIN wallet.transaction_status ts ON th.transaction_status_id = ts.id
      ORDER BY th.created_at DESC
      LIMIT 10
    `;
    
    const result = await query(query_text, []);
    
    // Format the results
    return result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      userName: row.user_name,
      amount: parseFloat(row.amount),
      type: row.type.toUpperCase().replace(' ', '_'),
      status: row.status.toUpperCase(),
      timestamp: row.timestamp.toISOString()
    }));
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    
    // Return mock data as fallback
    return getMockData('recentTransactions');
  }
}

export default router; 