const express = require('express');
const router = express.Router();
const connection = require('../db/database');
const { v4: uuidv4 } = require('uuid'); // ใช้ UUID เพื่อสร้าง order_id และ order_list_id

// ดึงรายการสินค้าอาหาร (Food) สำหรับการสั่งซื้อ
router.get('/products/food', (req, res) => {
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image
    FROM products
    WHERE product_type = 'Food' 
      AND product_quantity <= threshold;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(results);
  });
});

// ดึงรายการสินค้าเคมีภัณฑ์ (Chemical) สำหรับการสั่งซื้อ
router.get('/products/chemical', (req, res) => {
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image
    FROM products
    WHERE product_type = 'Chemical' 
      AND product_quantity <= threshold;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(results);
  });
});

// ดึงหน่วยของสินค้าประเภทอาหาร
router.get('/units/food', (req, res) => {
  const query = `SELECT unit_id, unit_name FROM UNITS WHERE product_type = 'Food'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    res.status(200).json(results);
  });
});

// ดึงหน่วยของสินค้าประเภทเคมีภัณฑ์
router.get('/units/chem', (req, res) => {
  const query = `SELECT unit_id, unit_name FROM UNITS WHERE product_type = 'Chemical'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Database query error' });
      return;
    }

    res.status(200).json(results);
  });
});

// ดึงรายการสั่งซื้อตาม employee_id
router.get('/orders/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { status, order } = req.query; // รับ query params เช่น status และ order

  // สร้าง statusQuery ให้ไม่มี 'AND' ถ้า status เป็น 'all'
  let statusQuery = '';
  if (status && status !== 'all') {
    statusQuery = `AND order_status = ?`; // ใช้ ? เพื่อป้องกัน SQL injection
  }

  const orderQuery = order === 'asc' ? 'ORDER BY order_date ASC' : 'ORDER BY order_date DESC'; // เรียงลำดับ

  const query = `
    SELECT order_id, employee_id, order_date, order_status
    FROM orders
    WHERE employee_id = ? ${statusQuery} ${orderQuery};
  `;

  connection.query(query, [employee_id, status !== 'all' ? status : null], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ' });
    }

    res.status(200).json(results);
  });
});

// ดึงรายการสั่งซื้อทั้งหมดสำหรับธุรการ (สามารถกรองด้วย status, order, product_type)
router.get('/orders', (req, res) => {
  const { status, order, product_type } = req.query;

  const statusQuery = status && status !== 'all' ? `AND o.order_status = ?` : '';
  const productTypeQuery = product_type ? `AND p.product_type = ?` : '';
  const orderQuery = order === 'asc' ? 'ORDER BY o.order_date ASC' : 'ORDER BY o.order_date DESC';

  const query = `
    SELECT o.order_id, o.employee_id, o.order_date, o.order_status,
           ol.order_list_id, ol.product_id, ol.order_quantity, ol.unit_id,
           p.product_name, p.product_image, u.unit_name, e.employee_fname, e.employee_lname, p.product_type
    FROM ORDERS o
    JOIN ORDER_LISTS ol ON o.order_id = ol.order_id
    JOIN PRODUCTS p ON ol.product_id = p.product_id
    JOIN UNITS u ON ol.unit_id = u.unit_id
    JOIN EMPLOYEES e ON o.employee_id = e.employee_id
    WHERE 1=1 ${statusQuery} ${productTypeQuery} ${orderQuery};
  `;

  const queryParams = [];
  if (status && status !== 'all') queryParams.push(status);
  if (product_type) queryParams.push(product_type);

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ' });
    }

    res.status(200).json(results);
  });
});

