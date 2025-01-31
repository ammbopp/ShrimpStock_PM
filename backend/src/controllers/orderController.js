const express = require('express');
const router = express.Router();
const connection = require('../db/database');
const { v4: uuidv4 } = require('uuid'); // ใช้ UUID เพื่อสร้าง request_id และ request_list_id

router.get('/orders', (req, res) => {
    const { status, order } = req.query;
  
    const statusQuery = status && status !== 'all' ? `AND o.order_status = ?` : '';
  
    const orderQuery = order === 'asc' ? 'ORDER BY o.order_date ASC' : 'ORDER BY o.order_date DESC';
  
    const query = `
      SELECT o.order_id, o.employee_id, o.order_date, o.order_status,
             ol.order_list_id, ol.product_id, ol.order_quantity, ol.unit_id,
             p.product_name, p.product_image, u.unit_name, e.employee_fname, e.employee_lname
      FROM ORDERS o
      JOIN ORDER_LISTS ol ON o.order_id = ol.order_id
      JOIN PRODUCTS p ON ol.product_id = p.product_id
      JOIN UNITS u ON ol.unit_id = u.unit_id
      JOIN EMPLOYEES e ON o.employee_id = e.employee_id
      WHERE 1=1 ${statusQuery} ${orderQuery};
    `;
  
    const queryParams = [];
    if (status && status !== 'all') queryParams.push(status);
  
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' });
      }
  
      res.status(200).json(results);
    });
  });

// ดึงรายละเอียดตาม order_id
router.get('/orders/:order_id', (req, res) => {
  const { order_id } = req.params;

  const query = `
    SELECT o.order_id, o.order_date, o.order_status, o.employee_id,
           e.employee_fname, e.employee_lname, e.employee_image,
           ol.order_list_id, ol.product_id, ol.order_quantity, ol.unit_id,
           p.product_name, p.product_image, u.unit_name
    FROM ORDERS o
    JOIN ORDER_LISTS ol ON o.order_id = ol.order_id
    JOIN PRODUCTS p ON ol.product_id = p.product_id
    JOIN UNITS u ON ol.unit_id = u.unit_id
    JOIN EMPLOYEES e ON o.employee_id = e.employee_id
    WHERE o.order_id = ?;
  `;

  connection.query(query, [order_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }

    res.status(200).json(results);
  });
});

// อัปเดตสถานะเป็น done, accept, reject
router.put('/update-order-status/:order_id', (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  const query = `
    UPDATE ORDERS
    SET order_status = ?
    WHERE order_id = ?;
  `;

  connection.query(query, [status, order_id], (error, results) => {
    if (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสั่งซื้อนี้' });
    }

    res.status(200).json({ message: 'อัปเดตสถานะใบสั่งซื้อสำเร็จ' });
  });
});




module.exports = router;