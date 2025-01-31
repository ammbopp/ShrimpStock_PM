require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const loginController = require('./src/controllers/loginController');
const requestController = require('./src/controllers/requestController');
const EmployeeController = require('./src/controllers/EmployeeController');
const productController = require('./src/controllers/productController');
const orderController = require('./src/controllers/orderController');
const auditController = require('./src/controllers/auditController');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/product', express.static(path.join(__dirname, '../../frontend/public/product')));

app.post('/api/login', loginController.login);
app.use('/api', requestController);
app.use('/api', EmployeeController);
app.use('/api', productController);
app.use('/api', orderController);
app.use('/api', auditController);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
