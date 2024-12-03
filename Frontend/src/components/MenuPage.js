import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuPage.css';

const MenuPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('access');
    navigate('/');
  };

  const menuItems = [
    {
      id: 1,
      name: 'Basic Plan',
      price: '$10/month',
      plan_type: 'basic',
      features: ['10GB Storage', 'Basic Support', 'Limited Access']
    },
    {
      id: 2,
      name: 'Pro Plan',
      price: '$20/month',
      plan_type: 'pro',
      features: ['50GB Storage', '24/7 Support', 'Full Access']
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      price: '$50/month',
      plan_type: 'enterprise',
      features: ['Unlimited Storage', 'Priority Support', 'Custom Solutions']
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user/dashboard/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
          setIsAdmin(data.user.is_staff);
          setCurrentPlan(data.subscription?.plan || null);
        } else {
          throw new Error(data.error || 'Failed to fetch user data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);

      // Cleanup function to clear timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handlePurchase = async (planType) => {
    try {
      const response = await fetch('http://localhost:8000/api/purchase-plan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ plan: planType })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase plan');
      }
  
      setSuccess(`Successfully subscribed to ${data.plan}`);
      setCurrentPlan(data.plan);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-container">
        <div className="error-message">{error}</div>
        <button className="logout-button" onClick={handleLogout}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <div className="header">
        <h1>Welcome, {user?.username}</h1>
        <div className="header-buttons">
          <button 
            className="profile-button"
            onClick={() => navigate('/profile')}
          >
            My Profile
          </button>
          {isAdmin && (
            <button 
              className="admin-button"
              onClick={() => navigate('/admin')}
            >
              Admin Dashboard
            </button>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {success && <div className="success-message">{success}</div>}
      
      {currentPlan && (
        <div className="current-plan-banner">
          Your current plan: {currentPlan}
        </div>
      )}

      <div className="plans-container">
        {menuItems.map(item => (
          <div key={item.id} className="plan-card">
            <h2>{item.name}</h2>
            <div className="price">{item.price}</div>
            <ul className="features-list">
              {item.features.map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`purchase-button ${currentPlan === item.name ? 'current-plan' : ''}`}
              onClick={() => handlePurchase(item.plan_type)}
              disabled={currentPlan === item.name}
            >
              {currentPlan === item.name ? 'Current Plan' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;