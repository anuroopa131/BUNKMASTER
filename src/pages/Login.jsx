import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/Auth.css';
import loginAnimation from '../assets/login-animation.json';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.6 19.6 0 0 1 4.22-5.19M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.6 19.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const userEmail = email.trim();
    const pass = password.trim();

    if (!userEmail || !pass) {
      setMessageType('error');
      setMessage('Fields cannot be empty!');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Connects to your Express auth login route
      const response = await fetch('https://bunkmaster-gs92.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Login successful!');
        // Pass the user object received from MySQL to the parent component
        onLogin({ token: data.token, user: data.user });
        navigate('/dashboard');
      } else {
        setMessageType('error');
        setMessage(data.message || 'Invalid email or password!');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Server error. Please ensure your backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <div>
            <div className="auth-wordmark">
              Bunk<span>Master</span>
            </div>
            <div className="auth-eyebrow">Attendance, sorted</div>
            <p className="auth-tagline">Log in to see today's numbers.</p>
          </div>
          <div className="auth-brand-animation">
            <Player src={loginAnimation} autoplay loop />
          </div>
        </div>

        <div className="auth-seam" aria-hidden="true" />

        <div className="auth-form-panel">
          <h2>Welcome back</h2>
          <p className="auth-form-subtext">Log in to check today's attendance.</p>

          {message && (
            <div className={`auth-message ${messageType}`} role="status" aria-live="polite">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <button
                type="button"
                className="forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" aria-hidden="true" />}
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
