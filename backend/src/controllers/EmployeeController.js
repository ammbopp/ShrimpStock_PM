// src/controllers/EmployeeController.js
const express = require('express');
const router = express.Router();
const db = require('../db/database'); // เชื่อมต่อกับ database

// ฟังก์ชันสำหรับดึงข้อมูลพนักงานตาม employee_id
router.get('/employee/:employee_id', (req, res) => {
  const { employee_id } = req.params;

  const query = 'SELECT * FROM employees WHERE employee_id = ?';
  const values = [employee_id];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error fetching employee data:', error);
      return res.status(500).json({ error: 'Failed to fetch employee data' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = results[0];
    res.status(200).json(employee);
  });
});

// ฟังก์ชันสำหรับอัปเดตข้อมูลพนักงานตาม employee_id
router.put('/employee/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { employee_fname, employee_lname, employee_address } = req.body;

  // คำสั่ง SQL สำหรับอัปเดตเฉพาะข้อมูลที่อนุญาตให้แก้ไข
  const query = `
    UPDATE employees
    SET employee_fname = ?, employee_lname = ?, employee_address = ?
    WHERE employee_id = ?`;
  const values = [employee_fname, employee_lname, employee_address, employee_id];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error updating employee data:', error);
      return res.status(500).json({ error: 'Failed to update employee data' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully' });
  });
});

module.exports = router;



module.exports = router;
