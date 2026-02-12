import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsRes, attemptsRes] = await Promise.all([
        axios.get(`${API_URL}/api/exams`),
        axios.get(`${API_URL}/api/students/${user.id}/progress`)
      ]);
      
      setExams(examsRes.data);
      setAttempts(attemptsRes.data.attempts || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    navigate(`/exam/${examId}`);
  };

  const getAttemptStatus = (examId) => {
    const attempt = attempts.find(a => a.exam_id === examId);
    if (!attempt) return { status: 'not-started', label: 'Start Exam' };
    if (attempt.status === 'in_progress') return { status: 'in-progress', label: 'Resume Exam' };
    if (attempt.status === 'submitted') return {
      status: 'completed',
      label: 'View Results',
      score: attempt.score,
      total: attempt.total_questions,
      percentage: attempt.percentage
    };
    return { status: 'not-started', label: 'Start Exam' };
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title" data-testid="dashboard-title">📚 {t('dashboard')}</h1>
              <p className="header-subtitle">🌟 {t('welcome')}, {user.name}!</p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/progress/${user.id}`)}
                data-testid="view-progress-button"
              >
                📊 View Progress
              </button>
              <button
                className="btn btn-secondary"
                onClick={logout}
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          {error && (
            <div className="alert alert-destructive">{error}</div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" data-testid="total-exams-stat">{exams.length}</div>
              <div className="stat-label">Available Exams</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" data-testid="completed-exams-stat">
                {attempts.filter(a => a.status === 'submitted').length}
              </div>
              <div className="stat-label">Completed Exams</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" data-testid="avg-score-stat">
                {attempts.length > 0
                  ? Math.round(
                      attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
                    )
                  : 0}%
              </div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Exams</h2>
            
            {exams.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No exams available at the moment.</p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {exams.map(exam => {
                  const attemptStatus = getAttemptStatus(exam.id);
                  return (
                    <div
                      key={exam.id}
                      className="exam-card"
                      onClick={() => attemptStatus.status !== 'completed' && handleStartExam(exam.id)}
                      data-testid={`exam-card-${exam.id}`}
                      style={{ cursor: attemptStatus.status === 'completed' ? 'default' : 'pointer' }}
                    >
                      <div className="exam-card-header">
                        <span className={`exam-badge grade-${exam.grade}`}>
                          Grade {exam.grade}
                        </span>
                        <span className={`status-badge ${attemptStatus.status}`}>
                          {attemptStatus.status === 'completed' && '✅ '}
                          {attemptStatus.status === 'in-progress' && '⏳ '}
                          {attemptStatus.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <h3 className="exam-card-title">{exam.title}</h3>
                      <p className="exam-card-description">{exam.description}</p>
                      
                      <div className="exam-card-meta">
                        <span>⏱️ {formatDuration(exam.duration_minutes)}</span>
                        <span>📝 {exam.questions?.length || exam.total_marks} Questions</span>
                        <span>🎯 Paper {exam.paper}</span>
                      </div>
                      
                      {attemptStatus.status === 'completed' ? (
                        <div className="exam-card-footer">
                          <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(var(--success))' }}>
                              {attemptStatus.score}/{attemptStatus.total}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                              Score: {attemptStatus.percentage}%
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              className="btn btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('Results detail view coming soon!');
                              }}
                              data-testid={`view-results-${exam.id}`}
                            >
                              View Details
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/paper2/${exam.id}`);
                              }}
                              data-testid={`submit-paper2-${exam.id}`}
                            >
                              📸 Submit Paper 2
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="exam-card-footer">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStartExam(exam.id)}
                            data-testid={`start-exam-${exam.id}`}
                          >
                            {attemptStatus.label}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
