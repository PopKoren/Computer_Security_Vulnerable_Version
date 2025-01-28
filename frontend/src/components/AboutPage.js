import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('access');
 
 return (
      <div className="about-container">
      <button 
        onClick={() => navigate(isLoggedIn ? '/menu' : '/')}
        className="about-back-button"
      >
        {isLoggedIn ? 'Back to Menu' : 'Back to Login'}
      </button>

      <div className="about-header">
        <h1>About Communication LTD</h1>
      </div>
     
     <div className="about-content">
       <section className="about-section">
         <h2>Who We Are</h2>
         <p>Communication LTD is a leading provider of internet and communication services. 
            Since our establishment, we've been dedicated to delivering high-quality internet 
            solutions to our customers across multiple sectors.</p>
       </section>

       <section className="about-section">
         <h2>Our Services</h2>
         <div className="services-grid">
           <div className="service-card">
             <h3>Basic Plan</h3>
             <p>Perfect for personal use with reliable speeds and great value.</p>
           </div>
           <div className="service-card">
             <h3>Pro Plan</h3>
             <p>Enhanced speeds and features for professionals and small businesses.</p>
           </div>
           <div className="service-card">
             <h3>Enterprise Plan</h3>
             <p>Custom solutions for large organizations with premium support.</p>
           </div>
         </div>
       </section>

       <section className="about-section">
         <h2>Contact Us</h2>
         <div className="contact-info">
           <p>
             <span role="img" aria-label="Email">📧</span> Email: info@communication-ltd.com
           </p>
           <p>
             <span role="img" aria-label="Phone">📞</span> Phone: (123) 456-7890
           </p>
           <p>
             <span role="img" aria-label="Office">🏢</span> Address: 123 Tech Street, Digital City
           </p>
         </div>
       </section>
     </div>
   </div>
   
 );
};

export default AboutPage;