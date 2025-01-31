import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // นำเข้า App.js ที่ถูกต้อง

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
