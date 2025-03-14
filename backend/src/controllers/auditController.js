const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// helper function to check and create a new audit if needed
function checkAndCreateAudit(callback) {
  // Get the latest audit to check its payment_due_date
  const getLatestQuery = `SELECT * FROM AUDITS ORDER BY payment_due_date DESC LIMIT 1;`;

  connection.query(getLatestQuery, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      // Continue with callback even if there's an error
      return callback(error);
    }

    // Get today's date on the server
    const today = new Date();
    let shouldCreateNewAudit = false;

    // If no audits exist yet, we should create one
    if (results.length === 0) {
      shouldCreateNewAudit = true;
    } else {
      // Get the latest payment_due_date
      const latestAudit = results[0];
      const latestDueDate = new Date(latestAudit.payment_due_date);

      // Calculate the difference in days
      const diffTime = today.getTime() - latestDueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if more than 70 days have passed
      shouldCreateNewAudit = diffDays > 70;
    }

    if (shouldCreateNewAudit) {
      // Create a new audit with due date set to today + 70 days
      const newDueDate = new Date(results[0].payment_due_date);
      console.log(newDueDate.getDate());
      newDueDate.setDate(newDueDate.getDate() + 70);

      const newAuditId = `AUDIT-${Date.now()}`;
      const createAuditQuery = `
        INSERT INTO AUDITS (audit_id, payment_due_date, payment_status) 
        VALUES (?, ?, 0);
      `;

      connection.query(createAuditQuery, [newAuditId, newDueDate], (createError) => {
        if (createError) {
          console.error('Error creating new audit:', createError);
        } else {
          console.log('New audit created successfully', newAuditId);
        }
        // Continue with callback regardless of result
        callback(null);
      });
    } else {
      // No new audit needed, continue with callback
      callback(null);
    }
  });
}

// Get all audits
router.get('/audits', (req, res) => {
  checkAndCreateAudit((error) => {
    // If there was an error in the check, we still proceed with getting all audits
    const query = `SELECT * FROM AUDITS ORDER BY payment_due_date DESC;`;
    connection.query(query, (queryError, results) => {
      if (queryError) {
        console.error('Database query error:', queryError);
        return res.status(500).json({ error: 'Failed to fetch audits' });
      }
      res.status(200).json(results);
    });
  });
});

// Get the latest audit
router.get('/audits/latest', (req, res) => {
  const query = `SELECT * FROM AUDITS ORDER BY payment_due_date DESC LIMIT 1;`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Failed to fetch the latest audit' });
    }
    res.status(200).json(results[0]);
  });
});

// Get audit details by ID
router.get('/audits/:audit_id', (req, res) => {
  const { audit_id } = req.params;

  const queryAudit = `SELECT * FROM AUDITS WHERE audit_id = ?;`;
  const queryAuditLists = `SELECT * FROM AUDIT_LISTS WHERE audit_id = ?;`;

  connection.query(queryAudit, [audit_id], (error, auditResults) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Failed to fetch audit details' });
    }

    connection.query(queryAuditLists, [audit_id], (error, auditListResults) => {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Failed to fetch audit list details' });
      }

      res.status(200).json({
        audit: auditResults[0],
        auditLists: auditListResults,
      });
    });
  });
});

router.get('/audits/latest/total', (req, res) => {
  const query = `
      SELECT SUM(order_amount) AS total 
      FROM AUDIT_LISTS 
      WHERE audit_id = (SELECT audit_id FROM AUDITS ORDER BY payment_due_date DESC LIMIT 1);
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Failed to fetch total audit amount' });
    }
    res.status(200).json({ total: results[0]?.total || 0 });
  });
});

// adds api endpoint to query audits only with the status of payment_status 0
router.get('/home/clerical/audits/waiting', async (req, res) => {

  // Join AUDITS and AUDIT_LISTS tables to get order_amount
  const query = `
    SELECT a.*, 
           COALESCE(SUM(al.order_amount), 0) as total_order_amount,
           COUNT(al.audit_list_id) as order_count
    FROM AUDITS a
    LEFT JOIN AUDIT_LISTS al ON a.audit_id = al.audit_id
    WHERE a.payment_status = 0
    GROUP BY a.audit_id
    ORDER BY a.payment_due_date DESC;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    res.status(200).json(results);
  });

});

// Update payment status
router.post('/audits/:audit_id/confirm-payment', (req, res) => {
  const { audit_id } = req.params;

  const query = `UPDATE AUDITS SET payment_status = TRUE WHERE audit_id = ?;`;
  connection.query(query, [audit_id], (error, results) => {
    if (error) {
      console.error('Database update error:', error);
      return res.status(500).json({ error: 'Failed to confirm payment' });
    }
    res.status(200).json({ message: 'Payment confirmed successfully' });
  });
});

router.get('/audit/orders/accepted', (req, res) => {
  const query = `SELECT * FROM ORDERS WHERE order_status = 'accept'`;

  connection.query(query, (error, results) => {
    console.log('Query:', query); // Log query
    console.log('Results:', results); // Log results
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Failed to fetch accepted orders' });
    }
    res.status(200).json(results);
  });
});



router.post('/audits/latest/add-orders', (req, res) => {
  const { orders } = req.body; // Array of { order_id, order_amount }

  const latestAuditQuery = `SELECT audit_id FROM AUDITS ORDER BY payment_due_date DESC LIMIT 1`;

  connection.query(latestAuditQuery, (error, auditResults) => {
    if (error || auditResults.length === 0) {
      console.error('Error fetching latest audit:', error);
      return res.status(500).json({ error: 'Failed to fetch latest audit' });
    }

    const latestAuditId = auditResults[0].audit_id;

    const insertAuditListQuery = `
          INSERT INTO AUDIT_LISTS (audit_list_id, audit_id, order_id, order_amount)
          VALUES ?
      `;
    const updateOrderStatusQuery = `UPDATE ORDERS SET order_status = 'done' WHERE order_id IN (?)`;

    const auditListValues = [];
    const orderIds = [];

    orders.forEach(order => {
      auditListValues.push([
        `AUDIT_LIST-${Date.now()}-${order.order_id}`,
        latestAuditId,
        order.order_id,
        order.order_amount,
      ]);
      orderIds.push(order.order_id);
    });

    console.log("Pushed orders: " + auditListValues);

    connection.query(insertAuditListQuery, [auditListValues], (insertError) => {
      if (insertError) {
        console.error('Error inserting audit list:', insertError);
        return res.status(500).json({ error: 'Failed to insert audit list' });
      }

      connection.query(updateOrderStatusQuery, [orderIds], (updateError) => {
        if (updateError) {
          console.error('Error updating order status:', updateError);
          return res.status(500).json({ error: 'Failed to update order status' });
        }

        res.status(201).json({ message: 'Audit list created and orders updated successfully' });
      });
    });
  });
});





module.exports = router;
