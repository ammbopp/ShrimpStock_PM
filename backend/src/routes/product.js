// backend/routes/products.js

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

// ดึงข้อมูลสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const conn = await getConnection();
    const query = `
      SELECT p.*, pt.name as product_type_name, u.name as unit_name 
      FROM products p
      LEFT JOIN product_types pt ON p.product_type_id = pt.id
      LEFT JOIN units u ON p.default_unit_id = u.id
      ORDER BY p.name ASC
    `;
    
    const [products] = await conn.execute(query);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ดึงข้อมูลสินค้าตามประเภท
router.get('/by-type/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const productTypeId = req.params.id;
    const query = `
      SELECT p.*, u.name as unit_name, u.id as unit_id
      FROM products p
      LEFT JOIN units u ON p.default_unit_id = u.id
      WHERE p.product_type_id = ?
      ORDER BY p.name ASC
    `;
    
    const [products] = await conn.execute(query, [productTypeId]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by type:', error);
    res.status(500).json({ error: 'Failed to fetch products by type' });
  }
});

// ดึงข้อมูลสินค้าเฉพาะรายการพร้อมหน่วย
router.get('/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const productId = req.params.id;
    const query = `
      SELECT p.*, u.name as unit_name, u.id as unit_id, pt.name as product_type_name
      FROM products p
      JOIN product_types pt ON p.product_type_id = pt.id
      LEFT JOIN units u ON p.default_unit_id = u.id
      WHERE p.id = ?
    `;
    
    const [products] = await conn.execute(query, [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ดึงข้อมูลหน่วยของสินค้าเฉพาะรายการ
router.get('/:id/units', async (req, res) => {
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