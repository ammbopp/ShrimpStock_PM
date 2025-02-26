// backend/routes/orders.js

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

// ดึงข้อมูลออเดอร์ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const query = `SELECT * FROM orders ORDER BY created_at DESC`;
    const [orders] = await conn.execute(query);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ดึงข้อมูลออเดอร์เฉพาะรายการ
router.get('/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const orderId = req.params.id;
    
    // ดึงข้อมูลออเดอร์
    const orderQuery = `SELECT * FROM orders WHERE id = ?`;
    const [orders] = await conn.execute(orderQuery, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // ดึงข้อมูลรายการสินค้าในออเดอร์
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, u.name as unit_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN units u ON oi.unit_id = u.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `;
    
    const [items] = await conn.execute(itemsQuery, [orderId]);
    
    res.json({
      ...order,
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// สร้างออเดอร์ใหม่
router.post('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const { customerId, orderDate, notes } = req.body;
    
    const query = `
      INSERT INTO orders (customer_id, order_date, notes, total_amount, created_at) 
      VALUES (?, ?, ?, 0, NOW())
    `;
    
    const [result] = await conn.execute(query, [customerId, orderDate, notes]);
    
    res.status(201).json({
      id: result.insertId,
      customerId,
      orderDate,
      notes,
      totalAmount: 0,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// เพิ่มสินค้าในออเดอร์พร้อมระบุหน่วย
router.post('/:id/items', async (req, res) => {
  try {
    const conn = await getConnection();
    const orderId = req.params.id;
    const { productId, quantity, unitId } = req.body;
    
    // ตรวจสอบว่าสินค้ามีอยู่จริงและหน่วยที่เลือกใช้ได้กับสินค้านี้
    const validateQuery = `
      SELECT p.id, p.price, 
             COALESCE(u.id, p.default_unit_id) as unit_id,
             COALESCE(u.name, default_u.name) as unit_name
      FROM products p
      LEFT JOIN units default_u ON p.default_unit_id = default_u.id
      LEFT JOIN units u ON u.id = ?
      LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.unit_id = ?
      LEFT JOIN product_types pt ON p.product_type_id = pt.id
      LEFT JOIN product_type_units ptu ON pt.id = ptu.product_type_id AND ptu.unit_id = ?
      WHERE p.id = ? AND (
        pu.unit_id IS NOT NULL OR 
        ptu.unit_id IS NOT NULL OR 
        p.default_unit_id = ? OR
        ? IS NULL
      )
    `;
    
    // ถ้าไม่ได้ระบุ unitId ให้ใช้ default_unit_id ของสินค้า
    const useUnitId = unitId || null;
    
    const [validateResult] = await conn.execute(validateQuery, [
      useUnitId, useUnitId, useUnitId, productId, useUnitId, useUnitId
    ]);
    
    if (validateResult.length === 0) {
      return res.status(400).json({ error: 'Invalid product or unit' });
    }
    
    const product = validateResult[0];
    const finalUnitId = unitId || product.unit_id;
    
    // คำนวณราคารวมตามหน่วยที่เลือก (อาจมีการปรับราคาตามหน่วย)
    const productPrice = product.price;
    const totalPrice = productPrice * quantity;
    
    // สร้างรายการสินค้าในออเดอร์
    const insertQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_id, price, total_price) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await conn.execute(insertQuery, [
      orderId, productId, quantity, finalUnitId, productPrice, totalPrice
    ]);
    
    // อัพเดทมูลค่ารวมของออเดอร์
    await updateOrderTotalAmount(conn, orderId);
    
    res.status(201).json({
      id: result.insertId,
      orderId,
      productId,
      quantity,
      unitId: finalUnitId,
      unitName: product.unit_name,
      price: productPrice,
      totalPrice
    });
  } catch (error) {
    console.error('Error adding product to order:', error);
    res.status(500).json({ error: 'Failed to add product to order' });
  }
});

// แก้ไขรายการสินค้าในออเดอร์
router.put('/:orderId/items/:itemId', async (req, res) => {
  try {
    const conn = await getConnection();
    const { orderId, itemId } = req.params;
    const { quantity, unitId } = req.body;
    
    // ดึงข้อมูลรายการสินค้าที่จะแก้ไข
    const getItemQuery = `
      SELECT oi.*, p.price as current_price, p.id as product_id
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.id = ? AND oi.order_id = ?
    `;
    
    const [items] = await conn.execute(getItemQuery, [itemId, orderId]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    
    const item = items[0];
    
    // ตรวจสอบหน่วยที่เลือกใช้ได้กับสินค้านี้หรือไม่
    if (unitId && unitId !== item.unit_id) {
      const validateUnitQuery = `
        SELECT 1
        FROM products p
        LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.unit_id = ?
        LEFT JOIN product_types pt ON p.product_type_id = pt.id
        LEFT JOIN product_type_units ptu ON pt.id = ptu.product_type_id AND ptu.unit_id = ?
        WHERE p.id = ? AND (pu.unit_id IS NOT NULL OR ptu.unit_id IS NOT NULL OR p.default_unit_id = ?)
      `;
      
      const [validateResult] = await conn.execute(validateUnitQuery, [
        unitId, unitId, item.product_id, unitId
      ]);
      
      if (validateResult.length === 0) {
        return res.status(400).json({ error: 'Invalid unit for this product' });
      }
    }
    
    const newUnitId = unitId || item.unit_id;
    const newQuantity = quantity || item.quantity;
    const totalPrice = item.price * newQuantity;
    
    // อัพเดทรายการสินค้า
    const updateQuery = `
      UPDATE order_items
      SET quantity = ?, unit_id = ?, total_price = ?
      WHERE id = ? AND order_id = ?
    `;
    
    await conn.execute(updateQuery, [
      newQuantity, newUnitId, totalPrice, itemId, orderId
    ]);
    
    // อัพเดทมูลค่ารวมของออเดอร์
    await updateOrderTotalAmount(conn, orderId);
    
    // ดึงข้อมูลรายการสินค้าที่อัพเดทแล้ว
    const getUpdatedItemQuery = `
      SELECT oi.*, p.name as product_name, u.name as unit_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN units u ON oi.unit_id = u.id
      WHERE oi.id = ?
    `;
    
    const [updatedItems] = await conn.execute(getUpdatedItemQuery, [itemId]);
    
    res.json(updatedItems[0]);
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

// ลบรายการสินค้าในออเดอร์
router.delete('/:orderId/items/:itemId', async (req, res) => {
  try {
    const conn = await getConnection();
    const { orderId, itemId } = req.params;
    
    // ตรวจสอบว่ารายการสินค้ามีอยู่จริง
    const checkQuery = `SELECT 1 FROM order_items WHERE id = ? AND order_id = ?`;
    const [checkResult] = await conn.execute(checkQuery, [itemId, orderId]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    
    // ลบรายการสินค้า
    const deleteQuery = `DELETE FROM order_items WHERE id = ? AND order_id = ?`;
    await conn.execute(deleteQuery, [itemId, orderId]);
    
    // อัพเดทมูลค่ารวมของออเดอร์
    await updateOrderTotalAmount(conn, orderId);
    
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    console.error('Error deleting order item:', error);
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

// ฟังก์ชันสำหรับอัพเดทมูลค่ารวมของออเดอร์
async function updateOrderTotalAmount(conn, orderId) {
  const query = `
    UPDATE orders o
    SET total_amount = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM order_items 
      WHERE order_id = ?
    )
    WHERE o.id = ?
  `;
  
  await conn.execute(query, [orderId, orderId]);
}

module.exports = router;