import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { role: filter } : {};
      const response = await axios.get(`${API_URL}/api/admin/users`, { params });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title">🔑 Admin Dashboard</h1>
              <p className="header-subtitle">{user.name}</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          {error && <div className="alert alert-destructive">{error}</div>}

          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>User Management</h2>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'student', 'parent', 'teacher', 'admin'].map(role => (
                  <button
                    key={role}
                    className={`btn ${filter === role ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilter(role)}
                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'capitalize' }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Grade</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '1rem' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="status-badge" style={{ textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{u.grade || '-'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;