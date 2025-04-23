import { query } from './db';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { reportType, startDate, endDate, timeFrame = 'daily' } = req.query;
      
      if (!reportType) {
        return res.status(400).json({ error: 'Report type is required' });
      }
      
      let result;
      
      switch (reportType) {
        case 'transactionVolume':
          result = await getTransactionVolume(startDate, endDate, timeFrame);
          break;
        case 'transactionSuccessRate':
          result = await getTransactionSuccessRate(startDate, endDate, timeFrame);
          break;
        case 'transactionTypeDistribution':
          result = await getTransactionTypeDistribution(startDate, endDate);
          break;
        case 'averageTransactionValue':
          result = await getAverageTransactionValue(startDate, endDate, timeFrame);
          break;
        case 'userRegistrations':
          result = await getUserRegistrations(startDate, endDate, timeFrame);
          break;
        case 'activeUsers':
          result = await getActiveUsers(startDate, endDate, timeFrame);
          break;
        case 'userRetention':
          result = await getUserRetention(startDate, endDate);
          break;
        case 'geographicDistribution':
          result = await getGeographicDistribution(startDate, endDate);
          break;
        case 'transactionValue':
          result = await getTransactionValue(startDate, endDate, timeFrame);
          break;
        case 'feeRevenue':
          result = await getFeeRevenue(startDate, endDate, timeFrame);
          break;
        case 'transactionCorridors':
          result = await getTransactionCorridors(startDate, endDate);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }
      
      res.status(200).json(result);
    } else if (req.method === 'POST') {
      // Handle saving report configurations
      const { name, description, filters, visualizations } = req.body;
      
      if (!name || !filters || !visualizations) {
        return res.status(400).json({ error: 'Name, filters, and visualizations are required' });
      }
      
      const result = await query(
        'INSERT INTO report_configurations (name, description, filters, visualizations, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
        [name, description, JSON.stringify(filters), JSON.stringify(visualizations)]
      );
      
      res.status(201).json(result.rows[0]);
    } else {
      // Method not allowed
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in reports API:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper functions for different report types
async function getTransactionVolume(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      COUNT(*) as count,
      SUM(amount) as volume
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getTransactionSuccessRate(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
      ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getTransactionTypeDistribution(startDate, endDate) {
  const result = await query(
    `SELECT 
      type,
      COUNT(*) as count,
      ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2)::numeric * 100, 2) as percentage
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY type
    ORDER BY count DESC`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getAverageTransactionValue(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      ROUND(AVG(amount)::numeric, 2) as average_value
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getUserRegistrations(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      COUNT(*) as count
    FROM users
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getActiveUsers(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      COUNT(DISTINCT user_id) as count
    FROM user_activities
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getUserRetention(startDate, endDate) {
  // This is a complex query that would typically involve cohort analysis
  // For simplicity, we'll return mock data
  return [
    { cohort: 'Week 1', retention_rate: 85 },
    { cohort: 'Week 2', retention_rate: 72 },
    { cohort: 'Week 3', retention_rate: 65 },
    { cohort: 'Week 4', retention_rate: 58 },
    { cohort: 'Week 5', retention_rate: 52 },
    { cohort: 'Week 6', retention_rate: 48 },
    { cohort: 'Week 7', retention_rate: 45 },
    { cohort: 'Week 8', retention_rate: 42 }
  ];
}

async function getGeographicDistribution(startDate, endDate) {
  const result = await query(
    `SELECT 
      country,
      COUNT(*) as count,
      ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM transactions WHERE created_at BETWEEN $1 AND $2)::numeric * 100, 2) as percentage
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY country
    ORDER BY count DESC`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getTransactionValue(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      SUM(amount) as total_value
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getFeeRevenue(startDate, endDate, timeFrame) {
  const timeGrouping = getTimeGrouping(timeFrame);
  
  const result = await query(
    `SELECT 
      ${timeGrouping} as date,
      SUM(fee_amount) as total_revenue
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY date
    ORDER BY date`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

async function getTransactionCorridors(startDate, endDate) {
  const result = await query(
    `SELECT 
      source_country || ' to ' || destination_country as corridor,
      COUNT(*) as count,
      SUM(amount) as volume
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY corridor
    ORDER BY count DESC
    LIMIT 10`,
    [startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
     endDate ? new Date(endDate) : new Date()]
  );
  
  return result.rows;
}

// Helper function to get the appropriate time grouping SQL based on timeFrame
function getTimeGrouping(timeFrame) {
  switch (timeFrame) {
    case 'hourly':
      return "DATE_TRUNC('hour', created_at)";
    case 'daily':
      return "DATE_TRUNC('day', created_at)";
    case 'weekly':
      return "DATE_TRUNC('week', created_at)";
    case 'monthly':
      return "DATE_TRUNC('month', created_at)";
    case 'quarterly':
      return "DATE_TRUNC('quarter', created_at)";
    case 'yearly':
      return "DATE_TRUNC('year', created_at)";
    default:
      return "DATE_TRUNC('day', created_at)";
  }
} 