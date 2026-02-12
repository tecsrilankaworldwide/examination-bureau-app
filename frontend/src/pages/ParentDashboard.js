import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user.student_id) {
      setError('No student linked to this parent account');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [progressRes] = await Promise.all([
        axios.get(`${API_URL}/api/students/${user.student_id}/progress`)
      ]);
      
      setProgress(progressRes.data);
    } catch (err) {
      setError('Failed to load student data');
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
              <h1 className="header-title">👨‍👩‍👧‍👦 Parent Dashboard</h1>
              <p className="header-subtitle">{user.name}</p>
            </div>
            <div className="header-actions">
              {user.student_id && (
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/progress/${user.student_id}`)}
                >
                  📊 View Progress Report
                </button>
              )}
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

          {progress && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{progress.total_exams}</div>
                  <div className="stat-label">Total Exams Taken</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{progress.average_score}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>

              <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Exam Results</h2>
                
                {progress.attempts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <p>No exam attempts yet.</p>
                  </div>
                ) : (
                  <div className="dashboard-grid">
                    {progress.attempts.map(attempt => (
                      <div key={attempt.id} className="card">
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                            Exam Attempt
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                            {new Date(attempt.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(var(--primary))', marginBottom: '0.5rem' }}>
                          {attempt.score}/{attempt.total_questions}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                          Score: {attempt.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;