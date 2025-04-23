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
      // Extract query parameters
      const { 
        page = 1, 
        limit = 10, 
        status, 
        paymentMethod,
        userId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      // Build the query
      let sqlQuery = 'SELECT * FROM non_wallet_transactions WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;
      
      // Add filters if provided
      if (status) {
        sqlQuery += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
      
      if (paymentMethod) {
        sqlQuery += ` AND payment_method = $${paramIndex}`;
        queryParams.push(paymentMethod);
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
      
      // Execute the query
      const result = await query(sqlQuery, queryParams);
      
      // Get total count for pagination
      const countResult = await query(
        'SELECT COUNT(*) FROM non_wallet_transactions WHERE 1=1' + 
        (status ? ' AND status = $1' : '') +
        (paymentMethod ? ` AND payment_method = $${status ? 2 : 1}` : '') +
        (userId ? ` AND user_id = $${(status ? 1 : 0) + (paymentMethod ? 1 : 0) + 1}` : ''),
        [
          ...(status ? [status] : []),
          ...(paymentMethod ? [paymentMethod] : []),
          ...(userId ? [userId] : [])
        ]
      );
      
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
    } else if (req.method === 'POST') {
      // Handle creating a new non-wallet transaction
      const { 
        userId, 
        amount, 
        currency, 
        paymentMethod, 
        description,
        externalReference,
        metadata
      } = req.body;
      
      // Validate required fields
      if (!userId || !amount || !currency || !paymentMethod) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          requiredFields: ['userId', 'amount', 'currency', 'paymentMethod'] 
        });
      }
      
      // Insert the new transaction
      const result = await query(
        `INSERT INTO non_wallet_transactions (
          user_id, 
          amount, 
          currency, 
          payment_method, 
          description, 
          external_reference,
          metadata,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
        [
          userId, 
          amount, 
          currency, 
          paymentMethod, 
          description || null, 
          externalReference || null,
          metadata ? JSON.stringify(metadata) : null,
          'pending' // Default status
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } else if (req.method === 'PATCH' && req.query.id) {
      // Handle updating a non-wallet transaction
      const { id } = req.query;
      const { status, metadata } = req.body;
      
      // Validate required fields
      if (!status) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          requiredFields: ['status'] 
        });
      }
      
      // Update the transaction
      const result = await query(
        `UPDATE non_wallet_transactions 
        SET 
          status = $1, 
          metadata = $2,
          updated_at = NOW()
        WHERE id = $3 
        RETURNING *`,
        [status, metadata ? JSON.stringify(metadata) : null, id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } else {
      // Method not allowed
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in non-wallet transactions API:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 