import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   username: '',
   password: '',
 });
 const [error, setError] = useState('');

 const handleSubmit = async (e) => {
   e.preventDefault();
   setError('');

   try {
     const response = await fetch('http://localhost:8000/api/login/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
       },
       body: JSON.stringify(formData)
     });

     const data = await response.json();

     if (!response.ok) {
       throw new Error(data.error || 'Login failed');
     }

     localStorage.setItem('access', data.access);
     console.log('Login successful:', data);
     navigate('/menu');
   } catch (err) {
     setError(err.message);
     console.error('Login error:', err);
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
        <h1 className="big-header">This is the vulnerable version of the project.</h1>
       <div className="login-card">
         <h2 className="login-title">Login</h2>
         {error && <div className="login-error">{error}</div>}
         <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="login-input"
        />
        <button type="submit" className="login-button">
          Login
        </button>
        </form>
         <p className="mt-4 text-center">
           <button 
             onClick={() => navigate('/forgot-password')}
             className="text-blue-500 hover:text-blue-700"
           >
             Forgot Password?
           </button>
         </p>
         <p className="mt-4 text-center">
           Don't have an account?{' '}
           <button 
             onClick={() => navigate('/register')}
             className="text-blue-500 hover:text-blue-700"
           >
             Register here
           </button>
         </p>
       </div>
     </div>
  
 );
};

export default LoginForm;