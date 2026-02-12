import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import '../styles/ExamInterface.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ExamInterface = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    startOrResumeExam();
  }, [examId]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  useEffect(() => {
    if (!attempt || !exam) return;

    const saveInterval = setInterval(() => {
      saveCurrentAnswer();
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [attempt, answers, currentQuestionIndex, timeRemaining]);

  const startOrResumeExam = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/exams/${examId}/start`);
      
      setExam(response.data.exam);
      setAttempt(response.data.attempt);
      setAnswers(response.data.attempt.answers || {});
      setFlaggedQuestions(new Set(response.data.attempt.flagged_questions || []));
      setTimeRemaining(response.data.attempt.time_remaining);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start exam');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentAnswer = async () => {
    if (!exam || !attempt) return;
    
    const currentQuestion = exam.questions[currentQuestionIndex];
    const selectedOption = answers[currentQuestion.id];
    
    if (!selectedOption) return;

    try {
      await axios.post(`${API_URL}/api/exams/${examId}/save-answer`, {
        question_id: currentQuestion.id,
        selected_option: selectedOption,
        time_remaining: timeRemaining,
        flagged: flaggedQuestions.has(currentQuestion.id)
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleFlagToggle = () => {
    const currentQuestion = exam.questions[currentQuestionIndex];
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleNavigation = (direction) => {
    saveCurrentAnswer();
    
    if (direction === 'next' && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index) => {
    saveCurrentAnswer();
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unanswered = exam.questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        const confirm = window.confirm(
          `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
        );
        if (!confirm) return;
      } else {
        const confirm = window.confirm('Are you sure you want to submit your exam?');
        if (!confirm) return;
      }
    }

    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/exams/${examId}/submit`, {
        time_remaining: timeRemaining
      });
      
      alert(
        `Exam Submitted Successfully!\n\n` +
        `Score: ${response.data.score}/${response.data.total}\n` +
        `Percentage: ${response.data.percentage}%`
      );
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error || !exam || !attempt) {
    return (
      <div className="loading-screen">
        <div className="alert alert-destructive">{error || 'Failed to load exam'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="exam-interface">
      <div className="exam-header">
        <div className="exam-header-content">
          <div className="exam-info">
            <h1 className="exam-title" data-testid="exam-title">{exam.title}</h1>
            <p className="exam-meta">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </p>
          </div>
          
          <div className="exam-timer" data-testid="exam-timer">
            <div className="timer-display" style={{ color: timeRemaining < 300 ? 'hsl(var(--destructive))' : 'inherit' }}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
            <div className="timer-label">Time Remaining</div>
          </div>
          
          <button
            className="btn btn-destructive"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            data-testid="submit-exam-button"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="exam-body">
        <div className="question-panel">
          <div className="question-header">
            <span className="question-skill" data-testid="question-skill">
              🎯 {currentQuestion.skill}
            </span>
            <button
              className={`btn-icon ${flaggedQuestions.has(currentQuestion.id) ? 'flagged' : ''}`}
              onClick={handleFlagToggle}
              title={flaggedQuestions.has(currentQuestion.id) ? 'Unflag question' : 'Flag for review'}
              data-testid="flag-question-button"
            >
              🚩
            </button>
          </div>
          
          <div className="question-text" data-testid="question-text">
            {currentQuestion.text}
          </div>
          
          <div className="options-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={index}
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  data-testid={`option-${index}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {isSelected && <span className="option-check">✓</span>}
                </button>
              );
            })}
          </div>
          
          <div className="question-navigation">
            <button
              className="btn btn-outline"
              onClick={() => handleNavigation('prev')}
              disabled={currentQuestionIndex === 0}
              data-testid="prev-question-button"
            >
              ← Previous
            </button>
            
            <span className="nav-status">
              {getAnsweredCount()} / {exam.questions.length} Answered
            </span>
            
            <button
              className="btn btn-primary"
              onClick={() => handleNavigation('next')}
              disabled={currentQuestionIndex === exam.questions.length - 1}
              data-testid="next-question-button"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="navigator-panel">
          <h3 className="navigator-title">Question Navigator</h3>
          <div className="navigator-legend">
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot flagged"></span>
              <span>Flagged</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered"></span>
              <span>Unanswered</span>
            </div>
          </div>
          
          <div className="navigator-grid">
            {exam.questions.map((q, index) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flaggedQuestions.has(q.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  className={`navigator-button ${
                    isCurrent ? 'current' : ''
                  } ${
                    isFlagged ? 'flagged' : isAnswered ? 'answered' : 'unanswered'
                  }`}
                  onClick={() => jumpToQuestion(index)}
                  data-testid={`navigator-${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className="navigator-summary">
            <div className="summary-stat">
              <strong>{getAnsweredCount()}</strong>
              <span>Answered</span>
            </div>
            <div className="summary-stat">
              <strong>{flaggedQuestions.size}</strong>
              <span>Flagged</span>
            </div>
            <div className="summary-stat">
              <strong>{exam.questions.length - getAnsweredCount()}</strong>
              <span>Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
