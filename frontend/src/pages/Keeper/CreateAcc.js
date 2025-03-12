import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAcc.css';

const CreateAcc = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_fname: '',
    employee_lname: '',
    employee_age: '',
    employee_sex: '',
    employee_position: '',
    employee_address: '',
    employee_salary: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.employee_fname.trim()) newErrors.employee_fname = 'First name is required';
    if (!formData.employee_lname.trim()) newErrors.employee_lname = 'Last name is required';
    
    if (!formData.employee_age) {
      newErrors.employee_age = 'Age is required';
    } else if (formData.employee_age < 18 || formData.employee_age > 80) {
      newErrors.employee_age = 'Age must be between 18 and 80';
    }
    
    if (!formData.employee_sex) newErrors.employee_sex = 'Sex is required';
    if (!formData.employee_position) newErrors.employee_position = 'Position is required';
    if (!formData.employee_address.trim()) newErrors.employee_address = 'Address is required';
    
    if (!formData.employee_salary) {
      newErrors.employee_salary = 'Salary is required';
    } else if (formData.employee_salary < 0) {
      newErrors.employee_salary = 'Salary cannot be negative';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 5) {
      newErrors.username = 'Username must be at least 5 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:3001/api/employee/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Employee registration successful!');
          navigate('/keeper/employees');
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${errorData.message || 'Please try again'}`);
        }
      } catch (error) {
        alert('Network error, please try again');
        console.error('Registration error:', error);
      }
    } else {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setLoading(false);
  };

  const positionOptions = [
    { value: "worker", label: "Worker" },
    { value: "academic", label: "Academic" },
    { value: "clerical", label: "Clerical" },
    { value: "keeper", label: "Keeper" }
  ];

  return (
    <div className="page-container-3">
    <div className="signup-container">
      <div className="signup-card">
        <div className="card-header">
          <h2>Employee Registration</h2>
          <p>Add a new employee to the shrimp farm system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employee_fname">First Name</label>
                <input 
                  id="employee_fname"
                  type="text" 
                  name="employee_fname" 
                  value={formData.employee_fname} 
                  onChange={handleChange}
                  className={errors.employee_fname ? "error-input" : ""}
                />
                {errors.employee_fname && <p className="error-message">{errors.employee_fname}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="employee_lname">Last Name</label>
                <input 
                  id="employee_lname"
                  type="text" 
                  name="employee_lname" 
                  value={formData.employee_lname} 
                  onChange={handleChange}
                  className={errors.employee_lname ? "error-input" : ""}
                />
                {errors.employee_lname && <p className="error-message">{errors.employee_lname}</p>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employee_age">Age</label>
                <input 
                  id="employee_age"
                  type="number" 
                  name="employee_age" 
                  min="18" 
                  max="80"
                  value={formData.employee_age} 
                  onChange={handleChange}
                  className={errors.employee_age ? "error-input" : ""}
                />
                {errors.employee_age && <p className="error-message">{errors.employee_age}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="employee_sex">Sex</label>
                <select 
                  id="employee_sex"
                  name="employee_sex" 
                  value={formData.employee_sex} 
                  onChange={handleChange}
                  className={errors.employee_sex ? "error-input" : ""}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.employee_sex && <p className="error-message">{errors.employee_sex}</p>}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Employment Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employee_position">Position</label>
                <select 
                  id="employee_position"
                  name="employee_position" 
                  value={formData.employee_position} 
                  onChange={handleChange}
                  className={errors.employee_position ? "error-input" : ""}
                >
                  <option value="">Select Position</option>
                  {positionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.employee_position && <p className="error-message">{errors.employee_position}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="employee_salary">
                  Salary <span className="label-hint">(per month)</span>
                </label>
                <input 
                  id="employee_salary"
                  type="number" 
                  name="employee_salary" 
                  min="0" 
                  step="1000"
                  value={formData.employee_salary} 
                  onChange={handleChange}
                  className={errors.employee_salary ? "error-input" : ""}
                />
                {errors.employee_salary && <p className="error-message">{errors.employee_salary}</p>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="employee_address">Address</label>
              <textarea 
                id="employee_address"
                name="employee_address" 
                value={formData.employee_address} 
                onChange={handleChange}
                className={errors.employee_address ? "error-input" : ""}
                rows="3"
              />
              {errors.employee_address && <p className="error-message">{errors.employee_address}</p>}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Account Information</h3>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username"
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange}
                className={errors.username ? "error-input" : ""}
              />
              {errors.username && <p className="error-message">{errors.username}</p>}
            </div>
            
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input 
                  id="password"
                  type={showPassword.password ? "text" : "password"}
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  className={errors.password ? "error-input" : ""}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPassword.password ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            
            <div className="form-group password-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input 
                  id="confirmPassword"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error-input" : ""}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {showPassword.confirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Employee'}
            </button>
            <button 
              type="button" 
              className="btn secondary-btn" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default CreateAcc;