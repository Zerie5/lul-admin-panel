import { query } from './db';

export default async function handler(req, res) {
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
    // Get dashboard data
    const { timeFrame = '30days' } = req.query;
    
    // Calculate date range based on timeFrame
    let startDate;
    const endDate = new Date();
    
    switch (timeFrame) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Run all queries in parallel for better performance
    const [
      transactionStats,
      recentTransactions,
      transactionsByStatus,
      transactionsByType,
      transactionTrend,
      userStats,
      revenueStats
    ] = await Promise.all([
      getTransactionStats(startDate, endDate),
      getRecentTransactions(),
      getTransactionsByStatus(startDate, endDate),
      getTransactionsByType(startDate, endDate),
      getTransactionTrend(startDate, endDate, timeFrame),
      getUserStats(startDate, endDate),
      getRevenueStats(startDate, endDate)
    ]);
    
    // Return all dashboard data
    res.status(200).json({
      transactionStats,
      recentTransactions,
      transactionsByStatus,
      transactionsByType,
      transactionTrend,
      userStats,
      revenueStats
    });
  } catch (error) {
    console.error('Error in dashboard API:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper functions for dashboard data

async function getTransactionStats(startDate, endDate) {
  const result = await query(
    `SELECT
      COUNT(*) as total_count,
      SUM(amount) as total_volume,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
      ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate,
      ROUND(AVG(amount)::numeric, 2) as average_amount
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2`,
    [startDate, endDate]
  );
  
  return result.rows[0];
}

async function getRecentTransactions() {
  const result = await query(
    `SELECT
      id,
      user_id,
      type,
      status,
      amount,
      fee_amount,
      currency,
      created_at,
      updated_at
    FROM transactions
    ORDER BY created_at DESC
    LIMIT 10`
  );
  
  return result.rows;
}

async function getTransactionsByStatus(startDate, endDate) {
  const result = await query(
    `SELECT
      status,
      COUNT(*) as count,
      ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2)::numeric * 100, 2) as percentage
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY status
    ORDER BY count DESC`,
    [startDate, endDate]
  );
  
  return result.rows;
}

async function getTransactionsByType(startDate, endDate) {
  const result = await query(
    `SELECT
      type,
      COUNT(*) as count,
      ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2)::numeric * 100, 2) as percentage
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY type
    ORDER BY count DESC`,
    [startDate, endDate]
  );
  
  return result.rows;
}

async function getTransactionTrend(startDate, endDate, timeFrame) {
  let timeGrouping;
  
  // Determine appropriate time grouping based on timeFrame
  switch (timeFrame) {
    case '7days':
      timeGrouping = "DATE_TRUNC('day', created_at)";
      break;
    case '30days':
      timeGrouping = "DATE_TRUNC('day', created_at)";
      break;
    case '90days':
      timeGrouping = "DATE_TRUNC('week', created_at)";
      break;
    case '1year':
      timeGrouping = "DATE_TRUNC('month', created_at)";
      break;
    default:
      timeGrouping = "DATE_TRUNC('day', created_at)";
  }
  
  const result = await query(
    `SELECT
      ${timeGrouping} as date,
      COUNT(*) as count,
      SUM(amount) as volume
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate, endDate]
  );
  
  return result.rows;
}

async function getUserStats(startDate, endDate) {
  const result = await query(
    `SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at BETWEEN $1 AND $2 THEN 1 END) as new_users,
      COUNT(CASE WHEN last_login_at BETWEEN $1 AND $2 THEN 1 END) as active_users
    FROM users`,
    [startDate, endDate]
  );
  
  return result.rows[0];
}

async function getRevenueStats(startDate, endDate) {
  const result = await query(
    `SELECT
      SUM(fee_amount) as total_revenue,
      ROUND(AVG(fee_amount)::numeric, 2) as average_fee
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2 AND status = 'completed'`,
    [startDate, endDate]
  );
  
  return result.rows[0];
} 