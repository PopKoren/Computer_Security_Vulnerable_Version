import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState(''); // Added to store the token

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

      setSuccess('Verification code sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/verify-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setResetToken(data.token); // Save the token
      setSuccess('Code verified successfully');
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: resetToken, // Use the stored token, not the verification code
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successful');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('•')) {
        // Format password validation errors
        setError(err.message.split('\n').join('\n• '));
      }
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
        <h2 className="login-title">Reset Password</h2>
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
        
        {step === 1 && (
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
              Send Verification Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerification} className="login-form">
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="login-form">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;