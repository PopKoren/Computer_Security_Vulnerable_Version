import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSuccess('Password reset instructions have been sent to your email');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <button 
        onClick={() => navigate('/login')}
        className="back-button"
      >
        Back to Login
      </button>

      <div className="login-card">
        <h2 className="login-title">Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;