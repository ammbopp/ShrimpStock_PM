const express = require('express');
const router = express.Router();
const connection = require('../db/database');

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
  
  
  

module.exports = router;