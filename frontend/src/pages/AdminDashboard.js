import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import LanguageToggle from '../components/LanguageToggle';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { role: filter } : {};
      const response = await axios.get(`${API_URL}/api/admin/users`, { params });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
              <h1 className="header-title">🔑 {t('dashboard')} - Admin</h1>
              <p className="header-subtitle">{user.name}</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <LanguageToggle />
              <button className="btn btn-secondary" onClick={logout}>
                {t('logout')}
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
            
            <div className="card" style={{ overflowX: 'auto' }}>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                  No users found for filter: {filter}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Grade</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{u.name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{u.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span 
                            className="status-badge" 
                            style={{ 
                              textTransform: 'capitalize',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'hsl(var(--muted))',
                              display: 'inline-block'
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{u.grade || '-'}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;