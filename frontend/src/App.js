import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import WorkerHome from './pages/Worker/WorkerHome'; 
import RequestFoodMenu from './pages/Worker/RequestMenu';
import FoodDetail from './pages/Worker/FoodDetail';
import ProfileWorker from './pages/Worker/Profile'
import RequestFoodCart from './pages/Worker/RequestCart';
import RequestHistory from './pages/Worker/RequestHistory';
import RequestFoodDetail from './pages/Worker/RequestDetail';

import AcademicHome from './pages/Academic/AcademicHome';
import RequestChemDetail from './pages/Academic/RequestDetail';
import RequestChemHistory from './pages/Academic/RequestHistory';
import RequestChemMenu from './pages/Academic/RequestMenu';
import CartChemical from './pages/Academic/Cart';
import ChemDetail from './pages/Academic/ChemDetail'
import ProfileAcademic from './pages/Academic/Profile';

import CleriaHome from './pages/Clerical/CleriaHome';
import ClericalProfile from './pages/Clerical/Profile';
import RequestAllDetail from './pages/Clerical/RequestDetail';
import Request from './pages/Clerical/Request';
import Order from './pages/Clerical/Order';
import OrderDetail from './pages/Clerical/OrderDetail';
import Product from './pages/Clerical/Product';
import ProductDetail from './pages/Clerical/ProductDetail';
import Lot from './pages/Clerical/Lot';
import LotDetail from './pages/Clerical/LotDetail';
import AddProduct from './pages/Clerical/AddProduct';
import Audit from './pages/Clerical/Audit';
import AddOrdersToAudit from './pages/Clerical/AddOrdersToAudit';
import AddOrderPayment from './pages/Clerical/AddOrderPayment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/profile" element={<ProfileWorker />} />
        <Route path="/worker/home" element={<WorkerHome />} />
        <Route path="/worker/request-menu" element={<RequestFoodMenu />} />
        <Route path="/worker/food-detail" element={<FoodDetail />} />
        <Route path="/Worker/cart" element={<RequestFoodCart/>}/>
        <Route path="/worker/requests/:employee_id" element={<RequestHistory/>}/>
        <Route path="/worker/request-detail/" element={<RequestFoodDetail />} />

        <Route path="/academic/home" element={<AcademicHome />} />
        <Route path="/academic/request-detail/" element={<RequestChemDetail />} />
        <Route path="/academic/requests/:employee_id" element={<RequestChemHistory />} />
        <Route path="/academic/request-menu" element={<RequestChemMenu />} />
        <Route path="/academic/cart" element={<CartChemical />} />
        <Route path="/academic/chem-detail" element={<ChemDetail />} />
        <Route path="/academic/profile" element={<ProfileAcademic />} />

        <Route path="/clerical/home" element={<CleriaHome />} />
        <Route path="/clerical/profile" element={<ClericalProfile />} />
        <Route path="/clerical/request-detail" element={<RequestAllDetail />} />
        <Route path="/clerical/requests/" element={<Request />} />
        <Route path="/clerical/orders" element={<Order />} />
        <Route path="/clerical/order-detail/:order_id" element={<OrderDetail />} />
        <Route path="/clerical/products" element={<Product />} />
        <Route path="/clerical/product-detail/:product_id" element={<ProductDetail />} />
        <Route path="/clerical/lots/:product_id" element={<Lot />} />
        <Route path="/clerical/lot-detail/:lot_id" element={<LotDetail />} />
        <Route path="/clerical/add-product" element={<AddProduct />} />
        <Route path="/clerical/audit" element={<Audit />} />
        <Route path="/clerical/add-orders/:audit_id" element={<AddOrdersToAudit />} />
        <Route path="/clerical/add-orders/payment" element={<AddOrderPayment />} />

      </Routes>
    </Router>
  );
}

export default App;
