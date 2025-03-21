import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import '../styles/Auth.css';
import signupAnimation from '../assets/login-animation.json';

const Signup = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is student
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = () => {
    // Trim inputs
    const user = name.trim();
    const userEmail = email.trim();
    const pass = password.trim();
    const confirmPass = confirmPassword.trim();

    // Validation
    if (!user || !userEmail || !pass || !confirmPass) {
      setMessage('All fields are required.');
      return;
    }

    if (pass !== confirmPass) {
      setMessage('Passwords do not match!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Get stored user data
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if username or email already exists
    const userExists = users.some((u) => u.username === user || u.email === userEmail);
    if (userExists) {
      setMessage('Username or email already exists!');
      return;
    }

    // Add new user to local storage
    const newUser = { name: user, email: userEmail, password: pass, role: role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setMessage('Signup successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login'); // Redirect to login page after 2 seconds
    }, 2000);
  };

  return (
    <div className="auth-container">
      {/* Lottie Animation on the left */}
      <div className="animation-container">
        <Player
          src={signupAnimation}
          autoplay
          loop
          style={{ width: '400px', height: '400px' }}
        />
      </div>

      {/* Signup box on the right */}
      <div className="auth-box">
        <h2>Sign Up for BunkMaster</h2>
        {message && (
          <p style={{ color: message.includes('success') ? 'green' : 'red' }}>
            {message}
          </p>
        )}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleSignup}
          style={{
            width: '100%',
            padding: '8px',
            margin: '10px 0',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
        <p style={{ marginTop: '10px' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'blue', cursor: 'pointer' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;