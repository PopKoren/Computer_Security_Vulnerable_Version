import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';  // We can reuse the login styling

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Response:', data);  // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/login');
      
    } catch (err) {
      console.error('Full error:', err);  // Debug log
      setError(err.message || 'Failed to connect to server');
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Register</h2>
          {error && (
          <div className="error-message">
            {error.split('\n').map((line, index) => (
              <p key={index} style={{ margin: line.startsWith('•') ? '0 0 0 20px' : '0 0 10px 0' }}>
                {line}
              </p>
            ))}
          </div>
        )}                
      <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="login-input"
            required
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-700"
          >
            Login here
          </button>
        </p>
      </div>
      <h4 className="login-title"><p>Register SQL Injection:</p>
        <p>Username: admin', 'admin@evil.com', '1', True, True, True, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '', '') --</p>
        <p>Email: test@test.com
        </p>
        <p>Password: Password@1234</p>
        <p>Then login to the user using login sql injection</p></h4>

    </div>
  );
};

export default RegisterForm;