const express = require('express');
const router = express.Router();
const db = require('../db/database'); 
const { v4: uuidv4 } = require('uuid');

// ดึงข้อมูลพนักงานทั้งหมดหรือตามตำแหน่งงาน
router.get('/employee', (req, res) => {
  const { position } = req.query; // รับค่าตำแหน่ง

  let query = 'SELECT * FROM employees';
  let values = [];

  if (position) {
    query += ' WHERE employee_position = ?';
    values.push(position);
  }

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ error: 'Failed to retrieve employees' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No employees found' });
    }

    res.status(200).json(results);
  });
});


router.get('/employee/getAllWorkerAcademic',(req,res)=>{
  const sql = 'SELECT * FROM employees WHERE employee_position = "worker" OR employee_position = "academic"'; 
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving worker:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
     
      res.json(results);
    });
})

router.get('/employee/getAllWorker',(req,res)=>{
  const sql = 'SELECT * FROM employees WHERE employee_position = "worker"'; 
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving worker:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
     
      res.json(results);
    });
})


router.get('/employee/getAllAcademic',(req,res)=>{
  const sql = 'SELECT * FROM employees WHERE employee_position = "academic"'; 
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving Academic:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
     
      res.json(results);
    });
})


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

//  API เพิ่มพนักงานใหม่
router.post('/employee/add', (req, res) => {
  let {
    employee_id,
    employee_fname,
    employee_lname,
    employee_age,
    employee_sex,
    employee_position,
    employee_address,
    employee_salary,
    employee_image,
    username,
    password,
    status
  } = req.body;

  if (!employee_id) {
    employee_id = uuidv4();
  }

  if (!employee_image) {
    employee_image = 'panda.png';
  }

  const validPositions = ['worker', 'academic', 'clerical', 'keeper'];
  if (!validPositions.includes(employee_position)) {
    return res.status(400).json({ error: 'Invalid employee position' });
  }

  const validSex = ['Male', 'Female', 'Other'];
  if (!validSex.includes(employee_sex)) {
    return res.status(400).json({ error: 'Invalid employee sex' });
  }

  if (status === undefined) {
    status = 1;
  }

  const query = `
    INSERT INTO employees (
      employee_id, employee_fname, employee_lname, employee_age, employee_sex,
      employee_position, employee_address, employee_salary, employee_image, 
      username, password, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    employee_id, employee_fname, employee_lname, employee_age, employee_sex,
    employee_position, employee_address, employee_salary, employee_image, 
    username, password, status
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting new employee:', error);
      return res.status(500).json({ error: 'Failed to add new employee' });
    }
    
    res.status(201).json({ message: 'Employee added successfully' });
  });
});

// edit empolyee infomation
router.put('/employee/update/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No data provided for update' });
  }

  const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
  const values = Object.values(updates);
  
  const query = `UPDATE employees SET ${fields} WHERE employee_id = ?`;
  values.push(employee_id);

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ error: 'Failed to update employee' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully' });
  });
});



module.exports = router;




