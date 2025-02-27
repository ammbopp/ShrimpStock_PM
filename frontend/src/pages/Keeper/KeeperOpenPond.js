// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// // import ''; 
// import shrimpLogo from '../../assets/shrimp.png';
// import iconUser from '../../assets/bear.png';
// import starIcon from '../../assets/star-dark.png';

// function KeeperOpenPond(){

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};

//   const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

// const [employees, setEmployees] = useState([]);
//   const [filter, setFilter] = useState('All');  // "Worker", "Academic", or "All"
//   const [selectedEmployees, setSelectedEmployees] = useState([]);

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//   };

//   // 1. Fetch employees from your backend or define them statically
//   useEffect(() => {
//     // Example: fetch all employees from your backend
//     fetch('/api/employees') 
//       .then((res) => res.json())
//       .then((data) => setEmployees(data))
//       .catch((err) => console.error(err));
//   }, []);

//   // 2. Filter toggle
//   const handleFilterChange = (filterValue) => {
//     setFilter(filterValue);
//   };

//   // 3. Checkbox toggle
//   const handleCheckboxChange = (employeeId) => {
//     setSelectedEmployees((prevSelected) => {
//       if (prevSelected.includes(employeeId)) {
//         // Uncheck
//         return prevSelected.filter((id) => id !== employeeId);
//       } else {
//         // Check
//         return [...prevSelected, employeeId];
//       }
//     });
//   };

//   // 4. Submit
//   const handleSubmit = async () => {
//     try {
//       // (A) Update pond status to "OPEN"
//       // Example POST: /pond/status/open/:pond_id
//       const openRes = await fetch(`/pond/status/open/${pond_id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pond_status: 'OPEN' }),
//       });
//       if (!openRes.ok) {
//         throw new Error('Failed to open pond');
//       }

//       // (B) Update current_used_id in ponds, insert into pond_history, and add staff to pond_staffs
//       // We send the pond_id and the list of selected employees
//       const staffRes = await fetch('/pond/staff/add', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           pond_id: pond_id,
//           staff: selectedEmployees,
//         }),
//       });
//       if (!staffRes.ok) {
//         throw new Error('Failed to add staff to pond');
//       }

//       alert('Pond opened and staff assigned successfully!');
//       // Optionally reset checkboxes
//       setSelectedEmployees([]);
//     } catch (err) {
//       console.error(err);
//       alert('An error occurred. Check the console for details.');
//     }
//   };

//   // Filter employees based on "Worker", "Academic", or "All"
//   const filteredEmployees =
//     filter === 'All'
//       ? employees
//       : employees.filter((emp) => emp.position === filter);

//   const navigateToPage = (path) => {
//     navigate(path, {
//       state: {
//         employee_id,
//         employee_fname,
//         employee_lname,
//         employee_image,
//         employee_position,
//       },
//     });
//     console.log('Employee ID:', employee_id);
//   };

//   return (
//     <div className="page-container">
//       {/* Side Menu */}
//       <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
//         <ul>
//           <li onClick={() => navigateToPage('/keeper/home')}>Home</li>
//           <li onClick={() => navigateToPage('/keeper/profile')}>Profile</li>
//           <li onClick={() => navigateToPage('/keeper/products')}>Products</li>
//           <li onClick={() => navigateToPage('/keeper/requests')}>Requests</li>
//           <li onClick={() => navigateToPage('/keeper/orders')}>Orders</li>
//           <li onClick={() => navigateToPage('/keeper/audit')}>Audits</li>
//           <li onClick={() => navigateToPage('/keeper/pond')}>Ponds</li>
//           <li onClick={() => navigateToPage('/keeper/employee')}>Employees</li>
//           <li onClick={() => navigateToPage('/login')}>Logout</li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="content">
//         {/* Navbar */}
//         <div className="navbar">
//           <div className="logo">
//             <img src={shrimpLogo} alt="Shrimp Logo" />
//             <button className="menu-button" onClick={toggleMenu}>
//               <span className="menu-icon">&#9776;</span>
//             </button>
//             <span>Shrimp Farm</span>
//           </div>
//           <div className="user-profile">
//             <img src={employeeImagePath} alt="User Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
//           </div>
//         </div>

// //         {/* Title */}
//       <h1 style={{ textAlign: 'center' }}>OPEN POND {pond_id}</h1>

//       {/* Filter buttons */}
//       <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
//         <span style={{ marginRight: '0.5rem' }}>Filter:</span>
//         <button onClick={() => handleFilterChange('Worker')} style={{ marginRight: '0.5rem' }}>
//           Worker
//         </button>
//         <button onClick={() => handleFilterChange('Academic')} style={{ marginRight: '0.5rem' }}>
//           Academic
//         </button>
//         <button onClick={() => handleFilterChange('All')}>All</button>
//       </div>

//       {/* Employee list */}
//       <div style={{ maxWidth: '600px', margin: '0 auto' }}>
//         {filteredEmployees.map((emp) => (
//           <div
//             key={emp.employee_id}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               border: '1px solid #ccc',
//               padding: '0.5rem',
//               marginBottom: '0.5rem',
//             }}
//           >
//             <div>
//               <p>Name: {emp.employee_fname} {emp.employee_lname}</p>
//               <p>Age: {emp.employee_age}</p>
//               <p>Position: {emp.employee_position}</p>
//             </div>
//             <input
//               type="checkbox"
//               checked={selectedEmployees.includes(emp.employee_id)}
//               onChange={() => handleCheckboxChange(emp.employee_id)}
//             />
//           </div>
//         ))}
//       </div>

//       {/* Submit button */}
//       <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//         <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
//           SUBMIT
//         </button>
//       </div>
        
        
//       </div>
//     </div>
//   );

// }

// export default KeeperOpenPond;






