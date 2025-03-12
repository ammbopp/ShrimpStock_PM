import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Employee.css'; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function Employee(){
  const [employees, setEmployees] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    navigate(path, {
      state: {
        employee_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_position,
      },
    });
    console.log('Employee ID:', employee_id);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      let url = 'http://localhost:3001/api/employee';
  
      if (filterPosition) {
        url += `?position=${filterPosition}`; // เพิ่มตำแหน่ง
      }
  
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
  
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
  
    fetchEmployees();
  }, [filterPosition]);
  
  

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterPosition(event.target.value);
  };

  const navigateToDetails = (employee) => {
    navigate(`/keeper/employee/details/${employee.employee_id}`, { state: employee });
  };

  // กรองข้อมูลพนักงานตามการค้นหาและตำแหน่งงาน
  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.employee_fname.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterPosition === '' || emp.employee_position === filterPosition)
    );
  });

  return (
    <div className="page-container">
      {/* Side Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/keeper/home')}>Home</li>
          <li onClick={() => navigateToPage('/keeper/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/keeper/products')}>Products</li>
          <li onClick={() => navigateToPage('/keeper/requests')}>Requests</li>
          <li onClick={() => navigateToPage('/keeper/orders')}>Orders</li>
          <li onClick={() => navigateToPage('/keeper/audit')}>Audits</li>
          <li onClick={() => navigateToPage('/keeper/pond')}>Ponds</li>
          <li onClick={() => navigateToPage('/keeper/employee')}>Employees</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Navbar */}
        <div className="navbar">
          <div className="logo">
            <img src={shrimpLogo} alt="Shrimp Logo" />
            <button className="menu-button" onClick={toggleMenu}>
              <span className="menu-icon">&#9776;</span>
            </button>
            <span>Shrimp Farm</span>
          </div>
          <div className="user-profile">
            <img src={employeeImagePath} alt="User Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Content Body */}
        {/* Employee List Section */}
      <div className="employee-list-container">
        <h1>Employee List 👥</h1>
        <hr />

        {/* Search & Filter */}
        <div className="search-filter">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
          <select onChange={handleFilterChange}>
            <option value="">Select Position</option>
            <option value="worker">Worker</option>
            <option value="academic">Academic</option>
            <option value="clerical">Clerical</option>
            <option value="keeper">Keeper</option>
          </select>
          <button className="create-btn" onClick={() => navigateToPage('/keeper/employee/create')}>Create Account</button>
        </div>

        {/* Employee Cards */}
        <div className="employee-list">
          {filteredEmployees.map((employee) => (
            <div key={employee.employee_id} className="employee-card2">
              <img
                src={employee.employee_image ? `/avatar/${employee.employee_image}` : iconUser}
                alt={employee.employee_fname}
                className="employee-avatar"
              />
              <div className="employee-info2">
                <p><strong> {employee.employee_fname} {employee.employee_lname} </strong></p>
                <p><strong>Age:</strong> {employee.employee_age}</p>
                <p><strong>Position:</strong> {employee.employee_position}</p>
              </div>

              <div className="employee-footer">
                <div className="employee-status">
                  <span className={employee.status === 1 ? 'status-active' : 'status-inactive'}>
                    {employee.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button className="details-btn" onClick={() => navigateToDetails(employee)}>View Details</button>
              </div>

            </div>
          ))}
        </div>
      </div>

    
      </div>
    </div>
  );

}

export default Employee;
