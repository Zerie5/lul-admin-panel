import { query } from './db';
import { getMockData } from './mock-data';

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
      // Extract query parameters
      const { 
        page = 1, 
        limit = 10, 
        status, 
        type, 
        userId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      // Build the query
      let sqlQuery = 'SELECT * FROM transactions WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;
      
      // Add filters if provided
      if (status) {
        sqlQuery += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
      
      if (type) {
        sqlQuery += ` AND type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
      }
      
      if (userId) {
        sqlQuery += ` AND user_id = $${paramIndex}`;
        queryParams.push(userId);
        paramIndex++;
      }
      
      if (startDate) {
        sqlQuery += ` AND created_at >= $${paramIndex}`;
        queryParams.push(new Date(startDate));
        paramIndex++;
      }
      
      if (endDate) {
        sqlQuery += ` AND created_at <= $${paramIndex}`;
        queryParams.push(new Date(endDate));
        paramIndex++;
      }
      
      // Add sorting
      sqlQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Add pagination
      const offset = (page - 1) * limit;
      sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);
      
      // Execute the query with mock data fallback
      const mockDataFunction = () => {
        // Get mock transactions
        const allTransactions = getMockData('transactions');
        
        // Apply filters
        let filteredTransactions = [...allTransactions];
        
        if (status) {
          filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
        }
        
        if (type) {
          filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
        }
        
        if (userId) {
          filteredTransactions = filteredTransactions.filter(tx => tx.user_id === userId);
        }
        
        if (startDate) {
          const startDateObj = new Date(startDate);
          filteredTransactions = filteredTransactions.filter(tx => new Date(tx.created_at) >= startDateObj);
        }
        
        if (endDate) {
          const endDateObj = new Date(endDate);
          filteredTransactions = filteredTransactions.filter(tx => new Date(tx.created_at) <= endDateObj);
        }
        
        // Sort transactions
        filteredTransactions.sort((a, b) => {
          const aValue = a[sortBy] || a.created_at;
          const bValue = b[sortBy] || b.created_at;
          
          if (sortOrder.toUpperCase() === 'DESC') {
            return aValue > bValue ? -1 : 1;
          } else {
            return aValue < bValue ? -1 : 1;
          }
        });
        
        // Apply pagination
        const paginatedTransactions = filteredTransactions.slice(offset, offset + parseInt(limit));
        
        return {
          rows: paginatedTransactions,
          rowCount: paginatedTransactions.length
        };
      };
      
      const result = await query(sqlQuery, queryParams, 'transactions', mockDataFunction);
      
      // Get total count for pagination
      const countSql = 'SELECT COUNT(*) FROM transactions WHERE 1=1' + 
        (status ? ' AND status = $1' : '') +
        (type ? ` AND type = $${status ? 2 : 1}` : '') +
        (userId ? ` AND user_id = $${(status ? 1 : 0) + (type ? 1 : 0) + 1}` : '');
      
      const countParams = [
        ...(status ? [status] : []),
        ...(type ? [type] : []),
        ...(userId ? [userId] : [])
      ];
      
      const countMockFunction = () => {
        // Get mock transactions
        const allTransactions = getMockData('transactions');
        
        // Apply filters
        let filteredTransactions = [...allTransactions];
        
        if (status) {
          filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
        }
        
        if (type) {
          filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
        }
        
        if (userId) {
          filteredTransactions = filteredTransactions.filter(tx => tx.user_id === userId);
        }
        
        return {
          rows: [{ count: filteredTransactions.length }]
        };
      };
      
      const countResult = await query(countSql, countParams, 'transactions', countMockFunction);
      
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);
      
      // Return the results
      res.status(200).json({
        data: result.rows,
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } else {
      // Method not allowed
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in transactions API:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 