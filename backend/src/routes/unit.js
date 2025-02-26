// backend/routes/units.js

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

// ดึงข้อมูลหน่วยทั้งหมด
router.get('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const query = `SELECT * FROM units ORDER BY name ASC`;
    const [units] = await conn.execute(query);
    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// ดึงข้อมูลหน่วยตามประเภทสินค้า
router.get('/by-product-type/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const productTypeId = req.params.id;
    const query = `
      SELECT u.* 
      FROM units u
      JOIN product_type_units ptu ON u.id = ptu.unit_id
      WHERE ptu.product_type_id = ?
    `;
    
    const [units] = await conn.execute(query, [productTypeId]);
    res.json(units);
  } catch (error) {
    console.error('Error fetching units for product type:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// ดึงข้อมูลหน่วยตามสินค้า
router.get('/by-product/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const productId = req.params.id;
    
    // ดึงข้อมูลประเภทของสินค้าก่อน
    const productQuery = `SELECT product_type_id FROM products WHERE id = ?`;
    const [productResult] = await conn.execute(productQuery, [productId]);
    
    if (productResult.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const productTypeId = productResult[0].product_type_id;
    
    // ดึงข้อมูลหน่วยทั้งหมดที่ใช้ได้กับประเภทสินค้านี้
    const unitsQuery = `
      SELECT u.*, 
             CASE WHEN pu.is_default = 1 THEN true ELSE false END as is_default
      FROM units u
      LEFT JOIN product_units pu ON u.id = pu.unit_id AND pu.product_id = ?
      LEFT JOIN product_type_units ptu ON u.id = ptu.unit_id AND ptu.product_type_id = ?
      WHERE pu.product_id IS NOT NULL OR ptu.product_type_id IS NOT NULL
      ORDER BY pu.is_default DESC, ptu.is_default DESC, u.name ASC
    `;
    
    const [units] = await conn.execute(unitsQuery, [productId, productTypeId]);
    res.json(units);
  } catch (error) {
    console.error('Error fetching units for product:', error);
    res.status(500).json({ error: 'Failed to fetch units for product' });
  }
});

module.exports = router;