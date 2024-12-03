import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';  // Add this import
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MenuPage from './components/MenuPage';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import ForgotPassword from './components/ForgotPassword';
import AboutPage from './components/AboutPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />  {/* Add this line */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;