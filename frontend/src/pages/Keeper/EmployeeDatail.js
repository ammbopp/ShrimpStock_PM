import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const EmployeeDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_id, employee_fname, employee_lname, employee_image, employee_position } = location.state || {};
  const [menuOpen, setMenuOpen] = useState(false);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const [employee, setEmployee] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

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
    })
    console.log('Employee ID:', employee_id);;
  };

  useEffect(() => {
    if (!employee_id) return;
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/employee/${employee_id}`);
        if (response.ok) {
          const data = await response.json();
          setEmployee(data);
          setFormData({
            employee_fname: data.employee_fname || '',
            employee_lname: data.employee_lname || '',
            employee_age: data.employee_age || '',
            employee_sex: data.employee_sex || '',
            employee_position: data.employee_position || '',
            employee_address: data.employee_address || '',
            employee_salary: data.employee_salary || '',
            status: data.status || 1,
          });
        } else {
          console.error('Error fetching employee data');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [employee_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/employee/update/${employee_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEmployee({ ...employee, ...formData });
        setEditMode(false);
        alert('Employee details updated successfully!');
      } else {
        console.error('Error updating employee data');
      }
    } catch (error) {
      console.error('Error updating employee data:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-picture">
          <img src={employee.employee_image ? `/avatar/${employee.employee_image}` : iconUser} alt="Employee" />
        </div>
        <div className="profile-info">
          <div className="profile-field">
            <label>Employee ID:</label>
            <p>{employee.employee_id}</p>
          </div>
          <div className="profile-field">
            <label>First Name:</label>
            {editMode ? (
              <input type="text" name="employee_fname" value={formData.employee_fname} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_fname}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Last Name:</label>
            {editMode ? (
              <input type="text" name="employee_lname" value={formData.employee_lname} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_lname}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Age:</label>
            {editMode ? (
              <input type="number" name="employee_age" value={formData.employee_age} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_age}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Sex:</label>
            {editMode ? (
              <input type="text" name="employee_sex" value={formData.employee_sex} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_sex}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Position:</label>
            {editMode ? (
              <input type="text" name="employee_position" value={formData.employee_position} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_position}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Address:</label>
            {editMode ? (
              <textarea name="employee_address" value={formData.employee_address} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_address}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Salary:</label>
            {editMode ? (
              <input type="number" name="employee_salary" value={formData.employee_salary} onChange={handleInputChange} />
            ) : (
              <p>{employee.employee_salary}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Username:</label>
            <p>{employee.username}</p>
          </div>
          <div className="profile-field">
            <label>Status:</label>
            {editMode ? (
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            ) : (
              <p>{employee.status === 1 ? 'Active' : 'Inactive'}</p>
            )}
          </div>

          <div className="profile-buttons">
          <button className="save-button" onClick={() => navigate(-1)}>Back</button>
            {editMode ? (
              <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
            ) : (
              <button className="edit-button" onClick={handleEditToggle}>Edit</button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  
  );
};

export default EmployeeDetail;
