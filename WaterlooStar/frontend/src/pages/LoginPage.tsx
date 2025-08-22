import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

interface LoginPageProps {
  onLogin?: (token: string, user: any) => void;
  isAuthenticated?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isAuthenticated }) => {
  const history = useHistory();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      history.push('/');
    }
  }, [isAuthenticated, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onLogin) {
          onLogin(data.token, data.user);
        }
        history.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message + ' Switching to login...');
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Switch to login mode after successful registration (faster since no email verification needed)
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🎓 Student Community Forum</h1>
          <p>Connect, Share, Learn Together</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button 
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              🔐 Login
            </button>
            <button 
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              📝 Register
            </button>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <h2>Welcome Back!</h2>
              <p>Sign in to your account to continue</p>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !username.trim() || !password.trim()}
              >
                {loading ? 'Signing In...' : '🚀 Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <h2>Create Account</h2>
              <p>Join our student community today - no email verification required!</p>

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username (min 3 characters)"
                  disabled={loading}
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password (min 6 characters)"
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
              >
                {loading ? 'Creating Account...' : '🎉 Create Account'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <button 
              type="button" 
              className="back-btn"
              onClick={() => history.push('/')}
            >
              ← Back to Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
