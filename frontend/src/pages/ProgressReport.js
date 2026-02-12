import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProgressReport = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress();
  }, [studentId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/students/${studentId}/progress`);
      setProgress(response.data);
    } catch (err) {
      setError('Failed to load progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading progress report...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="loading-screen">
        <div className="alert alert-destructive">{error || 'Failed to load progress'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = Object.entries(progress.skill_summary || {}).map(([skill, data]) => ({
    skill: skill.length > 20 ? skill.substring(0, 20) + '...' : skill,
    percentage: data.average_percentage
  }));

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title">📊 Progress Report</h1>
              <p className="header-subtitle">Skill Analysis & Performance Trends</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          {/* Overall Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{progress.total_exams}</div>
              <div className="stat-label">Total Exams</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{progress.average_score}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Skills Radar</h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" style={{ fontSize: '0.75rem' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="percentage"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Skills Breakdown */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Skills Breakdown</h2>
            <div className="dashboard-grid">
              {Object.entries(progress.skill_summary || {}).map(([skill, data]) => (
                <div key={skill} className="card">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{skill}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(var(--primary))' }}>
                      {data.average_percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                    {data.correct}/{data.total} correct
                  </div>
                  <div style={{ marginTop: '0.75rem', height: '6px', background: 'hsl(var(--muted))', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${data.average_percentage}%`,
                        background: data.average_percentage >= 70 ? 'hsl(var(--success))' : data.average_percentage >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attempts */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Exam Results</h2>
            {progress.attempts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No exam attempts yet.</p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {progress.attempts.slice(-6).reverse().map(attempt => (
                  <div key={attempt.id} className="card">
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        {new Date(attempt.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(var(--primary))', marginBottom: '0.5rem' }}>
                      {attempt.score}/{attempt.total_questions}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                      Score: {attempt.percentage}%
                    </div>
                    <div style={{ marginTop: '0.75rem', height: '6px', background: 'hsl(var(--muted))', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${attempt.percentage}%`,
                          background: attempt.percentage >= 70 ? 'hsl(var(--success))' : attempt.percentage >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                        }}
                      />
                    </div>
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

export default ProgressReport;