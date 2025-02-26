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

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!employee_id || !cart || cart.length === 0) {
    console.error('ข้อมูลไม่ครบถ้วน:', { employee_id, cart });
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  try {
    // ดึง pond_used_id จาก POND_STAFFS ตาม employee_id
    const pondUsedQuery = `
      SELECT pond_used_id FROM POND_STAFFS WHERE employee_id = ? LIMIT 1`;
    
    const pondUsedId = await new Promise((resolve, reject) => {
      connection.query(pondUsedQuery, [employee_id], (err, results) => {
        if (err) {
          console.error('Error querying pond_used_id:', err);
          return reject(err);
        }
        if (results.length === 0) {
          return reject(new Error(`ไม่พบข้อมูลสำหรับ employee_id: ${employee_id}`));
        }
        resolve(results[0].pond_used_id);
      });
    });

    // สร้าง request_id ใหม่ด้วย UUID
    const request_id = uuidv4();

    // เริ่มสร้าง Request ใหม่ในตาราง REQUESTS
    const createRequestQuery = `
      INSERT INTO REQUESTS (request_id, employee_id, pond_used_id, request_date, request_status)
      VALUES (?, ?, ?, NOW(), 'waiting')`;
    
    await new Promise((resolve, reject) => {
      connection.query(createRequestQuery, [request_id, employee_id, pondUsedId], (err) => {
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

const unitConversion = {
  'Kilogram': { 'Gram': 1000 },
  'Gram': { 'Kilogram': 0.001 },
  'Liter': { 'Milliliter': 1000 },
  'Milliliter': { 'Liter': 0.001 },
  'Pound': { 'Kilogram': 0.453592 },
  'Ton': { 'Kilogram': 1000 }
};

const convertUnit = (quantity, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return quantity;
  if (unitConversion[fromUnit] && unitConversion[fromUnit][toUnit]) {
    return quantity * unitConversion[fromUnit][toUnit];
  }
  return null;
};

const getProductUnit = async (product_id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT product_unit FROM PRODUCTS WHERE product_id = ?`;
    connection.query(query, [product_id], (error, results) => {
      if (error) return reject(error);
      if (results.length === 0) return reject('Product not found');
      resolve(results[0].product_unit);
    });
  });
};

// อัปเดตสถานะใบเบิกเป็น done, accept และหักสต็อกสินค้าจากล็อตที่ใกล้หมดอายุก่อน
router.put('/update-request-status/:request_id', (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  if (status === 'accept') {
    // ดึงข้อมูลสินค้าทั้งหมดที่เกี่ยวข้องกับ request นี้
    const query = `
      SELECT rl.product_id, rl.request_quantity, rl.unit_id, u.unit_name, p.product_unit
      FROM REQUEST_LISTS rl
      JOIN PRODUCTS p ON rl.product_id = p.product_id
      JOIN UNITS u ON rl.unit_id = u.unit_id
      WHERE rl.request_id = ?;
    `;

    connection.query(query, [request_id], async (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'ไม่พบสินค้าในคำขอนี้' });
      }

      for (const item of results) {
        const { product_id, request_quantity, unit_name, product_unit } = item;
        let finalQuantity = request_quantity;

        if (unit_name !== product_unit) {
          finalQuantity = convertUnit(request_quantity, unit_name, product_unit);
          if (finalQuantity === null) {
            return res.status(400).json({ message: `ไม่สามารถแปลงหน่วย ${unit_name} เป็น ${product_unit} ได้` });
          }
        }

        // ดึงล็อตสินค้าตามวันหมดอายุจากเก่าสุดไปใหม่สุด
        const lotQuery = `SELECT lot_id, lot_quantity FROM PRODUCT_LOTS WHERE product_id = ? ORDER BY lot_exp ASC;`;
        connection.query(lotQuery, [product_id], (lotError, lotResults) => {
          if (lotError) {
            console.error('Error fetching product lots:', lotError);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงล็อตสินค้า' });
          }

          let remainingQuantity = finalQuantity;
          for (const lot of lotResults) {
            if (remainingQuantity <= 0) break;

            const deductedQuantity = Math.min(lot.lot_quantity, remainingQuantity);
            remainingQuantity -= deductedQuantity;

            const updateLotQuery = `UPDATE PRODUCT_LOTS SET lot_quantity = lot_quantity - ? WHERE lot_id = ?;`;
            connection.query(updateLotQuery, [deductedQuantity, lot.lot_id], (updateLotError) => {
              if (updateLotError) {
                console.error('Error updating lot quantity:', updateLotError);
              }
            });
          }

          if (remainingQuantity > 0) {
            return res.status(400).json({ message: `สินค้า ${product_id} ไม่เพียงพอในสต็อก` });
          }

          // อัปเดตปริมาณสินค้าใน PRODUCTS หลังจากหักล็อต
          const updateProductQuery = `UPDATE PRODUCTS SET product_quantity = product_quantity - ? WHERE product_id = ?;`;
          connection.query(updateProductQuery, [finalQuantity, product_id], (updateProductError) => {
            if (updateProductError) {
              console.error('Error updating product quantity:', updateProductError);
              return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตปริมาณสินค้า' });
            }
          });
        });
      }

      // อัปเดตสถานะใบเบิกเป็น accept
      const updateRequestQuery = `UPDATE REQUESTS SET request_status = ? WHERE request_id = ?;`;
      connection.query(updateRequestQuery, [status, request_id], (error, results) => {
        if (error) {
          console.error('Error updating request status:', error);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะใบเบิก' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'ไม่พบใบเบิกนี้' });
        }
        res.status(200).json({ message: 'อัปเดตสถานะใบเบิกสำเร็จ และหักสต็อกสินค้าเรียบร้อย' });
      });
    });
  } else {
    // อัปเดตเฉพาะสถานะถ้าไม่ใช่ accept
    const query = `UPDATE REQUESTS SET request_status = ? WHERE request_id = ?;`;
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
  }
});



module.exports = router;
