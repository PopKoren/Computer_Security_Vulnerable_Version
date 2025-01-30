import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientsTable.css';

const ClientsTable = () => {
 const navigate = useNavigate();
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [showForm, setShowForm] = useState(false);
 const [success, setSuccess] = useState('');
 const [deleting, setDeleting] = useState(false);
 const [newClient, setNewClient] = useState({
   name: '',
   email: '',
   client_id: ''
 });

 useEffect(() => {
   fetchClients();
 }, []);

 const fetchClients = async () => {
   try {
     const response = await fetch('http://localhost:8000/api/clients/', {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('access')}`
       }
     });
     const data = await response.json();
     if (!response.ok) throw new Error(data.error || 'Failed to fetch clients');
     setClients(data);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const response = await fetch('http://localhost:8000/api/clients/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('access')}`
       },
       body: JSON.stringify(newClient)
     });

     const data = await response.json();
     if (!response.ok) throw new Error(data.error || 'Failed to add client');

     setClients([...clients, data]);
     setShowForm(false);
     setNewClient({ name: '', email: '', client_id: '' });
   } catch (err) {
     setError(err.message);
   }
 };

 const handleDelete = async (clientId) => {
   if (!window.confirm('Are you sure you want to delete this client?')) {
     return;
   }

   setDeleting(true);
   try {
     const response = await fetch(`http://localhost:8000/api/clients/${clientId}/`, {
       method: 'DELETE',
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('access')}`
       }
     });

     if (!response.ok) {
       throw new Error('Failed to delete client');
     }

     setClients(clients.filter(client => client.id !== clientId));
     setSuccess('Client deleted successfully!');
     setTimeout(() => setSuccess(''), 3000);
   } catch (err) {
     setError(err.message);
   } finally {
     setDeleting(false);
   }
 };

 if (loading) return <div>Loading...</div>;

 return (
   <div className="clients-container">
     <button 
       onClick={() => navigate('/menu')}
       className="back-button"
     >
       Back to Menu
     </button>

     <div className="clients-header">
       <h2>Clients List</h2>
       <button 
         className="add-client-button"
         onClick={() => setShowForm(true)}
       >
         Add New Client
       </button>
     </div>

     {error && <div className="error-message">{error}</div>}
     {success && <div className="success-message">{success}</div>}

     {showForm && (
       <div className="client-form">
         <form onSubmit={handleSubmit}>
           <div className="form-group">
             <label>Name:</label>
             <input
               type="text"
               value={newClient.name}
               onChange={(e) => setNewClient({...newClient, name: e.target.value})}
               required
             />
           </div>
           <div className="form-group">
             <label>Email:</label>
             <input
               type="email"
               value={newClient.email}
               onChange={(e) => setNewClient({...newClient, email: e.target.value})}
               required
             />
           </div>
           <div className="form-group">
             <label>Client ID:</label>
             <input
               type="text"
               value={newClient.client_id}
               onChange={(e) => setNewClient({...newClient, client_id: e.target.value})}
               required
             />
           </div>
           <div className="form-buttons">
             <button type="submit">Add Client</button>
             <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
           </div>
         </form>
       </div>
     )}

     <table className="clients-table">
       <thead>
         <tr>
           <th>Client ID</th>
           <th>Name</th>
           <th>Email</th>
           <th>Created By</th>
           <th>Created At</th>
           <th>Actions</th>
         </tr>
       </thead>
       <tbody>
  {clients.map(client => (
    <tr key={client.id}>
      <td dangerouslySetInnerHTML={{ __html: client.client_id }}></td>  {/* Allow raw HTML */}
      <td dangerouslySetInnerHTML={{ __html: client.name }}></td>
      <td>{client.email}</td>
      <td>{client.created_by}</td>
      <td>{new Date(client.created_at).toLocaleDateString()}</td>
      <td>
        <button
          className="delete-button"
          onClick={() => handleDelete(client.id)}
          disabled={deleting}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

     </table>
     <h4 className="login-title"><p>Client Table XSS:</p>
     <p>Client ID: &lt;img src=&quot;x&quot; onerror=&quot;alert(&amp;quot;XSS&amp;quot;)&quot;&gt;
     </p>
     <p>SQL Injection:</p>
     <p> Client ID: &#39; || (SELECT group_concat(email, &#39;, &#39;) FROM api_client) || &#39;
     </p></h4>
   </div> 
 );
};

export default ClientsTable;
