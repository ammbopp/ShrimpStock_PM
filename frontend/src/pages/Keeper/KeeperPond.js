import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './KeeperPond.css'
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

const KeeperPond = () => {
  const [ponds, setPonds] = useState([]);
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch all ponds on component mount
  useEffect(() => {
    fetchPonds();
  }, []);

  // Fetch ponds based on filter
  useEffect(() => {
    if (filter === 'all') {
      fetchPonds();
    } else if (filter === 'open') {
      fetchOpenPonds();
    } else if (filter === 'close') {
      fetchClosedPonds();
    }
  }, [filter]);

  // Function to fetch all ponds
  const fetchPonds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ponds');
      if (!response.ok) {
        throw new Error('Failed to fetch ponds');
      }
      const data = await response.json();
      setPonds(data);
    } catch (error) {
      console.error('Error fetching ponds:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch open ponds
  const fetchOpenPonds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pondsOpen');
      if (!response.ok) {
        throw new Error('Failed to fetch open ponds');
      }
      const data = await response.json();
      setPonds(data);
    } catch (error) {
      console.error('Error fetching open ponds:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch closed ponds
  const fetchClosedPonds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pondsClose');
      if (!response.ok) {
        throw new Error('Failed to fetch closed ponds');
      }
      const data = await response.json();
      setPonds(data);
    } catch (error) {
      console.error('Error fetching closed ponds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoreInfo = (pondId) => {
    console.log(`Navigating to more info for pond ${pondId}`);
    // Navigate to pond details page
    navigate(`/keeper/pond/${pondId}`);
  };

  const navigateToPage = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // For employee image path (using iconUser as default)
  const employeeImagePath = iconUser;

  return (
    <div className="min-h-screen bg-stone-100 p-4 flex flex-col items-center">
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

      {/* Header - Using the new navbar structure */}
      <div className="navbar">
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img src={employeeImagePath} alt="User Profile" className="user-avatar" />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="w-full max-w-4xl flex justify-end items-center mb-4 gap-2">
        <span className="text-gray-600 text-lg">filter</span>
        <button 
          className={`px-8 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}`}
          onClick={() => setFilter('all')}
        >
          ALL
        </button>
        <button 
          className={`px-8 py-2 rounded-full ${filter === 'open' ? 'bg-green-500 text-white' : 'bg-green-400 text-white'}`}
          onClick={() => setFilter('open')}
        >
          OPEN
        </button>
        <button 
          className={`px-8 py-2 rounded-full ${filter === 'close' ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}
          onClick={() => setFilter('close')}
        >
          CLOSE
        </button>
      </div>

      {/* Pond Management Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl p-8 shadow-md">
        <h2 className="text-3xl font-bold text-orange-700 mb-8">Pond Management</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading ponds...</p>
          </div>
        ) : ponds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No ponds found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ponds.map((pond) => (
              <div key={pond.pond_id} className="border border-gray-200 rounded-xl p-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Pond {pond.pond_id}</h3>
                <div className="flex items-center gap-2">
                  {pond.pond_status === 'OPEN' ? (
                    <span className="text-green-500 font-medium">OPEN</span>
                  ) : (
                    <span className="text-red-500 font-medium">CLOSE</span>
                  )}
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => handleMoreInfo(pond.pond_id)}
                  >
                    More Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeeperPond