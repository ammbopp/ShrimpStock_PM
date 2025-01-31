const express = require('express');
const router = express.Router();
const multer = require('multer');
const connection = require('../db/database');
const { v4: uuidv4 } = require('uuid'); // ใช้ UUID เพื่อสร้าง request_id และ request_list_id

// const fs = require('fs');

// fs.writeFileSync(testFilePath, 'This is a test file!', (err) => {
//   if (err) console.error('Error creating test file:', err);
//   else console.log('Test file created successfully!');
// });

const fs = require('fs');
const path = require('path');

// Define the path where the test file will be saved
const testFilePath = path.join(__dirname, 'testFile.txt');

// Write the content to the file
fs.writeFileSync(testFilePath, 'This is a test file!', (err) => {
  if (err) console.error('Error creating test file:', err);
  else console.log('Test file created successfully!');
});


router.get('/products', (req, res) => {
  const { product_type } = req.query;

  const typeQuery = product_type ? `WHERE product_type = ?` : '';

  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_image,
      product_type
    FROM products
    ${typeQuery}
  `;

  const queryParams = [];
  if (product_type) queryParams.push(product_type);

  connection.query(query, queryParams, (error, results) => {
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

router.get('/product-detail/:product_id', (req, res) => {
  const { product_id } = req.params;

  const query = `
    SELECT 
      product_id, 
      product_name, 
      product_type, 
      product_unit, 
      product_quantity, 
      threshold, 
      product_image 
    FROM products 
    WHERE product_id = ?;
  `;

  connection.query(query, [product_id], (error, results) => {
    if(error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch product details' });
      return;
    }
    if(results.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(results[0]);
  });
});

router.get('/product/:product_id/lots', (req, res) => {
  const { product_id } = req.params;

  const lotQuery = `
    SELECT 
      lot_id, 
      product_id, 
      lot_date, 
      lot_exp, 
      lot_quantity 
    FROM product_lots 
    WHERE product_id = ?;
  `;

  connection.query(lotQuery, [product_id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch lot details' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'No lots found for this product' });
      return;
    }
    res.status(200).json(results);
  });
});

router.get('/lot-detail/:lot_id', (req, res) => {
  const { lot_id } = req.params;

  const query = `
    SELECT 
      pl.lot_id, 
      pl.product_id, 
      pl.lot_date, 
      pl.lot_exp, 
      pl.lot_quantity,
      p.product_name,
      p.product_unit,
      p.product_type,
      p.product_image
    FROM product_lots AS pl
    JOIN products AS p ON pl.product_id = p.product_id
    WHERE pl.lot_id = ?;
  `;

  connection.query(query, [lot_id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch lot detail' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'Lot not found' });
      return;
    }
    res.status(200).json(results[0]);
  });
});


// Route to get unit options from unit table
router.get('/add-product/units', (req, res) => {
  const query = 'SELECT unit_name FROM units';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error); // Log detailed error to debug
      res.status(500).json({ error: 'Failed to fetch units' });
      return;
    }
    res.status(200).json(results);
  });
});

// Path to the upload directory
const uploadPath = '/Users/bopp/Desktop/sa/SA-Stock/frontend/public/product';

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true }); // Creates directory if it does not exist
}

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const sanitizedFilename = Date.now() + '-' + sanitizeFilename(file.originalname);
    cb(null, sanitizedFilename);
  },
});


const upload = multer({ storage });

router.post('/add-product', upload.single('product_image'), (req, res) => {
  const { product_name, product_type, product_unit, product_quantity, threshold } = req.body;
  const product_image = req.file ? req.file.filename : null;
  const product_id = 'PROD-' + uuidv4();

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log('File uploaded successfully:', req.file.path);

  // Add logging to check data received
  console.log('Received data:', {
    product_name,
    product_type,
    product_unit,
    product_quantity,
    threshold,
    product_image,
  });

  const query = `
    INSERT INTO products (product_id, product_name, product_type, product_unit, product_quantity, threshold, product_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [product_id, product_name, product_type, product_unit, product_quantity, threshold, product_image],
    (error, results) => {
      if (error) {
        console.error('Database insertion error:', error); // Log the database error for debugging
        return res.status(500).json({ error: 'Failed to add product' });
      }
      res.status(201).json({ message: 'Product added successfully' });
    }
  );
});



module.exports = router;