import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate ,useParams} from 'react-router-dom';
import './KeeperOpenPond.css'
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';


function KeeperOpenPond() {
  const { pond_id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};
 
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;
  

  const [employees, setEmployees] = useState([]);
  // "Worker", "Academic", or "All"
  const [filter, setFilter] = useState('All');
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    let endpoint = '/api/employee/getAllWorkerAcademic'; // default "All"
    if (filter === 'Worker') {
      endpoint = '/api/employee/getAllWorker';
    } else if (filter === 'Academic') {
      endpoint = '/api/employee/getAllAcademic';
    }
    
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error(err));
  }, [filter]);

  // Update filter state to trigger a new API call.
  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  // Toggle checkbox selection for each employee.
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };
  

  // Submit the selected employees to open the pond.
  const handleSubmit = async () => {
    try {
      const openRes = await fetch(`http://localhost:3001/api/pond/status/open/${pond_id}`, {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pond_id: pond_id,
          staff: selectedEmployees 
        }),
      });
  
      const response = await openRes.json();
      if (!openRes.ok) throw new Error(response.error || 'Failed to open pond');
  
      // Navigate back to KeeperPondDetail page with current state
      navigate(`/keeper/pond/${pond_id}`, {
        state: {
          employee_id,
          employee_fname,
          employee_lname,
          employee_image,
          employee_position,
        },
      });
    } catch (err) {
      console.error(err);
      alert('An error occurred. Check the console for details.');
    }
  };


  // Navigation helper to pass along employee state.
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
    setMenuOpen(false);
  };

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
            <img 
              src={employeeImagePath} 
              alt="User Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
            />
          </div>
        </div>

        <h1 className='title' style={{ textAlign: 'center' }}>OPEN POND {pond_id}</h1>

        <div className='employees container'>
     
        <div className="filter-container">
        <span>Filter:</span>
        <button className={filter === "Worker" ? "active" : ""} onClick={() => handleFilterChange("Worker")}>
          Worker
        </button>
        <button className={filter === "Academic" ? "active" : ""} onClick={() => handleFilterChange("Academic")}>
          Academic
        </button>
        <button className={filter === "All" ? "active" : ""} onClick={() => handleFilterChange("All")}>
          All
        </button>
      </div>

        <div className="employee-list">
          {employees.map((emp) => (
            <div className="employee-card" key={emp.employee_id}>
              <div>
              <div className="employee-info">
              <img src={emp.employee_image} alt="Profile" className="employee-image" />
              <div>
                <p>Name: {emp.employee_fname} {emp.employee_lname}</p>
                <p>Age: {emp.employee_age}</p>
                <p>Position: {emp.employee_position}</p>
              </div>
            </div>
              </div>
              <input
                type="checkbox"
                checked={selectedEmployees.includes(emp.employee_id)}
                onChange={() => handleCheckboxChange(emp.employee_id)}
              />
            </div>
          ))}
        </div>

        <div >
          <button className="submit-button" onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
            SUBMIT
          </button>
        </div>

        </div>
      </div>
    </div>
  );
}

export default KeeperOpenPond;