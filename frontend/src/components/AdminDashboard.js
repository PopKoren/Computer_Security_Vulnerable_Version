import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
 const navigate = useNavigate();
 const [users, setUsers] = useState([]);
 const [currentUser, setCurrentUser] = useState(null);
 const [editingUser, setEditingUser] = useState(null);
 const [error, setError] = useState('');

 useEffect(() => {
  let timer;
  if (error) {
    timer = setTimeout(() => {
      setError('');
    }, 3000);
  }
  return () => clearTimeout(timer);
  }, [error]);

 useEffect(() => {
   // Fetch current user
   const fetchCurrentUser = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/user/', {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('access')}`
         }
       });
       const data = await response.json();
       setCurrentUser(data);
     } catch (err) {
       console.error('Failed to fetch current user:', err);
     }
   };

   fetchCurrentUser();
   fetchUsers();
 }, []);

 const fetchUsers = async () => {
   try {
     const response = await fetch('http://localhost:8000/api/users/', {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('access')}`,
       }
     });
     const data = await response.json();
     setUsers(data);
   } catch (err) {
     setError('Failed to fetch users');
   }
 };

 const handleDelete = async (userId) => {
   if (window.confirm('Are you sure you want to delete this user?')) {
     try {
       const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('access')}`,
         }
       });
       if (response.ok) {
         fetchUsers();
       }
     } catch (err) {
       setError('Failed to delete user');
     }
   }
 };

 const handleEdit = (user) => {
   setEditingUser(user);
 };

 const handleUpdate = async (e) => {
   e.preventDefault();
  try {
    const response = await fetch(`http://localhost:8000/api/users/${editingUser.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
      },
      body: JSON.stringify(editingUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // If we're editing our own user, update currentUser state
      if (currentUser && editingUser.id === currentUser.id) {
        setCurrentUser({
          ...currentUser,
          username: editingUser.username,
          email: editingUser.email
        });
      }
      setEditingUser(null);
      fetchUsers();
    } else {
      setError(data.error || 'Failed to update user');
    }
  } catch (err) {
    setError('Failed to update user');
  }
};

 return (
  <div className="admin-container">
     <button 
       onClick={() => navigate('/menu')}
       className="back-button"
     >
       Back to Menu
     </button>

     <div className="header">
       <h1>Admin Dashboard</h1>
     </div>

     {error && <div className="error-message">{error}</div>}


     <div className="dashboard-content">
       <table className="admin-table">
         <thead>
           <tr>
             <th>Username</th>
             <th>Email</th>
             <th>Plan</th>
             <th>Role</th>
             <th>Actions</th>
           </tr>
         </thead>
              <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>
              {user.subscription ? user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1) : 'No Plan'}
            </td>
            <td>{user.is_staff ? 'Admin' : 'User'}</td>
            <td>
              <button
                className="edit-btn"
                onClick={() => handleEdit(user)}
              >
                Edit
              </button>

              {/* Hide delete button for the current user */}
              {currentUser && user.username !== currentUser.username && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>

       </table>
     </div>

     {editingUser && (
       <div className="edit-modal">
         <h3>Edit User</h3>
         <form onSubmit={handleUpdate}>
           <input
             type="text"
             value={editingUser.username}
             onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
           />
           <input
             type="email"
             value={editingUser.email}
             onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
           />
          <select
            value={editingUser.subscription || ''}
            onChange={(e) => setEditingUser({...editingUser, subscription: e.target.value})}
          >
            <option value="">No Plan</option>
            <option value="basic">Basic Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="enterprise">Enterprise Plan</option>
          </select>
           <button type="submit">Save</button>
           <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
         </form>
       </div>
     )}
   </div>
 );
};

export default AdminDashboard;
