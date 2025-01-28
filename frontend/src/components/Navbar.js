import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../hit.png";
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('access');

  //const handleLogout = () => {
   // localStorage.removeItem('access');
   // navigate('/');
 // };

   return (
    <nav className="navbar">
      
      <div className="nav-container">
        
        <div className="nav-brand">
          <img 
            src={logo} 
            alt="Logo" 
            className="nav-logo hover-effect" 
            onClick={() => navigate(isLoggedIn ? '/menu' : '/')} 
            />
        </div>
        <h2 class="white-text">This is the vulnerable version of the project.</h2>

        <div className="nav-links">
          <button 
            onClick={() => navigate('/about')}
            className="nav-link about-us"
          >
            About Us
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;