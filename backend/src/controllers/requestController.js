// requestController.js
const express = require('express');
const router = express.Router();
const connection = require('../db/database');
const { v4: uuidv4 } = require('uuid'); // ใช้ UUID เพื่อสร้าง request_id และ request_list_id

router.get('/products/food', (req, res) => {
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image
    FROM products
    WHERE product_type = 'Food' 
      AND product_quantity > threshold;
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

router.get('/products/chemical', (req, res) => {
  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image
    FROM products
    WHERE product_type = 'Chemical' 
      AND product_quantity > threshold;
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

router.get('/requests/:employee_id', (req, res) => {
  const { employee_id } = req.params;
  const { status, order } = req.query; // รับ query params เช่น status และ order

  // สร้าง statusQuery ให้ไม่มี 'AND' ถ้า status เป็น 'all'
  let statusQuery = '';
  if (status && status !== 'all') {
    statusQuery = `AND request_status = ?`; // ใช้ ? เพื่อป้องกัน SQL injection
  }

  const orderQuery = order === 'asc' ? 'ORDER BY request_date ASC' : 'ORDER BY request_date DESC'; // เรียงลำดับ

  const query = `
    SELECT request_id, employee_id, request_date, request_status
    FROM requests
    WHERE employee_id = ? ${statusQuery} ${orderQuery};
  `;

  connection.query(query, [employee_id, status !== 'all' ? status : null], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }

    res.status(200).json(results);
  });
});

// ของธุรการ request sort 3 อัน
router.get('/requests/', (req, res) => {
  const { status, order, product_type } = req.query;

  const statusQuery = status && status !== 'all' ? `AND r.request_status = ?` : '';
  const productTypeQuery = product_type ? `AND p.product_type = ?` : '';
  const orderQuery = order === 'asc' ? 'ORDER BY r.request_date ASC' : 'ORDER BY r.request_date DESC';

  const query = `
    SELECT r.request_id, r.employee_id, r.request_date, r.request_status, p.product_type
    FROM requests r
    JOIN request_lists rl ON r.request_id = rl.request_id
    JOIN products p ON rl.product_id = p.product_id
    WHERE 1=1 ${statusQuery} ${productTypeQuery} ${orderQuery};
  `;

  const queryParams = [];
  if (status && status !== 'all') queryParams.push(status);
  if (product_type) queryParams.push(product_type);

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }

    res.status(200).json(results);
  });
});



// ดึงข้อมูลใบเบิกที่ถูกสร้างโดย employee_id และสถานะเป็น 'accept'
router.get('/home/requests/accept/:employee_id', async (req, res) => {
  const { employee_id } = req.params;

  try {
    const query = `
      SELECT * FROM requests
      WHERE employee_id = ? AND request_status = 'accept'
      ORDER BY request_date DESC LIMIT 5
    `;
    const values = [employee_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Error fetching accepted requests:', error);
        return res.status(500).json({ error: 'Failed to fetch accepted requests' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// homeของธุรการ
router.get('/home/clerical/requests/waiting', async (req, res) => {

  const query = `
      SELECT * FROM requests
      WHERE request_status = 'waiting'
      ORDER BY request_date DESC
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


router.get('/request-detail/:request_id', (req, res) => {
  const { request_id } = req.params;
  console.log('Received request_id:', request_id);
  const query = `
    SELECT r.request_id, r.employee_id, r.request_date, r.request_status,
           rl.product_id, p.product_name, rl.request_quantity, u.unit_name, p.product_image
    FROM REQUESTS r
    JOIN REQUEST_LISTS rl ON r.request_id = rl.request_id
    JOIN PRODUCTS p ON rl.product_id = p.product_id
    JOIN UNITS u ON rl.unit_id = u.unit_id
    WHERE r.request_id = ?;
  `;

  connection.query(query, [request_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }

    res.status(200).json(results);
  });
});

// request detail ของธุรการ
router.get('/request-detail-2/:request_id', (req, res) => {
  const { request_id } = req.params;
  console.log('Received request_id:', request_id);

  const query = `
    SELECT r.request_id, r.employee_id, r.request_date, r.request_status,
           e.employee_fname, e.employee_lname, e.employee_image,
           rl.product_id, p.product_name, rl.request_quantity, u.unit_name, p.product_image, p.product_type
    FROM REQUESTS r
    JOIN REQUEST_LISTS rl ON r.request_id = rl.request_id
    JOIN PRODUCTS p ON rl.product_id = p.product_id
    JOIN UNITS u ON rl.unit_id = u.unit_id
    JOIN EMPLOYEES e ON r.employee_id = e.employee_id
    WHERE r.request_id = ?;
  `;

  connection.query(query, [request_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }

    res.status(200).json(results);
  });
});


// สร้าง Request ใหม่พร้อมกับสินค้าใน Cart
router.post('/create-request', async (req, res) => {
  const { employee_id, cart } = req.body;

  if (!employee_id || !cart || cart.length === 0) {
    console.error('ข้อมูลไม่ครบถ้วน:', { employee_id, cart });
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    // สร้าง request_id ใหม่ด้วย UUID
    const request_id = uuidv4();

    // เริ่มสร้าง Request ใหม่ในตาราง REQUESTS
    const createRequestQuery = `
      INSERT INTO REQUESTS (request_id, employee_id, request_date, request_status)
      VALUES (?, ?, NOW(), 'waiting')`;
    await new Promise((resolve, reject) => {
      connection.query(createRequestQuery, [request_id, employee_id], (err) => {
        if (err) {
          console.error('Error creating request:', err);
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

    // เตรียมข้อมูลสำหรับบันทึกลงในตาราง REQUEST_LISTS
    const requestItems = updatedCart.map((item) => [
      uuidv4(), // request_list_id ใหม่สำหรับแต่ละรายการ
      request_id,
      item.product_id,
      item.quantity,
      item.unit_id,
    ]);

    // บันทึกข้อมูลสินค้าที่อยู่ใน Cart ลงในตาราง REQUEST_LISTS
    const createRequestItemsQuery = `
      INSERT INTO REQUEST_LISTS (request_list_id, request_id, product_id, request_quantity, unit_id)
      VALUES ?`;
    await new Promise((resolve, reject) => {
      connection.query(createRequestItemsQuery, [requestItems], (err) => {
        if (err) {
          console.error('Error inserting request items:', err);
          return reject(err);
        }
        resolve();
      });
    });

    // ส่ง response กลับไปยัง client
    res.status(201).json({ message: 'สร้างใบเบิกสำเร็จ', request_id });

  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างใบเบิก' });
  }
});

// อัปเดตสถานะใบเบิกเป็น done, accept
router.put('/update-request-status/:request_id', (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  const query = `
    UPDATE REQUESTS
    SET request_status = ?
    WHERE request_id = ?;
  `;

  connection.query(query, [status, request_id], (error, results) => {
    if (error) {
      console.error('Error updating request status:', error);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะใบเบิก' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบใบเบิกนี้' });
    }

    res.status(200).json({ message: 'อัปเดตสถานะใบเบิกสำเร็จ' });
  });
});




module.exports = router;
