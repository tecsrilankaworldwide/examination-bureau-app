import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const quickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 data-testid="login-title">🇱🇰 Examination Evaluation Bureau</h1>
          <p className="login-subtitle">Building the Nation's New Generation</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} data-testid="login-form">
          {error && (
            <div className="alert alert-destructive" data-testid="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login">
          <p className="quick-login-title">Quick Login (For Testing)</p>
          <div className="quick-login-grid">
            <button
              className="btn btn-outline"
              onClick={() => quickLogin('student4@test.com', 'student423')}
              data-testid="quick-login-student"
            >
              Student (Grade 4)
            </button>
            <button
              className="btn btn-outline"
              onClick={() => quickLogin('parent4@test.com', 'parent423')}
              data-testid="quick-login-parent"
            >
              Parent (Grade 4)
            </button>
            <button
              className="btn btn-outline"
              onClick={() => quickLogin('teacher@exambureau.com', 'teacher123')}
              data-testid="quick-login-teacher"
            >
              Teacher
            </button>
            <button
              className="btn btn-outline"
              onClick={() => quickLogin('admin@exambureau.com', 'admin123')}
              data-testid="quick-login-admin"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>Grades 2-5 Scholarship Examination Platform</p>
          <p className="text-muted">© 2026 Examination Evaluation Bureau</p>
        </div>
      </div>
    </div>
  );
};

export default Login;