// ดึงข้อมูลใบสั่งซื้อที่ถูกสร้างโดย employee_id และสถานะเป็น 'accept'
router.get('/home/orders/accept/:employee_id', async (req, res) => {
  const { employee_id } = req.params;

  try {
    const query = `
      SELECT * FROM orders
      WHERE employee_id = ? AND order_status = 'accept'
      ORDER BY order_date DESC LIMIT 5
    `;
    const values = [employee_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Error fetching accepted orders:', error);
        return res.status(500).json({ error: 'Failed to fetch accepted orders' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ดึงใบสั่งซื้อรอดำเนินการสำหรับหน้า home ของธุรการ
router.get('/home/clerical/orders/waiting', async (req, res) => {
  const query = `
    SELECT * FROM orders
    WHERE order_status = 'waiting'
    ORDER BY order_date DESC
    LIMIT 5
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

// ดึงรายละเอียดใบสั่งซื้อตาม order_id
router.get('/order-detail/:order_id', (req, res) => {
  const { order_id } = req.params;
  console.log('Received order_id:', order_id);
  const query = `
    SELECT o.order_id, o.employee_id, o.order_date, o.order_status,
           ol.product_id, p.product_name, ol.order_quantity, u.unit_name, p.product_image
    FROM ORDERS o
    JOIN ORDER_LISTS ol ON o.order_id = ol.order_id
    JOIN PRODUCTS p ON ol.product_id = p.product_id
    JOIN UNITS u ON ol.unit_id = u.unit_id
    WHERE o.order_id = ?;
  `;

  connection.query(query, [order_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ' });
    }

    res.status(200).json(results);
  });
});

// ดึงรายละเอียดใบสั่งซื้อพร้อมข้อมูลพนักงานสำหรับธุรการ
router.get('/order-detail-2/:order_id', (req, res) => {
  const { order_id } = req.params;
  console.log('Received order_id:', order_id);

  const query = `
    SELECT o.order_id, o.employee_id, o.order_date, o.order_status,
           e.employee_fname, e.employee_lname, e.employee_image,
           ol.product_id, p.product_name, ol.order_quantity, u.unit_name, p.product_image, p.product_type
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
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งซื้อ' });
    }

    res.status(200).json(results);
  });
});

// สร้าง Order ใหม่พร้อมกับสินค้าใน Cart
router.post('/create-order', async (req, res) => {
  const { employee_id, cart } = req.body;

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!employee_id || !cart || cart.length === 0) {
    console.error('ข้อมูลไม่ครบถ้วน:', { employee_id, cart });
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    // สร้าง order_id ใหม่ด้วย UUID
    const order_id = uuidv4();

    // เริ่มสร้าง Order ใหม่ในตาราง ORDERS
    const createOrderQuery = `
      INSERT INTO ORDERS (order_id, employee_id, order_date, order_status)
      VALUES (?, ?, NOW(), 'waiting')`;
    
    await new Promise((resolve, reject) => {
      connection.query(createOrderQuery, [order_id, employee_id], (err) => {
        if (err) {
          console.error('Error creating order:', err);
          return reject(err);
        }
        resolve();
      });
    });

    // ดึง unit_id จากชื่อหน่วย (unit) ในแต่ละรายการใน cart
    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        return new Promise((resolve, reject) => {
          const unitQuery = `SELECT unit_id FROM UNITS WHERE unit_name = ? LIMIT 1`;
          connection.query(unitQuery, [item.unit], (err, results) => {
            if (err) {
              console.error('Error querying unit_id:', err);
              return reject(err);
            }
            if (results.length === 0) {
              return reject(new Error(`Unit '${item.unit}' not found in the database`));
            }

            // เพิ่ม unit_id ให้กับรายการใน cart
            const updatedItem = {
              ...item,
              unit_id: results[0].unit_id,
            };
            resolve(updatedItem);
          });
        });
      })
    );

    // เตรียมข้อมูลสำหรับบันทึกลงในตาราง ORDER_LISTS
    const orderItems = updatedCart.map((item) => [
      uuidv4(), // order_list_id ใหม่สำหรับแต่ละรายการ
      order_id,
      item.product_id,
      item.quantity,
      item.unit_id,
    ]);

    // บันทึกข้อมูลสินค้าที่อยู่ใน Cart ลงในตาราง ORDER_LISTS
    const createOrderItemsQuery = `
      INSERT INTO ORDER_LISTS (order_list_id, order_id, product_id, order_quantity, unit_id)
      VALUES ?`;
    
    await new Promise((resolve, reject) => {
      connection.query(createOrderItemsQuery, [orderItems], (err) => {
        if (err) {
          console.error('Error inserting order items:', err);
          return reject(err);
        }
        resolve();
      });
    });

    // ส่ง response กลับไปยัง client
    res.status(201).json({ message: 'สร้างใบสั่งซื้อสำเร็จ', order_id });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ' });
  }
});

// อัปเดตสถานะใบสั่งซื้อเป็น done, accept, reject
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
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะใบสั่งซื้อ' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบใบสั่งซื้อนี้' });
    }

    res.status(200).json({ message: 'อัปเดตสถานะใบสั่งซื้อสำเร็จ' });
  });
});

module.exports = router;