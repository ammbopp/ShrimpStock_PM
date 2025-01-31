import React, { useState } from 'react';
import './Login.css';
import shrimpLogo from '../assets/shrimp.png';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) {
      alert('โปรดกรอกข้อมูล');
      return;
    }
  
    console.log('Attempting login with:', { username, password });
    fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Login response data:', data);
        if (data.success) {
          localStorage.setItem('user', JSON.stringify({
            employee_id: data.employee_id,
            employee_fname: data.employee_fname,
            employee_lname: data.employee_lname,
            employee_position: data.employee_position,
            employee_age: data.employee_age,
            employee_sex: data.employee_sex,
            employee_salary: data.employee_salary,
            employee_address: data.employee_address,
            employee_image: data.employee_image
          }));
          navigate('/worker/home', {
            state: {
              employee_fname: data.employee_fname,
              employee_lname: data.employee_lname,
              employee_image: data.employee_image,
              employee_id: data.employee_id,
              employee_position: data.employee_position
            }
          });
          navigate('/academic/home', {
            state: {
              employee_fname: data.employee_fname,
              employee_lname: data.employee_lname,
              employee_image: data.employee_image,
              employee_id: data.employee_id,
              employee_position: data.employee_position
            }
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
      });
  };

  const handleLogin1 = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          navigate(data.redirectUrl, {
            state: {
              employee_id: data.employee_id,
              employee_fname: data.employee_fname,
              employee_lname: data.employee_lname,
              employee_position: data.employee_position,
              employee_age: data.employee_age,
              employee_sex: data.employee_sex,
              employee_salary: data.employee_salary,
              employee_address: data.employee_address,
              employee_image: data.employee_image,
            },
          });
        }
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  
  

  return (
    <div className="login-card">
      <div className="login-header">
        <img src={shrimpLogo} alt="Shrimp Logo" />
        <h1>Welcome to Shrimp Farm</h1>
        <p>Sign in to your account</p>
      </div>
      <div className="form-container">
        <form id="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group-checkbox" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="show-password" className="checkbox-label" style={{ margin: 0 }}>Show Password</label>
          </div>
          <p></p>
          <button type="button" className="login-button" onClick={handleLogin1}>Sign In</button>
          <a href="#" className="forgot-password">Forgot Password?</a>
        </form>
      </div>
    </div>
  );
}

export default Login;
