const express = require('express');
const router = express.Router();
const connection = require('../db/database');
const { route } = require('./requestController');
const { v4: uuidv4 } = require('uuid');

router.get('/ponds', (req, res) => {
    const sql = 'SELECT * FROM ponds'; 
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving ponds:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
     
      res.json(results);
    });
  });

  router.get('/pondsOpen', (req, res) => {
    const sql = 'SELECT * FROM ponds WHERE pond_status = "OPEN"';
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving open ponds:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  
  router.get('/pondsClose', (req, res) => {
    const sql = 'SELECT * FROM ponds WHERE pond_status = "CLOSE"';
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving closed ponds:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  

  router.get('/ponds/:pond_id', (req, res) => {
    const { pond_id } = req.params;
    const sql = 'SELECT * FROM ponds WHERE pond_id = ?';
    connection.query(sql, [pond_id], (error, results) => {
      if (error) {
        console.error('Error retrieving pond:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Pond not found' });
      }
      res.json(results);
    });
  });

  router.get('/ponds/allHistory/:pond_id', (req, res) => {
    const { pond_id } = req.params;
    const sql = 'SELECT pond_used_id FROM pond_history WHERE pond_id = ?';
    connection.query(sql, [pond_id], (error, results) => {
      if (error) {
        console.error('Error retrieving pond history:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Pond not found' });
      }
      res.json(results);
    });
  });

  router.get('/pond/detail/:pond_used_id', (req, res) => {
    const { pond_used_id } = req.params;
    
    const sql = `
      SELECT 
        rl.PRODUCT_ID, 
        p.product_name, 
        p.product_image, 
        rl.UNIT_ID, 
        u.unit_name, 
        rl.REQUEST_QUANTITY 
      FROM request_lists AS rl
      JOIN products AS p ON rl.PRODUCT_ID = p.product_id
      JOIN units AS u ON rl.UNIT_ID = u.unit_id
      WHERE rl.REQUEST_ID IN (
        SELECT request_id FROM requests 
        WHERE pond_used_id = ?
      )
    `;
    
    connection.query(sql, [pond_used_id], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  

  router.put('/pond/status/close/:pond_id', (req, res) => {
    const { pond_id } = req.params;          
    const { pond_status } = req.body;             
    
    if (!['CLOSE'].includes(pond_status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "CLOSE" to close the pond.' });
    }
  
    const sql = 'UPDATE ponds SET pond_status = ? WHERE pond_id = ?';
    connection.query(sql, [pond_status, pond_id], (error, results) => {
      if (error) {
        console.error('Error updating pond status:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Pond not found' });
      }
      res.json({ message: `Pond status updated to ${pond_status}` });
    });
  });
  
 

  router.post('/pond/status/open/:pond_id', async (req, res) => {
    const { pond_id, staff } = req.body; 

    try {
        const new_current_used_id = uuidv4(); 

        const [updatePondStatus] = await connection.promise().query(
            'UPDATE ponds SET pond_status = "OPEN" WHERE pond_id = ?',
            [pond_id]
        );

        if (updatePondStatus.affectedRows === 0) {
            await db.query("ROLLBACK");
            return res.status(400).json({ error: 'Error updating pond_status in ponds table' });
        }

        const [updatePondResult] = await connection.promise().query(
            'UPDATE ponds SET current_used_id = ? WHERE pond_id = ?',
            [new_current_used_id, pond_id]
        );

        if (updatePondResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Error updating current_used_id in ponds table' });
        }

        const [insertPondHistory] = await connection.promise().query(
            'INSERT INTO pond_history (pond_used_id, pond_id) VALUES (?, ?)',
            [new_current_used_id, pond_id]
        );

        if (insertPondHistory.affectedRows === 0) {
            return res.status(404).json({ error: 'Error inserting into pond_history table' });
        }

        if (staff.length > 0) {
            const staffValues = staff.map(empId => [empId, new_current_used_id]);

            await connection.promise().query(
                'INSERT INTO pond_staffs (employee_id, pond_used_id) VALUES ?',
                [staffValues]
            );
        }

        res.json({ message: 'Pond staff updated successfully' });

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// เพิ่มใน pondController.js
router.get('/pond_staffs/pond/:pond_used_id', (req, res) => {
  const { pond_used_id } = req.params;
  const sql = 'SELECT employee_id FROM pond_staffs WHERE pond_used_id = ?';
  connection.query(sql, [pond_used_id], (error, results) => {
    if (error) {
      console.error('Error retrieving pond staff:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

module.exports = router;