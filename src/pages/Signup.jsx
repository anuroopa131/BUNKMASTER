import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/Auth.css';
import signupAnimation from '../assets/login-animation.json';

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('All fields are required.');
      return;
    }

    if (!EMAIL_RE.test(email.trim())) {
      setMessageType('error');
      setMessage('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Sends registration data to your Express signup route
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Signup failed.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Server error. Check your database connection.');
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
            <p className="auth-tagline">Set up your account in under a minute.</p>
          </div>
          <div className="auth-brand-animation">
            <Player src={signupAnimation} autoplay loop />
          </div>
        </div>

        <div className="auth-seam" aria-hidden="true" />

        <div className="auth-form-panel">
          <h2>Create your account</h2>
          <p className="auth-form-subtext">Set up BunkMaster in under a minute.</p>

          {message && (
            <div className={`auth-message ${messageType}`} role="status" aria-live="polite">
              {message}
            </div>
          )}

          <form onSubmit={handleSignup} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="signup-name">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="signup-email">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="signup-password">
                Password
              </label>
              <div className="password-field">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="field-group">
              <label className="field-label" htmlFor="signup-confirm">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={passwordsMismatch ? 'field-error' : ''}
              />
              {passwordsMismatch && (
                <p className="field-hint error">Passwords don't match yet.</p>
              )}
              {passwordsMatch && <p className="field-hint success">Passwords match.</p>}
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" aria-hidden="true" />}
              {isSubmitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
