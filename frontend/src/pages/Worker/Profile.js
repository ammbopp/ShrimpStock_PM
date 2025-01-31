import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import './Profile.css'; // ใช้ไฟล์ CSS สำหรับการตกแต่ง
import shrimpLogo from '../../assets/shrimp.png'; // โลโก้ฟาร์มกุ้ง
import iconUser from '../../assets/bear.png'; // รูปภาพโปรไฟล์เริ่มต้น

const Profile = () => {
  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    })
    console.log('Employee ID:', employee_id);;
  };


  const [profileData, setProfileData] = useState({
    fname: '',
    lname: '',
    address: '',
    employee_image: '',
    employee_salary: '',
    employee_position: '',
    employee_sex: '',
    employee_age: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (!employee_id) return;
        const response = await fetch(`http://localhost:3001/api/employee/${employee_id}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            fname: data.employee_fname ?? '',
            lname: data.employee_lname ?? '',
            address: data.employee_address ?? '',
            employee_image: data.employee_image ?? '',
            employee_salary: data.employee_salary ?? '',
            employee_position: data.employee_position ?? '',
            employee_sex: data.employee_sex ?? '',
            employee_age: data.employee_age ?? '',
          });
          setFormData({
            fname: data.employee_fname ?? '',
            lname: data.employee_lname ?? '',
            address: data.employee_address ?? '',
          });
        } else {
          console.error('Error fetching employee data');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    if (employee_id) {
      fetchEmployeeData();
    }
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
      const response = await fetch(`http://localhost:3001/api/employee/${employee_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_fname: formData.fname,
          employee_lname: formData.lname,
          employee_address: formData.address,
        }),
      });

      if (response.ok) {
        setProfileData({ ...profileData, ...formData });
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        console.error('Error updating employee data');
      }
    } catch (error) {
      console.error('Error updating employee data:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '60%', zIndex: 1000, backgroundColor: '#FFFFFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)' }}>
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

      {/* เมนูที่จะเปิดเมื่อคลิก */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/worker/home')}>Home</li>
          <li onClick={() => navigateToPage('/worker/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/worker/requests/:employee_id')}>Request History</li>
          <li onClick={() => navigateToPage('/worker/request-menu')}>Product Request</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>
      
      <div className="profile-card">
        <div className="profile-picture">
          <img
            src={profileData.employee_image ? `/avatar/${profileData.employee_image}` : iconUser}
            alt="Profile"
          />
        </div>
        <div className="profile-info">
          <div className="profile-field">
            <label>First Name:</label>
            {editMode ? (
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
              />
            ) : (
              <p>{profileData.fname}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Last Name:</label>
            {editMode ? (
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
              />
            ) : (
              <p>{profileData.lname}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Address:</label>
            {editMode ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            ) : (
              <p>{profileData.address}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Employee ID:</label>
            <p>{employee_id}</p>
          </div>
          <div className="profile-field">
            <label>Age:</label>
            <p>{profileData.employee_age}</p>
          </div>
          <div className="profile-field">
            <label>Sex:</label>
            <p>{profileData.employee_sex}</p>
          </div>
          <div className="profile-field">
            <label>Position:</label>
            <p>{profileData.employee_position}</p>
          </div>
          <div className="profile-field">
            <label>Salary:</label>
            <p>{profileData.employee_salary}</p>
          </div>

          <div className="profile-buttons">
            {editMode ? (
              <button className="save-button" onClick={handleSaveChanges}>
                Save Changes
              </button>
            ) : (
              <button className="edit-button" onClick={handleEditToggle}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
