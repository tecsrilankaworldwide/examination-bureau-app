import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/teacher/paper2/submissions`);
      setSubmissions(response.data);
    } catch (err) {
      setError('Failed to load submissions');
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
              <h1 className="header-title">👩‍🏫 Teacher Dashboard</h1>
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Paper 2 Submissions</h2>
            
            {submissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No Paper 2 submissions to review.</p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {submissions.map(submission => (
                  <div key={submission.id} className="card">
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {submission.student_name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        Grade {submission.student_grade} • {submission.exam_title}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <span className={`status-badge ${submission.status === 'submitted' ? 'in-progress' : 'completed'}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                    
                    {submission.status === 'submitted' && (
                      <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                        onClick={() => alert('Marking interface coming in Phase 2!')}
                      >
                        Mark Submission
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;