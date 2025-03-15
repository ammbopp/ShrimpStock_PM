const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Get all audits
router.get('/audits', (req, res) => {
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
  const { orders } = req.body;

  if (!orders || orders.length === 0) {
    return res.status(400).json({ error: "No orders provided" });
  }

  console.log("Orders received:", orders);

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
    const timestamp = Date.now(); // ใช้ timestamp เดียวกันในทุก iteration

    orders.forEach(order => {
      if (!order.order_id) {
        console.error("Invalid order data:", order);
        return;
      }

      const auditListId = `AUDIT_LIST-${timestamp}-${order.order_id}`.slice(0, 50); // จำกัดความยาวไม่ให้เกิน 50 ตัวอักษร
      auditListValues.push([auditListId, latestAuditId, order.order_id, order.order_amount]);
      orderIds.push(order.order_id);
    });

    if (auditListValues.length === 0) {
      return res.status(400).json({ error: "No valid orders to insert" });
    }

    console.log("Pushed audit list values:", auditListValues);

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
