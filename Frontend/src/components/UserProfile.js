import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    currentPassword: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscriptions, setSubscriptions] = useState({
    active: null,
    history: []
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/user/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUser(data);
      setProfileData(prev => ({
        ...prev,
        username: data.username,
        email: data.email
      }));
    });

    // Fetch subscriptions
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user/subscriptions/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access')}`
          }
        });
        const data = await response.json();
        setSubscriptions(data);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
      }
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/user/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) throw new Error('Current Password is incorrect!');

      const userData = await response.json();
      setUser(userData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setProfileData(prev => ({
        ...prev,
        currentPassword: ''
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/user/change-password/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="profile-container">
      <button 
        onClick={() => navigate('/menu')}
        className="back-button"
      >
        Back to Menu
      </button>

      <div className="header">
        <h1>User Profile</h1>
      </div>

      <div className="profile-card">
      {error && (
        <div className="error-message">
          {error.split('\n').map((line, index) => (
            <p key={index} style={{ margin: line.startsWith('•') ? '0 0 0 20px' : '0 0 10px 0' }}>
              {line}
            </p>
          ))}
        </div>
      )}
      {success && <div className="success-message">{success}</div>}
      

        {!isEditing && !isChangingPassword ? (
          <>
            <div className="profile-info">
              <div className="info-group">
                <label>Username:</label>
                <p>{user?.username}</p>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <p>{user?.email}</p>
              </div>
              <div className="button-group">
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button 
                  className="password-button"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="subscription-section">
              <h3>Current Plan</h3>
              {subscriptions.active ? (
                <div className="active-plan">
                  <p className="plan-name">{subscriptions.active.plan}</p>
                  <p className="plan-date">Since: {new Date(subscriptions.active.start_date).toLocaleDateString()}</p>
                </div>
              ) : (
                <p>No active subscription</p>
              )}

              <h3>Subscription History</h3>
              {subscriptions.history.length > 0 ? (
                <div className="subscription-history">
                  {subscriptions.history.map((sub, index) => (
                    <div key={index} className="history-item">
                      <p className="plan-name">{sub.plan}</p>
                      <p className="plan-date">
                        {new Date(sub.start_date).toLocaleDateString()} - 
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No subscription history</p>
              )}
            </div>
          </>
        ) : isEditing ? (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleProfileChange}
                placeholder="Enter current password to confirm changes"
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                  setProfileData(prev => ({
                    ...prev,
                    currentPassword: ''
                  }));
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="save-button">
                Change Password
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setError('');
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
            <h4 className="login-title"><p>Change Password SQL Injection:</p>
        <p>Current Password: ' OR '1'='1</p>
        <p>New password: anything</p></h4>

          </form>
        )}
      </div>
    </div>
    
  );
};

export default UserProfile;
